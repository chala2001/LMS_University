package com.decp.decp_platform.comment.controller;

import com.decp.decp_platform.comment.dto.CommentRequest;
import com.decp.decp_platform.comment.entity.Comment;
import com.decp.decp_platform.comment.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable("postId") Long postId,
                                              @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(postId, request));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable("postId") Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }
}