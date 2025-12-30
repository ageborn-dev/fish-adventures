export const LIFE_SPAWN_MIN_INTERVAL = 20000;
export const LIFE_SPAWN_MAX_INTERVAL = 40000;
export const INVULNERABILITY_DURATION = 3000;
export const BASE_OBSTACLE_SPEED = 3;
export const BASE_OBSTACLE_INTERVAL = 2000;
export const CRAB_SPEED = 2;
export const PEARL_SPEED = -1.5;
export const PEARL_INTERVAL = 2000;
export const MAX_CRABS = 3;

export const hapticPatterns = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30],
    collision: [50, 30, 50],
    powerUp: [15, 10, 15],
    stageUp: [20, 20, 40]
};

export const MOVEMENT_PATTERNS = {
    SPEEDS: {
        MIN: 2,
        MAX: 5,
        VARIATION: 0.2,
    },
    VERTICAL: {
        AMPLITUDE: { MIN: 30, MAX: 150 },
        FREQUENCY: { MIN: 0.01, MAX: 0.03 },
    },
};

export const ICON_SIZE = 50;
export const HUD_HEART_SCALE = 0.8;
export const PEARL_SPEED_PX = 120;
export const PEARL_MIN_DELAY = 800;
export const PEARL_MAX_DELAY = 2200;
export const BUBBLE_MIN_SIZE = 6;
export const BUBBLE_MAX_SIZE = 14;

export const BACKGROUNDS = [
    "calm-waters.png",
    "reef-waters.png",
    "deep-sea.png",
    "storm-waters.png",
    "deep-abyss.png",
];

export const OBSTACLE_SETS = {
    basic: ["rock.png", "trash.png"],
    easy: ["jellyfish.gif", "small-fish.gif"],
    medium: ["barracuda.gif", "stingray.gif"],
    hard: ["shark.gif", "octopus.gif"],
    extreme: ["sea-monster.gif", "giant-squid.gif"],
    special: ["electric-eel.gif", "submarine.gif"],
};

export const defaultSettings = {
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'normal',
    controlScheme: 'arrows',
    graphics: 'high',
    particleEffects: true,
    volume: 0.7,
    autoSave: true,
    accessibility: {
        announcements: true,
        reducedMotion: false,
        highContrast: false
    }
};

export const difficultyMultipliers = {
    easy: { speed: 0.7, interval: 1.4, lives: 5 },
    normal: { speed: 1.0, interval: 1.0, lives: 3 },
    hard: { speed: 1.5, interval: 0.7, lives: 2 }
};
