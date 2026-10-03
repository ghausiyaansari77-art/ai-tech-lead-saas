package com.techlead.ai_tech_lead.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true) // Database level safety parameters for accounts isolation
    private String email;
    
    private String password; 
    private String fullName;
    private String gitHubToken; 
    private LocalDateTime createdAt = LocalDateTime.now();
}
