package com.techlead.ai_tech_lead.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "code_reviews")
public class CodeReview {
    @Id
    private String id;
    private String projectId; // 📁 Linked Workspace Project Identifier
    private String userId;    // 🔐 Linked Multi-Tenant User Identifier
    private int score;        // Overall dynamic score
    private String reviewStatus;
    private String programmingLanguage;
    private String submittedCode;
    private String aiFeedback;
    
    // Explicit dynamic sub-score tracking indicators layout matrix 📊
    private int correctnessScore;
    private int performanceScore;
    private int securityScore;
    private int maintainabilityScore;

    // Advanced Telemetry Subprocess Fields 📈
    private boolean compilationSuccess;
    private String executionStage;
    private String compilerConsoleOutput;
    private double runtimeDurationMs;
    private String calculatedComplexity;

    private LocalDateTime createdAt = LocalDateTime.now();
}
