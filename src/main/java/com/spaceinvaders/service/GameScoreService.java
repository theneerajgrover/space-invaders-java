package com.spaceinvaders.service;

import com.spaceinvaders.model.GameScore;
import com.spaceinvaders.repository.GameScoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for game score operations.
 * Contains business logic for saving scores and retrieving leaderboard data.
 */
@Service
public class GameScoreService {

    private final GameScoreRepository repository;

    public GameScoreService(GameScoreRepository repository) {
        this.repository = repository;
    }

    /**
     * Save a new game score after trimming the player name.
     */
    public GameScore saveScore(GameScore gameScore) {
        // Trim the player name to remove leading/trailing whitespace
        gameScore.setPlayerName(gameScore.getPlayerName().trim());
        return repository.save(gameScore);
    }

    /**
     * Get the top 10 scores for the leaderboard.
     */
    public List<GameScore> getLeaderboard() {
        List<GameScore> all = repository.findTop10Scores();
        // Return only top 10
        if (all.size() > 10) {
            return all.subList(0, 10);
        }
        return all;
    }

    /**
     * Get all scores for a specific player.
     */
    public List<GameScore> getPlayerScores(String playerName) {
        return repository.findByPlayerNameIgnoreCaseOrderByScoreDesc(playerName);
    }
}
