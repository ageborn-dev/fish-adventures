import { gameState } from './gameState.js';

export const audioSystem = {
    backgroundMusic: {
        stage1: new Audio("/assets/music/calm-waters.mp3"),
        stage2: new Audio("/assets/music/reef-waters.mp3"),
        stage3: new Audio("/assets/music/deep-sea.mp3"),
        stage4: new Audio("/assets/music/storm-waters.mp3"),
        stage5: new Audio("/assets/music/abyss.mp3"),
    },
    soundEffects: {
        hit: new Audio("/assets/sounds/hit.mp3"),
        powerUp: new Audio("/assets/sounds/power-up.mp3"),
        lifePickup: new Audio("/assets/sounds/life-pickup.mp3"),
        stageUp: new Audio("/assets/sounds/stage-up.mp3"),
        gameOver: new Audio("/assets/sounds/game-over.mp3"),
        bubble: new Audio("/assets/sounds/bubble.mp3"),
        scorePoint: new Audio("/assets/sounds/score-point.mp3"),
        thunder: new Audio("/assets/sounds/thunder.mp3"),
        inkSpray: new Audio("/assets/sounds/ink-spray.mp3"),
        electricShock: new Audio("/assets/sounds/electric-shock.mp3"),
        monsterRoar: new Audio("/assets/sounds/monster-roar.mp3"),
    },
    audioPool: new Map(),
    maxPoolSize: 5,
    currentMusic: null,

    initSounds() {
        Object.values(this.backgroundMusic).forEach((music) => {
            music.loop = true;
            music.volume = 0.5;
            music._originalVolume = music.volume;
            music.addEventListener("error", () => { });
        });

        const volumeLevels = {
            hit: 0.4, powerUp: 0.6, lifePickup: 0.6, stageUp: 0.7,
            gameOver: 0.7, bubble: 0.2, scorePoint: 0.3, thunder: 0.5,
            inkSpray: 0.4, electricShock: 0.5, monsterRoar: 0.6,
        };

        Object.entries(this.soundEffects).forEach(([name, sound]) => {
            sound.volume = volumeLevels[name] || 0.5;
            sound._originalVolume = sound.volume;
            sound.addEventListener("error", () => { });
        });
    },

    playBackgroundMusic(stage) {
        if (gameState && !gameState.settings.musicEnabled) return;
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        const musicTrack = this.backgroundMusic[`stage${Math.min(stage, 5)}`];
        if (musicTrack) {
            musicTrack.play().catch(() => { });
            this.currentMusic = musicTrack;
        }
    },

    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    },

    playSound(soundName) {
        if (gameState && !gameState.settings.soundEnabled) return;
        const sound = this.soundEffects[soundName];
        if (!sound) return;

        if (!this.audioPool.has(soundName)) {
            this.audioPool.set(soundName, []);
        }

        const pool = this.audioPool.get(soundName);
        let audioElement = pool.find(a => a.paused || a.ended);

        if (!audioElement && pool.length < this.maxPoolSize) {
            audioElement = sound.cloneNode();
            audioElement.volume = sound.volume;
            pool.push(audioElement);
        } else if (!audioElement) {
            audioElement = pool[0];
        }

        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(() => { });
        }
    },

    setEnabled(type, enabled) {
        if (type === 'music' && !enabled && this.currentMusic) {
            this.stopBackgroundMusic();
        }
    },
};
