package com.decp.decp_platform.job.controller;

import com.decp.decp_platform.job.dto.JobRequest;
import com.decp.decp_platform.job.dto.JobResponse;
import com.decp.decp_platform.job.entity.Job;
import com.decp.decp_platform.job.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.createJob(request));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<String> apply(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.applyToJob(jobId));
    }
}