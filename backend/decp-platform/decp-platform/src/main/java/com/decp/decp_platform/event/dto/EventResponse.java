package com.decp.decp_platform.event.dto;

import java.time.LocalDateTime;

public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private String createdBy;
    private long goingCount;
    private LocalDateTime createdAt;

    public EventResponse(Long id,
                         String title,
                         String description,
                         String location,
                         LocalDateTime eventDate,
                         String createdBy,
                         long goingCount,
                         LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.eventDate = eventDate;
        this.createdBy = createdBy;
        this.goingCount = goingCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public LocalDateTime getEventDate() { return eventDate; }
    public String getCreatedBy() { return createdBy; }
    public long getGoingCount() { return goingCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
