import {
    BASE_OBSTACLE_SPEED, BASE_OBSTACLE_INTERVAL, hapticPatterns,
    INVULNERABILITY_DURATION
} from './config.js';
import { assetLoader } from './assets.js';
import { audioSystem } from './audio.js';
import { gameState } from './gameState.js';
import { initializePools, startPoolCleanup, stopPoolCleanup, cleanupObjectPools } from './pools.js';
import { stageSystem } from './stages.js';
import { accessibility } from './accessibility.js';
import {
    initializeSettingsListeners, updateModernUI, setDifficulty
} from './ui.js';
import {
    initMobileControls, handleKeyboard, resetFishRotation,
    updateFishPosition, isMobileDevice
} from './controls.js';
import {
    entities, createObstacle, createBubble, createPowerUp, createCrab,
    updateObstacles, updateBubbles, updateCrabs, updatePearls, updatePowerUps,
    clearAllEntities, initCrabs, activatePowerUp
} from './entities.js';
import { triggerHaptic } from './utils.js';

const fish = document.getElementById("fish");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const pauseScreen = document.getElementById("pause-screen");
const livesDisplay = document.getElementById("lives") || (() => {
    const el = document.createElement("div");
    el.id = "lives";
    document.body.appendChild(el);
    return el;
})();

const gameData = {
    fishBottom: 300,
    fishLeft: 50,
    score: 0,
    highScore: Number(localStorage.getItem("highScore") || 0),
    lives: 3,
    obstacleSpeed: BASE_OBSTACLE_SPEED,
    obstacleInterval: BASE_OBSTACLE_INTERVAL,
    gameOver: false,
    isGameStarted: false,
    isPaused: false,
    isPoweredUp: false,
    isInvulnerable: false,
    currentStage: 1,
    currentDifficulty: "normal",
    isMobileDevice: false
};

let gameAnimationId = null;
let lastFrameTime = 0;
let lastObstacleSpawn = 0;
let lastBubbleSpawn = 0;
let lastPowerUpSpawn = 0;
let lastCrabSpawn = 0;
let deltaTime = 0;
let smoothDeltaTime = 16.67;

function initGame() {
    gameData.fishBottom = 300;
    gameData.fishLeft = 50;
    gameData.score = 0;
    gameData.lives = 3;
    gameData.gameOver = false;
    gameData.isPaused = false;
    gameData.isPoweredUp = false;
    gameData.isInvulnerable = false;
    gameData.currentStage = 1;

    const config = stageSystem.getStageConfig(gameData.currentStage);
    gameData.obstacleSpeed = BASE_OBSTACLE_SPEED * config.speedMultiplier;
    gameData.obstacleInterval = BASE_OBSTACLE_INTERVAL / config.spawnRateMultiplier;

    fish.style.bottom = `${gameData.fishBottom}px`;
    fish.style.left = `${gameData.fishLeft}px`;
    fish.style.transform = "rotate(0deg)";

    if (config.background.startsWith('linear-gradient')) {
        gameContainer.style.background = config.background;
        gameContainer.style.backgroundImage = 'none';
    } else {
        gameContainer.style.backgroundImage = `url('${config.background}')`;
    }
    updateScore();
}

function updateScore() {
    const nextStagePoints = stageSystem.calculatePointsForStage(gameData.currentStage + 1);
    const config = stageSystem.getStageConfig(gameData.currentStage);
    updateModernUI(gameData, stageSystem);
    scoreDisplay.innerHTML = `Score: ${gameData.score}<br>High Score: ${gameData.highScore}<br>${config.name}`;
    livesDisplay.innerHTML = "❤️".repeat(Math.max(0, gameData.lives));
    accessibility.announceScoreChange(gameData.score);
    accessibility.announceLivesChange(gameData.lives);
}

function handleCollision(damage = 1) {
    if (gameData.isInvulnerable || gameData.isPoweredUp) return;

    gameData.lives -= damage;
    updateScore();
    audioSystem.playSound("hit");
    triggerHaptic('collision', gameData.isMobileDevice, hapticPatterns);

    if (gameData.lives <= 0) {
        endGame();
        return;
    }

    gameData.isInvulnerable = true;
    fish.classList.add("invulnerable");

    const blinkInterval = setInterval(() => {
        fish.style.opacity = fish.style.opacity === "0.5" ? "1" : "0.5";
    }, 100);

    setTimeout(() => {
        gameData.isInvulnerable = false;
        fish.classList.remove("invulnerable");
        clearInterval(blinkInterval);
        fish.style.opacity = "1";
    }, INVULNERABILITY_DURATION);
}

function increaseScore() {
    gameData.score += 1;
    if (gameData.score > gameData.highScore) {
        gameData.highScore = gameData.score;
        localStorage.setItem("highScore", gameData.highScore);
    }
    audioSystem.playSound("scorePoint");
    updateScore();
    updateStage();
    if (gameData.score % 10 === 0 && gameState) {
        gameState.saveGameState(gameData);
    }
}

function updateStage() {
    const nextStagePoints = stageSystem.calculatePointsForStage(gameData.currentStage + 1);
    if (gameData.score >= nextStagePoints && gameData.currentStage < stageSystem.maxStage) {
        gameData.currentStage++;
        const config = stageSystem.getStageConfig(gameData.currentStage);

        audioSystem.playSound("stageUp");
        triggerHaptic('stageUp', gameData.isMobileDevice, hapticPatterns);
        audioSystem.playBackgroundMusic(gameData.currentStage);

        gameData.obstacleSpeed = BASE_OBSTACLE_SPEED * config.speedMultiplier;
        gameData.obstacleInterval = BASE_OBSTACLE_INTERVAL / config.spawnRateMultiplier;

        updateBackground(config.background);
        accessibility.announceStageChange(config.name);
    }
}

function updateBackground(background) {
    if (background.startsWith('linear-gradient')) {
        gameContainer.style.background = background;
        gameContainer.style.backgroundImage = 'none';
    } else {
        gameContainer.style.backgroundImage = `url('${background}')`;
    }
}

function togglePause() {
    if (!gameData.isGameStarted || gameData.gameOver) return;
    gameData.isPaused = !gameData.isPaused;
    pauseScreen.style.display = gameData.isPaused ? "flex" : "none";
    accessibility.announcePause(gameData.isPaused);
}

function startGame() {
    gameData.isGameStarted = true;
    initGame();
    const config = stageSystem.getStageConfig(gameData.currentStage);
    startScreen.style.display = "none";

    if (config.background.startsWith('linear-gradient')) {
        gameContainer.style.background = config.background;
        gameContainer.style.backgroundImage = 'none';
    } else {
        gameContainer.style.backgroundImage = `url('${config.background}')`;
    }

    audioSystem.playBackgroundMusic(gameData.currentStage);

    lastObstacleSpawn = 0;
    lastBubbleSpawn = 0;
    lastPowerUpSpawn = 0;
    lastCrabSpawn = 0;

    initCrabs(gameData, gameContainer);
    startGameLoop();
    startPoolCleanup();
    accessibility.announceGameStart(gameData.isGameStarted);
}

function restartGame() {
    stopGameLoop();
    clearAllEntities();
    gameData.gameOver = false;
    gameData.isGameStarted = false;
    gameData.isPaused = false;
    gameData.isPoweredUp = false;
    gameData.isInvulnerable = false;
    gameData.currentStage = 1;
    gameData.score = 0;
    gameData.lives = 3;
    gameData.fishLeft = 50;
    gameData.fishBottom = 300;
    gameData.obstacleSpeed = BASE_OBSTACLE_SPEED;
    gameData.obstacleInterval = BASE_OBSTACLE_INTERVAL;

    gameOverDisplay.style.display = "none";
    fish.style.transform = "rotate(0deg)";
    fish.style.filter = "none";
    fish.style.opacity = "1";
    fish.className = "";

    lastObstacleSpawn = 0;
    lastBubbleSpawn = 0;
    lastPowerUpSpawn = 0;
    lastCrabSpawn = 0;

    setTimeout(() => startGame(), 100);
}

function endGame() {
    gameData.gameOver = true;
    gameData.isGameStarted = false;
    audioSystem.stopBackgroundMusic();
    audioSystem.playSound("gameOver");
    stopGameLoop();

    gameOverDisplay.querySelector("p").innerHTML = `Game Over!<br>Final Score: ${gameData.score}<br>Press R to Restart`;
    gameOverDisplay.style.display = "block";
    fish.style.transform = "rotate(180deg)";

    accessibility.announceGameOver(gameData.score);
    setTimeout(cleanupObjectPools, 1000);
}

function gameLoop(currentTime = 0) {
    if (gameData.gameOver && !gameData.isGameStarted) {
        gameAnimationId = null;
        return;
    }

    const rawDelta = currentTime - lastFrameTime;
    smoothDeltaTime = smoothDeltaTime * 0.9 + rawDelta * 0.1;
    deltaTime = Math.min(smoothDeltaTime, 50);
    lastFrameTime = currentTime;

    if (!gameData.isPaused && gameData.isGameStarted) {
        updateObstacles(deltaTime, gameData, fish, handleCollision);
        updateBubbles(deltaTime, gameContainer);
        updateCrabs(deltaTime, gameContainer);
        updatePearls(deltaTime, fish, handleCollision);
        updatePowerUps(deltaTime, gameData, fish, activatePowerUp, updateScore);
        updateFishPosition(gameData, fish);
        handleSpawning(currentTime);
    }

    gameAnimationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (gameAnimationId) cancelAnimationFrame(gameAnimationId);
    gameAnimationId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
        gameAnimationId = null;
    }
}

function handleSpawning(currentTime) {
    if (currentTime - lastObstacleSpawn > gameData.obstacleInterval) {
        createObstacle(gameData, gameContainer);
        lastObstacleSpawn = currentTime;
    }

    if (currentTime - lastBubbleSpawn > 500 && Math.random() < 0.7) {
        createBubble(gameData, gameContainer);
        lastBubbleSpawn = currentTime;
    }

    if (currentTime - lastPowerUpSpawn > 15000 && Math.random() < 0.1) {
        createPowerUp(gameData, gameContainer);
        lastPowerUpSpawn = currentTime;
    }

    if (currentTime - lastCrabSpawn > 3000 && entities.crabs.size < 3 && Math.random() < 0.3) {
        createCrab(gameData, gameContainer);
        lastCrabSpawn = currentTime;
    }
}

document.addEventListener("keydown", (e) => handleKeyboard(e, gameData, fish, restartGame, togglePause, setDifficulty));
document.addEventListener("keyup", (e) => resetFishRotation(e, fish, gameData));
startButton.addEventListener("click", startGame);

window.addEventListener("resize", () => {
    gameData.fishBottom = Math.min(gameData.fishBottom, window.innerHeight - 60);
    gameData.fishLeft = Math.min(gameData.fishLeft, window.innerWidth - 80);
    fish.style.bottom = `${gameData.fishBottom}px`;
    fish.style.left = `${gameData.fishLeft}px`;
});

window.addEventListener('beforeunload', () => {
    if (gameData.isGameStarted && !gameData.gameOver && gameState) {
        gameState.saveGameState(gameData);
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (gameData.isGameStarted && !gameData.gameOver && !gameData.isPaused) {
            togglePause();
        }
        if (gameData.isGameStarted && !gameData.gameOver && gameState) {
            gameState.saveGameState(gameData);
        }
    }
});

window.addEventListener("load", () => {
    assetLoader.init();
    audioSystem.initSounds();
    initializePools();
    initMobileControls(togglePause, (diff) => setDifficulty(diff, gameData), gameData, ['easy', 'normal', 'hard']);
    gameState.init();
    accessibility.init();
    initializeSettingsListeners();

    assetLoader.onProgress((progress) => {
        if (progress >= 1.0) {
            setTimeout(() => {
                initGame();
                initCrabs(gameData, gameContainer);
                updateScore();
            }, 500);
        }
    });
});
