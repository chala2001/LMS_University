package com.decp.decp_platform.messaging.service;


import com.decp.decp_platform.messaging.entity.Message;
import com.decp.decp_platform.messaging.repository.MessageRepository;
import com.decp.decp_platform.notification.service.NotificationService;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository,
                          UserRepository userRepository, NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Message sendMessage(Long receiverId, String content) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User sender = userRepository.findByEmail(email)
                .orElseThrow();

        User receiver = userRepository.findById(receiverId)
                .orElseThrow();

        Message message = new Message(
                content,
                false,
                LocalDateTime.now(),
                sender,
                receiver
        );

        if (!receiver.getId().equals(sender.getId())) {

            notificationService.createNotification(
                    "New message from " + sender.getName(),
                    "MESSAGE",
                    receiver
            );
        }

        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long otherUserId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow();

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow();

        List<Message> sent =
                messageRepository.findBySenderAndReceiverOrderBySentAtAsc(
                        currentUser, otherUser);

        List<Message> received =
                messageRepository.findByReceiverAndSenderOrderBySentAtAsc(
                        currentUser, otherUser);

        List<Message> conversation = new ArrayList<>();
        conversation.addAll(sent);
        conversation.addAll(received);

        conversation.sort((m1, m2) ->
                m1.getSentAt().compareTo(m2.getSentAt()));

        return conversation;
    }
}