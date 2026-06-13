package com.Backend.AI_Resume_Builder_Backend.resume;

import java.io.IOException;
import java.util.Map;


public interface ResumeService {

	Map<String, Object> generateResumeResponse(String userResumeDescription) throws IOException;

	Map<String, Object> generateResumeResponse(String userResumeDescription, String templateType) throws IOException;

}