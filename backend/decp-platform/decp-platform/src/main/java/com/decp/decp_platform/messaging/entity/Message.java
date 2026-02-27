package com.decp.decp_platform.messaging.entity;


import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private boolean isRead;

    private LocalDateTime sentAt;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    public Message() {}

    public Message(String content,
                   boolean isRead,
                   LocalDateTime sentAt,
                   User sender,
                   User receiver) {
        this.content = content;
        this.isRead = isRead;
        this.sentAt = sentAt;
        this.sender = sender;
        this.receiver = receiver;
    }

    public Long getId() { return id; }

    public String getContent() { return content; }

    public boolean isRead() { return isRead; }

    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getSentAt() { return sentAt; }

    public User getSender() { return sender; }

    public User getReceiver() { return receiver; }
}
