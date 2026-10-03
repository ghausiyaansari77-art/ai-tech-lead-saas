package com.techlead.ai_tech_lead.score;

import com.techlead.ai_tech_lead.compiler.ExecutionMetrics;
import com.techlead.ai_tech_lead.ast.AnalysisMetrics;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class ScoreCalculator {

    // Computes an absolute mathematical weighted score metric parameters matrix
    public Map<String, Integer> calculatePlatformScore(ExecutionMetrics executionMetrics, AnalysisMetrics astMetrics, String code) {
        Map<String, Integer> scoresMap = new HashMap<>();

        // 1. Correctness Index Calculation (Weight: 25%)
        int correctness = 100;
        if (!executionMetrics.isSuccess()) {
            if ("COMPILATION_FAILED".equals(executionMetrics.getRuntimeStatus())) {
                correctness = 0; // Syntax failure breaks execution completely
            } else if ("EXECUTION_TIMEOUT".equals(executionMetrics.getRuntimeStatus())) {
                correctness = 30; // Resource leak protection triggered
            } else {
                correctness = 40; // Runtime crash indicators fallback
            }
        }
        scoresMap.put("correctness", correctness);

        // 2. Performance Index Calculation (Weight: 20%)
        int performance = 100;
        if ("O(N²)".equals(astMetrics.getCalculatedComplexity())) {
            performance = 50; // Heavily penalize nested iterations depth logic
        } else if ("O(N)".equals(astMetrics.getCalculatedComplexity())) {
            performance = 85; // Standard iterative traversal baseline scaling
        }
        // Penalize higher runtime thresholds dynamically
        if (executionMetrics.getExecutionDurationMs() > 500) {
            performance = Math.max(10, performance - 20);
        }
        scoresMap.put("performance", performance);

        // 3. Security Index Calculation (Weight: 20%)
        int security = 100;
        String sanitizedCode = code.toLowerCase();
        if (sanitizedCode.contains("runtime.getruntime().exec") || sanitizedCode.contains("processbuilder")) {
            security -= 50; // Critical subprocess command injection risk vulnerability
        }
        if (sanitizedCode.contains("password") || sanitizedCode.contains("secret_key") || sanitizedCode.contains("apikey")) {
            security -= 30; // High level hardcoded credentials indicator leaks risk
        }
        scoresMap.put("security", security);

        // 4. Maintainability & Code Quality Index Calculation (Weight: 15%)
        int maintainability = 100;
        if (code.length() > 5000) {
            maintainability -= 20; // Massive monolith class structure pollution flags
        }
        if (!code.contains("/**") && !code.contains("//")) {
            maintainability -= 15; // Zero structural inline comments metrics penalty
        }
        scoresMap.put("maintainability", maintainability);

        // 5. Final Mathematical Weighted Score Synthesis
        // Score = (C * 25%) + (P * 20%) + (S * 20%) + (M * 15%) aggregated properly up to 100 basis
        double weightedSum = (correctness * 0.30) + (performance * 0.25) + (security * 0.25) + (maintainability * 0.20);
        int finalAggregatedScore = (int) Math.round(weightedSum);

        scoresMap.put("finalScore", Math.max(0, Math.min(100, finalAggregatedScore)));

        return scoresMap;
    }
}

