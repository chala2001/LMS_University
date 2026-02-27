package com.decp.decp_platform.comment.service;


import com.decp.decp_platform.comment.dto.CommentRequest;
import com.decp.decp_platform.comment.entity.Comment;
import com.decp.decp_platform.comment.repository.CommentRepository;
import com.decp.decp_platform.notification.service.NotificationService;
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
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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


        if (!post.getUser().getId().equals(user.getId())) {

            notificationService.createNotification(
                    user.getName() + " commented on your post",
                    "COMMENT",
                    post.getUser()
            );
        }

        return commentRepository.save(comment);


    }

    public List<Comment> getCommentsByPost(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow();

        return commentRepository.findByPost(post);
    }
}