import { BACKGROUNDS, OBSTACLE_SETS } from './config.js';
import { preloadedImages } from './assets.js';

export const stageSystem = {
    basePoints: 100,
    pointMultiplier: 1.5,
    maxStage: Infinity,

    calculatePointsForStage(stage) {
        return Math.floor(this.basePoints * Math.pow(this.pointMultiplier, stage - 1));
    },

    getBackgroundForStage(stage) {
        const index = (stage - 1) % BACKGROUNDS.length;
        const backgroundFile = BACKGROUNDS[index];
        if (preloadedImages.get(backgroundFile) === true) {
            return `/assets/images/backgrounds/${backgroundFile}`;
        }
        const loadedBackground = BACKGROUNDS.find(bg => preloadedImages.get(bg) === true);
        if (loadedBackground) {
            return `/assets/images/backgrounds/${loadedBackground}`;
        }
        return 'linear-gradient(to bottom, #006994, #004d6b)';
    },

    getObstaclesForStage(stage) {
        let obstacles = [...OBSTACLE_SETS.basic];
        if (stage >= 2) obstacles.push(...OBSTACLE_SETS.easy);
        if (stage >= 3) obstacles.push(...OBSTACLE_SETS.medium);
        if (stage >= 4) obstacles.push(...OBSTACLE_SETS.hard);
        if (stage >= 5) obstacles.push(...OBSTACLE_SETS.extreme);
        if (stage % 3 === 0) obstacles.push(...OBSTACLE_SETS.special);
        return obstacles.filter((obstacle) => preloadedImages.get(obstacle) === true);
    },

    getStageName(stage) {
        const cycle = Math.floor((stage - 1) / 5);
        const stageInCycle = ((stage - 1) % 5) + 1;
        const baseNames = [
            "Calm Waters", "Reef Waters", "Deep Sea", "Storm Waters", "The Abyss"
        ];
        if (cycle === 0) return baseNames[stageInCycle - 1];
        const prefixes = ["", "Greater ", "Extreme ", "Ultimate ", "Infinite "];
        const prefix = prefixes[Math.min(cycle, prefixes.length - 1)];
        return `${prefix}${baseNames[stageInCycle - 1]}`;
    },

    getStageEffects(stage) {
        const effects = [];
        if (stage >= 4) effects.push("storm");
        if (stage >= 5) effects.push("darkness");
        if (stage % 5 === 0) effects.push("boss");
        return effects;
    },

    getStageConfig(stage) {
        return {
            name: this.getStageName(stage),
            background: this.getBackgroundForStage(stage),
            obstacleTypes: this.getObstaclesForStage(stage),
            pointsRequired: this.calculatePointsForStage(stage),
            speedMultiplier: 1 + (stage - 1) * 0.1,
            spawnRateMultiplier: 1 + (stage - 1) * 0.15,
            effects: this.getStageEffects(stage),
        };
    },
};

export const obstacleBehaviors = {
    "shark.gif": {
        speed: 1.5,
        aggressive: true,
        chaseRange: 200,
        damage: 2,
        soundEffect: "hit",
        chase(obstacle, fishPos) {
            const obstacleRect = obstacle.getBoundingClientRect();
            const dx = fishPos.x - obstacleRect.x;
            const dy = fishPos.y - obstacleRect.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.chaseRange) {
                return { x: (dx / distance) * this.speed, y: (dy / distance) * this.speed };
            }
            return { x: 0, y: 0 };
        },
    },
    "octopus.gif": {
        speed: 0.8,
        inkCooldown: 3000,
        inkDuration: 2000,
        damage: 1,
        soundEffect: "inkSpray",
        shootInk(obstacle) {
            const inkCloud = document.createElement("div");
            inkCloud.className = "ink-cloud";
            inkCloud.style.left = `${obstacle.offsetLeft}px`;
            inkCloud.style.top = `${obstacle.offsetTop}px`;
            document.getElementById("game-container").appendChild(inkCloud);
            setTimeout(() => inkCloud.remove(), this.inkDuration);
        },
    },
    "electric-eel.gif": {
        speed: 1.2,
        shockRange: 100,
        shockCooldown: 2000,
        damage: 1.5,
        soundEffect: "electricShock",
        createShockwave(obstacle) {
            const shockwave = document.createElement("div");
            shockwave.className = "electric-field";
            shockwave.style.left = `${obstacle.offsetLeft - 50}px`;
            shockwave.style.top = `${obstacle.offsetTop - 50}px`;
            document.getElementById("game-container").appendChild(shockwave);
            setTimeout(() => shockwave.remove(), 500);
        },
    },
    "sea-monster.gif": {
        speed: 0.7,
        attackRange: 300,
        attackCooldown: 5000,
        damage: 3,
        soundEffect: "monsterRoar",
        specialAttack(obstacle) {
            obstacle.style.transform = "scale(1.2)";
            setTimeout(() => (obstacle.style.transform = "scale(1)"), 500);
        },
    },
};

export const defaultBehavior = {
    speed: 1,
    damage: 1,
    soundEffect: "hit",
};
