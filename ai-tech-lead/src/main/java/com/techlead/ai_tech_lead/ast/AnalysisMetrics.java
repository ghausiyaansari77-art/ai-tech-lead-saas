package com.techlead.ai_tech_lead.ast;

import lombok.Data;

@Data
public class AnalysisMetrics {
    private int loopCount;
    private String calculatedComplexity;
    private String reason;
}
