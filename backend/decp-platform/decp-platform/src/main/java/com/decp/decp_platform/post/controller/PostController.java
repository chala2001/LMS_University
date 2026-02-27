package com.decp.decp_platform.post.controller;


import com.decp.decp_platform.post.dto.PostRequest;
import com.decp.decp_platform.post.dto.PostResponse;
import com.decp.decp_platform.post.dto.UpdatePostRequest;
import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.post.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.createPost(request));
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long postId,
            @RequestBody UpdatePostRequest request) {

        return ResponseEntity.ok(
                postService.updatePost(postId, request.getContent())
        );
    }
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.deletePost(postId));
    }
}