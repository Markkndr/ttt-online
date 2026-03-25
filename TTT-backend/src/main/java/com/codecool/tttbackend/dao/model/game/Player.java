package com.codecool.tttbackend.dao.model.game;

import com.codecool.tttbackend.dao.model.User;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "players")
public class Player {

    @EmbeddedId
    private PlayerId id = new PlayerId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("gameId")
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "character", length = 1)
    private Character character;

    @Transient
    private int numberOfWins;

    public Player() {
    }

    public PlayerId getId() {
        return id;
    }

    public void setId(PlayerId id) {
        this.id = id;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
        if (this.id == null) {
            this.id = new PlayerId();
        }
        this.id.setGameId(game != null ? game.getId() : null);
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        if (this.id == null) {
            this.id = new PlayerId();
        }
        this.id.setUserId(user != null ? user.getId() : null);
    }

    public Character getCharacter() {
        return character;
    }

    public void setCharacter(Character character) {
        this.character = character;
    }

    public int getNumberOfWins() {
        return numberOfWins;
    }

    public void setNumberOfWins(int numberOfWins) {
        this.numberOfWins = numberOfWins;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Player other)) return false;

        Integer thisGameId = game != null ? game.getId() : null;
        Integer otherGameId = other.game != null ? other.game.getId() : null;
        Integer thisUserId = user != null ? user.getId() : null;
        Integer otherUserId = other.user != null ? other.user.getId() : null;

        return Objects.equals(thisGameId, otherGameId)
                && Objects.equals(thisUserId, otherUserId);
    }

    @Override
    public int hashCode() {
        Integer gameId = game != null ? game.getId() : null;
        Integer userId = user != null ? user.getId() : null;
        return Objects.hash(gameId, userId);
    }
}