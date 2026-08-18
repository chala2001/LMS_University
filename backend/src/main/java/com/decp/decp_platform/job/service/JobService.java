package com.decp.decp_platform.job.service;


import com.decp.decp_platform.job.dto.JobResponse;
import com.decp.decp_platform.job.entity.JobApplication;
import com.decp.decp_platform.job.dto.JobRequest;
import com.decp.decp_platform.job.entity.Job;
import com.decp.decp_platform.job.repository.JobApplicationRepository;
import com.decp.decp_platform.job.repository.JobRepository;
import com.decp.decp_platform.notification.service.NotificationService;
import com.decp.decp_platform.user.dto.UserProfileResponse;
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
    private final NotificationService notificationService;

    public JobService(JobRepository jobRepository,
                      UserRepository userRepository, JobApplicationRepository applicationRepository, NotificationService notificationService) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
    }

//    public Job createJob(JobRequest request) {
//
//        String email = SecurityContextHolder.getContext()
//                .getAuthentication()
//                .getName();
//
//        User user = userRepository.findByEmail(email)
//                .orElseThrow();
//
//        // 🔥 BUSINESS RULE
//        if (user.getRole() == Role.STUDENT) {
//            throw new RuntimeException("Students cannot post jobs");
//        }
//
//        Job job = new Job();
//        job.setTitle(request.getTitle());
//        job.setDescription(request.getDescription());
//        job.setCompany(request.getCompany());
//        job.setCreatedAt(LocalDateTime.now());
//        job.setPostedBy(user);
//
//        return jobRepository.save(job);
//    }

    public Job createJob(JobRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        // 🔥 BUSINESS RULE: Students cannot post jobs
        if (user.getRole() == Role.STUDENT) {
            throw new RuntimeException("Students cannot post jobs");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setCreatedAt(LocalDateTime.now());
        job.setPostedBy(user);

        Job savedJob = jobRepository.save(job);

        // 🔥 NOTIFY ALL USERS ABOUT NEW JOB (EXCEPT CREATOR)
        List<User> users = userRepository.findAll();

        for (User u : users) {

            if (!u.getId().equals(user.getId())) {

                notificationService.createNotification(
                        "New job posted: " + savedJob.getTitle(),
                        "JOB",
                        u
                );
            }
        }

        return savedJob;
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
        notificationService.createNotification(
                user.getName() + " applied to your job: " + job.getTitle(),
                "JOB_APPLICATION",
                job.getPostedBy()
        );


        return "Application submitted successfully";
    }

    public List<UserProfileResponse> getJobApplicants(Long jobId) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        if (user.getRole() == Role.STUDENT) {
            throw new RuntimeException("Students cannot view job applicants");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return applicationRepository.findByJob(job).stream()
                .map(application -> {
                    User applicant = application.getUser();
                    return new UserProfileResponse(
                            applicant.getId(),
                            applicant.getName(),
                            applicant.getEmail(),
                            applicant.getRole()
                    );
                })
                .toList();
    }


    public Job updateJob(Long jobId, JobRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // 🔥 ADMIN or the original ALUMNI/ADMIN who posted it can update
        boolean isCreator = job.getPostedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (!isCreator && !isAdmin) {
            throw new RuntimeException("You are not allowed to update this job");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());

        return jobRepository.save(job);
    }


    public String deleteJob(Long jobId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isCreator = job.getPostedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (!isCreator && !isAdmin) {
            throw new RuntimeException("You are not allowed to delete this job");
        }

        // 🔥 Remove constrained records beforehand since no CascadeType exists on Job
        applicationRepository.deleteByJob(job);
        jobRepository.delete(job);

        return "Job deleted successfully";
    }


}