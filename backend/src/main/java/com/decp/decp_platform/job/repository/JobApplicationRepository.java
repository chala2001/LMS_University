package com.decp.decp_platform.job.repository;

import com.decp.decp_platform.job.entity.JobApplication;
import com.decp.decp_platform.job.entity.Job;
import com.decp.decp_platform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByUserAndJob(User user, Job job);

    long countByJob(Job job);

    List<JobApplication> findByJob(Job job);

    @org.springframework.transaction.annotation.Transactional
    void deleteByJob(Job job);
}
