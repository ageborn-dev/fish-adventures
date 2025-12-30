import {
    OBSTACLE_SETS, PEARL_SPEED_PX, PEARL_MIN_DELAY, PEARL_MAX_DELAY,
    BUBBLE_MIN_SIZE, BUBBLE_MAX_SIZE, MAX_CRABS, MOVEMENT_PATTERNS, hapticPatterns
} from './config.js';
import { getPooledElement, returnToPool } from './pools.js';
import { stageSystem, obstacleBehaviors, defaultBehavior } from './stages.js';
import { audioSystem } from './audio.js';
import { preloadedImages } from './assets.js';
import { checkCollision, getRandomRange, triggerHaptic } from './utils.js';
import { accessibility } from './accessibility.js';

export const entities = {
    obstacles: new Map(),
    bubbles: new Map(),
    crabs: new Map(),
    pearls: new Map(),
    powerUps: new Map()
};

export function createObstacle(gameData, gameContainer) {
    if (gameData.gameOver || gameData.isPaused) return;
    const config = stageSystem.getStageConfig(gameData.currentStage);
    if (!config.obstacleTypes.length) return;

    const availableObstacles = config.obstacleTypes.filter(
        (type) => preloadedImages.get(type) === true
    );

    if (!availableObstacles.length) {
        availableObstacles.push(...OBSTACLE_SETS.basic.filter(
            (type) => preloadedImages.get(type) === true
        ));
    }

    if (!availableObstacles.length) {
        availableObstacles.push(OBSTACLE_SETS.basic[0]);
    }

    const obstacle = getPooledElement('obstacles');
    const randomType = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
    const img = document.createElement("img");
    img.src = `/assets/images/icons/${randomType}`;
    img.alt = "Obstacle";

    img.onload = () => {
        obstacle.innerHTML = '';
        obstacle.appendChild(img);
        obstacle.dataset.type = randomType;

        const maxTop = window.innerHeight - 80;
        const randomTop = Math.random() * maxTop;
        obstacle.style.left = `${window.innerWidth + 100}px`;
        obstacle.style.top = `${randomTop}px`;
        const behavior = obstacleBehaviors[randomType] || defaultBehavior;

        const speedVariation = 1 + (Math.random() - 0.5) * 2 * MOVEMENT_PATTERNS.SPEEDS.VARIATION;
        const baseSpeed = getRandomRange(MOVEMENT_PATTERNS.SPEEDS.MIN, MOVEMENT_PATTERNS.SPEEDS.MAX);
        const obstacleSpeed = baseSpeed * gameData.obstacleSpeed / 3 * speedVariation;

        const amplitude = getRandomRange(MOVEMENT_PATTERNS.VERTICAL.AMPLITUDE.MIN, MOVEMENT_PATTERNS.VERTICAL.AMPLITUDE.MAX);
        const frequency = getRandomRange(MOVEMENT_PATTERNS.VERTICAL.FREQUENCY.MIN, MOVEMENT_PATTERNS.VERTICAL.FREQUENCY.MAX);
        const patternType = Math.random() > 0.7 ? 'zigzag' : 'sine';

        entities.obstacles.set(obstacle, {
            x: window.innerWidth,
            y: randomTop,
            startY: randomTop,
            speed: obstacleSpeed * behavior.speed * config.speedMultiplier,
            behavior: behavior,
            time: 0,
            pattern: { type: patternType, amplitude: amplitude, frequency: frequency },
            width: 80,
            height: 80
        });

        if (OBSTACLE_SETS.basic.includes(randomType)) {
            const rotationSpeed = Math.random() * 2 + 1;
            const rotationDirection = Math.random() < 0.5 ? 1 : -1;
            img.style.animation = `rotate ${rotationSpeed}s linear infinite ${rotationDirection === -1 ? 'reverse' : ''}`;
        }

        obstacle.style.display = 'block';
        gameContainer.appendChild(obstacle);
    };

    img.onerror = () => returnToPool(obstacle, 'obstacles');
}

export function createCrab(gameData, gameContainer) {
    if (gameData.gameOver || gameData.isPaused || entities.crabs.size >= MAX_CRABS) return;

    const crab = getPooledElement('crabs');
    const startFromLeft = Math.random() > 0.5;
    const direction = startFromLeft ? 1 : -1;
    const gameRect = gameContainer.getBoundingClientRect();
    const startX = startFromLeft ? -100 : gameRect.width;

    crab.style.left = `${startX}px`;
    crab.style.position = 'absolute';
    crab.style.zIndex = '95';
    crab.dataset.direction = direction;
    if (!crab.querySelector('img')) {
        const img = document.createElement("img");
        img.src = "/assets/images/icons/crab.gif";
        img.alt = "Crab";
        crab.appendChild(img);
    }

    entities.crabs.set(crab, {
        x: startX,
        y: 0,
        direction: direction,
        speed: 2,
        lastPearlTime: 0,
        nextPearlDelay: Math.random() * (PEARL_MAX_DELAY - PEARL_MIN_DELAY) + PEARL_MIN_DELAY
    });

    gameContainer.appendChild(crab);
}

export function createPearl(crab, crabData, gameContainer) {
    const pearl = getPooledElement('pearls');
    pearl.style.display = 'block';
    pearl.style.position = 'absolute';
    pearl.innerHTML = '';
    const pearlSize = 12;
    pearl.style.width = `${pearlSize}px`;
    pearl.style.height = `${pearlSize}px`;
    pearl.style.borderRadius = '50%';
    pearl.style.boxShadow = '0 0 6px rgba(255,255,255,0.6)';
    pearl.style.bottom = '0px';

    const pearlX = (crabData.x || 0) + 50;
    pearl.style.left = `${pearlX}px`;

    entities.pearls.set(pearl, {
        x: pearlX,
        y: 0,
        speed: PEARL_SPEED_PX,
        width: pearlSize,
        height: pearlSize,
        startTime: Date.now()
    });

    gameContainer.appendChild(pearl);
}

export function createBubble(gameData, gameContainer) {
    if (gameData.gameOver || gameData.isPaused) return;
    const bubble = getPooledElement('bubbles');

    if (!bubble.querySelector('img') || bubble.querySelector('img').src.indexOf('bubble.png') === -1) {
        bubble.innerHTML = '';
        const img = document.createElement("img");
        img.src = "/assets/images/icons/bubble.png";
        img.alt = "Bubble";
        bubble.appendChild(img);
    }

    const size = Math.random() * (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE) + BUBBLE_MIN_SIZE;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.opacity = Math.random() * 0.4 + 0.4;
    bubble.style.position = 'absolute';

    const gameRect = gameContainer.getBoundingClientRect();
    const randomLeft = Math.random() * (gameRect.width - 30);
    const speed = Math.random() * 10 + 5;

    bubble.style.left = `${randomLeft}px`;
    bubble.style.bottom = '0px';

    entities.bubbles.set(bubble, {
        x: randomLeft,
        y: 0,
        speed: speed,
        time: 0,
        scale: 0.5,
        width: size,
        height: size
    });

    gameContainer.appendChild(bubble);
}

export function createPowerUp(gameData, gameContainer) {
    if (gameData.gameOver || gameData.isPaused) return;

    const powerUp = getPooledElement('powerUps');
    powerUp.innerHTML = "⭐";
    powerUp.style.display = 'block';

    const maxTop = window.innerHeight - 50;
    const randomTop = Math.random() * maxTop;
    powerUp.style.left = `${window.innerWidth + 100}px`;
    powerUp.style.top = `${randomTop}px`;

    entities.powerUps.set(powerUp, {
        x: window.innerWidth,
        y: randomTop,
        speed: 2,
        isLife: false
    });

    gameContainer.appendChild(powerUp);
}

export function createLifePowerup(gameData, gameContainer) {
    if (gameData.gameOver || gameData.isPaused) return;
    const lifePowerup = getPooledElement('lifePowerUps');
    lifePowerup.innerHTML = "❤️";
    lifePowerup.style.display = 'block';

    const maxTop = window.innerHeight - 50;
    const randomTop = Math.random() * maxTop;
    lifePowerup.style.left = `${window.innerWidth + 100}px`;
    lifePowerup.style.top = `${randomTop}px`;
    entities.powerUps.set(lifePowerup, {
        x: window.innerWidth,
        y: randomTop,
        speed: 2,
        isLife: true
    });

    gameContainer.appendChild(lifePowerup);
}

export function activatePowerUp(gameData, fish) {
    gameData.isPoweredUp = true;
    audioSystem.playSound("powerUp");
    triggerHaptic('powerUp', gameData.isMobileDevice, hapticPatterns);

    fish.classList.add("powered-up");
    accessibility.announcePowerUp();

    const powerState = document.createElement("div");
    powerState.className = "power-state";
    fish.appendChild(powerState);

    let timeLeft = 5;
    const updateTimer = setInterval(() => {
        timeLeft--;
        powerState.textContent = `Power: ${timeLeft}s`;
        if (timeLeft <= 2) {
            fish.style.animation = "powerPulse 0.5s infinite";
        }
    }, 1000);

    setTimeout(() => {
        gameData.isPoweredUp = false;
        fish.classList.remove("powered-up");
        clearInterval(updateTimer);
        powerState.remove();
        fish.style.animation = "";
    }, 5000);
}

export function updateObstacles(deltaTime, gameData, fish, handleCollision) {
    entities.obstacles.forEach((obstacleData, element) => {
        if (!element.parentNode) {
            entities.obstacles.delete(element);
            return;
        }

        const { speed, behavior, startY, time, pattern } = obstacleData;
        obstacleData.time += deltaTime * 0.001;
        obstacleData.x -= speed * deltaTime * 0.06;

        if (pattern.type === 'sine') {
            obstacleData.y = startY + Math.sin(obstacleData.time * pattern.frequency) * pattern.amplitude;
        } else if (pattern.type === 'zigzag') {
            const phase = (obstacleData.time * pattern.frequency) % 2;
            obstacleData.y = startY + (phase < 1 ? phase : 2 - phase) * pattern.amplitude * 2 - pattern.amplitude;
        }

        obstacleData.y = Math.max(0, Math.min(obstacleData.y, window.innerHeight - 80));
        element.style.left = `${obstacleData.x}px`;
        element.style.top = `${obstacleData.y}px`;

        if (!gameData.isPoweredUp && !gameData.isInvulnerable && checkCollision(element, fish)) {
            handleCollision(behavior.damage || 1);
            audioSystem.playSound(behavior.soundEffect || "hit");
            return;
        }

        if (obstacleData.x < -100) {
            returnToPool(element, 'obstacles');
            entities.obstacles.delete(element);
        }
    });
}

export function updateBubbles(deltaTime, gameContainer) {
    entities.bubbles.forEach((bubbleData, element) => {
        if (!element.parentNode) {
            entities.bubbles.delete(element);
            return;
        }

        bubbleData.y += bubbleData.speed * deltaTime * 0.03;
        element.style.bottom = `${bubbleData.y}px`;

        if (bubbleData.y > gameContainer.clientHeight) {
            returnToPool(element, 'bubbles');
            entities.bubbles.delete(element);
        }
    });
}

export function updateCrabs(deltaTime, gameContainer) {
    entities.crabs.forEach((crabData, element) => {
        if (!element.parentNode) {
            entities.crabs.delete(element);
            return;
        }

        crabData.x += crabData.direction * crabData.speed * deltaTime * 0.03;
        element.style.left = `${crabData.x}px`;
        const gameRect = gameContainer.getBoundingClientRect();
        element.style.top = `${gameRect.height - 73}px`;

        crabData.lastPearlTime += deltaTime;
        if (!crabData.nextPearlDelay) {
            crabData.nextPearlDelay = Math.random() * (PEARL_MAX_DELAY - PEARL_MIN_DELAY) + PEARL_MIN_DELAY;
        }
        if (crabData.lastPearlTime > crabData.nextPearlDelay) {
            if (Math.random() < 0.95) {
                createPearl(element, crabData, gameContainer);
            }
            crabData.lastPearlTime = 0;
            crabData.nextPearlDelay = Math.random() * (PEARL_MAX_DELAY - PEARL_MIN_DELAY) + PEARL_MIN_DELAY;
        }

        if (crabData.x < -150 || crabData.x > gameRect.width + 150) {
            returnToPool(element, 'crabs');
            entities.crabs.delete(element);
        }
    });
}

export function updatePearls(deltaTime, fish, handleCollision) {
    entities.pearls.forEach((pearlData, element) => {
        if (!element.parentNode) {
            entities.pearls.delete(element);
            return;
        }

        pearlData.y += (pearlData.speed || PEARL_SPEED_PX) * deltaTime * 0.001;
        element.style.left = `${pearlData.x}px`;
        element.style.bottom = `${pearlData.y}px`;

        if (checkCollision(element, fish)) {
            handleCollision(1);
            audioSystem.playSound("hit");
            returnToPool(element, 'pearls');
            entities.pearls.delete(element);
            return;
        }

        const maxAge = 8000;
        const isOffScreen = pearlData.y > window.innerHeight + 50;
        const isTooOld = pearlData.startTime && (Date.now() - pearlData.startTime > maxAge);

        if (isOffScreen || isTooOld) {
            returnToPool(element, 'pearls');
            entities.pearls.delete(element);
        }
    });
}

export function updatePowerUps(deltaTime, gameData, fish, activatePowerUpFn, updateScore) {
    entities.powerUps.forEach((powerUpData, element) => {
        if (!element.parentNode) {
            entities.powerUps.delete(element);
            return;
        }

        powerUpData.x -= powerUpData.speed * deltaTime * 0.06;
        element.style.left = `${powerUpData.x}px`;

        if (checkCollision(element, fish)) {
            if (powerUpData.isLife) {
                gameData.lives = Math.min(gameData.lives + 1, 5);
                audioSystem.playSound("lifePickup");
                updateScore();
            } else {
                activatePowerUpFn(gameData, fish);
            }
            returnToPool(element, powerUpData.isLife ? 'lifePowerUps' : 'powerUps');
            entities.powerUps.delete(element);
            return;
        }

        if (powerUpData.x < -50) {
            returnToPool(element, powerUpData.isLife ? 'lifePowerUps' : 'powerUps');
            entities.powerUps.delete(element);
        }
    });
}

export function clearAllEntities() {
    entities.obstacles.forEach((data, element) => returnToPool(element, 'obstacles'));
    entities.bubbles.forEach((data, element) => returnToPool(element, 'bubbles'));
    entities.crabs.forEach((data, element) => returnToPool(element, 'crabs'));
    entities.pearls.forEach((data, element) => returnToPool(element, 'pearls'));
    entities.powerUps.forEach((data, element) => {
        const poolType = element.classList.contains('life-powerup') ? 'lifePowerUps' : 'powerUps';
        returnToPool(element, poolType);
    });

    entities.obstacles.clear();
    entities.bubbles.clear();
    entities.crabs.clear();
    entities.pearls.clear();
    entities.powerUps.clear();
}

export function initCrabs(gameData, gameContainer) {
    entities.crabs.clear();
    entities.pearls.clear();
    for (let i = 0; i < Math.min(2, MAX_CRABS); i++) {
        setTimeout(() => createCrab(gameData, gameContainer), Math.random() * 2000);
    }
}
