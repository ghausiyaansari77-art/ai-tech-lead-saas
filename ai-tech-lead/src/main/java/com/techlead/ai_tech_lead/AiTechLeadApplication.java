
package com.techlead.ai_tech_lead;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiTechLeadApplication {

    public static void main(String[] args) {
        String mongoUri = System.getenv("MONGO_URI");
       System.out.println("MONGO_URI PRESENT: " + (mongoUri != null && !mongoUri.isBlank()));
       System.out.println("MONGO_URI PREFIX: " + (mongoUri != null ? mongoUri.substring(0, Math.min(14, mongoUri.length())) : "NULL"));
        SpringApplication.run(AiTechLeadApplication.class, args);
    }
}

