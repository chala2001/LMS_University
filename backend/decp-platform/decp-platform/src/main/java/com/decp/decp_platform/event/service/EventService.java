package com.decp.decp_platform.event.service;


import com.decp.decp_platform.event.dto.EventRequest;
import com.decp.decp_platform.event.dto.EventResponse;
import com.decp.decp_platform.event.entity.Event;
import com.decp.decp_platform.event.entity.EventRSVP;
import com.decp.decp_platform.event.entity.RSVPStatus;
import com.decp.decp_platform.event.repository.EventRSVPRepository;
import com.decp.decp_platform.event.repository.EventRepository;
import com.decp.decp_platform.notification.service.NotificationService;
import com.decp.decp_platform.user.entity.Role;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventRSVPRepository rsvpRepository;
    private final NotificationService notificationService;

    public EventService(EventRepository eventRepository,
                        UserRepository userRepository, EventRSVPRepository rsvpRepository, NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.rsvpRepository = rsvpRepository;
        this.notificationService = notificationService;
    }

//    public Event createEvent(EventRequest request) {
//
//        String email = SecurityContextHolder.getContext()
//                .getAuthentication()
//                .getName();
//
//        User user = userRepository.findByEmail(email)
//                .orElseThrow();
//
//        // 🔥 BUSINESS RULE
//        if (user.getRole() != Role.ADMIN) {
//            throw new RuntimeException("Only admins can create events");
//        }
//
//        Event event = new Event();
//        event.setTitle(request.getTitle());
//        event.setDescription(request.getDescription());
//        event.setLocation(request.getLocation());
//        event.setEventDate(request.getEventDate());
//        event.setCreatedAt(LocalDateTime.now());
//        event.setCreatedBy(user);
//
//        return eventRepository.save(event);
//    }

    public Event createEvent(EventRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        // 🔥 BUSINESS RULE: Only ADMIN can create events
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can create events");
        }

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setCreatedAt(LocalDateTime.now());
        event.setCreatedBy(user);

        Event savedEvent = eventRepository.save(event);

        // 🔥 NOTIFY ALL USERS ABOUT NEW EVENT
        List<User> users = userRepository.findAll();

        for (User u : users) {

            if (!u.getId().equals(user.getId())) {

                notificationService.createNotification(
                        "New event available: " + savedEvent.getTitle(),
                        "EVENT",
                        u
                );
            }
        }

        return savedEvent;
    }

    public List<EventResponse> getAllEvents() {

        List<Event> events = eventRepository.findAll();

        return events.stream().map(event -> {

            long goingCount =
                    rsvpRepository.countByEventAndStatus(
                            event, RSVPStatus.GOING);

            return new EventResponse(
                    event.getId(),
                    event.getTitle(),
                    event.getDescription(),
                    event.getLocation(),
                    event.getEventDate(),
                    event.getCreatedBy().getName(),
                    goingCount,
                    event.getCreatedAt()
            );

        }).toList();
    }

    public String respondToEvent(Long eventId, RSVPStatus status) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Event event = eventRepository.findById(eventId)
                .orElseThrow();

        Optional<EventRSVP> existing =
                rsvpRepository.findByUserAndEvent(user, event);

        if (existing.isPresent()) {
            // Update status instead of creating new
            EventRSVP rsvp = existing.get();
            rsvp.setStatus(status);
            rsvp.setRespondedAt(LocalDateTime.now());
            rsvpRepository.save(rsvp);
            return "RSVP updated";
        }

        EventRSVP rsvp = new EventRSVP(
                user,
                event,
                status,
                LocalDateTime.now()
        );

        rsvpRepository.save(rsvp);

        return "RSVP recorded";
    }

    public long getGoingCount(Event event) {
        return rsvpRepository.countByEventAndStatus(
                event, RSVPStatus.GOING);
    }

    public Event updateEvent(Long eventId, EventRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 🔥 Only ADMIN who created it can update
        if (!event.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());

        return eventRepository.save(event);
    }

    public String deleteEvent(Long eventId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to delete this event");
        }

        // 🔥 Delete related RSVPs first
        List<EventRSVP> rsvps = rsvpRepository.findByEvent(event);
        rsvpRepository.deleteAll(rsvps);

        eventRepository.delete(event);

        return "Event deleted successfully";
    }
}