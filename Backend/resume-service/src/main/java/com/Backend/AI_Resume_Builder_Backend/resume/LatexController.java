package com.Backend.AI_Resume_Builder_Backend.resume;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.Backend.AI_Resume_Builder_Backend.admin.SystemStatsService;
import com.Backend.AI_Resume_Builder_Backend.messaging.PdfCompileEvent;
import com.Backend.AI_Resume_Builder_Backend.resume.messaging.PdfCompileProducer;
import com.Backend.AI_Resume_Builder_Backend.resume.messaging.PdfCompileResultListener;

@RestController
@RequestMapping("/api/latex")
public class LatexController {

    @Autowired
    private LatexService latexService;

    @Autowired
    private com.Backend.AI_Resume_Builder_Backend.resume.LatexCompileService latexCompileService;

    @Autowired
    private SystemStatsService systemStatsService;

    @Autowired
    private PdfCompileProducer pdfCompileProducer;

    @Autowired
    private PdfCompileResultListener pdfCompileResultListener;

    /**
     * Generate LaTeX code from resume data
     */
    @PostMapping(value = "/generate", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> generateLatexCode(@RequestBody Map<String, Object> request) throws Exception {
        // Extract resume data and template type from request
        @SuppressWarnings("unchecked")
        Map<String, Object> resumeData = (Map<String, Object>) request.get("resumeData");
        String templateType = (String) request.getOrDefault("templateType", "ats");

        if (resumeData == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid input");
            errorResponse.put("message", "Resume data is required");
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        // Validate template type
        if (templateType != null) {
            String normalized = templateType.toLowerCase();
            if (!(normalized.equals("ats") || normalized.equals("minimal"))) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid templateType");
                errorResponse.put("message", "Allowed values: ats, minimal");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            templateType = normalized;
        }

        // Extract optional section configuration
        @SuppressWarnings("unchecked")
        Map<String, Object> sectionConfig = (Map<String, Object>) request.get("sectionConfig");

        // Generate LaTeX code
        String latexCode = latexService.generateLatexCode(resumeData, templateType, sectionConfig);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("latexCode", latexCode);
        response.put("templateType", templateType);
        response.put("success", true);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Get list of available LaTeX templates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates() throws Exception {
        Map<String, String> templates = latexService.getAvailableTemplates();

        Map<String, Object> response = new HashMap<>();
        response.put("templates", templates);
        response.put("success", true);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Generate LaTeX code directly from resume generation
     * (Alternative endpoint that takes userResumeDescription)
     */
    @PostMapping(value = "/generate-from-description", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> generateFromDescription(@RequestBody Map<String, Object> request) throws Exception {
        // This endpoint can be used if you want to generate LaTeX during resume
        // generation
        // For now, return info message
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Not implemented");
        response.put("message", "Use POST /api/latex/generate with { resumeData, templateType? }");
        response.put("success", false);
        return new ResponseEntity<>(response, HttpStatus.NOT_IMPLEMENTED);
    }

    /**
     * Compile LaTeX source to PDF and return as application/pdf (SYNC — backward compatible)
     */
    @PostMapping(value = "/compile", consumes = "application/json")
    public ResponseEntity<?> compileLatex(@RequestBody Map<String, Object> request) throws Exception {
        Object codeObj = request.get("latexCode");
        if (codeObj == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid input");
            error.put("message", "'latexCode' is required");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
        String latexCode = codeObj.toString();
        systemStatsService.incrementPdfCompilations();
        byte[] pdf = latexCompileService.compileToPdf(latexCode);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=resume.pdf")
                .body(pdf);
    }

    /**
     * Submit LaTeX for ASYNC PDF compilation.
     * Returns immediately with a jobId — poll /compile/status/{jobId} for the result.
     */
    @PostMapping(value = "/compile/async", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> compileLatexAsync(@RequestBody Map<String, Object> request) throws Exception {
        Object codeObj = request.get("latexCode");
        if (codeObj == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "'latexCode' is required"));
        }
        String latexCode = codeObj.toString();

        // Get user email from security context
        String userEmail = "anonymous";
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getName())) {
            userEmail = auth.getName();
        }

        // Create and publish event
        PdfCompileEvent event = PdfCompileEvent.createRequest(latexCode, userEmail);
        String jobId = pdfCompileProducer.requestCompile(event);

        systemStatsService.incrementPdfCompilations();

        Map<String, Object> response = new HashMap<>();
        response.put("jobId", jobId);
        response.put("status", "PENDING");
        response.put("message", "PDF compilation submitted. Poll /api/latex/compile/status/" + jobId + " for results.");

        return ResponseEntity.accepted().body(response);
    }

    /**
     * Poll for async PDF compilation result.
     * Returns status and Base64-encoded PDF when complete.
     */
    @GetMapping(value = "/compile/status/{jobId}", produces = "application/json")
    public ResponseEntity<Map<String, Object>> getCompileStatus(@PathVariable String jobId) {

        PdfCompileEvent event = pdfCompileResultListener.getResult(jobId);

        if (event == null) {
            return ResponseEntity.ok(Map.of(
                    "jobId", jobId,
                    "status", "PROCESSING",
                    "message", "Still compiling. Please poll again."
            ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("jobId", jobId);
        response.put("status", event.getStatus());

        if ("COMPLETED".equals(event.getStatus())) {
            response.put("pdfBase64", event.getPdfBase64());
            response.put("message", "Decode Base64 to get PDF bytes.");
            pdfCompileResultListener.consumeResult(jobId);
        } else if ("FAILED".equals(event.getStatus())) {
            response.put("error", event.getErrorMessage());
            pdfCompileResultListener.consumeResult(jobId);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Download compiled PDF directly as binary (convenience endpoint).
     * Only works after async compilation is COMPLETED.
     */
    @GetMapping(value = "/compile/download/{jobId}")
    public ResponseEntity<?> downloadCompiledPdf(@PathVariable String jobId) {
        PdfCompileEvent event = pdfCompileResultListener.getResult(jobId);

        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No result found. Still processing or invalid jobId."));
        }

        if (!"COMPLETED".equals(event.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Compilation " + event.getStatus(),
                                 "message", event.getErrorMessage()));
        }

        byte[] pdfBytes = Base64.getDecoder().decode(event.getPdfBase64());
        pdfCompileResultListener.consumeResult(jobId);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=resume_" + jobId.substring(0, 8) + ".pdf")
                .body(pdfBytes);
    }

    /**
     * Check LaTeX compiler readiness and return diagnostics.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(value = "/health", produces = "application/json")
    public ResponseEntity<Map<String, Object>> health() throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> status = (Map<String, Object>) latexCompileService.getCompilerStatus();
        status.put("success", true);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(value = "/queue", produces = "application/json")
    public ResponseEntity<Map<String, Object>> queueStatus() {
        Map<String, Object> out = new HashMap<>();
        out.put("usage", latexCompileService.getQueueUsage());
        return new ResponseEntity<>(out, HttpStatus.OK);
    }
}