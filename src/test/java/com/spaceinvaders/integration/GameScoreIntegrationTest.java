package com.spaceinvaders.integration;

import com.spaceinvaders.model.GameScore;
import com.spaceinvaders.repository.GameScoreRepository;
import com.spaceinvaders.service.GameScoreService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test verifying SQLite database persistence, repository queries,
 * and service business logic against an isolated test SQLite database.
 */
@SpringBootTest
@ActiveProfiles("test")
public class GameScoreIntegrationTest {

    @Autowired
    private GameScoreService gameScoreService;

    @Autowired
    private GameScoreRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @AfterAll
    static void cleanupTestDatabase() {
        File testDb = new File("data/test_space_invaders.db");
        if (testDb.exists()) {
            testDb.delete();
        }
    }

    @Test
    @DisplayName("Verify score persists in SQLite with generated ID and timestamp")
    void testSaveScorePersistence() {
        GameScore score = new GameScore();
        score.setPlayerName("CommanderAlpha");
        score.setScore(500);
        score.setEnemiesDestroyed(10);
        score.setCompletionStatus("LOST");

        GameScore saved = gameScoreService.saveScore(score);

        assertNotNull(saved.getId(), "Database should assign auto-increment ID");
        assertNotNull(saved.getCreatedAt(), "CreatedAt timestamp should be auto-populated");
        assertEquals("CommanderAlpha", saved.getPlayerName());
        assertEquals(500, saved.getScore());

        // Verify direct retrieval from repository
        assertTrue(repository.findById(saved.getId()).isPresent());
    }

    @Test
    @DisplayName("Verify player name whitespace is trimmed before persistence")
    void testPlayerNameTrimming() {
        GameScore score = new GameScore();
        score.setPlayerName("   WingMan   ");
        score.setScore(300);

        GameScore saved = gameScoreService.saveScore(score);
        assertEquals("WingMan", saved.getPlayerName(), "Leading and trailing spaces must be trimmed");
    }

    @Test
    @DisplayName("Verify leaderboard returns top 10 scores in descending order with tie-breakers")
    void testLeaderboardOrdering() throws InterruptedException {
        // Create 12 scores to test the top 10 limit and sorting
        for (int i = 1; i <= 12; i++) {
            GameScore score = new GameScore();
            score.setPlayerName("Pilot_" + i);
            score.setScore(i * 100);
            gameScoreService.saveScore(score);
            Thread.sleep(10); // Ensure distinct timestamps
        }

        List<GameScore> leaderboard = gameScoreService.getLeaderboard();

        assertEquals(10, leaderboard.size(), "Leaderboard must be capped at 10 records");
        assertEquals(1200, leaderboard.get(0).getScore(), "Highest score should be first");
        assertEquals(300, leaderboard.get(9).getScore(), "10th score should be 300");

        // Verify descending order
        for (int i = 0; i < leaderboard.size() - 1; i++) {
            assertTrue(leaderboard.get(i).getScore() >= leaderboard.get(i + 1).getScore(),
                    "Scores must be in non-increasing order");
        }
    }

    @Test
    @DisplayName("Verify player score query returns only that player's history")
    void testGetPlayerScores() {
        GameScore s1 = new GameScore();
        s1.setPlayerName("Nova");
        s1.setScore(400);
        gameScoreService.saveScore(s1);

        GameScore s2 = new GameScore();
        s2.setPlayerName("Nova");
        s2.setScore(900);
        gameScoreService.saveScore(s2);

        GameScore s3 = new GameScore();
        s3.setPlayerName("Orion");
        s3.setScore(600);
        gameScoreService.saveScore(s3);

        List<GameScore> novaScores = gameScoreService.getPlayerScores("nova"); // case-insensitive
        assertEquals(2, novaScores.size());
        assertEquals(900, novaScores.get(0).getScore(), "Player scores should be ordered descending");
        assertEquals(400, novaScores.get(1).getScore());
    }
}
