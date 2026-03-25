package com.codecool.tttbackend.security;

import org.springframework.stereotype.Service;

@Service
public interface PasswordHasherInterface {
    String hash(String password);
    boolean verify(String rawPassword, String hashedPassword);
}
