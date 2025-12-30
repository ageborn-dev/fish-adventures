import { difficultyMultipliers, BASE_OBSTACLE_SPEED, BASE_OBSTACLE_INTERVAL } from './config.js';
import { audioSystem } from './audio.js';
import { gameState } from './gameState.js';

export function initializeSettingsListeners() {
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.querySelector('.volume-value');

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            volumeValue.textContent = value + '%';
            if (gameState) {
                gameState.settings.volume = value / 100;
                applyVolumeSettings();
            }
        });
    }

    const toggles = ['sound-toggle', 'music-toggle', 'particle-toggle', 'announcements-toggle', 'reduced-motion-toggle'];
    toggles.forEach(toggleId => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('change', () => {
                setTimeout(saveSettingsFromUI, 100);
            });
        }
    });

    const radios = document.querySelectorAll('input[name="graphics"], input[name="difficulty"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            setTimeout(saveSettingsFromUI, 100);
        });
    });
}

export function applyVolumeSettings() {
    if (!gameState) return;
    const volume = gameState.settings.volume || 0.7;

    if (audioSystem.currentMusic) {
        audioSystem.currentMusic.volume = volume * 0.5;
    }

    Object.values(audioSystem.backgroundMusic).forEach(music => {
        music.volume = volume * 0.5;
    });

    Object.values(audioSystem.soundEffects).forEach(sound => {
        const originalVolume = (typeof sound._originalVolume === 'number') ? sound._originalVolume : sound.volume;
        sound.volume = originalVolume * volume;
    });
}

export function showSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'flex';
    loadSettingsIntoUI();
    document.addEventListener('keydown', handleSettingsEscape);
}

export function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'none';
    document.removeEventListener('keydown', handleSettingsEscape);
    saveSettingsFromUI();
}

function handleSettingsEscape(e) {
    if (e.key === 'Escape') closeSettings();
}

export function loadSettingsIntoUI() {
    if (!gameState) return;
    const settings = gameState.settings;
    document.getElementById('sound-toggle').checked = settings.soundEnabled;
    document.getElementById('music-toggle').checked = settings.musicEnabled;
    const graphicsRadio = document.querySelector(`input[name="graphics"][value="${settings.graphics}"]`);
    if (graphicsRadio) graphicsRadio.checked = true;
    document.getElementById('particle-toggle').checked = settings.particleEffects;
    const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${settings.difficulty}"]`);
    if (difficultyRadio) difficultyRadio.checked = true;
    document.getElementById('announcements-toggle').checked = settings.accessibility?.announcements !== false;
    document.getElementById('reduced-motion-toggle').checked = settings.accessibility?.reducedMotion === true;
    document.getElementById('auto-save-toggle').checked = settings.autoSave !== false;
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValueEl = document.querySelector('.volume-value');
    const volume = Math.round((settings.volume || 0.7) * 100);
    volumeSlider.value = volume;
    volumeValueEl.textContent = volume + '%';
}

export function saveSettingsFromUI() {
    if (!gameState) return;
    gameState.settings.soundEnabled = document.getElementById('sound-toggle').checked;
    gameState.settings.musicEnabled = document.getElementById('music-toggle').checked;
    const selectedGraphics = document.querySelector('input[name="graphics"]:checked');
    if (selectedGraphics) gameState.settings.graphics = selectedGraphics.value;
    gameState.settings.particleEffects = document.getElementById('particle-toggle').checked;
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    if (selectedDifficulty) gameState.settings.difficulty = selectedDifficulty.value;
    if (!gameState.settings.accessibility) gameState.settings.accessibility = {};
    gameState.settings.accessibility.announcements = document.getElementById('announcements-toggle').checked;
    gameState.settings.accessibility.reducedMotion = document.getElementById('reduced-motion-toggle').checked;
    gameState.settings.autoSave = document.getElementById('auto-save-toggle').checked;
    const volumeValue = document.getElementById('volume-slider').value;
    gameState.settings.volume = volumeValue / 100;
    gameState.saveSettings();
    gameState.applySettings();
    applyVolumeSettings();
}

export function resetSettings() {
    if (!gameState) return;
    gameState.settings = { ...gameState.defaultSettings };
    loadSettingsIntoUI();
    gameState.saveSettings();
    gameState.applySettings();
    applyVolumeSettings();
}

export function updateModernUI(gameData, stageSystem) {
    const currentScoreDisplay = document.getElementById('current-score');
    const highScoreDisplay = document.getElementById('high-score-display');
    const currentStageDisplay = document.getElementById('current-stage-display');
    const livesContainer = document.getElementById('lives-container');
    const mobileLivesContainer = document.getElementById('mobile-lives-container');
    const difficultyDisplay = document.getElementById('difficulty-display');
    const stageProgressBar = document.getElementById('stage-progress');

    if (currentScoreDisplay) currentScoreDisplay.textContent = gameData.score.toLocaleString();
    if (highScoreDisplay) highScoreDisplay.textContent = gameData.highScore.toLocaleString();
    if (currentStageDisplay) currentStageDisplay.textContent = gameData.currentStage;

    if (livesContainer) {
        const hearts = livesContainer.querySelectorAll('.life-heart');
        hearts.forEach((heart, index) => {
            heart.classList.toggle('filled', index < gameData.lives);
            heart.classList.toggle('empty', index >= gameData.lives);
        });
    }

    if (mobileLivesContainer) {
        const mobileHearts = mobileLivesContainer.querySelectorAll('.mobile-heart');
        mobileHearts.forEach((heart, index) => {
            if (index < gameData.lives) {
                heart.textContent = '❤️';
                heart.style.opacity = '1';
            } else {
                heart.textContent = '🖤';
                heart.style.opacity = '0.3';
            }
        });
    }

    if (difficultyDisplay) {
        const difficultyNames = { 'easy': 'Easy', 'normal': 'Normal', 'hard': 'Hard' };
        difficultyDisplay.textContent = difficultyNames[gameData.currentDifficulty] || 'Normal';
    }

    if (stageProgressBar) {
        const nextStagePoints = stageSystem.calculatePointsForStage(gameData.currentStage + 1);
        const currentStagePoints = stageSystem.calculatePointsForStage(gameData.currentStage);
        const progress = ((gameData.score - currentStagePoints) / (nextStagePoints - currentStagePoints)) * 100;
        stageProgressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }
}

export function setDifficulty(difficulty, gameData) {
    gameData.currentDifficulty = difficulty;
    const settings = difficultyMultipliers[difficulty];
    if (settings) {
        gameData.obstacleSpeed = BASE_OBSTACLE_SPEED * settings.speed;
        gameData.obstacleInterval = BASE_OBSTACLE_INTERVAL / settings.interval;
        if (!gameData.isGameStarted) {
            gameData.lives = settings.lives;
        }
    }
}

window.showSettings = showSettings;
window.closeSettings = closeSettings;
window.resetSettings = resetSettings;
