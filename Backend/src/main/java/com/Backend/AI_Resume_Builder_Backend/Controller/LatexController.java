package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Service.LatexService;
import com.Backend.AI_Resume_Builder_Backend.Service.SystemStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/latex")
public class LatexController {

    @Autowired
    private LatexService latexService;

    @Autowired
    private com.Backend.AI_Resume_Builder_Backend.Service.LatexCompileService latexCompileService;

    @Autowired
    private SystemStatsService systemStatsService;

    /**
     * Generate LaTeX code from resume data
     */
    @PostMapping(value = "/generate", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> generateLatexCode(@RequestBody Map<String, Object> request) {
        try {
            // Extract resume data and template type from request
            @SuppressWarnings("unchecked")
            Map<String, Object> resumeData = (Map<String, Object>) request.get("resumeData");
            String templateType = (String) request.getOrDefault("templateType", "professional");

            if (resumeData == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid input");
                errorResponse.put("message", "Resume data is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            // Validate template type
            if (templateType != null) {
                String normalized = templateType.toLowerCase();
                if (!(normalized.equals("professional") || normalized.equals("modern") || normalized.equals("ats")
                        || normalized.equals("creative"))) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Invalid templateType");
                    errorResponse.put("message", "Allowed values: professional, modern, ats, creative");
                    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
                }
                templateType = normalized;
            }

            // Generate LaTeX code
            String latexCode = latexService.generateLatexCode(resumeData, templateType);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("latexCode", latexCode);
            response.put("templateType", templateType);
            response.put("success", true);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (IOException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate LaTeX code");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get list of available LaTeX templates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates() {
        try {
            Map<String, String> templates = latexService.getAvailableTemplates();

            Map<String, Object> response = new HashMap<>();
            response.put("templates", templates);
            response.put("success", true);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve templates");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Generate LaTeX code directly from resume generation
     * (Alternative endpoint that takes userResumeDescription)
     */
    @PostMapping(value = "/generate-from-description", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> generateFromDescription(@RequestBody Map<String, Object> request) {
        try {
            // This endpoint can be used if you want to generate LaTeX during resume
            // generation
            // For now, return info message
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Not implemented");
            response.put("message", "Use POST /api/latex/generate with { resumeData, templateType? }");
            response.put("success", false);
            return new ResponseEntity<>(response, HttpStatus.NOT_IMPLEMENTED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Compile LaTeX source to PDF and return as application/pdf
     */
    @PostMapping(value = "/compile", consumes = "application/json")
    public ResponseEntity<?> compileLatex(@RequestBody Map<String, Object> request) {
        try {
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
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Compilation failed");
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check LaTeX compiler readiness and return diagnostics.
     */
    @GetMapping(value = "/health", produces = "application/json")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> status = (Map<String, Object>) latexCompileService.getCompilerStatus();
            status.put("success", true);
            return new ResponseEntity<>(status, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to check compiler status");
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
