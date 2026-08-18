package com.decp.decp_platform.event.entity;

import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_rsvp",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "event_id"}))
public class EventRSVP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RSVPStatus status;

    private LocalDateTime respondedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    public EventRSVP() {}

    public EventRSVP(User user, Event event,
                     RSVPStatus status,
                     LocalDateTime respondedAt) {
        this.user = user;
        this.event = event;
        this.status = status;
        this.respondedAt = respondedAt;
    }

    public Long getId() { return id; }

    public RSVPStatus getStatus() { return status; }
    public void setStatus(RSVPStatus status) { this.status = status; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public User getUser() { return user; }
    public Event getEvent() { return event; }
}
