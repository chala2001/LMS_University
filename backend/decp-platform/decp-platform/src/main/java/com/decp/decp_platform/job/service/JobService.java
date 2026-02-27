package com.decp.decp_platform.job.service;


import com.decp.decp_platform.job.dto.JobResponse;
import com.decp.decp_platform.job.entity.JobApplication;
import com.decp.decp_platform.job.dto.JobRequest;
import com.decp.decp_platform.job.entity.Job;
import com.decp.decp_platform.job.repository.JobApplicationRepository;
import com.decp.decp_platform.job.repository.JobRepository;
import com.decp.decp_platform.user.entity.Role;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;

    public JobService(JobRepository jobRepository,
                      UserRepository userRepository, JobApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    public Job createJob(JobRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        // 🔥 BUSINESS RULE
        if (user.getRole() == Role.STUDENT) {
            throw new RuntimeException("Students cannot post jobs");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setCreatedAt(LocalDateTime.now());
        job.setPostedBy(user);

        return jobRepository.save(job);
    }

    public List<JobResponse> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        return jobs.stream().map(job -> {

            long applicationCount =
                    applicationRepository.countByJob(job);

            return new JobResponse(
                    job.getId(),
                    job.getTitle(),
                    job.getDescription(),
                    job.getCompany(),
                    job.getPostedBy().getName(),
                    applicationCount,
                    job.getCreatedAt()
            );

        }).toList();
    }


    public String applyToJob(Long jobId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can apply for jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow();

        if (applicationRepository.findByUserAndJob(user, job).isPresent()) {
            throw new RuntimeException("You already applied for this job");
        }

        JobApplication application =
                new JobApplication(user, job, LocalDateTime.now());

        applicationRepository.save(application);

        return "Application submitted successfully";
    }
}