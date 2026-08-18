package com.decp.decp_platform.job.entity;


import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_id"}))
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime appliedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    public JobApplication() {}

    public JobApplication(User user, Job job, LocalDateTime appliedAt) {
        this.user = user;
        this.job = job;
        this.appliedAt = appliedAt;
    }

    public Long getId() { return id; }

    public LocalDateTime getAppliedAt() { return appliedAt; }

    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public Job getJob() { return job; }

    public void setJob(Job job) { this.job = job; }
}