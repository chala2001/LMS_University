package com.decp.decp_platform.like.repository;


import com.decp.decp_platform.like.entity.PostLike;
import com.decp.decp_platform.post.entity.Post;
import com.decp.decp_platform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByUserAndPost(User user, Post post);

    long countByPost(Post post);
}
