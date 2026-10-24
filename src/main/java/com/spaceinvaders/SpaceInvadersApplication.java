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
        SpringApplication.run(SpaceInvadersApplication.class, args);
    }
}
