package com.decp.decp_platform.research.service;

import com.decp.decp_platform.research.entity.ResearchMember;
import com.decp.decp_platform.research.entity.ResearchProject;
import com.decp.decp_platform.research.repository.ResearchMemberRepository;
import com.decp.decp_platform.research.repository.ResearchProjectRepository;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResearchService {

    private final ResearchProjectRepository projectRepository;
    private final ResearchMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ResearchService(ResearchProjectRepository projectRepository,
                           ResearchMemberRepository memberRepository,
                           UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public ResearchProject createProject(String title, String description) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        ResearchProject project = new ResearchProject();
        project.setTitle(title);
        project.setDescription(description);
        project.setCreatedAt(LocalDateTime.now());
        project.setCreatedBy(user);

        ResearchProject saved = projectRepository.save(project);

        // Creator automatically becomes member
        memberRepository.save(
                new ResearchMember(user, saved, LocalDateTime.now())
        );

        return saved;
    }

    public String joinProject(Long projectId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        ResearchProject project = projectRepository.findById(projectId)
                .orElseThrow();

        if (memberRepository.existsByUserAndProject(user, project)) {
            throw new RuntimeException("Already joined this project");
        }

        memberRepository.save(
                new ResearchMember(user, project, LocalDateTime.now())
        );

        return "Joined project successfully";
    }

    public List<ResearchProject> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<String> getProjectMembers(Long projectId) {

        ResearchProject project = projectRepository.findById(projectId)
                .orElseThrow();

        return memberRepository.findByProject(project)
                .stream()
                .map(m -> m.getUser().getName())
                .toList();
    }


    public ResearchProject updateProject(Long projectId,
                                         String title,
                                         String description) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        ResearchProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 🔥 Only creator can update
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this project");
        }

        project.setTitle(title);
        project.setDescription(description);

        return projectRepository.save(project);
    }



    public String deleteProject(Long projectId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        ResearchProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 🔥 Only creator can delete
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to delete this project");
        }

        // Delete members first
        List<ResearchMember> members =
                memberRepository.findByProject(project);

        memberRepository.deleteAll(members);

        projectRepository.delete(project);

        return "Project deleted successfully";
    }
}