package com.codecool.tttbackend.controller.dto.request;

public record CreateGameRequestDTO(String userName, String gameName, int maxPlayerCount, Character character) {
}
