package com.decp.decp_platform.post.repository;


import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUser(User user);

}