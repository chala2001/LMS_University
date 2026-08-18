package com.decp.decp_platform.post.service;


import com.decp.decp_platform.comment.repository.CommentRepository;
import com.decp.decp_platform.like.repository.PostLikeRepository;
import com.decp.decp_platform.post.dto.PostRequest;
import com.decp.decp_platform.post.dto.PostResponse;
import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.post.repository.PostRepository;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository likeRepository;
    private final CommentRepository commentRepository;



    public PostService(PostRepository postRepository, UserRepository userRepository, PostLikeRepository likeRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    public Post createPost(PostRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setContent(request.getContent());
        post.setMediaUrl(request.getMediaUrl());
        post.setCreatedAt(LocalDateTime.now());
        post.setUser(user);

        return postRepository.save(post);
    }



    public List<PostResponse> getAllPosts() {

        List<Post> posts = postRepository.findAll();

        return posts.stream().map(post -> {

            long likeCount = likeRepository.countByPost(post);
            long commentCount = commentRepository.countByPost(post);

            return new PostResponse(
                    post.getId(),
                    post.getContent(),
                    post.getUser().getName(),
                    likeCount,
                    commentCount,
                    post.getCreatedAt()
            );

        }).toList();
    }

    public Post updatePost(Long postId, String newContent) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Post post = postRepository.findById(postId)
                .orElseThrow();

        // 🔥 Ownership validation
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this post");
        }

        post.setContent(newContent);

        return postRepository.save(post);
    }

    public String deletePost(Long postId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Post post = postRepository.findById(postId)
                .orElseThrow();

        // 🔥 Author OR Admin can delete
        boolean isAuthor = post.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("You are not allowed to delete this post");
        }

        postRepository.delete(post);

        return "Post deleted successfully";
    }
}