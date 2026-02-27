package com.decp.decp_platform.event.entity;

import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String location;

    private LocalDateTime eventDate;

    private LocalDateTime createdAt;

    @ManyToOne
    private User createdBy;

    public Event() {}

    public Event(String title, String description,
                 String location, LocalDateTime eventDate,
                 LocalDateTime createdAt, User createdBy) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.eventDate = eventDate;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}