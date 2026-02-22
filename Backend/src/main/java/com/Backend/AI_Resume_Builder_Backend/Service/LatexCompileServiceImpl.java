package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.InitializingBean;

@Service
public class LatexCompileServiceImpl implements LatexCompileService, InitializingBean {

    @Value("${latex.compiler:auto}")
    private String compilerMode; // auto | tectonic | pdflatex

    @Value("${latex.compiler.path:}")
    private String compilerPath; // optional absolute path to compiler executable

    @Value("${latex.compile.timeoutSeconds:40}")
    private int timeoutSeconds;

    @Value("${latex.compile.max-concurrent:5}")
    private int maxConcurrent;

    private Semaphore compileSemaphore;

    @Override
    public void afterPropertiesSet() {
        this.compileSemaphore = new Semaphore(maxConcurrent, true);
    }

    @Override
    public byte[] compileToPdf(String latexCode) throws IOException, InterruptedException {
        Path tempDir = Files.createTempDirectory("latex_compile_");
        Path texFile = tempDir.resolve("resume.tex");
        Path pdfFile = tempDir.resolve("resume.pdf");

        // Write LaTeX file
        Files.write(texFile, latexCode.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING);

        // Check semaphore
        boolean acquired = false;
        try {
            acquired = compileSemaphore.tryAcquire(30, TimeUnit.SECONDS);
            if (!acquired) {
                cleanup(tempDir);
                throw new IOException(
                        "Server is currently busy compiling other resumes. Please try again in a moment.");
            }

            // Determine candidate compilers
            String mode = (compilerMode == null || compilerMode.isBlank()) ? "auto" : compilerMode.trim().toLowerCase();
            List<List<String>> candidates = new ArrayList<>();

            if ("pdflatex".equals(mode)) {
                candidates.add(buildPdflatexCommand(tempDir, texFile));
            } else if ("tectonic".equals(mode)) {
                candidates.add(buildTectonicCommand(tempDir, texFile));
            } else { // auto
                candidates.add(buildTectonicCommand(tempDir, texFile));
                candidates.add(buildPdflatexCommand(tempDir, texFile));
            }

            IOException lastError = null;
            for (List<String> cmd : candidates) {
                try {
                    byte[] pdf = runCompiler(cmd, tempDir, pdfFile);
                    cleanup(tempDir);
                    return pdf;
                } catch (IOException ex) {
                    lastError = ex;
                    // try next candidate
                }
            }

            cleanup(tempDir);
            if (lastError != null)
                throw lastError;
            throw new IOException("LaTeX compilation failed with all available compilers");
        } finally {
            if (acquired) {
                compileSemaphore.release();
            }
        }
    }

    @Override
    public java.util.Map<String, Object> getCompilerStatus() {
        java.util.Map<String, Object> out = new java.util.HashMap<>();
        String mode = (compilerMode == null || compilerMode.isBlank()) ? "auto" : compilerMode.trim().toLowerCase();
        out.put("mode", mode);
        out.put("configuredPath", compilerPath == null ? "" : compilerPath);

        java.util.List<java.util.Map<String, Object>> details = new java.util.ArrayList<>();
        java.util.List<java.util.List<String>> candidates = new java.util.ArrayList<>();
        Path dummyDir;
        try {
            dummyDir = Files.createTempDirectory("latex_check_");
        } catch (IOException e) {
            dummyDir = Path.of(System.getProperty("java.io.tmpdir", "."));
        }
        Path dummyTex = dummyDir.resolve("check.tex");
        try {
            Files.writeString(dummyTex, "\\documentclass{article}\\begin{document}OK\\end{document}");
        } catch (Exception ignored) {
        }

        if ("pdflatex".equals(mode)) {
            candidates.add(buildPdflatexCommand(dummyDir, dummyTex));
        } else if ("tectonic".equals(mode)) {
            candidates.add(buildTectonicCommand(dummyDir, dummyTex));
        } else { // auto
            candidates.add(buildTectonicCommand(dummyDir, dummyTex));
            candidates.add(buildPdflatexCommand(dummyDir, dummyTex));
        }

        boolean any = false;
        for (java.util.List<String> cmd : candidates) {
            java.util.Map<String, Object> d = new java.util.HashMap<>();
            d.put("command", String.join(" ", cmd));
            String exe = cmd.isEmpty() ? "" : cmd.get(0);
            // Try `--version` for detection; tectonic/pdflatex both support it
            java.util.List<String> probe = new java.util.ArrayList<>();
            probe.add(exe);
            probe.add("--version");
            try {
                Process p = new ProcessBuilder(probe).redirectErrorStream(true).start();
                java.io.ByteArrayOutputStream outBuf = new java.io.ByteArrayOutputStream();
                try (InputStream is = p.getInputStream()) {
                    is.transferTo(outBuf);
                }
                boolean finished = p.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
                if (!finished) {
                    p.destroyForcibly();
                    throw new IOException("timeout");
                }
                int code = p.exitValue();
                String ver = outBuf.toString(java.nio.charset.StandardCharsets.UTF_8);
                boolean ok = code == 0 && (ver.toLowerCase().contains("tectonic")
                        || ver.toLowerCase().contains("pdftex") || ver.toLowerCase().contains("miktex"));
                d.put("available", ok);
                d.put("version", ver.trim());
                any = any || ok;
            } catch (Exception e) {
                d.put("available", false);
                d.put("error", e.getMessage());
            }
            details.add(d);
        }

        out.put("ready", any);
        out.put("candidates", details);

        // cleanup
        try {
            Files.deleteIfExists(dummyTex);
            Files.deleteIfExists(dummyDir);
        } catch (Exception ignored) {
        }
        return out;
    }

    private byte[] runCompiler(List<String> cmd, Path workDir, Path pdfFile) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(workDir.toFile());
        pb.redirectErrorStream(true);
        // Set environment to speed up MiKTeX package checks
        pb.environment().put("MIKTEX_AUTOINSTALL", "yes");
        pb.environment().put("MIKTEX_TRACE", "error");

        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            // Likely the binary is not found on PATH or the configured path is invalid.
            String exe = cmd.isEmpty() ? "<unknown>" : cmd.get(0);
            String os = System.getProperty("os.name", "").toLowerCase();
            StringBuilder hint = new StringBuilder();
            hint.append("Failed to start compiler '").append(exe).append("'. ");
            hint.append("The compiler executable was not found.\n");
            hint.append("How to fix:\n");
            if (os.contains("win")) {
                hint.append("- Install Tectonic (recommended) and ensure 'tectonic.exe' is on PATH, or\n");
                hint.append("  install MiKTeX/TeX Live and ensure 'pdflatex.exe' is on PATH.\n");
                hint.append("- Alternatively, set an absolute path in application.properties, e.g.:\n");
                hint.append("    latex.compiler=tectonic\n");
                hint.append("    latex.compiler.path=C:/Program Files/Tectonic/tectonic.exe\n");
                hint.append("  or for MiKTeX:\n");
                hint.append("    latex.compiler=pdflatex\n");
                hint.append("    latex.compiler.path=C:/Program Files/MiKTeX/miktex/bin/x64/pdflatex.exe\n");
            } else {
                hint.append("- Install 'tectonic' or 'pdflatex' and ensure it is available on PATH, or\n");
                hint.append("  configure latex.compiler.path to its absolute location.\n");
            }
            hint.append("Current mode: '").append(compilerMode).append("'\n");
            hint.append("Configured path: '").append(compilerPath == null ? "" : compilerPath).append("'\n");
            throw new IOException(hint.toString(), e);
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (InputStream is = process.getInputStream()) {
            is.transferTo(output);
        }

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IOException("LaTeX compilation timed out after " + timeoutSeconds + "s");
        }

        int exit = process.exitValue();
        if (Files.notExists(pdfFile) || exit != 0) {
            String log = output.toString(StandardCharsets.UTF_8);
            throw new IOException("Compiler: " + String.join(" ", cmd) + " failed (exit=" + exit + "):\n" + log);
        }

        return Files.readAllBytes(pdfFile);
    }

    private List<String> buildPdflatexCommand(Path tempDir, Path texFile) {
        List<String> cmd = new ArrayList<>();
        String exe = compilerPath != null && !compilerPath.isBlank() ? compilerPath : "pdflatex";
        cmd.add(exe);
        cmd.add("-interaction=nonstopmode");
        cmd.add("-halt-on-error");
        cmd.add("-output-directory");
        cmd.add(tempDir.toString());
        cmd.add(texFile.getFileName().toString());
        return cmd;
    }

    private List<String> buildTectonicCommand(Path tempDir, Path texFile) {
        List<String> cmd = new ArrayList<>();
        String exe = compilerPath != null && !compilerPath.isBlank() ? compilerPath : "tectonic";
        cmd.add(exe);
        cmd.add("-o");
        cmd.add(tempDir.toString());
        cmd.add(texFile.toString());
        return cmd;
    }

    private void cleanup(Path tempDir) {
        try {
            if (tempDir != null && Files.exists(tempDir)) {
                Files.walk(tempDir)
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(p -> {
                            try {
                                Files.deleteIfExists(p);
                            } catch (IOException ignored) {
                            }
                        });
            }
        } catch (IOException ignored) {
        }
    }
}
