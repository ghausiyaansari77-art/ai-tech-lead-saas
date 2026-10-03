package com.techlead.ai_tech_lead.repository;

import com.techlead.ai_tech_lead.model.WorkspaceProject;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WorkspaceProjectRepository extends MongoRepository<WorkspaceProject, String> {
    // Multi-tenant project workspace router query utility to isolate developer tracking nodes
    List<WorkspaceProject> findByUserId(String userId);
}

