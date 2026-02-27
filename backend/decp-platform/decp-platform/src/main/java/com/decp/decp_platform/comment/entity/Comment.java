package com.decp.decp_platform.comment.entity;


import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private LocalDateTime createdAt;

    @ManyToOne
    private User user;

    @ManyToOne
    private Post post;

    public Comment() {}

    public Comment(String content, LocalDateTime createdAt,
                   User user, Post post) {
        this.content = content;
        this.createdAt = createdAt;
        this.user = user;
        this.post = post;
    }

    public Long getId() { return id; }

    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public Post getPost() { return post; }

    public void setPost(Post post) { this.post = post; }
}