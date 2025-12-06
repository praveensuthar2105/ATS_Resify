package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Entity.ResumeData;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ResumeWebSocketController {

    @MessageMapping("/resume/update")
    @SendTo("/topic/resume")
    public ResumeData updateResume(ResumeData resumeData) {
        // Broadcast updated resume data to all connected clients
        return resumeData;
    }

    @MessageMapping("/resume/json-update")
    @SendTo("/topic/resume/json")
    public String updateJson(String json) {
        // Broadcast JSON update to all connected clients
        return json;
    }

    @MessageMapping("/resume/latex-update")
    @SendTo("/topic/resume/latex")
    public String updateLatex(String latex) {
        // Broadcast LaTeX update to all connected clients
        return latex;
    }
}
