package com.Backend.AI_Resume_Builder_Backend.resume;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Backend.AI_Resume_Builder_Backend.ats.AtsScoreService;
import com.Backend.AI_Resume_Builder_Backend.auth.JwtUtil;
import com.Backend.AI_Resume_Builder_Backend.user.User;
import com.Backend.AI_Resume_Builder_Backend.user.UserRepository;






@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    private static final Logger log = LoggerFactory.getLogger(ResumeController.class);

	@Autowired
	private ResumeService resumeService;

	@Autowired
	private AtsScoreService atsScoreService;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ResumeRepository resumeRepository;

	@PostMapping("/generate")
	public ResponseEntity<Map<String, Object>> getResumeData(
			@jakarta.validation.Valid @RequestBody ResumeRequest resumeRequest) {
		try {
			// Get template type from request, default to "modern" if not provided
			String templateType = resumeRequest.getTemplateType();
			if (templateType == null || templateType.trim().isEmpty()) {
				templateType = "modern";
			}

			Map<String, Object> jsonObject = resumeService
					.generateResumeResponse(resumeRequest.getUserResumeDescription(), templateType);

			// Save resume generation record if user is authenticated
			org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
				String email = authentication.getName();
				Optional<User> userOpt = userRepository.findByEmail(email);
				if (userOpt.isPresent()) {
					Resume resume = new Resume(userOpt.get(), templateType);
					
					try {
						// Extract and save resume content
						Object dataObj = jsonObject.get("data");
						if (dataObj != null) {
							ObjectMapper mapper = new ObjectMapper();
							String resumeJson = mapper.writeValueAsString(dataObj);
							resume.setResumeJson(resumeJson);
							
							// Try to extract name for easy reference
							if (dataObj instanceof Map) {
								@SuppressWarnings("unchecked")
								Map<String, Object> dataMap = (Map<String, Object>) dataObj;
								Object personalInfoObj = dataMap.get("personalInformation");
								if (personalInfoObj instanceof Map) {
									@SuppressWarnings("unchecked")
									Map<String, Object> personalInfo = (Map<String, Object>) personalInfoObj;
									Object nameObj = personalInfo.get("fullName");
									if (nameObj != null) {
										resume.setCandidateName(nameObj.toString());
									}
								}
							}
						}
					} catch (Exception ex) {
						log.warn("Failed to serialize resume content for persistence", ex);
					}
					
					resumeRepository.save(resume);
				}
			}

			return new ResponseEntity<>(jsonObject, HttpStatus.OK);
		} catch (IOException e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "Failed to load prompt template");
			errorResponse.put("message", e.getMessage());
			log.error("Exception occurred", e); // Add logging for debugging
			return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "Internal server error");
			errorResponse.put("message", e.getMessage());
			// Avoid returning raw stacktrace in API responses; log it server-side instead.
			return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/ats-score")
	public ResponseEntity<Map<String, Object>> getAtsScore(
			@RequestParam MultipartFile file,
			@RequestParam(required = false) String jobDescription) {
		try {
			if (file.isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("error", "Invalid input");
				errorResponse.put("message", "File is required");
				return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
			}

			Map<String, Object> atsScore = atsScoreService.getAtsScore(file, jobDescription);
			return new ResponseEntity<>(atsScore, HttpStatus.OK);
		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "Internal server error");
			errorResponse.put("message", e.getMessage());
			log.error("Exception occurred", e);
			return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}