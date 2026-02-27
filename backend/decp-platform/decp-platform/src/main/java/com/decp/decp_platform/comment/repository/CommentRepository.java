package com.decp.decp_platform.comment.repository;

import com.decp.decp_platform.comment.entity.Comment;
import com.decp.decp_platform.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost(Post post);
    long countByPost(Post post);
}
