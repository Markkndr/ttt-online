package com.codecool.tttbackend.dao.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;

    private String username;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "roles")
    private Set<String> roles = new HashSet<>();

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    // ...existing code...
    // map to PostgreSQL TEXT to allow values longer than 255 characters
    @Column(name = "profile_image", columnDefinition = "text")
    private String profileImage;

    public User() {}
}