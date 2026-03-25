package com.codecool.tttbackend.controller.dto.response;

public record PlayerResponseDTO(int userId, String username, char character, int numberOfWins, int totalGames, String profileImage) {
}
