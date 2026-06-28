package com.Backend.AI_Resume_Builder_Backend;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.nio.file.Files;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import com.Backend.AI_Resume_Builder_Backend.ats.AtsScoreService;

@SpringBootTest
public class AtsScoreServiceTest {

    static {
        System.setProperty("java.net.preferIPv4Stack", "false");
        java.nio.file.Path path = java.nio.file.Paths.get("../.env");
        if (java.nio.file.Files.exists(path)) {
            try {
                java.util.List<String> lines = java.nio.file.Files.readAllLines(path);
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                        continue;
                    }
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim();
                    String value = parts[1].trim();
                    if (System.getProperty(key) == null) {
                        System.setProperty(key, value);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to load env: " + e.getMessage());
            }
        }
    }

    @Autowired
    private AtsScoreService atsScoreService;

    @Test
    public void testGetAtsScoreWithSamplePdf() throws Exception {
        File pdfFile = new File("../../FrontEnd/frontend/public/sample-resume.pdf");
        assertTrue(pdfFile.exists(), "Sample PDF file should exist at FrontEnd/frontend/public/sample-resume.pdf");

        byte[] content = Files.readAllBytes(pdfFile.toPath());
        MockMultipartFile mockFile = new MockMultipartFile(
            "file",
            pdfFile.getName(),
            "application/pdf",
            content
        );

        Map<String, Object> result = atsScoreService.getAtsScore(mockFile, "Looking for a software engineer with React and Node.js skills.");
        
        assertNotNull(result, "ATS analysis result should not be null");
        assertTrue(result.containsKey("data"), "Result should contain data key");
        
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) result.get("data");
        assertNotNull(data, "Internal data should not be null");
        assertTrue(data.containsKey("atsScore"), "Result data should contain atsScore");
        System.out.println("Calculated ATS Score: " + data.get("atsScore"));
    }
}
