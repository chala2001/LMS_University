package com.decp.decp_platform.job.entity;


import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String company;

    private LocalDateTime createdAt;

    @ManyToOne
    private User postedBy;

    public Job() {}

    public Job(String title, String description,
               String company, LocalDateTime createdAt,
               User postedBy) {
        this.title = title;
        this.description = description;
        this.company = company;
        this.createdAt = createdAt;
        this.postedBy = postedBy;
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getCompany() { return company; }

    public void setCompany(String company) { this.company = company; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getPostedBy() { return postedBy; }

    public void setPostedBy(User postedBy) { this.postedBy = postedBy; }
}