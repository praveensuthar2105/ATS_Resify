package com.Backend.AI_Resume_Builder_Backend.agent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST controller for resume import functionality.
 * Handles PDF upload and text paste for AI-powered resume parsing.
 */
@RestController
@RequestMapping("/api/resume/import")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000", "https://atsresify.me", "https://www.atsresify.me"})
public class ResumeImportController {

    private static final Logger log = LoggerFactory.getLogger(ResumeImportController.class);

    @Autowired
    private ResumeParserService resumeParserService;

    /**
     * Import resume from a PDF file.
     * POST /api/resume/import/pdf
     *
     * @param file   the PDF file (max 5MB)
     * @param source "general" or "linkedin" (auto-detected if not specified)
     */
    @PostMapping("/pdf")
    public ResponseEntity<Map<String, Object>> importFromPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "source", defaultValue = "general") String source) throws Exception {
        log.info("Resume import request received — source: {}, file: {}, size: {}KB",
                source, file.getOriginalFilename(), file.getSize() / 1024);

        Map<String, Object> result = resumeParserService.parseFromPdf(file, source);

        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Import resume from plain text.
     * POST /api/resume/import/text
     *
     * @param request JSON body with "text" field
     */
    @PostMapping("/text")
    public ResponseEntity<Map<String, Object>> importFromText(
            @RequestBody Map<String, String> request) throws Exception {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return new ResponseEntity<>(
                    Map.of("success", false, "error", "Resume text is required."),
                    HttpStatus.BAD_REQUEST);
        }

        log.info("Resume text import request received — {} characters", text.length());

        Map<String, Object> result = resumeParserService.parseFromText(text);

        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }
}
