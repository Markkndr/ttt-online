package com.codecool.tttbackend.service;

import com.codecool.tttbackend.controller.dto.response.PlayerResponseDTO;
import com.codecool.tttbackend.dao.UserRepository;
import com.codecool.tttbackend.dao.model.User;
import com.codecool.tttbackend.dao.GameRepository;
import com.codecool.tttbackend.dao.PlayerRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;

    public UserService(UserRepository userRepository,
                       GameRepository gameRepository,
                       PlayerRepository playerRepository) {
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.playerRepository = playerRepository;
    }

    public User getUserByUserName(String userName) {
        return userRepository.findByUsername(userName).orElse(null);
    }

    public User getUserById(int id) {
        return userRepository.findById(id).orElse(null);
    }

    public PlayerResponseDTO getUserStats(String username) {
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return null;
        }

        int wins = (int) gameRepository.countByWinner_Id(user.getId());
        int totalGames = (int) playerRepository.countByUser_Id(user.getId());

        return new PlayerResponseDTO(
                user.getId(),
                user.getUsername(),
                ' ',
                wins,
                totalGames,
                user.getProfileImage()
        );
    }

    public void updateProfileImage(String username, String base64Image) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        user.setProfileImage(base64Image);
        userRepository.save(user);
    }

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public void deleteProfileImage(long userId) {
        User user = userRepository.findById((int) userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfileImage(null);
        userRepository.save(user);
    }
}