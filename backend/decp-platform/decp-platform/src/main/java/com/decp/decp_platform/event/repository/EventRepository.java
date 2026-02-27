package com.decp.decp_platform.event.repository;

import com.decp.decp_platform.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}
