package com.decp.decp_platform.research.controller;

import com.decp.decp_platform.research.entity.ResearchProject;
import com.decp.decp_platform.research.dto.ResearchProjectResponse;
import com.decp.decp_platform.research.dto.ResearchProjectRequest;
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
    public ResearchProject createProject(@RequestBody ResearchProjectRequest request) {
        return researchService.createProject(request.getTitle(), request.getDescription(), request.getStatus());
    }

    @PostMapping("/{id}/join")
    public String joinProject(@PathVariable("id") Long id) {
        return researchService.joinProject(id);
    }

    @GetMapping
    public List<ResearchProjectResponse> getAllProjects() {
        return researchService.getAllProjects();
    }

    @GetMapping("/{id}/members")
    public List<String> getMembers(@PathVariable("id") Long id) {
        return researchService.getProjectMembers(id);
    }

    @DeleteMapping("/{id}")
    public String deleteProject(@PathVariable("id") Long id) {
        return researchService.deleteProject(id);
    }

    @PutMapping("/{id}")
    public ResearchProject updateProject(@PathVariable("id") Long id,
                                         @RequestBody ResearchProjectRequest request) {

        return researchService.updateProject(id, request.getTitle(), request.getDescription(), request.getStatus());
    }
}
