package com.codecool.tttbackend.dao;

import com.codecool.tttbackend.dao.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findById(Integer id);

    void deleteById(Integer id);

    @Modifying
    @Query("UPDATE User u SET u.profileImage = :image WHERE u.id = :userId")
    void updateProfileImage(long userId, String image);

    @Modifying
    @Query("UPDATE User u SET u.profileImage = NULL WHERE u.id = :userId")
    void deleteProfileImage(long userId);
}