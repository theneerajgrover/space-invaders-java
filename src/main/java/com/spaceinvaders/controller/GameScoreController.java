package com.spaceinvaders.controller;

import com.spaceinvaders.model.GameScore;
import com.spaceinvaders.service.GameScoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for game score operations.
 * Provides endpoints for saving scores and retrieving leaderboard data.
 */
@RestController
@RequestMapping("/api/scores")
public class GameScoreController {

    private final GameScoreService service;

    public GameScoreController(GameScoreService service) {
        this.service = service;
    }

    /**
     * Save a new game score.
     * POST /api/scores
     * Returns 201 CREATED on success.
     */
    @PostMapping
    public ResponseEntity<GameScore> saveScore(@Valid @RequestBody GameScore gameScore) {
        GameScore saved = service.saveScore(gameScore);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Get the top 10 leaderboard scores.
     * GET /api/scores/leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<GameScore>> getLeaderboard() {
        List<GameScore> scores = service.getLeaderboard();
        return ResponseEntity.ok(scores);
    }

    /**
     * Get all scores for a specific player by name.
     * GET /api/scores/player/{playerName}
     */
    @GetMapping("/player/{playerName}")
    public ResponseEntity<List<GameScore>> getPlayerScores(@PathVariable String playerName) {
        if (playerName == null || playerName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<GameScore> scores = service.getPlayerScores(playerName.trim());
        return ResponseEntity.ok(scores);
    }
}
