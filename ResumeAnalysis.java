package com.resumechecker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "resume_analysis")
public class ResumeAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer overallScore;

    @ElementCollection
    @CollectionTable(name = "analysis_strengths", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "strength")
    private List<String> strengths;

    @ElementCollection
    @CollectionTable(name = "analysis_weaknesses", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "weakness")
    private List<String> weaknesses;

    @ElementCollection
    @CollectionTable(name = "analysis_suggestions", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "suggestion")
    private List<String> suggestions;

    @ElementCollection
    @CollectionTable(name = "analysis_format_issues", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "format_issue")
    private List<String> formatIssues;

    @ElementCollection
    @CollectionTable(name = "analysis_missing_keywords", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "missing_keyword")
    private List<String> missingKeywords;

    @ElementCollection
    @CollectionTable(name = "analysis_suggested_keywords", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "suggested_keyword")
    private List<String> suggestedKeywords;

    @ElementCollection
    @CollectionTable(name = "analysis_keywords", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "keyword")
    private List<String> keywords;
} 