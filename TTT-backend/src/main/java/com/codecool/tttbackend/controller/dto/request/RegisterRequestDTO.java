package com.codecool.tttbackend.controller.dto.request;

import java.time.LocalDate;

public record RegisterRequestDTO(String email, String username, String password, LocalDate birthDate) {
}
