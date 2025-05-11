package com.resumechecker.controller;

import com.resumechecker.model.Resume;
import com.resumechecker.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            Resume resume = resumeService.analyzeResume(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", resume.getId());
            response.put("fileName", resume.getFileName());
            response.put("atsScore", resume.getAtsScore());
            response.put("formatScore", resume.getFormatScore());
            response.put("keywords", resume.getKeywords());
            response.put("suggestedRole", resume.getSuggestedRole());
            
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("overallScore", resume.getAnalysis().getOverallScore());
            analysis.put("strengths", resume.getAnalysis().getStrengths());
            analysis.put("weaknesses", resume.getAnalysis().getWeaknesses());
            analysis.put("suggestions", resume.getAnalysis().getSuggestions());
            analysis.put("formatIssues", resume.getAnalysis().getFormatIssues());
            analysis.put("missingKeywords", resume.getAnalysis().getMissingKeywords());
            analysis.put("suggestedKeywords", resume.getAnalysis().getSuggestedKeywords());
            
            response.put("analysis", analysis);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResume(@PathVariable Long id) {
        // Implement get resume by ID
        return ResponseEntity.ok().build();
    }
} 