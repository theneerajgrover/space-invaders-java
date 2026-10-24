package com.spaceinvaders.repository;

import com.spaceinvaders.model.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing GameScore records in the SQLite database.
 * Spring Data JPA generates the implementation automatically.
 */
@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, Long> {

    /**
     * Get the top 10 scores, sorted by score descending.
     * Ties are broken by earlier date first, then by lower id.
     */
    @Query("SELECT g FROM GameScore g ORDER BY g.score DESC, g.createdAt ASC, g.id ASC")
    List<GameScore> findTop10Scores();

    /**
     * Get all scores for a specific player, sorted by score descending.
     */
    List<GameScore> findByPlayerNameIgnoreCaseOrderByScoreDesc(String playerName);
}
