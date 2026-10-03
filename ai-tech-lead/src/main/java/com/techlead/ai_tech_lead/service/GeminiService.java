package com.techlead.ai_tech_lead.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    // Is function ko String se badal kar Map<String, Object> kiya hai taaki feedback aur score dono saath bheje ja sakein
    public Map<String, Object> reviewCode(String language, String code) {
        Map<String, Object> result = new HashMap<>();
        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Prompt ko thoda aur strict kiya taaki AI hamesha ek standard format me hi score de
        String prompt = "You are an expert MAANG Tech Lead. Review this " + language + " code. " +
                        "Provide a strict code quality score formatted exactly as 'CODE QUALITY SCORE: X / 100' where X is the number. " +
                        "Identify bugs, runtime complexity O(N), and optimization suggestions. " +
                        "Here is the code:\n" + code;

        Map<String, Object> textMap = new HashMap<>();
        textMap.put("text", prompt);

        Map<String, Object> partsMap = new HashMap<>();
        partsMap.put("parts", new Object[]{textMap});

        Map<String, Object> contentsMap = new HashMap<>();
        contentsMap.put("contents", new Object[]{partsMap});

        String fullUrl = apiUrl + "?key=" + apiKey;
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contentsMap, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, requestEntity, String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(response.getBody());

            String aiFeedback = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            // Naya function yahan call ho raha hai score nikalne ke liye
            int extractedScore = extractScoreFromText(aiFeedback);

            result.put("feedback", aiFeedback);
            result.put("score", extractedScore);

        } catch (Exception e) {
            result.put("feedback", "Error while calling Gemini AI: " + e.getMessage());
            result.put("score", 0);
        }

        return result;
    }

    // Yeh hai wo magical function jo case-insensitive tarike se score dhoond nikalega
    private int extractScoreFromText(String text) {
        Pattern pattern = Pattern.compile("CODE QUALITY SCORE:\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                return 50; 
            }
        }
        return 50; // Fallback score agar AI score dena bhool jaye
    }
}
