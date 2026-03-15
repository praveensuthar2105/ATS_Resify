package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Service.ServiceImpl.ResumeServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Service for parsing resumes from various sources (PDF, text) into structured
 * data
 * using PDFBox for text extraction and Gemini AI for intelligent parsing.
 */
@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final GeminiService geminiService;

    public ResumeParserService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Parse a PDF resume file into structured data.
     *
     * @param file   the uploaded PDF file
     * @param source "general" or "linkedin"
     * @return structured resume data with confidence scores
     */
    public Map<String, Object> parseFromPdf(MultipartFile file, String source) throws IOException {
        // Validate file
        validateFile(file);

        // Extract text from PDF using PDFBox
        String extractedText = extractTextFromPdf(file);

        if (extractedText == null || extractedText.trim().length() < 50) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error",
                    "Could not extract enough text from this PDF. It may be a scanned image or use non-standard formatting.");
            errorResult.put("extractedTextLength", extractedText != null ? extractedText.trim().length() : 0);
            return errorResult;
        }

        log.info("Extracted {} characters from PDF (source: {})", extractedText.length(), source);

        // Parse using AI
        return parseWithAI(extractedText, source);
    }

    /**
     * Parse plain text resume content into structured data.
     *
     * @param rawText the resume text
     * @return structured resume data with confidence scores
     */
    public Map<String, Object> parseFromText(String rawText) throws IOException {
        if (rawText == null || rawText.trim().length() < 50) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "Please provide at least 50 characters of resume content.");
            return errorResult;
        }

        log.info("Parsing {} characters of text input", rawText.length());
        return parseWithAI(rawText, "text");
    }

    /**
     * Extract raw text from a PDF file using Apache PDFBox.
     */
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream();
                PDDocument document = PDDocument.load(inputStream)) {

            if (document.isEncrypted()) {
                throw new IOException("This PDF is password-protected. Please remove the password and try again.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // Maintain visual reading order
            stripper.setAddMoreFormatting(true); // Preserve spacing and structure

            String text = stripper.getText(document);
            log.debug("PDFBox extracted {} characters from {} pages", text.length(), document.getNumberOfPages());
            return text;

        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}", e.getMessage());
            throw new IOException("Failed to read PDF file: " + e.getMessage(), e);
        }
    }

    /**
     * Send extracted text to Gemini AI for structured parsing.
     */
    private Map<String, Object> parseWithAI(String resumeText, String source) throws IOException {
        long startTime = System.currentTimeMillis();

        // Load the shared prompt template used by the entire system
        String promptTemplate = loadPromptFromFile("resume_prompt.txt");

        // Add source-specific context to the extracted text
        String sourceContext = getSourceContext(source);
        String enrichedText = sourceContext.isEmpty() ? resumeText : sourceContext + "\n\n" + resumeText;

        String prompt = promptTemplate
                .replace("{{userResumeDescription}}", enrichedText)
                .replace("{{templateType}}", "ats");

        // Call Gemini AI
        Optional<String> responseOpt = geminiService.generateContent(prompt);

        if (responseOpt.isEmpty()) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "AI service returned an empty response. Please try again.");
            return errorResult;
        }

        String aiResponse = responseOpt.get();
        long processingTime = System.currentTimeMillis() - startTime;

        // Parse the AI response into structured data
        try {
            // Use the shared, robust parsing from ResumeServiceImpl that handles <think>
            // tags
            Map<String, Object> parsedResponse = ResumeServiceImpl.parseMultipleResponses(aiResponse);

            if (parsedResponse.get("data") == null) {
                throw new Exception("Robust parsing returned null data");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> parsedData = (Map<String, Object>) parsedResponse.get("data");

            // Build the final result
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", parsedData);
            result.put("source", source);
            result.put("confidence", calculateConfidence(parsedData));
            result.put("warnings", generateWarnings(parsedData));
            result.put("extractedTextLength", resumeText.length());
            result.put("processingTimeMs", processingTime);

            log.info("Successfully parsed resume in {}ms (source: {})", processingTime, source);
            return result;

        } catch (Exception e) {
            log.error("Failed to parse AI response as JSON: {}", e.getMessage());
            log.debug("AI response (first 500 chars): {}",
                    aiResponse.substring(0, Math.min(aiResponse.length(), 500)));

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "Failed to parse the AI response. Please try again.");
            errorResult.put("processingTimeMs", processingTime);
            return errorResult;
        }
    }

    /**
     * Get source-specific context for the AI prompt.
     */
    private String getSourceContext(String source) {
        if ("linkedin".equalsIgnoreCase(source)) {
            return """
                    ADDITIONAL CONTEXT: This text is from a LinkedIn "Save to PDF" export.
                    LinkedIn PDFs have specific formatting:
                    - The first line is usually the person's name
                    - The second line is their headline/title
                    - "Experience" section lists jobs with company name, title, duration (e.g., "2 yrs 3 mos")
                    - Duration format: "Mon Year - Mon Year · X yrs Y mos"
                    - "Education" section may include activities/societies — put relevant ones in "details"
                    - "Skills" section lists endorsed skills — include all of them
                    - Ignore "Recommendations", "Connections", and "Interests" sections
                    - "Licenses & Certifications" — add notable ones to skills or summary
                    """;
        }
        return ""; // No special context for general resumes or text paste
    }

    /**
     * Calculate confidence scores for each section of the parsed data.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> calculateConfidence(Map<String, Object> data) {
        Map<String, Object> confidence = new HashMap<>();

        Map<?, ?> personalInfo = data.get("personalInformation") instanceof Map
                ? (Map<?, ?>) data.get("personalInformation")
                : Collections.emptyMap();
        double nameScore = hasNonEmptyMapValue(personalInfo, "fullName") ? 0.95 : 0.0;
        double emailScore = hasNonEmptyMapValue(personalInfo, "email") ? 0.99 : 0.3;
        double phoneScore = hasNonEmptyMapValue(personalInfo, "phoneNumber") ? 0.85 : 0.3;

        List<?> expList = data.get("experience") instanceof List ? (List<?>) data.get("experience") : List.of();
        double expScore = expList.isEmpty() ? 0.3 : Math.min(0.95, 0.6 + (expList.size() * 0.1));

        List<?> eduList = data.get("education") instanceof List ? (List<?>) data.get("education") : List.of();
        double eduScore = eduList.isEmpty() ? 0.3 : Math.min(0.95, 0.7 + (eduList.size() * 0.1));

        // Use skills if it's a list, otherwise handle the newer object schema
        List<?> skillsList;
        if (data.get("skills") instanceof List) {
            skillsList = (List<?>) data.get("skills");
        } else if (data.get("skills") instanceof Map) {
            Map<?, ?> skillsMap = (Map<?, ?>) data.get("skills");
            List<Object> combined = new ArrayList<>();
            skillsMap.values().forEach(v -> {
                if (v instanceof List)
                    combined.addAll((List<?>) v);
            });
            skillsList = combined;
        } else {
            skillsList = List.of();
        }
        double skillsScore = skillsList.isEmpty() ? 0.3 : Math.min(0.95, 0.5 + (skillsList.size() * 0.05));

        List<?> projectsList = data.get("projects") instanceof List ? (List<?>) data.get("projects") : List.of();
        double projectsScore = projectsList.isEmpty() ? 0.5 : Math.min(0.95, 0.6 + (projectsList.size() * 0.1));

        double overall = (nameScore + emailScore + expScore + eduScore + skillsScore) / 5.0;

        confidence.put("overall", Math.round(overall * 100.0) / 100.0);
        confidence.put("sections", Map.of(
                "personalInfo", Math.round(((nameScore + emailScore + phoneScore) / 3.0) * 100.0) / 100.0,
                "experience", Math.round(expScore * 100.0) / 100.0,
                "education", Math.round(eduScore * 100.0) / 100.0,
                "skills", Math.round(skillsScore * 100.0) / 100.0,
                "projects", Math.round(projectsScore * 100.0) / 100.0));

        return confidence;
    }

    /**
     * Generate warnings for potentially problematic parsed data.
     */
    @SuppressWarnings("unchecked")
    private List<String> generateWarnings(Map<String, Object> data) {
        List<String> warnings = new ArrayList<>();

        Map<?, ?> personalInfo = data.get("personalInformation") instanceof Map
                ? (Map<?, ?>) data.get("personalInformation")
                : Collections.emptyMap();

        if (!hasNonEmptyMapValue(personalInfo, "email")) {
            warnings.add("No email address found — please add one manually.");
        }
        if (!hasNonEmptyMapValue(personalInfo, "phoneNumber")) {
            warnings.add("No phone number found — consider adding one.");
        }
        if (!hasNonEmptyValue(data, "summary")) {
            warnings.add("No professional summary detected — consider adding one for better ATS scores.");
        }

        List<?> expList = data.get("experience") instanceof List ? (List<?>) data.get("experience") : List.of();
        if (expList.isEmpty()) {
            warnings.add("No work experience entries found.");
        }

        int skillCount = 0;
        if (data.get("skills") instanceof List) {
            skillCount = ((List<?>) data.get("skills")).size();
        } else if (data.get("skills") instanceof Map) {
            Map<?, ?> skillsMap = (Map<?, ?>) data.get("skills");
            for (Object v : skillsMap.values()) {
                if (v instanceof List)
                    skillCount += ((List<?>) v).size();
            }
        }

        if (skillCount < 3) {
            warnings.add("Very few skills detected — the resume may need more specific technical skills.");
        }

        return warnings;
    }

    private boolean hasNonEmptyValue(Map<String, Object> data, String key) {
        Object val = data.get(key);
        return val instanceof String && !((String) val).trim().isEmpty();
    }

    private boolean hasNonEmptyMapValue(Map<?, ?> data, String key) {
        Object val = data.get(key);
        return val instanceof String && !((String) val).trim().isEmpty();
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException("File too large. Maximum size is 5MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IOException("Only PDF files are accepted.");
        }
    }

    private String loadPromptFromFile(String fileName) throws IOException {
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            if (!resource.exists()) {
                throw new IOException("Prompt file not found: " + fileName);
            }
            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new IOException("Failed to load prompt file: " + fileName, e);
        }
    }
}
