package com.decp.decp_platform.event.repository;

import com.decp.decp_platform.event.entity.Event;
import com.decp.decp_platform.event.entity.EventRSVP;
import com.decp.decp_platform.event.entity.RSVPStatus;
import com.decp.decp_platform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRSVPRepository
        extends JpaRepository<EventRSVP, Long> {

    Optional<EventRSVP> findByUserAndEvent(User user, Event event);

    long countByEventAndStatus(Event event, RSVPStatus status);

    List<EventRSVP> findByEvent(Event event);
}