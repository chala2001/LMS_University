package com.decp.decp_platform.like.service;


import com.decp.decp_platform.like.entity.PostLike;
import com.decp.decp_platform.like.repository.PostLikeRepository;

import com.decp.decp_platform.notification.service.NotificationService;
import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.post.repository.PostRepository;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class PostLikeService {

    private final PostLikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PostLikeService(PostLikeRepository likeRepository,
                           PostRepository postRepository,
                           UserRepository userRepository, NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public String toggleLike(Long postId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Post post = postRepository.findById(postId)
                .orElseThrow();

        var existingLike = likeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return "Unliked";
        } else {
            likeRepository.save(new PostLike(user, post));
            if (!post.getUser().getId().equals(user.getId())) {

                notificationService.createNotification(
                        user.getName() + " liked your post",
                        "LIKE",
                        post.getUser()
                );
            }
            return "Liked";
        }
    }
}
