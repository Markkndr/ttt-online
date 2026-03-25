package com.codecool.tttbackend.dao;

import com.codecool.tttbackend.dao.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    int deleteByExpiresAtBefore(Instant time);

}