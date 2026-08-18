package com.decp.decp_platform.analytics.dto;

public class AnalyticsResponse {

    private long totalUsers;
    private long totalPosts;
    private long totalJobs;
    private long totalApplications;
    private long totalEvents;
    private long totalMessages;
    private String mostPopularPost;

    public AnalyticsResponse(long totalUsers,
                             long totalPosts,
                             long totalJobs,
                             long totalApplications,
                             long totalEvents,
                             long totalMessages,
                             String mostPopularPost) {

        this.totalUsers = totalUsers;
        this.totalPosts = totalPosts;
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.totalEvents = totalEvents;
        this.totalMessages = totalMessages;
        this.mostPopularPost = mostPopularPost;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getTotalPosts() { return totalPosts; }
    public long getTotalJobs() { return totalJobs; }
    public long getTotalApplications() { return totalApplications; }
    public long getTotalEvents() { return totalEvents; }
    public long getTotalMessages() { return totalMessages; }
    public String getMostPopularPost() { return mostPopularPost; }
}