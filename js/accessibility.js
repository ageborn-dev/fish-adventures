import { assetLoader } from './assets.js';

export const accessibility = {
    announcements: [],
    lastScore: 0,
    lastLives: 3,
    gameStateAnnounced: false,

    init() {
        this.setupAriaUpdates();
        this.setupKeyboardNavigation();
    },

    setupAriaUpdates() {
        const updateLoadingAria = (progress) => {
            const progressBar = document.querySelector('.loading-bar');
            const progressValue = Math.round(progress * 100);
            if (progressBar) {
                progressBar.setAttribute('aria-valuenow', progressValue);
                progressBar.setAttribute('aria-valuetext', `Loading ${progressValue} percent complete`);
            }
        };
        if (assetLoader) {
            assetLoader.onProgress(updateLoadingAria);
        }
    },

    setupKeyboardNavigation() {
        const virtualJoystick = document.getElementById('virtual-joystick');
        if (virtualJoystick) {
            virtualJoystick.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                }
            });
        }
    },

    announceGameStart(isGameStarted) {
        if (!this.gameStateAnnounced && isGameStarted) {
            this.announce('Game started. Use arrow keys to control your fish and avoid obstacles.');
            this.gameStateAnnounced = true;
        }
    },

    announceScoreChange(score) {
        if (score !== this.lastScore) {
            if (score > this.lastScore) {
                if (score % 10 === 0 || score - this.lastScore > 1) {
                    this.announce(`Score: ${score}`);
                }
            }
            this.lastScore = score;
        }
    },

    announceLivesChange(lives) {
        if (lives !== this.lastLives) {
            if (lives < this.lastLives) {
                this.announce(`Lives remaining: ${lives}`);
            } else {
                this.announce(`Extra life! Lives: ${lives}`);
            }
            this.lastLives = lives;
        }
    },

    announceStageChange(stageName) {
        this.announce(`Entered new stage: ${stageName}`);
    },

    announcePowerUp() {
        this.announce('Power-up activated! You are temporarily invincible.');
    },

    announceGameOver(score) {
        this.announce(`Game Over! Final score: ${score}. Press R to restart.`);
        this.gameStateAnnounced = false;
    },

    announcePause(paused) {
        this.announce(paused ? 'Game paused' : 'Game resumed');
    },

    announce(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};
