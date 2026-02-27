package com.decp.decp_platform.post.dto;

public class PostRequest {

    private String content;
    private String mediaUrl;

    public PostRequest() {}

    public PostRequest(String content, String mediaUrl) {
        this.content = content;
        this.mediaUrl = mediaUrl;
    }

    public String getContent() { return content; }

    public String getMediaUrl() { return mediaUrl; }
}