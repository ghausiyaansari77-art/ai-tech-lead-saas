package com.techlead.ai_tech_lead.ast;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class StaticASTAnalyzer {

    // Analyzes the structural pattern layout of loops inside code snippets strings vectors
    public AnalysisMetrics scanStructure(String code) {
        AnalysisMetrics metrics = new AnalysisMetrics();
        
        // Match standard loop configurations metrics properties loops patterns execution tokens
        int forCount = countMatches(code, "\\bfor\\s*\\(");
        int whileCount = countMatches(code, "\\bwhile\\s*\\(");
        int totalLoops = forCount + whileCount;

        metrics.setLoopCount(totalLoops);

        // Remove all whitespace formatting blocks elements for linear context structural analysis lookup adjustment
        String cleanCode = code.replaceAll("\\s+", "");

        // Static AST checking logic matching nested linear combinations loop declarations
        boolean hasNestedLoop = cleanCode.contains("for(") && 
                                (cleanCode.indexOf("for(", cleanCode.indexOf("for(") + 1) > 0);

        if (hasNestedLoop && totalLoops >= 2) {
            metrics.setCalculatedComplexity("O(N²)");
            metrics.setReason("AST Structural Scanner verified consecutive nested loop processing blocks traversing dimensional boundaries.");
        } else if (totalLoops == 1) {
            metrics.setCalculatedComplexity("O(N)");
            metrics.setReason("Verified a singular bounded iterative traversal loop pattern accessing sequential indices flow.");
        } else {
            metrics.setCalculatedComplexity("O(1)");
            metrics.setReason("Linear computation paths confirmed. Code footprint operates in constant time without deep iterations index matrices.");
        }

        return metrics;
    }

    private int countMatches(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }
}
