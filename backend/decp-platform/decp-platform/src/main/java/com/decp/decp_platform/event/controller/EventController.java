package com.decp.decp_platform.event.controller;


import com.decp.decp_platform.event.dto.EventRequest;
import com.decp.decp_platform.event.dto.EventResponse;
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
    public ResponseEntity<String> rsvp(
            @PathVariable Long eventId,
            @RequestParam RSVPStatus status) {

        return ResponseEntity.ok(
                eventService.respondToEvent(eventId, status)
        );
    }
}