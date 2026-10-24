package com.spaceinvaders.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spaceinvaders.model.GameScore;
import com.spaceinvaders.service.GameScoreService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for GameScoreController verifying REST endpoints, status codes, and input validation.
 */
@WebMvcTest(GameScoreController.class)
public class GameScoreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GameScoreService gameScoreService;

    @Test
    @DisplayName("POST /api/scores with valid data returns 201 Created")
    void testSaveScoreSuccess() throws Exception {
        GameScore score = new GameScore();
        score.setId(1L);
        score.setPlayerName("AcePilot");
        score.setScore(450);
        score.setEnemiesDestroyed(9);
        score.setCompletionStatus("LOST");
        score.setCreatedAt(LocalDateTime.now());

        when(gameScoreService.saveScore(any(GameScore.class))).thenReturn(score);

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(score)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.playerName").value("AcePilot"))
                .andExpect(jsonPath("$.score").value(450));
    }

    @Test
    @DisplayName("POST /api/scores with empty player name returns 400 Bad Request")
    void testSaveScoreEmptyNameValidation() throws Exception {
        GameScore invalidScore = new GameScore();
        invalidScore.setPlayerName("   ");
        invalidScore.setScore(100);

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidScore)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/scores with negative score returns 400 Bad Request")
    void testSaveScoreNegativeScoreValidation() throws Exception {
        GameScore invalidScore = new GameScore();
        invalidScore.setPlayerName("Player1");
        invalidScore.setScore(-50);

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidScore)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/scores/leaderboard returns 200 OK with list of scores")
    void testGetLeaderboard() throws Exception {
        GameScore s1 = new GameScore();
        s1.setId(1L);
        s1.setPlayerName("TopPlayer");
        s1.setScore(1200);

        when(gameScoreService.getLeaderboard()).thenReturn(List.of(s1));

        mockMvc.perform(get("/api/scores/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].playerName").value("TopPlayer"))
                .andExpect(jsonPath("$[0].score").value(1200));
    }

    @Test
    @DisplayName("GET /api/scores/player/{playerName} returns 200 OK with player scores")
    void testGetPlayerScores() throws Exception {
        GameScore s1 = new GameScore();
        s1.setId(2L);
        s1.setPlayerName("StarGazer");
        s1.setScore(800);

        when(gameScoreService.getPlayerScores("StarGazer")).thenReturn(List.of(s1));

        mockMvc.perform(get("/api/scores/player/StarGazer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].playerName").value("StarGazer"));
    }
}
