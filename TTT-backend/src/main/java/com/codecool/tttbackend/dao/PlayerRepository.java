package com.codecool.tttbackend.dao;

import com.codecool.tttbackend.dao.model.game.Player;
import com.codecool.tttbackend.dao.model.game.PlayerId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, PlayerId> {

    @EntityGraph(attributePaths = {"user", "game"})
    List<Player> findByGame_Id(Integer gameId);

    @EntityGraph(attributePaths = {"user", "game"})
    Optional<Player> findByGame_IdAndUser_Id(Integer gameId, Integer userId);

    long countByUser_Id(Integer userId);
}