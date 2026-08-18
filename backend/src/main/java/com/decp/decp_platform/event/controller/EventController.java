package com.decp.decp_platform.event.controller;


import com.decp.decp_platform.event.dto.EventRequest;
import com.decp.decp_platform.event.dto.EventResponse;
import com.decp.decp_platform.user.dto.UserProfileResponse;
import com.decp.decp_platform.event.entity.Event;
import com.decp.decp_platform.event.entity.RSVPStatus;
import com.decp.decp_platform.event.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping("/{eventId}/rsvp")
    public ResponseEntity<String> rsvpToEvent(
            @PathVariable("eventId") Long eventId,
            @RequestParam("status") RSVPStatus status) {

        return ResponseEntity.ok(
                eventService.respondToEvent(eventId, status)
        );
    }

    @GetMapping("/{eventId}/attendees")
    public ResponseEntity<List<UserProfileResponse>> getEventAttendees(@PathVariable("eventId") Long eventId) {
        return ResponseEntity.ok(eventService.getEventAttendees(eventId));
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable("id") Long id,
                             @RequestBody EventRequest request) {

        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteEvent(@PathVariable("id") Long id) {
        return eventService.deleteEvent(id);
    }
}