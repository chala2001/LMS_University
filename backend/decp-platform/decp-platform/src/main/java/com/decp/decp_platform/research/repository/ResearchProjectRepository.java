package com.decp.decp_platform.research.repository;

import com.decp.decp_platform.research.entity.ResearchProject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResearchProjectRepository
        extends JpaRepository<ResearchProject, Long> {

}