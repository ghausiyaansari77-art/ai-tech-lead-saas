package com.techlead.ai_tech_lead.compiler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestCaseVerifier {

    @Autowired
    private CompilerEngine compilerEngine;

    // Evaluates the raw code mapping it explicitly over test case bounds strings
    public TestResult runTest(String sourceCode, String input, String expectedOutput) {
        TestResult result = new TestResult();
        
        // 1. Trigger the sandbox subprocess system variables flow
        ExecutionMetrics metrics = compilerEngine.runJavaSandbox(sourceCode, input);
        
        result.setRuntimeStatus(metrics.getRuntimeStatus());
        result.setExecutionTimeMs(metrics.getExecutionDurationMs());
        result.setMemoryUsedMb(metrics.getMemoryConsumptionMb());
        result.setActualOutput(metrics.getConsoleLogs());
        result.setExpectedOutput(expectedOutput);

        // 2. Perform dynamic exact semantic checks verification comparisons nodes
        if (!metrics.isSuccess()) {
            result.setPassed(false);
            result.setFeedbackMessage("Execution terminated abnormally at stage: " + metrics.getRuntimeStatus());
        } else {
            String sanitizedActual = metrics.getConsoleLogs().trim().replaceAll("\\r\\n", "\n");
            String sanitizedExpected = expectedOutput.trim().replaceAll("\\r\\n", "\n");
            
            if (sanitizedActual.equals(sanitizedExpected)) {
                result.setPassed(true);
                result.setFeedbackMessage("✓ Validation Index Check Verified: Output matches structural parameters.");
            } else {
                result.setPassed(false);
                result.setFeedbackMessage("✗ Structural Mismatch: Actual computation differs from expected outputs token vectors.");
            }
        }
        
        return result;
    }
}
