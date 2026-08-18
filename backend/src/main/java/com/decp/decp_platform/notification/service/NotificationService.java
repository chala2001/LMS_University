package com.decp.decp_platform.notification.service;

import com.decp.decp_platform.notification.entity.Notification;
import com.decp.decp_platform.notification.repository.NotificationRepository;
import com.decp.decp_platform.user.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(String message, String type, User recipient) {

        Notification notification = new Notification(message, type, false, LocalDateTime.now(), recipient);

        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long notificationId, User user) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // 🔥 SECURITY CHECK
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {

        List<Notification> notifications =
                notificationRepository.findByRecipientOrderByCreatedAtDesc(user);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }
}
