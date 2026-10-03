package com.techlead.ai_tech_lead.compiler;

import lombok.Data;

@Data
public class ExecutionMetrics {
    private boolean success;
    private String runtimeStatus; // COMPILATION_FAILED, EXECUTION_TIMEOUT, RUNTIME_CRASH, PASSED
    private String consoleLogs; // System raw console logs outputs or error dumps
    private double executionDurationMs; // Real benchmarking telemetry duration indicator 📈
    private double memoryConsumptionMb; // Dynamic RAM capacity footprints weight tracking parameters
}
