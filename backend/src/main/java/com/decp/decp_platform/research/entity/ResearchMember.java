package com.decp.decp_platform.research.entity;


import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class ResearchMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private ResearchProject project;

    private LocalDateTime joinedAt;

    public ResearchMember() {}

    public ResearchMember(User user,
                          ResearchProject project,
                          LocalDateTime joinedAt) {
        this.user = user;
        this.project = project;
        this.joinedAt = joinedAt;
    }

    public User getUser() { return user; }
    public ResearchProject getProject() { return project; }
}