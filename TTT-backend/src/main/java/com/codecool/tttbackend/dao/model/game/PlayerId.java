package com.codecool.tttbackend.dao.model.game;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlayerId implements Serializable {

    @Column(name = "game_id")
    private Integer gameId;

    @Column(name = "user_id")
    private Integer userId;

    public PlayerId() {
    }

    public PlayerId(Integer gameId, Integer userId) {
        this.gameId = gameId;
        this.userId = userId;
    }

    public Integer getGameId() {
        return gameId;
    }

    public void setGameId(Integer gameId) {
        this.gameId = gameId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlayerId playerId)) return false;
        return Objects.equals(gameId, playerId.gameId)
                && Objects.equals(userId, playerId.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(gameId, userId);
    }
}