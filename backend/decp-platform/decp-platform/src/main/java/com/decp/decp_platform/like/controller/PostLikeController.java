package com.decp.decp_platform.like.controller;

import com.decp.decp_platform.like.service.PostLikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostLikeController {

    private final PostLikeService likeService;

    public PostLikeController(PostLikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<String> toggleLike(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.toggleLike(postId));
    }
}