package com.techlead.ai_tech_lead.compiler;

import lombok.Data;

@Data
public class TestResult {
    private boolean passed;
    private String runtimeStatus;
    private String expectedOutput;
    private String actualOutput;
    private String feedbackMessage;
    private double executionTimeMs;
    private double memoryUsedMb;
}
