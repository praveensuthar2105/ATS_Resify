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
@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    private static final Logger log = LoggerFactory.getLogger(ResumeController.class);

	@Autowired
	private ResumeService resumeService;

	@Autowired
	private com.Backend.AI_Resume_Builder_Backend.resume.messaging.ResumeGenProducer resumeGenProducer;

	@Autowired
	private com.Backend.AI_Resume_Builder_Backend.resume.messaging.ResumeGenResultListener resumeGenResultListener;

	@PostMapping("/generate")
	public ResponseEntity<Map<String, Object>> getResumeData(
			@jakarta.validation.Valid @RequestBody ResumeRequest resumeRequest) throws Exception {
		// Get template type from request, default to "modern" if not provided
		String templateType = resumeRequest.getTemplateType();
		if (templateType == null || templateType.trim().isEmpty()) {
			templateType = "modern";
		}

		Map<String, Object> jsonObject = resumeService
				.generateResumeResponse(resumeRequest.getUserResumeDescription(), templateType);

		// Save resume generation log only for successful authenticated generations
		boolean generationSucceeded = jsonObject != null
				&& !jsonObject.containsKey("error")
				&& jsonObject.get("data") != null;
		org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		if (generationSucceeded
				&& authentication != null
				&& authentication.isAuthenticated()
				&& !authentication.getName().equals("anonymousUser")) {
			String email = authentication.getName();
			try {
				resumeService.saveResumeToDb(email, templateType, jsonObject);
			} catch (Exception e) {
				log.warn("Failed to persist resume generation log for {}: {}", email, e.getMessage());
			}
		}

		return new ResponseEntity<>(jsonObject, HttpStatus.OK);
	}

	/**
	 * Async endpoint for resume generation.
	 * Returns immediately with a jobId.
	 */
	@PostMapping("/generate/async")
	public ResponseEntity<Map<String, Object>> generateResumeAsync(
			@jakarta.validation.Valid @RequestBody ResumeRequest resumeRequest) throws Exception {
		String templateType = resumeRequest.getTemplateType();
		if (templateType == null || templateType.trim().isEmpty()) {
			templateType = "modern";
		}

		String userEmail = "anonymous";
		org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
			userEmail = authentication.getName();
		}

		com.Backend.AI_Resume_Builder_Backend.messaging.ResumeGenEvent event = 
				com.Backend.AI_Resume_Builder_Backend.messaging.ResumeGenEvent.createRequest(
						resumeRequest.getUserResumeDescription(), templateType, userEmail);

		String jobId = event.getJobId();
		final String finalTemplateType = templateType;
		try {
			resumeGenProducer.requestGeneration(event);
		} catch (Exception e) {
			log.warn("RabbitMQ is down, falling back to synchronous generation. Error: {}", e.getMessage());
			// Fallback to synchronous generation in a separate thread
			new Thread(() -> {
				try {
					Map<String, Object> jsonObject = resumeService.generateResumeResponse(resumeRequest.getUserResumeDescription(), finalTemplateType);
					event.setResultData(jsonObject);
					event.setStatus("COMPLETED");
					resumeGenResultListener.putResult(jobId, event);
				} catch (Exception ex) {
					event.setErrorMessage(ex.getMessage());
					event.setStatus("FAILED");
					resumeGenResultListener.putResult(jobId, event);
				}
			}).start();
		}

		Map<String, Object> response = new HashMap<>();
		response.put("jobId", jobId);
		response.put("status", "PENDING");
		response.put("message", "Resume generation submitted. Poll /api/resume/generate/status/" + jobId + " for results.");

		return ResponseEntity.accepted().body(response);
	}

	/**
	 * Poll for async resume generation result.
	 */
	@org.springframework.web.bind.annotation.GetMapping(value = "/generate/status/{jobId}", produces = "application/json")
	public ResponseEntity<Map<String, Object>> getGenerateStatus(@org.springframework.web.bind.annotation.PathVariable String jobId) {
		com.Backend.AI_Resume_Builder_Backend.messaging.ResumeGenEvent event = resumeGenResultListener.getResult(jobId);

		if (event == null) {
			return ResponseEntity.ok(Map.of(
					"jobId", jobId,
					"status", "PROCESSING",
					"message", "Still generating. Please poll again."
			));
		}

		Map<String, Object> response = new HashMap<>();
		response.put("jobId", jobId);
		response.put("status", event.getStatus());

		if ("COMPLETED".equals(event.getStatus())) {
			response.put("data", event.getResultData());

			// Save resume generation log only for successful authenticated generations
			Map<String, Object> resultData = event.getResultData();
			boolean generationSucceeded = resultData != null
					&& !resultData.containsKey("error")
					&& resultData.get("data") != null;
			if (generationSucceeded
					&& event.getUserEmail() != null
					&& !"anonymous".equals(event.getUserEmail())) {
				try {
					String templateType = event.getTemplateType() != null ? event.getTemplateType() : "modern";
					resumeService.saveResumeToDb(event.getUserEmail(), templateType, resultData);
				} catch (Exception e) {
					log.warn("Failed to persist async resume generation log for {}: {}",
							event.getUserEmail(), e.getMessage());
				}
			}

			resumeGenResultListener.consumeResult(jobId);
		} else if ("FAILED".equals(event.getStatus())) {
			response.put("error", event.getErrorMessage());
			resumeGenResultListener.consumeResult(jobId);
		}

		return ResponseEntity.ok(response);
	}

	/**
	 * Endpoint to manually log or save a resume to the database.
	 * Can be used for custom scratch, imported, or updated resumes.
	 */
	@PostMapping("/save")
	public ResponseEntity<?> saveResumeLog(@RequestBody Map<String, Object> requestBody) {
		String templateType = (String) requestBody.get("templateType");
		if (templateType == null || templateType.trim().isEmpty()) {
			templateType = "ats";
		}

		org.springframework.security.core.Authentication authentication = 
				org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication != null 
				&& authentication.isAuthenticated() 
				&& !authentication.getName().equals("anonymousUser")) {
			String email = authentication.getName();
			try {
				resumeService.saveResumeToDb(email, templateType, requestBody);
				return ResponseEntity.ok(Map.of("success", true, "message", "Resume logged successfully"));
			} catch (Exception e) {
				log.error("Failed to save resume log manually", e);
				return new ResponseEntity<>(Map.of("error", "Failed to save resume log", "message", e.getMessage()), 
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
		return new ResponseEntity<>(Map.of("error", "Unauthorized. Please sign in to log your resume."), 
				HttpStatus.UNAUTHORIZED);
	}

}