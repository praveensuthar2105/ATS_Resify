package com.Backend.AI_Resume_Builder_Backend.ats;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class AtsController {
    private static final Logger log = LoggerFactory.getLogger(AtsController.class);

    @Autowired
    private AtsScoreService atsScoreService;

    @PostMapping("/ats-score")
    public ResponseEntity<Map<String, Object>> getAtsScore(
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String jobDescription) throws Exception {
        if (file.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid input");
            errorResponse.put("message", "File is required");
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> atsScore = atsScoreService.getAtsScore(file, jobDescription);
        return new ResponseEntity<>(atsScore, HttpStatus.OK);
    }
}
