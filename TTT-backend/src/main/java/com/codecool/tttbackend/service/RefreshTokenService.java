package com.codecool.tttbackend.service;

import com.codecool.tttbackend.dao.RefreshTokenRepository;
import com.codecool.tttbackend.dao.UserRepository;
import com.codecool.tttbackend.dao.model.RefreshToken;
import com.codecool.tttbackend.dao.model.User;
import com.codecool.tttbackend.exception.BadRequestException;
import com.codecool.tttbackend.security.JwtUtil;
import com.codecool.tttbackend.security.TokenHashUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public String createRefreshToken(int userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Cannot create refresh token: user not found"));

        String token = jwtUtil.generateRefreshToken(user.getUsername());
        String tokenHash = TokenHashUtil.hash(token);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setCreatedAt(Instant.now());
        refreshToken.setExpiresAt(Instant.now().plusMillis(refreshTokenExpiration));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        return token;
    }

    public RefreshToken verifyToken(String token) {

        String hash = TokenHashUtil.hash(token);

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Token revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token expired");
        }

        return refreshToken;
    }

    public void revokeToken(RefreshToken token) {
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    public void verifyAndRevoke(String rawToken) {
        RefreshToken token = verifyToken(rawToken);
        revokeToken(token);
    }
}