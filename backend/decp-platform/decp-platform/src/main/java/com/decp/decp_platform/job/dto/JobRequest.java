package com.decp.decp_platform.job.dto;

public class JobRequest {

    private String title;
    private String description;
    private String company;

    public JobRequest() {}

    public JobRequest(String title, String description, String company) {
        this.title = title;
        this.description = description;
        this.company = company;
    }

    public String getTitle() { return title; }

    public String getDescription() { return description; }

    public String getCompany() { return company; }
}