package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.web.multipart.MultipartFile;

public class AtsScoreRequest {
    private MultipartFile resumeFile;

    public AtsScoreRequest() {
    }

    public MultipartFile getResumeFile() {
        return resumeFile;
    }

    public void setResumeFile(MultipartFile resumeFile) {
        this.resumeFile = resumeFile;
    }
}
