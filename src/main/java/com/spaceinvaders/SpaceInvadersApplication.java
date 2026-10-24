package com.spaceinvaders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Space Invaders application.
 * Starts the Spring Boot server which serves both the REST API and the static frontend.
 */
@SpringBootApplication
public class SpaceInvadersApplication {

    public static void main(String[] args) {
        // Automatically create data directory if missing for SQLite storage
        java.io.File dataDir = new java.io.File("data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }
        SpringApplication.run(SpaceInvadersApplication.class, args);
    }
}
