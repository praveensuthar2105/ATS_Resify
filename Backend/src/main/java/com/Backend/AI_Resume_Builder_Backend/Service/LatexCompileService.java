package com.Backend.AI_Resume_Builder_Backend.Service;

import java.io.IOException;

public interface LatexCompileService {
    /**
     * Compile LaTeX source code to PDF bytes using a local TeX engine (e.g.,
     * tectonic or pdflatex).
     * 
     * @param latexCode Full LaTeX source code
     * @return PDF bytes
     */
    byte[] compileToPdf(String latexCode) throws IOException, InterruptedException;

    /**
     * Check availability of configured LaTeX compiler(s) and return diagnostic
     * info.
     * 
     * @return map containing mode, configured path, candidate commands with
     *         availability and version output
     */
    java.util.Map<String, Object> getCompilerStatus();

    /**
     * Get current number of compilations in progress or queued.
     */
    int getQueueUsage();
}
