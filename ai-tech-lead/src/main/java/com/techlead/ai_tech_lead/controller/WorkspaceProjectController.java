package com.techlead.ai_tech_lead.controller;

import com.techlead.ai_tech_lead.model.WorkspaceProject;
import com.techlead.ai_tech_lead.repository.WorkspaceProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class WorkspaceProjectController {

    @Autowired
    private WorkspaceProjectRepository projectRepository;

    // 🚀 1. POST API: Creates a brand new isolated project directory for a specific developer user account context
    @PostMapping("/create")
    public ResponseEntity<WorkspaceProject> createProject(@RequestBody WorkspaceProject project) {
        WorkspaceProject savedProject = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);
    }

    // 🚀 2. GET API: Fetches all project directories tracking folders belonging to a particular userId parameters
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkspaceProject>> getUserProjects(@PathVariable String userId) {
        List<WorkspaceProject> projectsList = projectRepository.findByUserId(userId);
        return ResponseEntity.ok(projectsList);
    }
}
