package com.decp.decp_platform.post.dto;


import java.time.LocalDateTime;

public class PostResponse {

    private Long id;
    private String content;
    private String authorName;
    private long likeCount;
    private long commentCount;
    private LocalDateTime createdAt;

    public PostResponse(Long id, String content,
                        String authorName,
                        long likeCount,
                        long commentCount,
                        LocalDateTime createdAt) {

        this.id = id;
        this.content = content;
        this.authorName = authorName;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getContent() { return content; }
    public String getAuthorName() { return authorName; }
    public long getLikeCount() { return likeCount; }
    public long getCommentCount() { return commentCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}