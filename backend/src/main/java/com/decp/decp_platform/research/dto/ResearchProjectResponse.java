package com.decp.decp_platform.research.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ResearchProjectResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String authorName;
    private List<String> members;
    private String status;

    public ResearchProjectResponse(Long id, String title, String description,
                                   LocalDateTime createdAt, String authorName,
                                   List<String> members, String status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.authorName = authorName;
        this.members = members;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getAuthorName() { return authorName; }
    public List<String> getMembers() { return members; }
    public String getStatus() { return status; }
}
