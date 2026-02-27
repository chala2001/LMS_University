package com.decp.decp_platform.comment.service;


import com.decp.decp_platform.comment.dto.CommentRequest;
import com.decp.decp_platform.comment.entity.Comment;
import com.decp.decp_platform.comment.repository.CommentRepository;
import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.post.repository.PostRepository;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Comment addComment(Long postId, CommentRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Post post = postRepository.findById(postId)
                .orElseThrow();

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUser(user);
        comment.setPost(post);

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPost(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow();

        return commentRepository.findByPost(post);
    }
}