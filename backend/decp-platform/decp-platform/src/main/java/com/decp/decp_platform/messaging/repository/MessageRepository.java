package com.decp.decp_platform.messaging.repository;

import com.decp.decp_platform.messaging.entity.Message;
import com.decp.decp_platform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrderBySentAtAsc(
            User sender, User receiver);

    List<Message> findByReceiverAndSenderOrderBySentAtAsc(
            User receiver, User sender);
}