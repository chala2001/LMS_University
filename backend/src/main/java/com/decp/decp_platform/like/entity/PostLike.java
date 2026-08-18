package com.decp.decp_platform.like.entity;

import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "post_likes")
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Post post;

    public PostLike() {}

    public PostLike(User user, Post post) {
        this.user = user;
        this.post = post;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public Post getPost() { return post; }

    public void setPost(Post post) { this.post = post; }
}