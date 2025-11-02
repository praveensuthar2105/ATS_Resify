package com.Backend.AI_Resume_Builder_Backend.Service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class AtsScoreServiceImpl implements AtsScoreService {

    private final GeminiService geminiService;
    private final ResumeServiceImpl resumeService;

    public AtsScoreServiceImpl(GeminiService geminiService, ResumeServiceImpl resumeService) {
        this.geminiService = geminiService;
        this.resumeService = resumeService;
    }

    @Override
    public Map<String, Object> getAtsScore(MultipartFile resumeFile) throws IOException {
        String resumeText = extractTextFromPdf(resumeFile);
        String promptTemplate = resumeService.loadPromptFromFile("ats_prompt.txt");
        String prompt = resumeService.putValueToTemplate(promptTemplate, Map.of("resumeText", resumeText));

        String response = geminiService.generateContent(prompt);

        return resumeService.parseMultipleResponses(response);
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream();
                PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            return pdfStripper.getText(document);
        }
    }
}
