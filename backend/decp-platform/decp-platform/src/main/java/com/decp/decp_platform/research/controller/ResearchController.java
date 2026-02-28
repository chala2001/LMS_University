package com.decp.decp_platform.research.controller;

import com.decp.decp_platform.research.entity.ResearchProject;
import com.decp.decp_platform.research.service.ResearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/research")
public class ResearchController {

    private final ResearchService researchService;

    public ResearchController(ResearchService researchService) {
        this.researchService = researchService;
    }

    @PostMapping
    public ResearchProject createProject(
            @RequestParam String title,
            @RequestParam String description) {

        return researchService.createProject(title, description);
    }

    @PostMapping("/{id}/join")
    public String joinProject(@PathVariable Long id) {
        return researchService.joinProject(id);
    }

    @GetMapping
    public List<ResearchProject> getAllProjects() {
        return researchService.getAllProjects();
    }

    @GetMapping("/{id}/members")
    public List<String> getMembers(@PathVariable Long id) {
        return researchService.getProjectMembers(id);
    }

    @DeleteMapping("/{id}")
    public String deleteProject(@PathVariable Long id) {
        return researchService.deleteProject(id);
    }

    @PutMapping("/{id}")
    public ResearchProject updateProject(@PathVariable Long id,
                                         @RequestParam String title,
                                         @RequestParam String description) {

        return researchService.updateProject(id, title, description);
    }
}
