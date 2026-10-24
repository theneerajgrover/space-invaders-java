package com.spaceinvaders.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Entity representing a saved game score.
 * Maps to the 'game_scores' table in the SQLite database.
 */
@Entity
@Table(name = "game_scores")
public class GameScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Player name is required")
    @Size(max = 20, message = "Player name must be 20 characters or less")
    @Column(name = "player_name", nullable = false, length = 20)
    private String playerName;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score must be non-negative")
    @Max(value = 999999, message = "Score exceeds maximum allowed value")
    @Column(name = "score", nullable = false)
    private Integer score;

    @Min(value = 0, message = "Enemies destroyed must be non-negative")
    @Max(value = 1000, message = "Enemies destroyed exceeds maximum")
    @Column(name = "enemies_destroyed")
    private Integer enemiesDestroyed;

    @Size(max = 10, message = "Completion status too long")
    @Column(name = "completion_status", length = 10)
    private String completionStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** Automatically set the creation timestamp before persisting. */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ----- Constructors -----

    public GameScore() {
    }

    // ----- Getters and Setters -----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getEnemiesDestroyed() {
        return enemiesDestroyed;
    }

    public void setEnemiesDestroyed(Integer enemiesDestroyed) {
        this.enemiesDestroyed = enemiesDestroyed;
    }

    public String getCompletionStatus() {
        return completionStatus;
    }

    public void setCompletionStatus(String completionStatus) {
        this.completionStatus = completionStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
