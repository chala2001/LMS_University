package com.decp.decp_platform.research.repository;

import com.decp.decp_platform.research.entity.ResearchMember;
import com.decp.decp_platform.research.entity.ResearchProject;
import com.decp.decp_platform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchMemberRepository extends JpaRepository<ResearchMember, Long> {

    boolean existsByUserAndProject(User user, ResearchProject project);

    List<ResearchMember> findByProject(ResearchProject project);
}
