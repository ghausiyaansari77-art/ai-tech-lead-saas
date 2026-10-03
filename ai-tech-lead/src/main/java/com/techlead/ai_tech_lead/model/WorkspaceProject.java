package com.techlead.ai_tech_lead.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "workspace_projects")
public class WorkspaceProject {
    @Id
    private String id;
    private String userId; // Isolated reference logic to bundle files to its owner
    private String projectName; // e.g., "LeetCode Practice"
    private String description;
    private LocalDateTime createdAt = LocalDateTime.now();
}

