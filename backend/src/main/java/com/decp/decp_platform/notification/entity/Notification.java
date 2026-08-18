package com.decp.decp_platform.notification.entity;

import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private String type;

    private boolean isRead;

    private LocalDateTime createdAt;

    @ManyToOne
    private User recipient;

    public Notification() {}

    public Notification(String message,
                        String type,
                        boolean isRead,
                        LocalDateTime createdAt,
                        User recipient) {
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.recipient = recipient;
    }

    public Long getId() { return id; }

    public String getMessage() { return message; }

    public String getType() { return type; }

    public boolean isRead() { return isRead; }

    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public User getRecipient() { return recipient; }
}