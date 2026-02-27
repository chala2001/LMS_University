package com.decp.decp_platform.analytics.service;

import com.decp.decp_platform.analytics.dto.AnalyticsResponse;
import com.decp.decp_platform.event.repository.EventRepository;
import com.decp.decp_platform.job.repository.JobApplicationRepository;
import com.decp.decp_platform.job.repository.JobRepository;
import com.decp.decp_platform.like.repository.PostLikeRepository;
import com.decp.decp_platform.messaging.repository.MessageRepository;
import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.post.repository.PostRepository;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final EventRepository eventRepository;
    private final MessageRepository messageRepository;
    private final PostLikeRepository likeRepository;

    public AnalyticsService(UserRepository userRepository,
                            PostRepository postRepository,
                            JobRepository jobRepository,
                            JobApplicationRepository applicationRepository,
                            EventRepository eventRepository,
                            MessageRepository messageRepository, PostLikeRepository likeRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.eventRepository = eventRepository;
        this.messageRepository = messageRepository;
        this.likeRepository = likeRepository;
    }

    public AnalyticsResponse getAnalytics() {

        long totalUsers = userRepository.count();
        long totalPosts = postRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalEvents = eventRepository.count();
        long totalMessages = messageRepository.count();

        // 🔥 Find most popular post using LikeRepository
        Post popularPost = null;
        long maxLikes = -1;

        for (Post post : postRepository.findAll()) {

            long likeCount = likeRepository.countByPost(post);

            if (likeCount > maxLikes) {
                maxLikes = likeCount;
                popularPost = post;
            }
        }

        String mostPopular =
                popularPost != null ? popularPost.getContent() : "No posts";

        return new AnalyticsResponse(
                totalUsers,
                totalPosts,
                totalJobs,
                totalApplications,
                totalEvents,
                totalMessages,
                mostPopular
        );
    }
}