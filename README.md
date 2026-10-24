# Space Invaders 👾🚀

A beginner-friendly, viva-friendly full-stack Space Invaders arcade game built with vanilla HTML5, CSS3, JavaScript (HTML5 Canvas), Java Spring Boot, and an embedded SQLite database.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Quick Start & Setup](#quick-start--setup)
- [Game Controls](#game-controls)
- [REST API Endpoints](#rest-api-endpoints)
- [Database & Persistence](#database--persistence)
- [Viva Explanation Guide](#viva-explanation-guide)
- [Automated Testing](#automated-testing)
- [Deployment Notes](#deployment-notes)
- [Limitations](#limitations)
- [Repository Information](#repository-information)

---

## 🌌 Project Overview

Space Invaders is a classic arcade game reimagined with a modern retro-futuristic aesthetic. Earth is under attack by a formation of alien invaders marching down from the cosmos. As the defender, you pilot a laser defense cannon to eliminate the invaders before they reach Earth or destroy your ship.

The project demonstrates an end-to-end full-stack architecture with clear separation of concerns:
- **Client (Browser):** High-performance real-time 60 FPS gameplay rendered on an HTML5 `<canvas>` using pure JavaScript (no external frameworks or CDNs).
- **Server (Java Spring Boot):** Layered RESTful backend handling score submission, validation, and retrieval.
- **Database (SQLite):** File-based relational storage persisting player scores across restarts without requiring an external database server installation.

---

## ✨ Features

- **Retro-Futuristic Visuals:** Deep space navy background, dynamic animated starfields, neon accents, and glowing vector graphics drawn with Canvas paths.
- **Classic Gameplay:**
  - Responsive player ship movement (bounded strictly within canvas borders).
  - Rapid laser cannon firing with cooldown to prevent bullet spam.
  - Alien formation marching horizontally, shifting direction, and dropping closer upon hitting screen boundaries.
  - Alien retaliatory laser fire.
  - Precise bounding-box collision detection.
- **HUD & Status:** Real-time live score and remaining lives display (♥♥♥).
- **Game State Flow:**
  - Main Menu with Pilot Name registration and How to Play instructions.
  - Pause & Resume functionality (`P` key) with overlay.
  - In-game Restart (`R` key) without duplicate animation loops.
  - Game Over and Victory screens displaying final statistics (score and enemies destroyed).
- **Database-Backed Leaderboard:**
  - Live top-10 leaderboard sorted by score descending, with tie-breakers (earlier timestamp, lower ID).
  - Duplicate score submission prevention (disables submit button on in-flight and saved states).
  - Loading, empty ("No scores yet. Play your first game!"), and error states.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Pure web standards; zero frontend dependencies; HTML5 Canvas rendering. |
| **Backend** | Java 17, Spring Boot 3.2.5 | Spring Web (MVC/REST), Spring Data JPA, Hibernate ORM 6.4, Jakarta Validation. |
| **Build Tool** | Apache Maven 3.6+ / Maven Wrapper | Fully self-contained build scripts (`mvnw`, `mvnw.cmd`). |
| **Database** | SQLite 3 | `sqlite-jdbc` 3.45.3.0 + `hibernate-community-dialects`. |
| **Testing** | JUnit 5, Mockito, Spring Boot Test | WebMvc unit tests and SQLite integration tests. |

---

## 🏛️ System Architecture

```
[ Browser Client ]
   │
   ├── index.html (UI structure & screens)
   ├── style.css  (Retro-futuristic arcade theme)
   └── game.js    (Game loop, Canvas rendering, Input, REST API fetch)
         │
         │  HTTP REST (JSON)
         ▼
[ Spring Boot Backend (Port 8080) ]
   │
   ├── GameScoreController (REST API Endpoints: /api/scores)
   ├── GlobalExceptionHandler (@RestControllerAdvice for clean JSON errors)
   ├── GameScoreService (Business logic: name trimming, top-10 limit)
   ├── GameScoreRepository (Spring Data JPA queries)
   └── GameScore (JPA Entity with Bean Validation)
         │
         │  JDBC
         ▼
[ SQLite Database: data/space_invaders.db ]
   └── Table: game_scores (id, player_name, score, enemies_destroyed, completion_status, created_at)
```

---

## 📋 Prerequisites

- **Java Development Kit (JDK):** Version 17 or higher (tested on Oracle JDK 17).
- **Operating System:** Windows, macOS, or Linux.
- **Browser:** Any modern Chromium-based browser (Google Chrome, Microsoft Edge) or Mozilla Firefox.

---

## 🚀 Quick Start & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/theneerajgrover/space-invaders-java.git
cd space-invaders-java
```

### 2. Run the Application
The project includes the Maven Wrapper, so you do not even need Maven installed globally!

**On Windows (PowerShell / Command Prompt):**
```powershell
.\mvnw.cmd spring-boot:run
```

**On macOS / Linux:**
```bash
./mvnw spring-boot:run
```

Alternatively, build and run the executable JAR:
```bash
.\mvnw.cmd package -DskipTests
java -jar target/space-invaders-java-1.0.0.jar
```

### 3. Open in Browser
Visit the application in your browser:
```
http://localhost:8080
```

---

## 🎮 Game Controls

| Key | Action |
|---|---|
| `←` / `A` | Move Ship Left |
| `→` / `D` | Move Ship Right |
| `Spacebar` | Fire Laser Cannon |
| `P` | Pause / Resume Game |
| `R` | Restart Current Game |

---

## 🌐 REST API Endpoints

All backend endpoints are prefixed under `/api/scores`:

| Method | Endpoint | Description | Request Body | Response Code |
|---|---|---|---|---|
| `POST` | `/api/scores` | Save completed game score | `{"playerName":"Ace","score":800,"enemiesDestroyed":16,"completionStatus":"WON"}` | `201 Created` / `400 Bad Request` |
| `GET` | `/api/scores/leaderboard` | Retrieve Top 10 leaderboard | None | `200 OK` (JSON Array) |
| `GET` | `/api/scores/player/{playerName}` | Retrieve score history for a player | None | `200 OK` (JSON Array) |

### Sample Validation Rules:
- `playerName`: Mandatory, trimmed, maximum 20 characters.
- `score`: Mandatory integer, non-negative ($0$ to $999,999$).
- `enemiesDestroyed`: Optional integer, non-negative ($0$ to $1,000$).
- `completionStatus`: Optional string ("WON" or "LOST", max 10 characters).

---

## 💾 Database & Persistence

- **Database File:** `data/space_invaders.db`
- **Automatic Setup:** The `data` directory and `space_invaders.db` file are created automatically if missing upon application start.
- **Schema Management:** Hibernate uses `spring.jpa.hibernate.ddl-auto=update`, ensuring existing records survive across application restarts and never drop existing scores.
- **Test Isolation:** Automated test executions activate the `test` Spring profile (`application-test.properties`), running against an isolated `data/test_space_invaders.db` with `create-drop` that cleans itself up after tests, guaranteeing the production database remains pristine.

---

## 🎓 Viva Explanation Guide

For examiners and project presentations, here is how each component works:

1. **`SpaceInvadersApplication.java` (Application Bootstrap):**
   - Standard `@SpringBootApplication` entry point.
   - The `main()` method checks for the existence of the `data/` directory and creates it before Spring initializes HikariCP and the SQLite datasource.

2. **`GameScore.java` (Entity / Data Model):**
   - `@Entity` mapping to table `game_scores`.
   - Uses `@GeneratedValue(strategy = GenerationType.IDENTITY)` for SQLite autoincrement primary keys.
   - Uses `@PrePersist` to automatically populate `createdAt` with `LocalDateTime.now()` right before the database insert.
   - Contains Jakarta validation annotations (`@NotBlank`, `@Size`, `@NotNull`, `@Min`, `@Max`).

3. **`GameScoreRepository.java` (Data Access Layer):**
   - Extends Spring Data's `JpaRepository<GameScore, Long>`.
   - Uses a custom JPQL query for the leaderboard:
     `SELECT g FROM GameScore g ORDER BY g.score DESC, g.createdAt ASC, g.id ASC`
     ensuring fair tie-breaking (players who reached the high score earlier rank higher).

4. **`GameScoreService.java` (Business Logic Layer):**
   - Decouples HTTP concerns from database operations.
   - Trims user input whitespace before persisting.
   - Enforces the top-10 limit on leaderboard results (`subList(0, 10)`).

5. **`GameScoreController.java` (REST API Controller):**
   - Exposes REST endpoints with `@RestController` and `@RequestMapping("/api/scores")`.
   - Validates incoming payloads using `@Valid @RequestBody`, returning `201 Created` upon success.

6. **`GlobalExceptionHandler.java` (Centralized Error Handling):**
   - Annotated with `@RestControllerAdvice`.
   - Catches `MethodArgumentNotValidException` to return user-friendly `400 Bad Request` JSON responses with clear validation messages.
   - Catches `HttpMessageNotReadableException` for malformed JSON.
   - Catches generic unexpected exceptions to return safe `500 Internal Server Error` responses without leaking stack traces or database connection details.

7. **`game.js` (Frontend Engine):**
   - Separation of concerns: `update()` handles math, positions, and collisions; `draw()` handles rendering to the Canvas.
   - Correct animation loop management: stores `animFrameId` and calls `cancelAnimationFrame(animFrameId)` before restarting to prevent accelerated duplicate loops.
   - Uses modern `async/await` and `fetch()` to communicate with backend REST endpoints.

---

## 🧪 Automated Testing

Run the test suite using Maven:
```powershell
.\mvnw.cmd test
```

### Executed Tests:
- **`GameScoreControllerTest` (5 Unit Tests):**
  - `testSaveScoreSuccess`: Verifies HTTP 201 Created and JSON response structure.
  - `testSaveScoreEmptyNameValidation`: Verifies empty names return HTTP 400 Bad Request.
  - `testSaveScoreNegativeScoreValidation`: Verifies negative scores return HTTP 400 Bad Request.
  - `testGetLeaderboard`: Verifies HTTP 200 OK with leaderboard array.
  - `testGetPlayerScores`: Verifies HTTP 200 OK for player-specific score retrieval.
- **`GameScoreIntegrationTest` (4 Integration Tests):**
  - `testSaveScorePersistence`: Verifies real SQLite insertion, auto-generated ID, and auto-populated timestamp.
  - `testPlayerNameTrimming`: Verifies whitespace trimming before persistence.
  - `testLeaderboardOrdering`: Verifies descending score sort order and top 10 limit with 12 scores.
  - `testGetPlayerScores`: Verifies case-insensitive player history retrieval.

---

## 🚢 Deployment Notes

SQLite is an embedded, file-based database stored locally at `data/space_invaders.db`.
- **Local Run:** Runs out-of-the-box with one command.
- **Container / Hosted Environments (Docker, Render, AWS, Heroku):** Since SQLite writes directly to the disk, any hosted container platform requires mounting a **persistent storage volume** to the `data/` directory. Without a persistent volume, ephemeral container restarts will create a fresh database and lose previously saved scores.

---

## ⚠️ Known Limitations

- Single-player arcade gameplay (no multiplayer or WebSockets by design).
- Single wave difficulty progression (viva-friendly scoped college project).
- Local desktop browser focus (optimized for standard keyboard controls).

---

## 📦 Repository Information

- **GitHub Repository:** [https://github.com/theneerajgrover/space-invaders-java](https://github.com/theneerajgrover/space-invaders-java)
- **License:** Open Source for educational purposes.
