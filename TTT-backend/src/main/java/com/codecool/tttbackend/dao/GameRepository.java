package com.codecool.tttbackend.dao;

import com.codecool.tttbackend.dao.model.game.Game;
import com.codecool.tttbackend.dao.model.game.GameState;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Integer> {

    @Override
    @EntityGraph(attributePaths = {"creator", "players", "players.user", "currentPlayer", "winner"})
    List<Game> findAll();

    @Override
    @EntityGraph(attributePaths = {"creator", "players", "players.user", "currentPlayer", "winner"})
    Optional<Game> findById(Integer id);

    @EntityGraph(attributePaths = {"creator", "players", "players.user", "currentPlayer", "winner"})
    @Query("""
        SELECT DISTINCT g
        FROM Game g
        LEFT JOIN g.players p
        WHERE g.creator.id = :userId or p.user.id = :userId
    """)
    List<Game> findAllGamesByUserId(Integer userId);

    @EntityGraph(attributePaths = {"creator", "players", "players.user", "currentPlayer", "winner"})
    List<Game> findByGameState(GameState gameState);

    long countByWinner_Id(Integer userId);
}