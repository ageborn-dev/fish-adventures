import { defaultSettings } from './config.js';
import { audioSystem } from './audio.js';
import { BASE_OBSTACLE_SPEED, BASE_OBSTACLE_INTERVAL } from './config.js';

export const gameState = {
    storageKey: 'fishAdventure_gameState',
    settingsKey: 'fishAdventure_settings',
    defaultSettings: defaultSettings,
    settings: {},

    init() {
        this.loadSettings();
        this.applySettings();
    },

    saveGameState(gameData) {
        if (!gameData.isGameStarted || gameData.gameOver) return;
        const state = {
            score: gameData.score,
            highScore: gameData.highScore,
            lives: gameData.lives,
            currentStage: gameData.currentStage,
            fishPosition: { left: gameData.fishLeft, bottom: gameData.fishBottom },
            difficulty: gameData.currentDifficulty,
            timestamp: Date.now(),
            sessionId: this.generateSessionId()
        };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) { }
    },

    loadGameState() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            if (!savedState) return null;
            const state = JSON.parse(savedState);
            const maxAge = 24 * 60 * 60 * 1000;
            if (Date.now() - state.timestamp > maxAge) {
                this.clearGameState();
                return null;
            }
            return state;
        } catch (error) {
            return null;
        }
    },

    clearGameState() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) { }
    },

    restoreGameState(state, gameData, stageSystem, setDifficulty, updateScore) {
        if (!state) return false;
        try {
            gameData.score = state.score || 0;
            gameData.highScore = Math.max(gameData.highScore, state.highScore || 0);
            gameData.lives = state.lives || 3;
            gameData.currentStage = state.currentStage || 1;
            gameData.fishLeft = state.fishPosition?.left || 50;
            gameData.fishBottom = state.fishPosition?.bottom || 300;
            gameData.currentDifficulty = state.difficulty || 'normal';

            const fish = document.getElementById('fish');
            fish.style.left = `${gameData.fishLeft}px`;
            fish.style.bottom = `${gameData.fishBottom}px`;
            setDifficulty(gameData.currentDifficulty);
            updateScore();

            const config = stageSystem.getStageConfig(gameData.currentStage);
            gameData.obstacleSpeed = BASE_OBSTACLE_SPEED * config.speedMultiplier;
            gameData.obstacleInterval = BASE_OBSTACLE_INTERVAL / config.spawnRateMultiplier;
            return true;
        } catch (error) {
            return false;
        }
    },

    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        } catch (error) { }
    },

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(this.settingsKey);
            if (savedSettings) {
                this.settings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
            } else {
                this.settings = { ...this.defaultSettings };
            }
        } catch (error) {
            this.settings = { ...this.defaultSettings };
        }
    },

    applySettings() {
        if (audioSystem) {
            audioSystem.setEnabled('sound', this.settings.soundEnabled);
            audioSystem.setEnabled('music', this.settings.musicEnabled);
        }
        this.applyGraphicsSettings();
        this.applyAccessibilitySettings();
    },

    applyGraphicsSettings() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;
        gameContainer.classList.remove('graphics-low', 'graphics-medium', 'graphics-high');
        gameContainer.classList.add(`graphics-${this.settings.graphics}`);
        switch (this.settings.graphics) {
            case 'low':
                document.documentElement.style.setProperty('--particle-count', '0');
                document.documentElement.style.setProperty('--animation-speed', '0.5');
                break;
            case 'medium':
                document.documentElement.style.setProperty('--particle-count', '5');
                document.documentElement.style.setProperty('--animation-speed', '0.8');
                break;
            case 'high':
                document.documentElement.style.setProperty('--particle-count', '15');
                document.documentElement.style.setProperty('--animation-speed', '1');
                break;
        }
    },

    applyAccessibilitySettings() {
        if (this.settings.accessibility.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
        }
        if (this.settings.accessibility.highContrast) {
            document.documentElement.classList.add('high-contrast');
        }
    },

    updateSetting(category, key, value) {
        if (typeof category === 'string' && typeof key === 'string') {
            if (!this.settings[category]) this.settings[category] = {};
            this.settings[category][key] = value;
        } else {
            this.settings[category] = key;
        }
        this.saveSettings();
        this.applySettings();
    },

    generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    },

    exportSave() {
        return JSON.stringify({
            gameState: this.loadGameState(),
            settings: this.settings,
            exportDate: new Date().toISOString()
        }, null, 2);
    },

    importSave(saveData) {
        try {
            const data = JSON.parse(saveData);
            if (data.settings) {
                this.settings = { ...this.defaultSettings, ...data.settings };
                this.saveSettings();
                this.applySettings();
            }
            if (data.gameState) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.gameState));
            }
            return true;
        } catch (error) {
            return false;
        }
    }
};
