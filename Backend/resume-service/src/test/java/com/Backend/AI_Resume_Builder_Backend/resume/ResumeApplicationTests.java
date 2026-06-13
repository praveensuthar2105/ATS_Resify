package com.Backend.AI_Resume_Builder_Backend.resume;

import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = ResumeApplication.class)
@ActiveProfiles("test")
class ResumeApplicationTests {

	@Autowired
	private LatexService latexService;

	@Autowired
	private LatexCompileService latexCompileService;

	@Test
	void contextLoads() {
	}

	@Test
	void testTemplateCompilation() throws Exception {
		Map<String, Object> compilerStatus = latexCompileService.getCompilerStatus();
		System.out.println("--- Compiler Status: " + compilerStatus);
		if (compilerStatus == null || !Boolean.TRUE.equals(compilerStatus.get("ready"))) {
			System.out.println("No LaTeX compiler available. Skipping compilation checks.");
			return;
		}

		Map<String, Object> personalInfo = new HashMap<>();
		personalInfo.put("fullName", "John Doe");
		personalInfo.put("email", "john@example.com");
		personalInfo.put("phoneNumber", "123-456-7890");
		personalInfo.put("location", "New York, NY");
		personalInfo.put("linkedIn", "https://linkedin.com/in/johndoe");
		personalInfo.put("gitHub", "https://github.com/johndoe");
		personalInfo.put("portfolio", "https://portfolio.com");

		Map<String, Object> eduEntry = new HashMap<>();
		eduEntry.put("university", "University of Tech");
		eduEntry.put("location", "Boston, MA");
		eduEntry.put("graduationYear", "2024");
		eduEntry.put("degree", "B.S. Computer Science");
		eduEntry.put("gpa", "3.8");

		Map<String, Object> expEntry = new HashMap<>();
		expEntry.put("company", "Tech Corp");
		expEntry.put("location", "San Francisco, CA");
		expEntry.put("duration", "2020 - 2024");
		expEntry.put("jobTitle", "Software Engineer");
		expEntry.put("responsibility", "Developed features.\nImproved performance.");

		Map<String, Object> projEntry = new HashMap<>();
		projEntry.put("title", "Cool App");
		projEntry.put("technologiesUsed", "React, Spring Boot");
		projEntry.put("description", "Built cool app.\nIntegrated APIs.\nDeployed to cloud.");
		projEntry.put("githubLink", "https://github.com/johndoe/coolapp");

		Map<String, Object> skills = new HashMap<>();
		skills.put("languages", Arrays.asList("Java", "JavaScript"));
		skills.put("frameworks", Arrays.asList("Spring Boot", "React"));

		Map<String, Object> certEntry = new HashMap<>();
		certEntry.put("title", "AWS Certified Developer");
		certEntry.put("issuingOrganization", "Amazon Web Services");
		certEntry.put("year", "2023");

		Map<String, Object> achEntry = new HashMap<>();
		achEntry.put("title", "Hackathon Winner");
		achEntry.put("year", "2022");

		Map<String, Object> resumeData = new HashMap<>();
		resumeData.put("personalInformation", personalInfo);
		resumeData.put("summary", "Experienced software engineer specializing in building robust applications.");
		resumeData.put("education", Collections.singletonList(eduEntry));
		resumeData.put("experience", Collections.singletonList(expEntry));
		resumeData.put("projects", Collections.singletonList(projEntry));
		resumeData.put("skills", skills);
		resumeData.put("certifications", Collections.singletonList(certEntry));
		resumeData.put("achievements", Collections.singletonList(achEntry));

		// Test ATS template
		System.out.println("Generating ATS LaTeX...");
		String atsLatex = latexService.generateLatexCode(resumeData, "ats");
		System.out.println("ATS LaTeX:\n" + atsLatex);
		try {
			byte[] pdf = latexCompileService.compileToPdf(atsLatex);
			assertNotNull(pdf);
			System.out.println("ATS compiled successfully!");
		} catch (Exception e) {
			System.err.println("ATS COMPILATION FAILED: " + e.getMessage());
			throw e;
		}

		// Test Minimal template
		System.out.println("Generating Minimal LaTeX...");
		String minimalLatex = latexService.generateLatexCode(resumeData, "minimal");
		System.out.println("Minimal LaTeX:\n" + minimalLatex);
		try {
			byte[] pdf = latexCompileService.compileToPdf(minimalLatex);
			assertNotNull(pdf);
			System.out.println("Minimal compiled successfully!");
		} catch (Exception e) {
			System.err.println("MINIMAL COMPILATION FAILED: " + e.getMessage());
			throw e;
		}
	}
}
