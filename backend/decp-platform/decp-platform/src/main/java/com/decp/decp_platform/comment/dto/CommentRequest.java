package com.decp.decp_platform.comment.dto;

public class CommentRequest {

    private String content;

    public CommentRequest() {}

    public CommentRequest(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
}
