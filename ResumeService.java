package com.resumechecker.service;

import com.resumechecker.model.Resume;
import com.resumechecker.model.ResumeAnalysis;
import com.resumechecker.repository.ResumeRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    private static final Map<String, List<String>> ROLE_KEYWORDS = new HashMap<>();
    private static final Map<String, List<String>> ROLE_SKILLS = new HashMap<>();

    static {
        // Software Developer keywords and skills
        ROLE_KEYWORDS.put("SOFTWARE_DEVELOPER", Arrays.asList(
            "software development", "programming", "coding", "development",
            "software engineer", "developer", "programmer"
        ));
        ROLE_SKILLS.put("SOFTWARE_DEVELOPER", Arrays.asList(
            "java", "python", "javascript", "c++", "c#", "sql",
            "spring", "react", "angular", "node.js", "git", "agile"
        ));

        // Data Scientist keywords and skills
        ROLE_KEYWORDS.put("DATA_SCIENTIST", Arrays.asList(
            "data science", "machine learning", "artificial intelligence",
            "data analysis", "statistics", "predictive modeling"
        ));
        ROLE_SKILLS.put("DATA_SCIENTIST", Arrays.asList(
            "python", "r", "tensorflow", "pytorch", "scikit-learn",
            "pandas", "numpy", "sql", "machine learning", "statistics"
        ));

        // DevOps Engineer keywords and skills
        ROLE_KEYWORDS.put("DEVOPS_ENGINEER", Arrays.asList(
            "devops", "continuous integration", "continuous deployment",
            "infrastructure", "automation", "cloud"
        ));
        ROLE_SKILLS.put("DEVOPS_ENGINEER", Arrays.asList(
            "docker", "kubernetes", "jenkins", "aws", "azure",
            "terraform", "ansible", "linux", "ci/cd", "git"
        ));
    }

    public Resume analyzeResume(MultipartFile file) throws IOException {
        Resume resume = new Resume();
        resume.setFileName(file.getOriginalFilename());
        resume.setFileType(file.getContentType());
        resume.setFileData(file.getBytes());

        String content = extractTextFromFile(file);
        String detectedRole = detectRole(content);
        ResumeAnalysis analysis = analyzeContent(content, detectedRole);
        resume.setAnalysis(analysis);
        resume.setKeywords(extractKeywords(content));
        resume.setAtsScore(calculateATSScore(analysis, detectedRole));
        resume.setFormatScore(calculateFormatScore(analysis));
        resume.setSuggestedRole(detectedRole);

        return resumeRepository.save(resume);
    }

    private String detectRole(String content) {
        String lowerContent = content.toLowerCase();
        Map<String, Integer> roleScores = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : ROLE_KEYWORDS.entrySet()) {
            int score = 0;
            for (String keyword : entry.getValue()) {
                if (lowerContent.contains(keyword.toLowerCase())) {
                    score += 2;
                }
            }
            for (String skill : ROLE_SKILLS.get(entry.getKey())) {
                if (lowerContent.contains(skill.toLowerCase())) {
                    score += 1;
                }
            }
            roleScores.put(entry.getKey(), score);
        }

        return roleScores.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("GENERAL");
    }

    private String extractTextFromFile(MultipartFile file) throws IOException {
        if (file.getContentType().equals("application/pdf")) {
            try (PDDocument document = PDDocument.load(file.getInputStream())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } else if (file.getContentType().equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
                XWPFWordExtractor extractor = new XWPFWordExtractor(document);
                return extractor.getText();
            }
        }
        throw new IOException("Unsupported file format");
    }

    private ResumeAnalysis analyzeContent(String content, String role) {
        ResumeAnalysis analysis = new ResumeAnalysis();
        String lowerContent = content.toLowerCase();
        
        // Calculate overall score based on role-specific criteria
        int score = calculateOverallScore(lowerContent, role);
        analysis.setOverallScore(score);

        // Identify strengths based on role
        List<String> strengths = identifyStrengths(lowerContent, role);
        analysis.setStrengths(strengths);

        // Identify weaknesses based on role
        List<String> weaknesses = identifyWeaknesses(lowerContent, role);
        analysis.setWeaknesses(weaknesses);

        // Generate role-specific suggestions
        List<String> suggestions = generateSuggestions(lowerContent, role);
        analysis.setSuggestions(suggestions);

        // Check format issues
        List<String> formatIssues = checkFormatIssues(content);
        analysis.setFormatIssues(formatIssues);

        // Identify missing keywords for the role
        List<String> missingKeywords = identifyMissingKeywords(lowerContent, role);
        analysis.setMissingKeywords(missingKeywords);

        // Generate suggested keywords for the role
        List<String> suggestedKeywords = generateSuggestedKeywords(role);
        analysis.setSuggestedKeywords(suggestedKeywords);

        // Set extracted keywords to avoid null pointer
        List<String> extractedKeywords = extractKeywords(content);
        analysis.setKeywords(extractedKeywords);

        return analysis;
    }

    private Integer calculateOverallScore(String content, String role) {
        int score = 40;
        int sectionCount = 0;
        // Section presence
        if (content.contains("summary")) { score += 10; sectionCount++; }
        if (content.contains("experience")) { score += 10; sectionCount++; }
        if (content.contains("education")) { score += 10; sectionCount++; }
        if (content.contains("skills")) { score += 10; sectionCount++; }
        if (content.contains("project")) { score += 5; sectionCount++; }
        if (content.length() > 1000) score += 5;
        if (content.length() < 500) score -= 10;
        // Penalize for missing sections
        if (sectionCount < 3) score -= 10;
        // Role-specific scoring
        List<String> roleSkills = ROLE_SKILLS.get(role);
        int matchedSkills = 0;
        if (roleSkills != null) {
            for (String skill : roleSkills) {
                if (content.contains(skill.toLowerCase())) {
                    matchedSkills++;
                }
            }
            score += Math.min(matchedSkills * 2, 15); // Cap skill bonus
        }
        return Math.max(0, Math.min(score, 100));
    }

    private List<String> identifyStrengths(String content, String role) {
        List<String> strengths = new ArrayList<>();
        List<String> roleSkills = ROLE_SKILLS.get(role);
        
        if (roleSkills != null) {
            for (String skill : roleSkills) {
                if (content.contains(skill.toLowerCase())) {
                    strengths.add("Strong " + skill + " skills");
                }
            }
        }

        if (content.contains("experience")) {
            strengths.add("Includes relevant work experience");
        }
        if (content.contains("education")) {
            strengths.add("Includes educational background");
        }
        if (content.contains("project")) {
            strengths.add("Includes project experience");
        }

        return strengths;
    }

    private List<String> identifyWeaknesses(String content, String role) {
        List<String> weaknesses = new ArrayList<>();
        List<String> roleSkills = ROLE_SKILLS.get(role);
        
        if (roleSkills != null) {
            for (String skill : roleSkills) {
                if (!content.contains(skill.toLowerCase())) {
                    weaknesses.add("Missing " + skill + " skills");
                }
            }
        }

        if (!content.contains("experience")) {
            weaknesses.add("No work experience mentioned");
        }
        if (!content.contains("education")) {
            weaknesses.add("No educational background mentioned");
        }
        if (!content.contains("project")) {
            weaknesses.add("No project experience mentioned");
        }

        return weaknesses;
    }

    private List<String> generateSuggestions(String content, String role) {
        List<String> suggestions = new ArrayList<>();
        List<String> missingKeywords = identifyMissingKeywords(content, role);
        
        for (String keyword : missingKeywords) {
            suggestions.add("Consider adding " + keyword + " to your resume");
        }

        if (!content.contains("summary")) {
            suggestions.add("Add a professional summary section");
        }
        if (!content.contains("achievement")) {
            suggestions.add("Include specific achievements and metrics");
        }
        if (!content.contains("certification")) {
            suggestions.add("Add relevant certifications if any");
        }

        return suggestions;
    }

    private List<String> checkFormatIssues(String content) {
        List<String> issues = new ArrayList<>();
        
        if (content.length() < 500) {
            issues.add("Resume content is too short");
        }
        if (content.length() > 2000) {
            issues.add("Resume content is too long");
        }
        if (!content.contains("\n")) {
            issues.add("Poor formatting - no line breaks");
        }
        if (content.contains("  ")) {
            issues.add("Multiple spaces detected - check formatting");
        }

        return issues;
    }

    private List<String> identifyMissingKeywords(String content, String role) {
        List<String> missing = new ArrayList<>();
        List<String> roleSkills = ROLE_SKILLS.get(role);
        
        if (roleSkills != null) {
            for (String skill : roleSkills) {
                if (!content.contains(skill.toLowerCase())) {
                    missing.add(skill);
                }
            }
        }

        return missing;
    }

    private List<String> generateSuggestedKeywords(String role) {
        return ROLE_SKILLS.getOrDefault(role, new ArrayList<>());
    }

    private Integer calculateATSScore(ResumeAnalysis analysis, String role) {
        int score = 50;
        // Keyword/skill match
        List<String> roleSkills = ROLE_SKILLS.get(role);
        int matched = 0, missing = 0;
        if (roleSkills != null && analysis.getKeywords() != null) {
            for (String skill : roleSkills) {
                if (analysis.getKeywords().contains(skill.toLowerCase())) matched++;
                else missing++;
            }
        }
        score += matched * 3;
        score -= missing * 2;
        // Formatting issues
        if (analysis.getFormatIssues() != null) score -= analysis.getFormatIssues().size() * 3;
        // Penalize for missing keywords
        if (analysis.getMissingKeywords() != null) score -= analysis.getMissingKeywords().size();
        // Bonus for suggestions addressed
        if (analysis.getSuggestions() != null && analysis.getSuggestions().size() < 3) score += 5;
        return Math.max(0, Math.min(score, 100));
    }

    private Integer calculateFormatScore(ResumeAnalysis analysis) {
        int score = 80;
        if (analysis.getFormatIssues() != null) {
            score -= analysis.getFormatIssues().size() * 5;
        }
        return Math.max(0, Math.min(score, 100));
    }

    private List<String> extractKeywords(String content) {
        List<String> keywords = new ArrayList<>();
        String lowerContent = content.toLowerCase();
        
        // Extract common technical keywords
        String[] commonKeywords = {
            "java", "python", "javascript", "c++", "c#", "sql",
            "spring", "react", "angular", "node.js", "git", "agile",
            "docker", "kubernetes", "aws", "azure", "linux",
            "machine learning", "data science", "artificial intelligence",
            "devops", "ci/cd", "microservices", "rest api", "graphql"
        };
        
        for (String keyword : commonKeywords) {
            if (lowerContent.contains(keyword.toLowerCase())) {
                keywords.add(keyword);
            }
        }
        
        return keywords;
    }
} 