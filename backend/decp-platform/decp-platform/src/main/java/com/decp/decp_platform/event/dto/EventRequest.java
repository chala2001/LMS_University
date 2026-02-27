package com.decp.decp_platform.event.dto;

import java.time.LocalDateTime;

public class EventRequest {

    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;

    public EventRequest() {}

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public LocalDateTime getEventDate() { return eventDate; }
}