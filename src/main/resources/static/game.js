/* ===========================================
   Space Invaders - Game Logic (Vanilla JS)
   =========================================== */

// ===== DOM Elements =====
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const instructionsScreen = document.getElementById('instructions-screen');

const playerNameInput = document.getElementById('player-name-input');
const nameError = document.getElementById('name-error');
const startBtn = document.getElementById('start-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const instructionsBackBtn = document.getElementById('instructions-back-btn');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const hudScore = document.getElementById('hud-score');
const hudLives = document.getElementById('hud-lives');
const pauseOverlay = document.getElementById('pause-overlay');

const gameoverTitle = document.getElementById('gameover-title');
const finalScore = document.getElementById('final-score');
const finalEnemies = document.getElementById('final-enemies');
const saveScoreBtn = document.getElementById('save-score-btn');
const saveStatus = document.getElementById('save-status');
const playAgainBtn = document.getElementById('play-again-btn');
const menuBtn = document.getElementById('menu-btn');

const victoryScreen = document.getElementById('victory-screen');
const victoryFinalScore = document.getElementById('victory-final-score');
const victoryFinalEnemies = document.getElementById('victory-final-enemies');
const victoryPlayAgainBtn = document.getElementById('victory-play-again-btn');
const victoryMenuBtn = document.getElementById('victory-menu-btn');

// ===== API Base URL =====
const API_BASE = '/api/scores';
const isGitHubPages = window.location.hostname.endsWith('github.io');

// LocalStorage helpers for static hosting (e.g. GitHub Pages) where Java backend cannot execute
function saveLocalScore(item) {
    try {
        const scores = JSON.parse(localStorage.getItem('space_invaders_scores') || '[]');
        item.id = Date.now();
        item.createdAt = new Date().toISOString();
        scores.push(item);
        scores.sort((a, b) => b.score - a.score || new Date(a.createdAt) - new Date(b.createdAt));
        localStorage.setItem('space_invaders_scores', JSON.stringify(scores.slice(0, 10)));
    } catch (e) {
        console.warn('LocalStorage unavailable', e);
    }
}

// ===== Game Constants =====
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 32;
const PLAYER_SPEED = 6;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 14;
const BULLET_SPEED = 8;
const BULLET_COOLDOWN = 250; // ms between player shots

const ENEMY_ROWS = 4;
const ENEMY_COLS = 8;
const ENEMY_WIDTH = 36;
const ENEMY_HEIGHT = 28;
const ENEMY_PADDING = 14;
const ENEMY_TOP_OFFSET = 60;
const ENEMY_SIDE_OFFSET = 50;
const ENEMY_SPEED_INITIAL = 1.2;
const ENEMY_DROP_DISTANCE = 22;
const ENEMY_FIRE_CHANCE = 0.002; // per enemy per frame

const ENEMY_BULLET_WIDTH = 4;
const ENEMY_BULLET_HEIGHT = 12;
const ENEMY_BULLET_SPEED = 4;

const MAX_LIVES = 3;
const POINTS_PER_KILL = 100;
const MAX_SCORE = 999999;

// ===== Game State =====
let playerName = '';
let animFrameId = null;
let gameState = 'menu'; // menu, playing, paused, gameover, victory, instructions

let player = {};
let bullets = [];
let enemies = [];
let enemyBullets = [];
let stars = [];

let score = 0;
let lives = 0;
let enemiesDestroyed = 0;
let totalEnemies = 0;
let enemyDirection = 1; // 1 = right, -1 = left
let enemySpeed = ENEMY_SPEED_INITIAL;
let lastBulletTime = 0;
let keys = {};
let scoreSaved = false;

// ===== Starfield =====
function createStars(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            radius: Math.random() * 1.5 + 0.3,
            alpha: Math.random() * 0.7 + 0.3,
            speed: Math.random() * 0.3 + 0.1
        });
    }
    return result;
}

function drawStars() {
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        // Slowly move stars downward for a scrolling effect
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
    }
}

// CSS starfield for menu/gameover backgrounds
function createCSSStarfield(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const count = 80;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;
        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.6 + 0.2};
            animation: starTwinkle ${2 + Math.random() * 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(star);
    }

    // Add the twinkle animation if not already present
    if (!document.getElementById('star-twinkle-style')) {
        const style = document.createElement('style');
        style.id = 'star-twinkle-style';
        style.textContent = `
            @keyframes starTwinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== Screen Navigation =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ===== Player Drawing =====
function drawPlayer() {
    const p = player;
    const cx = p.x + PLAYER_WIDTH / 2;

    // Ship body - sleek triangle shape
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(cx, p.y); // nose
    ctx.lineTo(p.x, p.y + PLAYER_HEIGHT);
    ctx.lineTo(p.x + PLAYER_WIDTH, p.y + PLAYER_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#004d66';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx, p.y + 8);
    ctx.lineTo(cx - 8, p.y + PLAYER_HEIGHT - 4);
    ctx.lineTo(cx + 8, p.y + PLAYER_HEIGHT - 4);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 8;
    ctx.fillRect(cx - 6, p.y + PLAYER_HEIGHT - 2, 12, 4);
    ctx.shadowBlur = 0;
}

// ===== Enemy Drawing =====
function drawEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = ENEMY_WIDTH;
    const h = ENEMY_HEIGHT;

    // Alien body - simple invader shape
    const color = enemy.row < 2 ? '#b388ff' : '#ff6b6b';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    // Body rectangle
    ctx.fillRect(x + 4, y + 6, w - 8, h - 12);

    // Head
    ctx.fillRect(x + 8, y, w - 16, 8);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillRect(x + 10, y + 8, 5, 5);
    ctx.fillRect(x + w - 15, y + 8, 5, 5);

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 12, y + 10, 2, 2);
    ctx.fillRect(x + w - 13, y + 10, 2, 2);

    // Legs (two little protrusions)
    ctx.fillStyle = color;
    ctx.fillRect(x + 6, y + h - 6, 6, 6);
    ctx.fillRect(x + w - 12, y + h - 6, 6, 6);
}

// ===== Bullet Drawing =====
function drawBullet(bullet) {
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    ctx.shadowBlur = 0;
}

function drawEnemyBullet(bullet) {
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 6;
    ctx.fillRect(bullet.x, bullet.y, ENEMY_BULLET_WIDTH, ENEMY_BULLET_HEIGHT);
    ctx.shadowBlur = 0;
}

// ===== Collision Detection =====
function rectsCollide(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// ===== Game Initialization =====
function initGame() {
    score = 0;
    lives = MAX_LIVES;
    enemiesDestroyed = 0;
    enemyDirection = 1;
    enemySpeed = ENEMY_SPEED_INITIAL;
    lastBulletTime = 0;
    bullets = [];
    enemyBullets = [];
    scoreSaved = false;

    // Size the canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Create stars
    stars = createStars(120);

    // Create player
    player = {
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };

    // Create enemies
    enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
            enemies.push({
                x: ENEMY_SIDE_OFFSET + col * (ENEMY_WIDTH + ENEMY_PADDING),
                y: ENEMY_TOP_OFFSET + row * (ENEMY_HEIGHT + ENEMY_PADDING),
                row: row,
                alive: true
            });
        }
    }
    totalEnemies = enemies.length;

    updateHUD();
}

// ===== HUD Updates =====
function updateHUD() {
    hudScore.textContent = score;
    hudLives.textContent = '♥'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
}

// ===== Game Update (Logic) =====
function update() {
    if (gameState !== 'playing') return;

    const now = Date.now();

    // Player movement
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 0) {
        player.x -= PLAYER_SPEED;
        if (player.x < 0) player.x = 0;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < CANVAS_WIDTH - PLAYER_WIDTH) {
        player.x += PLAYER_SPEED;
        if (player.x > CANVAS_WIDTH - PLAYER_WIDTH) player.x = CANVAS_WIDTH - PLAYER_WIDTH;
    }

    // Player shooting
    if (keys[' '] && now - lastBulletTime > BULLET_COOLDOWN) {
        bullets.push({
            x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
            y: player.y - BULLET_HEIGHT
        });
        lastBulletTime = now;
    }

    // Update player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;
        if (bullets[i].y + BULLET_HEIGHT < 0) {
            bullets.splice(i, 1);
        }
    }

    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += ENEMY_BULLET_SPEED;
        if (enemyBullets[i].y > CANVAS_HEIGHT) {
            enemyBullets.splice(i, 1);
        }
    }

    // Enemy movement
    let shouldDrop = false;
    const aliveEnemies = enemies.filter(e => e.alive);

    for (const enemy of aliveEnemies) {
        const nextX = enemy.x + enemySpeed * enemyDirection;
        if (nextX <= 0 || nextX + ENEMY_WIDTH >= CANVAS_WIDTH) {
            shouldDrop = true;
            break;
        }
    }

    if (shouldDrop) {
        enemyDirection *= -1;
        for (const enemy of aliveEnemies) {
            enemy.y += ENEMY_DROP_DISTANCE;
        }
    } else {
        for (const enemy of aliveEnemies) {
            enemy.x += enemySpeed * enemyDirection;
        }
    }

    // Enemy shooting
    for (const enemy of aliveEnemies) {
        if (Math.random() < ENEMY_FIRE_CHANCE) {
            enemyBullets.push({
                x: enemy.x + ENEMY_WIDTH / 2 - ENEMY_BULLET_WIDTH / 2,
                y: enemy.y + ENEMY_HEIGHT
            });
        }
    }

    // Bullet-enemy collision
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        let bulletHit = false;

        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            if (rectsCollide(
                { x: b.x, y: b.y, w: BULLET_WIDTH, h: BULLET_HEIGHT },
                { x: enemy.x, y: enemy.y, w: ENEMY_WIDTH, h: ENEMY_HEIGHT }
            )) {
                enemy.alive = false;
                bulletHit = true;
                enemiesDestroyed++;
                score += POINTS_PER_KILL;
                if (score > MAX_SCORE) score = MAX_SCORE;
                updateHUD();
                break; // One bullet destroys one enemy
            }
        }

        if (bulletHit) {
            bullets.splice(bi, 1);
        }
    }

    // Enemy bullet-player collision
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        if (rectsCollide(
            { x: eb.x, y: eb.y, w: ENEMY_BULLET_WIDTH, h: ENEMY_BULLET_HEIGHT },
            { x: player.x, y: player.y, w: PLAYER_WIDTH, h: PLAYER_HEIGHT }
        )) {
            enemyBullets.splice(i, 1);
            lives--;
            updateHUD();
            if (lives <= 0) {
                endGame(false);
                return;
            }
        }
    }

    // Enemy reaches player's level = game over
    for (const enemy of aliveEnemies) {
        if (enemy.y + ENEMY_HEIGHT >= player.y) {
            endGame(false);
            return;
        }
    }

    // Victory check
    if (aliveEnemies.length === 0) {
        endGame(true);
        return;
    }
}

// ===== Game Draw (Rendering) =====
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    drawStars();

    // Draw enemies
    for (const enemy of enemies) {
        if (enemy.alive) {
            drawEnemy(enemy);
        }
    }

    // Draw player
    drawPlayer();

    // Draw player bullets
    for (const bullet of bullets) {
        drawBullet(bullet);
    }

    // Draw enemy bullets
    for (const eb of enemyBullets) {
        drawEnemyBullet(eb);
    }
}

// ===== Game Loop =====
function gameLoop() {
    update();
    draw();
    animFrameId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    // Cancel any existing loop to prevent duplicates
    if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    animFrameId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

// ===== Game Start =====
function startGame() {
    const name = playerNameInput.value.trim();
    if (!name) {
        nameError.textContent = 'Please enter your pilot name.';
        playerNameInput.focus();
        return;
    }
    if (name.length > 20) {
        nameError.textContent = 'Name must be 20 characters or less.';
        playerNameInput.focus();
        return;
    }
    nameError.textContent = '';
    playerName = name;

    initGame();
    gameState = 'playing';
    showScreen('game-screen');
    startGameLoop();
}

// ===== Game End =====
function endGame(victory) {
    stopGameLoop();

    if (victory) {
        gameState = 'victory';
        if (victoryFinalScore) victoryFinalScore.textContent = score;
        if (victoryFinalEnemies) victoryFinalEnemies.textContent = enemiesDestroyed;

        if (saveScoreBtn) {
            saveScoreBtn.disabled = false;
            saveScoreBtn.textContent = 'SAVE SCORE';
        }
        if (saveStatus) {
            saveStatus.textContent = '';
            saveStatus.className = 'save-status';
        }
        scoreSaved = false;

        createCSSStarfield('victory-starfield');
        showScreen('victory-screen');
    } else {
        gameState = 'gameover';
        finalScore.textContent = score;
        finalEnemies.textContent = enemiesDestroyed;

        createCSSStarfield('gameover-starfield');
        showScreen('gameover-screen');
    }
}

// ===== Pause / Resume =====
function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        stopGameLoop();
        pauseOverlay.classList.remove('hidden');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseOverlay.classList.add('hidden');
        startGameLoop();
    }
}

// ===== Score Saving =====
async function saveScore() {
    if (scoreSaved) return;

    if (saveScoreBtn) {
        saveScoreBtn.disabled = true;
        saveScoreBtn.textContent = 'SAVING...';
    }
    if (saveStatus) {
        saveStatus.textContent = '';
        saveStatus.className = 'save-status';
    }

    const payload = {
        playerName: playerName,
        score: score,
        enemiesDestroyed: enemiesDestroyed,
        completionStatus: gameState === 'victory' ? 'WON' : 'LOST'
    };

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            scoreSaved = true;
            if (saveStatus) {
                saveStatus.textContent = '✓ Score saved successfully!';
                saveStatus.className = 'save-status success';
            }
            if (saveScoreBtn) saveScoreBtn.textContent = 'SAVED';
        } else {
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.message || 'Failed to save score.';
            if (saveStatus) {
                saveStatus.textContent = '✗ ' + msg;
                saveStatus.className = 'save-status error';
            }
            if (saveScoreBtn) {
                saveScoreBtn.disabled = false;
                saveScoreBtn.textContent = 'SAVE SCORE';
            }
        }
    } catch (err) {
        if (isGitHubPages) {
            saveLocalScore(payload);
            scoreSaved = true;
            if (saveStatus) {
                saveStatus.textContent = '✓ Score saved (Browser Storage)';
                saveStatus.className = 'save-status success';
            }
            if (saveScoreBtn) saveScoreBtn.textContent = 'SAVED';
            return;
        }
        if (saveStatus) {
            saveStatus.textContent = '✗ Could not connect to server.';
            saveStatus.className = 'save-status error';
        }
        if (saveScoreBtn) {
            saveScoreBtn.disabled = false;
            saveScoreBtn.textContent = 'SAVE SCORE';
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Keyboard Input =====
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Prevent spacebar from scrolling the page
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
    }

    // Pause
    if ((e.key === 'p' || e.key === 'P') && (gameState === 'playing' || gameState === 'paused')) {
        togglePause();
    }

    // Restart during gameplay
    if ((e.key === 'r' || e.key === 'R') && (gameState === 'playing' || gameState === 'paused')) {
        pauseOverlay.classList.add('hidden');
        stopGameLoop();
        initGame();
        gameState = 'playing';
        startGameLoop();
    }

    // Escape to close instructions
    if (e.key === 'Escape' && gameState === 'instructions') {
        showScreen('menu-screen');
        gameState = 'menu';
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ===== Button Event Listeners =====
startBtn.addEventListener('click', startGame);

// Allow Enter key in name input to start game
playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

instructionsBtn.addEventListener('click', () => {
    createCSSStarfield('instructions-starfield');
    gameState = 'instructions';
    showScreen('instructions-screen');
});

instructionsBackBtn.addEventListener('click', () => {
    gameState = 'menu';
    showScreen('menu-screen');
});

if (saveScoreBtn) {
    saveScoreBtn.addEventListener('click', saveScore);
}

playAgainBtn.addEventListener('click', () => {
    initGame();
    gameState = 'playing';
    showScreen('game-screen');
    startGameLoop();
});

menuBtn.addEventListener('click', () => {
    stopGameLoop();
    gameState = 'menu';
    showScreen('menu-screen');
});

if (victoryPlayAgainBtn) {
    victoryPlayAgainBtn.addEventListener('click', () => {
        initGame();
        gameState = 'playing';
        showScreen('game-screen');
        startGameLoop();
    });
}

if (victoryMenuBtn) {
    victoryMenuBtn.addEventListener('click', () => {
        stopGameLoop();
        gameState = 'menu';
        showScreen('menu-screen');
    });
}

// ===== Initialize CSS starfield for menu =====
createCSSStarfield('menu-starfield');
