package com.codecool.tttbackend.controller.dto.response;

import java.util.List;

public record GameResponseDTO(int gameId, String state, String gameName, String creator, String publicOrPrivate, int maxPlayers, int currentPlayers, List<Character> characters) {
}
