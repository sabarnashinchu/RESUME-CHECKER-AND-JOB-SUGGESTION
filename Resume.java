package com.resumechecker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "resumes")
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Lob
    @Column(nullable = false)
    private byte[] fileData;

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "analysis_id")
    private ResumeAnalysis analysis;

    @ElementCollection
    @CollectionTable(name = "resume_keywords", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "keyword")
    private List<String> keywords;

    @Column
    private Integer atsScore;

    @Column
    private Integer formatScore;

    @Column
    private String suggestedRole;

    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }
} 