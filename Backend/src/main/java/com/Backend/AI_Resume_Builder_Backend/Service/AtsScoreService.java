package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface AtsScoreService {
    Map<String, Object> getAtsScore(MultipartFile resumeFile) throws IOException;

    Map<String, Object> getAtsScore(MultipartFile resumeFile, String jobDescription) throws IOException;
}
