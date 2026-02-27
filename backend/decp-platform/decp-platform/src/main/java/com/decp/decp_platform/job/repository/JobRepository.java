package com.decp.decp_platform.job.repository;

import com.decp.decp_platform.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}