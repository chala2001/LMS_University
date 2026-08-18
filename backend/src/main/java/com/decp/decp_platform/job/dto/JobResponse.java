package com.decp.decp_platform.job.dto;

import java.time.LocalDateTime;

public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String company;
    private String postedBy;
    private long applicationCount;
    private LocalDateTime createdAt;

    public JobResponse(Long id,
                       String title,
                       String description,
                       String company,
                       String postedBy,
                       long applicationCount,
                       LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.company = company;
        this.postedBy = postedBy;
        this.applicationCount = applicationCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCompany() { return company; }
    public String getPostedBy() { return postedBy; }
    public long getApplicationCount() { return applicationCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}