package com.Backend.AI_Resume_Builder_Backend.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.AI_Resume_Builder_Backend.Entity.Resume;
import com.Backend.AI_Resume_Builder_Backend.Entity.User;
import com.Backend.AI_Resume_Builder_Backend.Repository.ResumeRepository;
import com.Backend.AI_Resume_Builder_Backend.Repository.UserRepository;
import com.Backend.AI_Resume_Builder_Backend.Security.JwtUtil;
import com.Backend.AI_Resume_Builder_Backend.Service.ResumeRequest;
import com.Backend.AI_Resume_Builder_Backend.Service.ResumeService;
import com.Backend.AI_Resume_Builder_Backend.Service.AtsScoreService;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class resumeController {
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
			@RequestBody ResumeRequest resumeRequest,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		try {
			// Validate input
			if (resumeRequest == null || resumeRequest.getUserResumeDescription() == null ||
					resumeRequest.getUserResumeDescription().trim().isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("error", "Invalid input");
				errorResponse.put("message", "User resume description is required");
				return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
			}

			// Get template type from request, default to "modern" if not provided
			String templateType = resumeRequest.getTemplateType();
			if (templateType == null || templateType.trim().isEmpty()) {
				templateType = "modern";
			}

			// Save resume generation record if user is authenticated
			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				String token = authHeader.substring(7);
				if (jwtUtil.validateToken(token)) {
					String email = jwtUtil.getEmailFromToken(token);
					Optional<User> userOpt = userRepository.findByEmail(email);
					if (userOpt.isPresent()) {
						Resume resume = new Resume(userOpt.get(), templateType);
						resumeRepository.save(resume);
					}
				}
			}

			Map<String, Object> jsonObject = resumeService
					.generateResumeResponse(resumeRequest.getUserResumeDescription(), templateType);
			return new ResponseEntity<>(jsonObject, HttpStatus.OK);
		} catch (IOException e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "Failed to load prompt template");
			errorResponse.put("message", e.getMessage());
			e.printStackTrace(); // Add logging for debugging
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
			e.printStackTrace();
			return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
