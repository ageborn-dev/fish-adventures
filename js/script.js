// DOM elements
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

// Modern UI Elements
const currentScoreDisplay = document.getElementById("current-score");
const highScoreDisplay = document.getElementById("high-score-display");
const currentStageDisplay = document.getElementById("current-stage-display");
const livesContainer = document.getElementById("lives-container");
const mobileLivesContainer = document.getElementById("mobile-lives-container");
const powerupDisplay = document.getElementById("powerup-display");
const stageProgressBar = document.getElementById("stage-progress");
const difficultyDisplay = document.getElementById("difficulty-display");

const preloadedImages = new Map();

// Asset loading management
const assetLoader = {
  totalAssets: 0,
  loadedAssets: 0,
  failedAssets: 0,
  loadingCallbacks: [],

  // Asset lists
  requiredImages: [
    '/assets/images/icons/fish.gif',
    '/assets/images/icons/rock.png',
    '/assets/images/icons/trash.png'
  ],

  optionalImages: [
    '/assets/images/icons/jellyfish.gif',
    '/assets/images/icons/small-fish.gif',
    '/assets/images/icons/barracuda.gif',
    '/assets/images/icons/stingray.gif',
    '/assets/images/icons/shark.gif',
    '/assets/images/icons/octopus.gif',
    '/assets/images/icons/sea-monster.gif',
    '/assets/images/icons/giant-squid.gif',
    '/assets/images/icons/electric-eel.gif',
    '/assets/images/icons/submarine.gif',
    '/assets/images/icons/crab.gif'
  ],

  backgrounds: [
    '/assets/images/backgrounds/calm-waters.png',
    '/assets/images/backgrounds/reef-waters.png',
    '/assets/images/backgrounds/deep-sea.png',
    '/assets/images/backgrounds/storm-waters.png',
    '/assets/images/backgrounds/deep-abyss.png'
  ],

  sounds: {
    music: [
      '/assets/music/calm-waters.mp3',
      '/assets/music/reef-waters.mp3',
      '/assets/music/deep-sea.mp3',
      '/assets/music/storm-waters.mp3',
      '/assets/music/abyss.mp3'
    ],
    effects: [
      '/assets/sounds/hit.mp3',
      '/assets/sounds/power-up.mp3',
      '/assets/sounds/life-pickup.mp3',
      '/assets/sounds/stage-up.mp3',
      '/assets/sounds/game-over.mp3',
      '/assets/sounds/bubble.mp3',
      '/assets/sounds/score-point.mp3',
      '/assets/sounds/thunder.mp3',
      '/assets/sounds/ink-spray.mp3',
      '/assets/sounds/electric-shock.mp3',
      '/assets/sounds/monster-roar.mp3'
    ]
  },

  init() {
    this.totalAssets = this.requiredImages.length + this.optionalImages.length +
      this.backgrounds.length + this.sounds.music.length + this.sounds.effects.length;
    this.loadedAssets = 0;
    this.failedAssets = 0;

    this.loadAssets();
  },

  loadAssets() {
    this.requiredImages.forEach(src => this.loadImage(src, true));
    this.optionalImages.forEach(src => this.loadImage(src, false));
    this.backgrounds.forEach(src => this.loadImage(src, false));
    this.sounds.music.forEach(() => this.markAssetComplete(false));
    this.sounds.effects.forEach(() => this.markAssetComplete(false));
  },

  loadImage(src, required = false) {
    const img = new Image();

    img.onload = () => {
      preloadedImages.set(src.split('/').pop(), true);
      this.markAssetComplete(required);
    };

    img.onerror = () => {
      preloadedImages.set(src.split('/').pop(), false);
      this.markAssetComplete(required, true);
      console.warn(`Failed to load ${required ? 'required' : 'optional'} image: ${src}`);
    };

    img.src = src;
  },

  markAssetComplete(required, failed = false) {
    if (failed) {
      this.failedAssets++;
      if (required) {
        console.error('Required asset failed to load! Game may not function properly.');
      }
    }

    this.loadedAssets++;
    const progress = this.loadedAssets / this.totalAssets;
    this.updateLoadingProgress(progress);
    if (this.loadedAssets >= this.totalAssets) {
      this.onLoadingComplete();
    }
  },

  updateLoadingProgress(progress) {
    const progressBar = document.getElementById('loading-progress');
    const progressText = document.getElementById('loading-text');

    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    if (progressText) {
      progressText.textContent = `Loading... ${Math.round(progress * 100)}%`;
    }
    this.loadingCallbacks.forEach(callback => callback(progress));
  },

  onLoadingComplete() {
    console.log(`Asset loading complete. Loaded: ${this.loadedAssets - this.failedAssets}, Failed: ${this.failedAssets}`);
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
      startScreen.style.display = 'flex';
    }
  },

  onProgress(callback) {
    this.loadingCallbacks.push(callback);
  },

  getLoadedCount() {
    return this.loadedAssets - this.failedAssets;
  },

  getFailedCount() {
    return this.failedAssets;
  }
};

const audioSystem = {
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
      music.addEventListener("error", () =>
        console.log("Audio file not found")
      );
    });
    const volumeLevels = {
      hit: 0.4,
      powerUp: 0.6,
      lifePickup: 0.6,
      stageUp: 0.7,
      gameOver: 0.7,
      bubble: 0.2,
      scorePoint: 0.3,
      thunder: 0.5,
      inkSpray: 0.4,
      electricShock: 0.5,
      monsterRoar: 0.6,
    };

    Object.entries(this.soundEffects).forEach(([name, sound]) => {
      sound.volume = volumeLevels[name] || 0.5;
      sound._originalVolume = sound.volume;
      sound.addEventListener("error", () =>
        console.log(`Sound effect ${name} not found`)
      );
    });
  },

  playBackgroundMusic(stage) {
    if (typeof gameState !== 'undefined' && !gameState.settings.musicEnabled) {
      return;
    }

    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    const musicTrack = this.backgroundMusic[`stage${Math.min(stage, 5)}`];
    if (musicTrack) {
      musicTrack
        .play()
        .catch((error) => console.log("Audio play failed:", error));
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
    if (typeof gameState !== 'undefined' && !gameState.settings.soundEnabled) {
      return;
    }

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
    if (type === 'music') {
      if (!enabled && this.currentMusic) {
        this.stopBackgroundMusic();
      }
    }
  },
};

let fishBottom = 300;
let fishLeft = 50;
let score = 0;
let highScore = Number(localStorage.getItem("highScore") || 0);
let lives = 3;
let obstacleSpeed = 3;
let obstacleInterval = 2000;
let gameOver = false;
let isGameStarted = false;
let isPaused = false;
let isPoweredUp = false;
let isInvulnerable = false;
let currentStage = 1;
let currentDifficulty = "normal";
let obstacleCreationInterval;
let bubbleCreationInterval;
let powerUpInterval;
let lifeSpawnTimer;
let activeObstacles = new Set();
let stormIntervals = [];
let activeCrabs = new Set();
let activePearls = new Set();
let gameAnimationId = null;
let lastFrameTime = 0;
let lastObstacleSpawn = 0;
let lastBubbleSpawn = 0;
let lastPowerUpSpawn = 0;
let lastCrabSpawn = 0;
let deltaTime = 0;
let smoothDeltaTime = 16.67;
let isMobileDevice = false;
let touchControls = {
  joystick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0, radius: 60 },
  movement: { x: 0, y: 0 }
};

const gameState = {
  storageKey: 'fishAdventure_gameState',
  settingsKey: 'fishAdventure_settings',

  defaultSettings: {
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
  },
  settings: {},

  init() {
    this.loadSettings();
    this.applySettings();
  },

  saveGameState() {
    if (!isGameStarted || gameOver) return;

    const state = {
      score: score,
      highScore: highScore,
      lives: lives,
      currentStage: currentStage,
      fishPosition: {
        left: fishLeft,
        bottom: fishBottom
      },
      difficulty: currentDifficulty,
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
      console.log('Game state saved');
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
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
      console.warn('Failed to load game state:', error);
      return null;
    }
  },

  clearGameState() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Game state cleared');
    } catch (error) {
      console.warn('Failed to clear game state:', error);
    }
  },

  restoreGameState(state) {
    if (!state) return false;

    try {
      score = state.score || 0;
      highScore = Math.max(highScore, state.highScore || 0);
      lives = state.lives || 3;
      currentStage = state.currentStage || 1;
      fishLeft = state.fishPosition?.left || 50;
      fishBottom = state.fishPosition?.bottom || 300;
      currentDifficulty = state.difficulty || 'normal';
      fish.style.left = `${fishLeft}px`;
      fish.style.bottom = `${fishBottom}px`;
      setDifficulty(currentDifficulty);
      updateScore();
      const config = stageSystem.getStageConfig(currentStage);
      obstacleSpeed = BASE_OBSTACLE_SPEED * config.speedMultiplier;
      obstacleInterval = BASE_OBSTACLE_INTERVAL / config.spawnRateMultiplier;

      console.log('Game state restored');
      return true;
    } catch (error) {
      console.warn('Failed to restore game state:', error);
      return false;
    }
  },

  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
      console.log('Settings saved');
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
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
      console.warn('Failed to load settings:', error);
      this.settings = { ...this.defaultSettings };
    }
  },

  applySettings() {
    if (typeof audioSystem !== 'undefined') {
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
      if (!this.settings[category]) {
        this.settings[category] = {};
      }
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
    const exportData = {
      gameState: this.loadGameState(),
      settings: this.settings,
      highScore: highScore,
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  },

  importSave(saveData) {
    try {
      const data = JSON.parse(saveData);

      if (data.settings) {
        this.settings = { ...this.defaultSettings, ...data.settings };
        this.saveSettings();
        this.applySettings();
      }

      if (data.highScore) {
        highScore = Math.max(highScore, data.highScore);
        localStorage.setItem('highScore', highScore);
      }

      if (data.gameState) {
        localStorage.setItem(this.storageKey, JSON.stringify(data.gameState));
      }

      console.log('Save data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import save data:', error);
      return false;
    }
  }
};

const accessibility = {
  announcements: [],
  lastScore: 0,
  lastLives: 3,
  gameStateAnnounced: false,

  init() {
    this.setupAriaUpdates();
    this.setupKeyboardNavigation();
    this.announceGameStart();
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
    if (typeof assetLoader !== 'undefined') {
      assetLoader.onProgress(updateLoadingAria);
    }
  },

  setupKeyboardNavigation() {
    const virtualJoystick = document.getElementById('virtual-joystick');
    if (virtualJoystick) {
      virtualJoystick.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const rect = virtualJoystick.getBoundingClientRect();
          const fakeEvent = {
            touches: [{
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2
            }],
            preventDefault: () => { }
          };
        }
      });
    }
  },

  announceGameStart() {
    if (!this.gameStateAnnounced && isGameStarted) {
      this.announce('Game started. Use arrow keys to control your fish and avoid obstacles.');
      this.gameStateAnnounced = true;
    }
  },

  announceScoreChange() {
    if (score !== this.lastScore) {
      if (score > this.lastScore) {
        if (score % 10 === 0 || score - this.lastScore > 1) {
          this.announce(`Score: ${score}`);
        }
      }
      this.lastScore = score;
    }
  },

  announceLivesChange() {
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

  announceGameOver() {
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

const LIFE_SPAWN_MIN_INTERVAL = 20000;
const LIFE_SPAWN_MAX_INTERVAL = 40000;
const INVULNERABILITY_DURATION = 3000;
const BASE_OBSTACLE_SPEED = 3;
const BASE_OBSTACLE_INTERVAL = 2000;
const CRAB_SPEED = 2;
const PEARL_SPEED = -1.5;
const PEARL_INTERVAL = 2000;
const MAX_CRABS = 3;

const hapticPatterns = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30],
  collision: [50, 30, 50],
  powerUp: [15, 10, 15],
  stageUp: [20, 20, 40]
};

function triggerHaptic(type = 'light') {
  if ('vibrate' in navigator && isMobileDevice) {
    navigator.vibrate(hapticPatterns[type] || hapticPatterns.light);
  }
}

const MOVEMENT_PATTERNS = {
  SPEEDS: {
    MIN: 2,
    MAX: 5,
    VARIATION: 0.2,
  },
  VERTICAL: {
    AMPLITUDE: {
      MIN: 30,
      MAX: 150,
    },
    FREQUENCY: {
      MIN: 0.01,
      MAX: 0.03,
    },
  },
};

const ICON_SIZE = 50;
const HUD_HEART_SCALE = 0.8;
const PEARL_SPEED_PX = 120;
const PEARL_MIN_DELAY = 800;
const PEARL_MAX_DELAY = 2200;
const BUBBLE_MIN_SIZE = 6;
const BUBBLE_MAX_SIZE = 14;

const BACKGROUNDS = [
  "calm-waters.png",
  "reef-waters.png",
  "deep-sea.png",
  "storm-waters.png",
  "deep-abyss.png",
];

const OBSTACLE_SETS = {
  basic: ["rock.png", "trash.png"],
  easy: ["jellyfish.gif", "small-fish.gif"],
  medium: ["barracuda.gif", "stingray.gif"],
  hard: ["shark.gif", "octopus.gif"],
  extreme: ["sea-monster.gif", "giant-squid.gif"],
  special: ["electric-eel.gif", "submarine.gif"],
};


const stageSystem = {
  basePoints: 100,
  pointMultiplier: 1.5,
  maxStage: Infinity,

  calculatePointsForStage(stage) {
    return Math.floor(
      this.basePoints * Math.pow(this.pointMultiplier, stage - 1)
    );
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
    const depthNames = [
      "Surface Waters",
      "Shallow Reef",
      "Deep Waters",
      "Abyssal Zone",
      "Hadal Depths",
    ];

    const difficultyModifiers = [
      "Peaceful",
      "Challenging",
      "Dangerous",
      "Treacherous",
      "Nightmare",
    ];

    const depthIndex = (stage - 1) % depthNames.length;
    const difficultyIndex = Math.min(
      Math.floor((stage - 1) / depthNames.length),
      difficultyModifiers.length - 1
    );

    return `${difficultyModifiers[difficultyIndex]} ${depthNames[depthIndex]}`;
  },

  getStageEffects(stage) {
    return {
      darknessFactor: Math.min((stage - 1) * 0.1, 0.7),
      stormIntensity: stage % 3 === 0 ? stage / 3 : 0,
      specialLighting: stage % 5 === 0,
    };
  },

  getStageConfig(stage) {
    return {
      name: this.getStageName(stage),
      background: this.getBackgroundForStage(stage),
      obstacleTypes: this.getObstaclesForStage(stage),
      speedMultiplier: 1 + (stage - 1) * 0.2,
      spawnRateMultiplier: 1 + (stage - 1) * 0.2,
      effects: this.getStageEffects(stage),
      behaviors: {
        hasAggressive: stage >= 3,
        hasChasing: stage >= 4,
        hasBoss: stage % 5 === 0,
      },
    };
  },
};

const obstacleBehaviors = {
  "shark.gif": {
    speed: 1.5,
    aggressive: true,
    chaseRange: 200,
    damage: 2,
    soundEffect: "hit",
    chase: (obstacle, fishPos) => {
      const obstacleRect = obstacle.getBoundingClientRect();
      const dx = fishPos.x - obstacleRect.x;
      const dy = fishPos.y - obstacleRect.y;
      const angle = Math.atan2(dy, dx);
      const speed = obstacleBehaviors["shark.gif"].speed;
      return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };
    },
  },
  "octopus.gif": {
    speed: 0.8,
    inkCooldown: 3000,
    inkDuration: 2000,
    damage: 1,
    soundEffect: "inkSpray",
    shootInk: (obstacle) => {
      const ink = document.createElement("div");
      ink.className = "ink-cloud";
      ink.style.left = obstacle.style.left;
      ink.style.top = obstacle.style.top;
      gameContainer.appendChild(ink);
      audioSystem.playSound("inkSpray");
      setTimeout(() => ink.remove(), 2000);
    },
  },
  "electric-eel.gif": {
    speed: 1.2,
    shockRange: 100,
    shockCooldown: 2000,
    damage: 1.5,
    soundEffect: "electricShock",
    createShockwave: (obstacle) => {
      const shock = document.createElement("div");
      shock.className = "electric-field";
      shock.style.left = obstacle.style.left;
      shock.style.top = obstacle.style.top;
      gameContainer.appendChild(shock);
      audioSystem.playSound("electricShock");
      setTimeout(() => shock.remove(), 1000);
    },
  },
  "sea-monster.gif": {
    speed: 0.7,
    attackRange: 300,
    attackCooldown: 5000,
    damage: 3,
    soundEffect: "monsterRoar",
    specialAttack: (obstacle) => {
      audioSystem.playSound("monsterRoar");
      obstacle.classList.add("attacking");
      setTimeout(() => obstacle.classList.remove("attacking"), 1000);
    },
  },
};

const defaultBehavior = {
  speed: 1,
  damage: 1,
  soundEffect: "hit",
};

function initGame() {

  fishBottom = 300;
  fishLeft = 50;
  score = 0;
  lives = 3;
  currentStage = 1;
  obstacleSpeed = BASE_OBSTACLE_SPEED;
  obstacleInterval = BASE_OBSTACLE_INTERVAL;
  gameOver = false;
  isPaused = false;
  isPoweredUp = false;

  const config = stageSystem.getStageConfig(1);
  startScreen.style.display = "flex";
  pauseScreen.style.display = "none";
  gameOverDisplay.style.display = "none";

  fish.style.bottom = `${fishBottom}px`;
  fish.style.left = `${fishLeft}px`;
  fish.style.transform = "rotate(0deg)";

  if (config.background.startsWith('linear-gradient')) {
    gameContainer.style.background = config.background;
    gameContainer.style.backgroundImage = 'none';
  } else {
    gameContainer.style.backgroundImage = `url('${config.background}')`;
  }
  updateScore();
}

function createObstacle() {
  if (gameOver || isPaused) return;

  const config = stageSystem.getStageConfig(currentStage);
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

  const randomType =
    availableObstacles[Math.floor(Math.random() * availableObstacles.length)];

  const img = new Image();
  img.src = `/assets/images/icons/${randomType}`;
  img.alt = "Obstacle";

  img.onload = () => {
    obstacle.innerHTML = '';
    obstacle.appendChild(img);
    obstacle.dataset.type = randomType;
    obstacle.style.display = 'block';

    const maxTop = window.innerHeight - 80;
    const randomTop = Math.random() * maxTop;
    obstacle.style.left = `${window.innerWidth + 100}px`;
    obstacle.style.top = `${randomTop}px`;
    const behavior = obstacleBehaviors[randomType] || defaultBehavior;
    const config = stageSystem.getStageConfig(currentStage);

    const movementPattern = {
      type: Math.random() < 0.5 ? "sine" : "zigzag",
      speed: getRandomRange(
        MOVEMENT_PATTERNS.SPEEDS.MIN,
        MOVEMENT_PATTERNS.SPEEDS.MAX
      ),
      amplitude: getRandomRange(
        MOVEMENT_PATTERNS.VERTICAL.AMPLITUDE.MIN,
        MOVEMENT_PATTERNS.VERTICAL.AMPLITUDE.MAX
      ),
      frequency: getRandomRange(
        MOVEMENT_PATTERNS.VERTICAL.FREQUENCY.MIN,
        MOVEMENT_PATTERNS.VERTICAL.FREQUENCY.MAX
      ),
      direction: 1,
    };

    entities.obstacles.set(obstacle, {
      x: window.innerWidth,
      y: randomTop,
      startY: randomTop,
      speed: obstacleSpeed * behavior.speed,
      behavior: behavior,
      time: 0,
      pattern: movementPattern,
      width: 80,
      height: 80
    });
    if (OBSTACLE_SETS.basic.includes(randomType)) {
      const rotationSpeed = Math.random() * 2 + 1;
      const rotationDirection = Math.random() < 0.5 ? 1 : -1;
      obstacle.style.animation = `rotate ${rotationSpeed}s linear infinite ${rotationDirection === -1 ? "reverse" : ""
        }`;
    }

    gameContainer.appendChild(obstacle);
  };

  img.onerror = () => {
    img.src = `/assets/images/icons/${OBSTACLE_SETS.basic[0]}`;
    obstacle.dataset.type = OBSTACLE_SETS.basic[0];
  };
}

function getRandomRange(min, max) {
  return min + Math.random() * (max - min);
}

function checkCollision(element) {
  const fishRect = fish.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return !(
    fishRect.right < elementRect.left ||
    fishRect.left > elementRect.right ||
    fishRect.bottom < elementRect.top ||
    fishRect.top > elementRect.bottom
  );
}

function createCrab() {
  if (gameOver || isPaused || entities.crabs.size >= MAX_CRABS) return;

  const crab = getPooledElement('crabs');
  const startFromLeft = Math.random() > 0.5;
  const direction = startFromLeft ? 1 : -1;
  const gameRect = gameContainer.getBoundingClientRect();
  const startX = startFromLeft ? 0 : gameRect.width - 100;

  crab.style.display = 'block';
  crab.style.left = `${startX}px`;
  crab.style.top = `${gameRect.height - 73}px`;
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
    lastPearlTime: 0,
    width: 100,
    height: 100
  });

  gameContainer.appendChild(crab);
  activeCrabs.add(crab);
}

function createPearl(crab, crabData) {
  const pearl = getPooledElement('pearls');
  pearl.style.display = 'block';
  pearl.style.position = 'absolute';
  pearl.innerHTML = '';
  const pearlSize = 12;
  pearl.style.width = `${pearlSize}px`;
  pearl.style.height = `${pearlSize}px`;
  pearl.style.borderRadius = '50%';
  pearl.style.background = 'rgba(255,255,255,0.95)';
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
  activePearls.add(pearl);
}

function createBubble() {
  if (gameOver || isPaused) return;
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
  bubble.style.display = 'block';
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

function createPowerUp() {
  if (gameOver || isPaused) return;

  const powerUp = getPooledElement('powerUps');
  powerUp.innerHTML = "⭐";
  powerUp.style.display = 'block';
  powerUp.style.position = 'absolute';

  const maxTop = window.innerHeight - 50;
  const randomTop = Math.random() * maxTop;
  powerUp.style.left = `${window.innerWidth + 100}px`;
  powerUp.style.top = `${randomTop}px`;

  entities.powerUps.set(powerUp, {
    x: window.innerWidth,
    y: randomTop,
    speed: obstacleSpeed,
    width: 50,
    height: 50
  });

  gameContainer.appendChild(powerUp);
}

function activatePowerUp() {
  isPoweredUp = true;
  audioSystem.playSound("powerUp");
  triggerHaptic('powerUp');

  fish.classList.add("powered-up");
  if (typeof accessibility !== 'undefined') {
    accessibility.announcePowerUp();
  }

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
    isPoweredUp = false;
    fish.classList.remove("powered-up");
    clearInterval(updateTimer);
    powerState.remove();
    fish.style.animation = "";
  }, 5000);
}

function createLifePowerup() {
  if (gameOver || isPaused) return;
  const lifePowerup = getPooledElement('lifePowerUps');
  lifePowerup.innerHTML = "❤️";
  lifePowerup.style.display = 'block';
  lifePowerup.style.position = 'absolute';

  const maxTop = window.innerHeight - 50;
  const randomTop = Math.random() * maxTop;
  lifePowerup.style.left = `${window.innerWidth + 100}px`;
  lifePowerup.style.top = `${randomTop}px`;
  entities.powerUps.set(lifePowerup, {
    x: window.innerWidth,
    y: randomTop,
    speed: obstacleSpeed,
    width: 50,
    height: 50,
    isLife: true
  });

  gameContainer.appendChild(lifePowerup);
}

function scheduleNextLifeSpawn() {
  if (lifeSpawnTimer) clearTimeout(lifeSpawnTimer);

  const spawnDelay =
    Math.random() * (LIFE_SPAWN_MAX_INTERVAL - LIFE_SPAWN_MIN_INTERVAL) +
    LIFE_SPAWN_MIN_INTERVAL;

  lifeSpawnTimer = setTimeout(() => {
    if (!gameOver && !isPaused) {
      createLifePowerup();
    }
    scheduleNextLifeSpawn();
  }, spawnDelay);
}

function initCrabs() {
  activeCrabs.forEach((crab) => crab.remove());
  activeCrabs.clear();
  activePearls.forEach((pearl) => pearl.remove());
  activePearls.clear();
  entities.crabs.clear();
  entities.pearls.clear();
  for (let i = 0; i < Math.min(2, MAX_CRABS); i++) {
    setTimeout(() => createCrab(), Math.random() * 2000);
  }
}

function handleCollision(damage = 1) {
  if (isInvulnerable || isPoweredUp) return;

  lives -= damage;
  updateScore();
  audioSystem.playSound("hit");
  triggerHaptic('collision');

  if (lives <= 0) {
    endGame();
    return;
  }

  isInvulnerable = true;
  fish.classList.add("invulnerable");

  const blinkInterval = setInterval(() => {
    fish.style.opacity = fish.style.opacity === "1" ? "0.3" : "1";
  }, 200);

  setTimeout(() => {
    isInvulnerable = false;
    fish.classList.remove("invulnerable");
    clearInterval(blinkInterval);
    fish.style.opacity = "1";
  }, INVULNERABILITY_DURATION);
}

function updateScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  const nextStagePoints = stageSystem.calculatePointsForStage(currentStage + 1);
  const pointsToNext =
    currentStage < stageSystem.maxStage ? nextStagePoints - score : "Max Stage";

  const config = stageSystem.getStageConfig(currentStage);
  updateModernUI();

  scoreDisplay.innerHTML = `
          Score: ${score}<br>
          High Score: ${highScore}<br>
          Stage: ${currentStage} - ${config.name}<br>
          Next Stage: ${pointsToNext} points
      `;

  livesDisplay.innerHTML = "❤️".repeat(Math.max(0, lives));
  if (typeof accessibility !== 'undefined') {
    accessibility.announceScoreChange();
    accessibility.announceLivesChange();
  }
}

function updateModernUI() {
  if (currentScoreDisplay) {
    currentScoreDisplay.textContent = score.toLocaleString();
  }
  if (highScoreDisplay) {
    highScoreDisplay.textContent = highScore.toLocaleString();
  }
  if (currentStageDisplay) {
    currentStageDisplay.textContent = currentStage;
  }

  if (livesContainer) {
    const hearts = livesContainer.querySelectorAll('.life-heart');
    hearts.forEach((heart, index) => {
      if (index < lives) {
        heart.classList.add('filled');
        heart.classList.remove('empty');
      } else {
        heart.classList.remove('filled');
        heart.classList.add('empty');
      }
    });
  }

  if (mobileLivesContainer) {
    const mobileHearts = mobileLivesContainer.querySelectorAll('.mobile-heart');
    mobileHearts.forEach((heart, index) => {
      if (index < lives) {
        heart.classList.remove('empty');
        heart.style.opacity = '1';
      } else {
        heart.classList.add('empty');
        heart.style.opacity = '0.3';
      }
    });
  }

  if (difficultyDisplay) {
    const difficultyNames = {
      'easy': 'Easy',
      'normal': 'Normal',
      'hard': 'Hard'
    };
    difficultyDisplay.textContent = difficultyNames[currentDifficulty] || 'Normal';
  }

  if (stageProgressBar) {
    const nextStagePoints = stageSystem.calculatePointsForStage(currentStage + 1);
    const currentStagePoints = stageSystem.calculatePointsForStage(currentStage);
    const progressInStage = score - currentStagePoints;
    const stageLength = nextStagePoints - currentStagePoints;
    const progressPercent = Math.min((progressInStage / stageLength) * 100, 100);
    stageProgressBar.style.width = `${progressPercent}%`;
  }
}

function addPowerUpToUI(powerUpType) {
  if (!powerupDisplay) return;

  const slots = powerupDisplay.querySelectorAll('.powerup-slot');
  const emptySlot = Array.from(slots).find(slot => slot.classList.contains('empty'));

  if (emptySlot) {
    emptySlot.classList.remove('empty');
    emptySlot.classList.add('active');

    const icons = {
      'speed': '⚡',
      'shield': '🛡️',
      'life': '❤️',
      'score': '⭐'
    };

    emptySlot.textContent = icons[powerUpType] || '✨';
    emptySlot.setAttribute('data-powerup', powerUpType);
  }
}

function removePowerUpFromUI(powerUpType) {
  if (!powerupDisplay) return;

  const activeSlot = powerupDisplay.querySelector(`[data-powerup="${powerUpType}"]`);
  if (activeSlot) {
    activeSlot.classList.remove('active');
    activeSlot.classList.add('empty');
    activeSlot.textContent = '';
    activeSlot.removeAttribute('data-powerup');
  }
}

function incrementScore() {
  score++;
  audioSystem.playSound("scorePoint");
  updateScore();
  updateStage();
  if (score % 10 === 0 && typeof gameState !== 'undefined') {
    gameState.saveGameState();
  }

  if (score % 5 === 0) {
    const config = stageSystem.getStageConfig(currentStage);
    const maxSpeed = BASE_OBSTACLE_SPEED * config.speedMultiplier * 1.5;
    const minInterval =
      (BASE_OBSTACLE_INTERVAL / config.spawnRateMultiplier) * 0.7;

    obstacleSpeed = Math.min(obstacleSpeed + 0.5, maxSpeed);
    obstacleInterval = Math.max(obstacleInterval - 100, minInterval);
  }
}

function updateStage() {
  const nextStagePoints = stageSystem.calculatePointsForStage(currentStage + 1);
  if (score >= nextStagePoints && currentStage < stageSystem.maxStage) {
    currentStage++;
    const config = stageSystem.getStageConfig(currentStage);

    audioSystem.playSound("stageUp");
    triggerHaptic('stageUp');
    audioSystem.playBackgroundMusic(currentStage);

    obstacleSpeed = BASE_OBSTACLE_SPEED * config.speedMultiplier;
    obstacleInterval = BASE_OBSTACLE_INTERVAL / config.spawnRateMultiplier;

    applyStageEffects(config.effects);
    updateBackground(config.background);
    showStageTransition(config.name);
    if (typeof accessibility !== 'undefined') {
      accessibility.announceStageChange(config.name);
    }

    restartObstacleCreation();
    clearExistingEffects();
  }
}

function togglePause() {
  if (!isGameStarted || gameOver) return;

  isPaused = !isPaused;
  pauseScreen.style.display = isPaused ? "flex" : "none";
  if (typeof accessibility !== 'undefined') {
    accessibility.announcePause(isPaused);
  }

  if (isPaused) {
    audioSystem.stopBackgroundMusic();
    stopGameLoop();
    stopPoolCleanup();
    clearAllIntervals();
  } else {
    if (isGameStarted && !gameOver) {
      audioSystem.playBackgroundMusic(currentStage);
      scheduleNextLifeSpawn();
      startGameLoop();
      startPoolCleanup();
    }
  }
}

function clearAllIntervals() {
  clearInterval(obstacleCreationInterval);
  clearInterval(bubbleCreationInterval);
  clearInterval(powerUpInterval);
  clearTimeout(lifeSpawnTimer);
  stormIntervals.forEach((interval) => clearInterval(interval));
  stormIntervals = [];
  activeObstacles.forEach(interval => clearInterval(interval));
  activeObstacles.clear();
  obstacleCreationInterval = null;
  bubbleCreationInterval = null;
  powerUpInterval = null;
  lifeSpawnTimer = null;
}

function startGame(resumeState = null) {
  isGameStarted = true;

  if (resumeState || (!resumeState && typeof gameState !== 'undefined')) {
    const savedState = resumeState || gameState.loadGameState();
    if (savedState && gameState.restoreGameState(savedState)) {

      console.log('Resuming from saved state');
    } else {
      initFreshGame();
    }
  } else {
    initFreshGame();
  }

  const config = stageSystem.getStageConfig(currentStage);
  startScreen.style.display = "none";

  if (config.background.startsWith('linear-gradient')) {
    gameContainer.style.background = config.background;
    gameContainer.style.backgroundImage = 'none';
  } else {
    gameContainer.style.backgroundImage = `url('${config.background}')`;
  }

  audioSystem.playBackgroundMusic(currentStage);

  lastObstacleSpawn = 0;
  lastBubbleSpawn = 0;
  lastPowerUpSpawn = 0;

  scheduleNextLifeSpawn();
  updateScore();
  initCrabs();
  startGameLoop();
  startPoolCleanup();
  if (typeof accessibility !== 'undefined') {
    accessibility.announceGameStart();
  }
}

function initFreshGame() {
  lives = 3;
  currentStage = 1;
  score = 0;
  fishLeft = 50;
  fishBottom = 300;
  obstacleSpeed = BASE_OBSTACLE_SPEED;
  obstacleInterval = BASE_OBSTACLE_INTERVAL;
  clearGameElements();
}

function clearGameElements() {
  entities.obstacles.forEach((data, element) => {
    returnToPool(element, 'obstacles');
  });
  entities.bubbles.forEach((data, element) => {
    returnToPool(element, 'bubbles');
  });
  entities.crabs.forEach((data, element) => {
    returnToPool(element, 'crabs');
  });
  entities.pearls.forEach((data, element) => {
    returnToPool(element, 'pearls');
  });
  entities.powerUps.forEach((data, element) => {
    const poolType = data.isLife ? 'lifePowerUps' : 'powerUps';
    returnToPool(element, poolType);
  });

  entities.obstacles.clear();
  entities.bubbles.clear();
  entities.crabs.clear();
  entities.pearls.clear();
  entities.powerUps.clear();
  document
    .querySelectorAll(
      ".obstacle, .bubble, .power-up, .life-powerup, .ink-cloud, .electric-field, .crab, .pearl"
    )
    .forEach((element) => element.remove());

  activeCrabs.clear();
  activePearls.clear();
  activeObstacles.clear();

  stopGameLoop();
  clearAllIntervals();

  document.querySelectorAll('.sr-only[aria-live]').forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}

function endGame() {
  gameOver = true;
  isGameStarted = false;

  audioSystem.stopBackgroundMusic();
  audioSystem.playSound("gameOver");
  stopGameLoop();
  stopPoolCleanup();
  clearAllIntervals();

  gameOverDisplay.style.display = "block";
  fish.style.transform = "rotate(180deg)";

  if (typeof accessibility !== 'undefined') {
    accessibility.announceGameOver();
  }

  clearExistingEffects();
  activeObstacles.clear();
  setTimeout(cleanupObjectPools, 1000);
}

function restartGame() {
  clearGameElements();

  gameOver = false;
  isGameStarted = true;
  isPaused = false;
  isPoweredUp = false;
  isInvulnerable = false;
  lives = 3;
  score = 0;
  currentStage = 1;
  fishLeft = 50;
  fishBottom = window.innerHeight / 2;
  obstacleSpeed = BASE_OBSTACLE_SPEED;
  obstacleInterval = BASE_OBSTACLE_INTERVAL;

  gameOverDisplay.style.display = "none";
  const config = stageSystem.getStageConfig(1);
  gameContainer.style.backgroundImage = `url('${config.background}')`;

  fish.style.bottom = `${fishBottom}px`;
  fish.style.left = `${fishLeft}px`;
  fish.style.transform = "rotate(0deg)";
  fish.style.filter = "none";
  fish.style.opacity = "1";
  fish.className = "";
  lastObstacleSpawn = 0;
  lastBubbleSpawn = 0;
  lastPowerUpSpawn = 0;

  audioSystem.playBackgroundMusic(1);
  scheduleNextLifeSpawn();
  updateScore();
  startGameLoop();
}

function handleKeyboard(e) {
  if (gameOver && (e.key === "r" || e.key === "R")) {
    restartGame();
    return;
  }

  if (e.key === "p" || e.key === "P") {
    togglePause();
    return;
  }

  if (!isGameStarted || isPaused || gameOver) return;
  if (isMobileDevice && touchControls.joystick.active) return;

  const moveSpeed = isPoweredUp ? 25 : 15;
  let newTransform = fish.style.transform;

  switch (e.key) {
    case "ArrowUp":
      fishBottom = Math.min(fishBottom + moveSpeed, window.innerHeight - 50);
      newTransform = "rotate(-15deg)";
      break;
    case "ArrowDown":
      fishBottom = Math.max(fishBottom - moveSpeed, 0);
      newTransform = "rotate(15deg)";
      break;
    case "ArrowLeft":
      fishLeft = Math.max(fishLeft - moveSpeed, 0);
      newTransform = "scaleX(-1)";
      break;
    case "ArrowRight":
      fishLeft = Math.min(fishLeft + moveSpeed, window.innerWidth - 80);
      newTransform = "scaleX(1)";
      break;
    case "1":
    case "2":
    case "3":
      setDifficulty(["easy", "normal", "hard"][parseInt(e.key) - 1]);
      break;
  }

  fish.style.bottom = `${fishBottom}px`;
  fish.style.left = `${fishLeft}px`;
  fish.style.transform = newTransform;
}

function resetFishRotation(e) {
  if (["ArrowUp", "ArrowDown"].includes(e.key) && !gameOver) {
    fish.style.transform = "rotate(0deg)";
  }
}

document.addEventListener("keydown", handleKeyboard);
document.addEventListener("keyup", resetFishRotation);
startButton.addEventListener("click", startGame);

window.addEventListener("resize", () => {
  fishBottom = Math.min(fishBottom, window.innerHeight - 50);
  fishLeft = Math.min(fishLeft, window.innerWidth - 80);
  fish.style.bottom = `${fishBottom}px`;
  fish.style.left = `${fishLeft}px`;
});

function checkForSavedGame() {
  if (typeof gameState === 'undefined') return;

  const savedState = gameState.loadGameState();
  const continueButton = document.getElementById('continue-button');
  const startButton = document.getElementById('start-button');

  if (savedState && continueButton) {
    continueButton.style.display = 'block';
    continueButton.textContent = `Continue (Stage ${savedState.currentStage}, Score ${savedState.score})`;

    if (startButton) {
      startButton.textContent = 'New Game';
    }
  }
}

function continueGame() {
  if (typeof gameState !== 'undefined') {
    const savedState = gameState.loadGameState();
    if (savedState) {
      startGame(savedState);
      return;
    }
  }
  startGame();
}

function showSettings() {
  const modal = document.getElementById('settings-modal');
  modal.style.display = 'flex';
  loadSettingsIntoUI();
  document.addEventListener('keydown', handleSettingsEscape);
}

function closeSettings() {
  const modal = document.getElementById('settings-modal');
  modal.style.display = 'none';
  document.removeEventListener('keydown', handleSettingsEscape);
  saveSettingsFromUI();
}

function handleSettingsEscape(e) {
  if (e.key === 'Escape') {
    closeSettings();
  }
}

function loadSettingsIntoUI() {
  if (typeof gameState === 'undefined') return;

  const settings = gameState.settings;
  document.getElementById('sound-toggle').checked = settings.soundEnabled;
  document.getElementById('music-toggle').checked = settings.musicEnabled;
  const graphicsRadio = document.querySelector(`input[name="graphics"][value="${settings.graphics}"]`);
  if (graphicsRadio) graphicsRadio.checked = true;

  document.getElementById('particle-toggle').checked = settings.particleEffects !== false;
  const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${settings.difficulty}"]`);
  if (difficultyRadio) difficultyRadio.checked = true;
  document.getElementById('announcements-toggle').checked = settings.accessibility?.announcements !== false;
  document.getElementById('reduced-motion-toggle').checked = settings.accessibility?.reducedMotion === true;
  document.getElementById('auto-save-toggle').checked = settings.autoSave !== false;

  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = document.querySelector('.volume-value');
  const volume = Math.round((settings.volume || 0.7) * 100);
  volumeSlider.value = volume;
  volumeValue.textContent = volume + '%';
}

function saveSettingsFromUI() {
  if (typeof gameState === 'undefined') return;

  gameState.settings.soundEnabled = document.getElementById('sound-toggle').checked;
  gameState.settings.musicEnabled = document.getElementById('music-toggle').checked;
  const selectedGraphics = document.querySelector('input[name="graphics"]:checked');
  if (selectedGraphics) {
    gameState.settings.graphics = selectedGraphics.value;
  }

  gameState.settings.particleEffects = document.getElementById('particle-toggle').checked;
  const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
  if (selectedDifficulty) {
    gameState.settings.difficulty = selectedDifficulty.value;
    setDifficulty(selectedDifficulty.value);
  }
  if (!gameState.settings.accessibility) {
    gameState.settings.accessibility = {};
  }
  gameState.settings.accessibility.announcements = document.getElementById('announcements-toggle').checked;
  gameState.settings.accessibility.reducedMotion = document.getElementById('reduced-motion-toggle').checked;
  gameState.settings.autoSave = document.getElementById('auto-save-toggle').checked;
  const volumeValue = document.getElementById('volume-slider').value;
  gameState.settings.volume = volumeValue / 100;
  gameState.saveSettings();
  gameState.applySettings();

  console.log('Settings saved and applied!');
}

function resetSettings() {
  if (typeof gameState === 'undefined') return;
  gameState.settings = { ...gameState.defaultSettings };
  loadSettingsIntoUI();
  gameState.saveSettings();
  gameState.applySettings();

  console.log('Settings reset to defaults!');
}

function initializeSettingsListeners() {
  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = document.querySelector('.volume-value');

  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      volumeValue.textContent = value + '%';
      if (typeof gameState !== 'undefined') {
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

function applyVolumeSettings() {
  if (typeof audioSystem === 'undefined' || typeof gameState === 'undefined') return;

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

window.addEventListener('beforeunload', () => {
  if (isGameStarted && !gameOver && typeof gameState !== 'undefined') {
    gameState.saveGameState();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (isGameStarted && !gameOver && !isPaused) {
      togglePause();
    }
    if (isGameStarted && !gameOver && typeof gameState !== 'undefined') {
      gameState.saveGameState();
    }
  }
});

const objectPools = {
  obstacles: [],
  bubbles: [],
  crabs: [],
  pearls: [],
  powerUps: [],
  lifePowerUps: []
};

function createPool(type, count = 20) {
  for (let i = 0; i < count; i++) {
    let element;

    switch (type) {
      case 'obstacles':
        element = document.createElement('div');
        element.className = 'obstacle';
        break;
      case 'bubbles':
        element = document.createElement('div');
        element.className = 'bubble';
        break;
      case 'crabs':
        element = document.createElement('div');
        element.className = 'crab';
        break;
      case 'pearls':
        element = document.createElement('div');
        element.className = 'pearl';
        break;
      case 'powerUps':
        element = document.createElement('div');
        element.className = 'power-up';
        break;
      case 'lifePowerUps':
        element = document.createElement('div');
        element.className = 'life-powerup';
        break;
    }

    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.top = '0';
    element.style.display = 'none';
    objectPools[type].push(element);
  }
}

function getPooledElement(type) {
  if (objectPools[type].length > 0) {
    return objectPools[type].pop();
  }

  let element;
  switch (type) {
    case 'obstacles':
      element = document.createElement('div');
      element.className = 'obstacle';
      break;
    case 'bubbles':
      element = document.createElement('div');
      element.className = 'bubble';
      break;
    case 'crabs':
      element = document.createElement('div');
      element.className = 'crab';
      break;
    case 'pearls':
      element = document.createElement('div');
      element.className = 'pearl';
      break;
    case 'powerUps':
      element = document.createElement('div');
      element.className = 'power-up';
      break;
    case 'lifePowerUps':
      element = document.createElement('div');
      element.className = 'life-powerup';
      break;
  }

  element.style.position = 'absolute';
  element.style.left = '0';
  element.style.top = '0';
  return element;
}

function returnToPool(element, type) {
  element.style.display = 'none';
  element.style.transform = '';
  element.style.animation = '';
  element.style.opacity = '';
  element.style.width = '';
  element.style.height = '';
  element.style.left = '';
  element.style.right = '';
  element.style.top = '';
  element.style.bottom = '';
  element.innerHTML = '';
  element.removeAttribute('data-type');
  element.removeAttribute('data-direction');
  element.className = type === 'obstacles' ? 'obstacle' :
    type === 'bubbles' ? 'bubble' :
      type === 'crabs' ? 'crab' :
        type === 'pearls' ? 'pearl' :
          type === 'powerUps' ? 'power-up' :
            type === 'lifePowerUps' ? 'life-powerup' : '';

  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }

  if (objectPools[type] && objectPools[type].length < 30) {
    objectPools[type].push(element);
  }
}

function cleanupObjectPools() {
  Object.keys(objectPools).forEach(type => {
    const pool = objectPools[type];

    if (pool.length > 20) {
      const excess = pool.splice(20);
      excess.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }
  });
  console.log('Object pools cleaned up');
}

let poolCleanupInterval;
function startPoolCleanup() {
  if (poolCleanupInterval) clearInterval(poolCleanupInterval);
  poolCleanupInterval = setInterval(cleanupObjectPools, 30000);
}

function stopPoolCleanup() {
  if (poolCleanupInterval) {
    clearInterval(poolCleanupInterval);
    poolCleanupInterval = null;
  }
}


function initializePools() {
  createPool('obstacles', 15);
  createPool('bubbles', 30);
  createPool('crabs', 5);
  createPool('pearls', 20);
  createPool('powerUps', 10);
  createPool('lifePowerUps', 5);
}

const entities = {
  obstacles: new Map(),
  bubbles: new Map(),
  crabs: new Map(),
  pearls: new Map(),
  powerUps: new Map()
};

function updateObstacles(deltaTime) {
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
      obstacleData.y += pattern.speed * pattern.direction;
      if (Math.abs(obstacleData.y - startY) > pattern.amplitude) {
        pattern.direction *= -1;
      }
    }

    obstacleData.y = Math.max(0, Math.min(obstacleData.y, window.innerHeight - 80));
    element.style.left = `${obstacleData.x}px`;
    element.style.top = `${obstacleData.y}px`;

    if (!isPoweredUp && !isInvulnerable && checkCollisionOptimized(element, obstacleData)) {
      handleCollision(behavior.damage || 1);
      audioSystem.playSound(behavior.soundEffect || "hit");
      returnToPool(element, 'obstacles');
      entities.obstacles.delete(element);
      return;
    }

    if (obstacleData.x < -100) {
      returnToPool(element, 'obstacles');
      entities.obstacles.delete(element);
      incrementScore();
    }
  });
}

function updateBubbles(deltaTime) {
  entities.bubbles.forEach((bubbleData, element) => {
    if (!element.parentNode) {
      entities.bubbles.delete(element);
      return;
    }

    bubbleData.y += bubbleData.speed * deltaTime * 0.1;
    bubbleData.x += Math.sin(bubbleData.time) * 0.5;
    bubbleData.time += deltaTime * 0.001;
    bubbleData.scale = Math.min(bubbleData.scale + deltaTime * 0.0005, 2);

    element.style.left = `${bubbleData.x}px`;
    element.style.bottom = `${bubbleData.y}px`;
    element.style.transform = `scale(${bubbleData.scale})`;
    element.style.opacity = Math.max(0, 1 - (bubbleData.time * 0.3));

    if (bubbleData.y > window.innerHeight + 50 || bubbleData.time > 10) {
      returnToPool(element, 'bubbles');
      entities.bubbles.delete(element);
    }
  });
}

function updateCrabs(deltaTime) {
  entities.crabs.forEach((crabData, element) => {
    if (!element.parentNode) {
      entities.crabs.delete(element);
      activeCrabs.delete(element);
      return;
    }

    crabData.x += crabData.direction * CRAB_SPEED * deltaTime * 0.06;
    element.style.left = `${crabData.x}px`;
    const gameRect = gameContainer.getBoundingClientRect();
    element.style.top = `${gameRect.height - 73}px`;

    crabData.lastPearlTime += deltaTime;
    if (!crabData.nextPearlDelay) {
      crabData.nextPearlDelay = Math.random() * (PEARL_MAX_DELAY - PEARL_MIN_DELAY) + PEARL_MIN_DELAY;
    }
    if (crabData.lastPearlTime > crabData.nextPearlDelay) {
      if (Math.random() < 0.95) {
        createPearl(element, crabData);
      }
      crabData.lastPearlTime = 0;
      crabData.nextPearlDelay = Math.random() * (PEARL_MAX_DELAY - PEARL_MIN_DELAY) + PEARL_MIN_DELAY;
    }

    if (crabData.x < -100 || crabData.x > window.innerWidth + 50) {
      returnToPool(element, 'crabs');
      entities.crabs.delete(element);
      activeCrabs.delete(element);
    }
  });
}


function updatePearls(deltaTime) {
  entities.pearls.forEach((pearlData, element) => {
    if (!element.parentNode) {
      entities.pearls.delete(element);
      activePearls.delete(element);
      return;
    }

    pearlData.y += (pearlData.speed || PEARL_SPEED_PX) * deltaTime * 0.001;
    element.style.left = `${pearlData.x}px`;
    element.style.bottom = `${pearlData.y}px`;

    if (checkCollisionOptimized(element, pearlData)) {
      handleCollision(1);
      audioSystem.playSound("hit");
      returnToPool(element, 'pearls');
      entities.pearls.delete(element);
      activePearls.delete(element);
      return;
    }

    const maxAge = 8000;
    const isOffScreen = pearlData.y > window.innerHeight + 50;
    const isTooOld = pearlData.startTime && (Date.now() - pearlData.startTime > maxAge);

    if (isOffScreen || isTooOld) {
      returnToPool(element, 'pearls');
      entities.pearls.delete(element);
      activePearls.delete(element);
    }
  });
}

function updatePowerUps(deltaTime) {
  entities.powerUps.forEach((powerUpData, element) => {
    if (!element.parentNode) {
      entities.powerUps.delete(element);
      return;
    }

    powerUpData.x -= powerUpData.speed * deltaTime * 0.06;
    element.style.left = `${powerUpData.x}px`;
    element.style.top = `${powerUpData.y}px`;

    if (checkCollisionOptimized(element, powerUpData)) {
      if (powerUpData.isLife) {
        lives = Math.min(lives + 1, 5);
        updateScore();
        audioSystem.playSound("lifePickup");
        returnToPool(element, 'lifePowerUps');
      } else {
        activatePowerUp();
        returnToPool(element, 'powerUps');
      }
      entities.powerUps.delete(element);
      return;
    }

    if (powerUpData.x < -50) {
      returnToPool(element, powerUpData.isLife ? 'lifePowerUps' : 'powerUps');
      entities.powerUps.delete(element);
    }
  });
}


function checkCollisionOptimized(element, entityData) {
  if (!element || !fish) return false;

  const fishRect = fish.getBoundingClientRect();
  const entityRect = element.getBoundingClientRect();
  const padding = 4;

  return !(
    fishRect.right - padding < entityRect.left + padding ||
    fishRect.left + padding > entityRect.right - padding ||
    fishRect.bottom - padding < entityRect.top + padding ||
    fishRect.top + padding > entityRect.bottom - padding
  );
}

function gameLoop(currentTime = 0) {
  if (gameOver && !isGameStarted) {
    gameAnimationId = null;
    return;
  }

  const rawDelta = currentTime - lastFrameTime;
  smoothDeltaTime = smoothDeltaTime * 0.9 + rawDelta * 0.1;
  deltaTime = Math.min(smoothDeltaTime, 50);
  lastFrameTime = currentTime;

  if (!isPaused && isGameStarted) {
    updateObstacles(deltaTime);
    updateBubbles(deltaTime);
    updateCrabs(deltaTime);
    updatePearls(deltaTime);
    updatePowerUps(deltaTime);
    updateFishPosition();
    handleSpawning(currentTime);
  }

  gameAnimationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
  if (gameAnimationId) {
    cancelAnimationFrame(gameAnimationId);
  }
  lastFrameTime = 0;
  gameAnimationId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
  if (gameAnimationId) {
    cancelAnimationFrame(gameAnimationId);
    gameAnimationId = null;
  }
}

function handleSpawning(currentTime) {

  if (currentTime - lastObstacleSpawn > obstacleInterval) {
    createObstacle();
    lastObstacleSpawn = currentTime;
  }

  if (currentTime - lastBubbleSpawn > 500 && Math.random() < 0.7) {
    createBubble();
    lastBubbleSpawn = currentTime;
  }

  if (currentTime - lastPowerUpSpawn > 15000 && Math.random() < 0.1) {
    createPowerUp();
    lastPowerUpSpawn = currentTime;
  }

  if (currentTime - lastCrabSpawn > 3000 && entities.crabs.size < MAX_CRABS && Math.random() < 0.3) {
    createCrab();
    lastCrabSpawn = currentTime;
  }
}

function detectMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768) ||
    ('ontouchstart' in window);
}

function initMobileControls() {
  isMobileDevice = detectMobileDevice();

  if (!isMobileDevice) return;

  const mobileControls = document.getElementById('mobile-controls');
  const virtualJoystick = document.getElementById('virtual-joystick');
  const joystickHandle = document.getElementById('joystick-handle');
  const mobilePause = document.getElementById('mobile-pause');
  const mobileDifficulty = document.getElementById('mobile-difficulty');

  if (!mobileControls) return;


  mobileControls.style.display = 'block';
  const joystickRect = virtualJoystick.getBoundingClientRect();
  touchControls.joystick.centerX = joystickRect.left + joystickRect.width / 2;
  touchControls.joystick.centerY = joystickRect.top + joystickRect.height / 2;


  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = virtualJoystick.getBoundingClientRect();

    touchControls.joystick.active = true;
    touchControls.joystick.centerX = rect.left + rect.width / 2;
    touchControls.joystick.centerY = rect.top + rect.height / 2;

    joystickHandle.classList.add('active');
    handleTouchMove(e);
  }

  function handleTouchMove(e) {
    if (!touchControls.joystick.active) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchControls.joystick.centerX;
    const deltaY = touch.clientY - touchControls.joystick.centerY;
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), touchControls.joystick.radius);
    const angle = Math.atan2(deltaY, deltaX);

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    joystickHandle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    touchControls.movement.x = x / touchControls.joystick.radius;
    touchControls.movement.y = y / touchControls.joystick.radius;
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    touchControls.joystick.active = false;
    touchControls.movement.x = 0;
    touchControls.movement.y = 0;

    joystickHandle.classList.remove('active');
    joystickHandle.style.transform = 'translate(-50%, -50%)';
  }

  virtualJoystick.addEventListener('touchstart', handleTouchStart, { passive: false });
  virtualJoystick.addEventListener('touchmove', handleTouchMove, { passive: false });
  virtualJoystick.addEventListener('touchend', handleTouchEnd, { passive: false });
  mobilePause.addEventListener('click', togglePause);
  mobileDifficulty.addEventListener('click', () => {
    const difficulties = ['easy', 'normal', 'hard'];
    const currentIndex = difficulties.indexOf(currentDifficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    setDifficulty(difficulties[nextIndex]);
  });
}

function updateFishPosition() {
  if (!isMobileDevice || !isGameStarted || isPaused || gameOver) return;

  const moveSpeed = isPoweredUp ? 25 : 15;
  const sensitivity = 3;

  const deltaX = touchControls.movement.x * moveSpeed * sensitivity;
  const deltaY = -touchControls.movement.y * moveSpeed * sensitivity;

  fishLeft = Math.max(0, Math.min(fishLeft + deltaX, window.innerWidth - 80));
  fishBottom = Math.max(0, Math.min(fishBottom + deltaY, window.innerHeight - 60));

  fish.style.left = `${fishLeft}px`;
  fish.style.bottom = `${fishBottom}px`;
  if (Math.abs(deltaX) > 1) {
    fish.style.transform = deltaX > 0 ? 'scaleX(1)' : 'scaleX(-1)';
  } else if (Math.abs(deltaY) > 1) {
    fish.style.transform = deltaY > 0 ? 'rotate(-15deg)' : 'rotate(15deg)';
  } else {
    fish.style.transform = 'rotate(0deg)';
  }
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  const difficultyMultipliers = {
    easy: { speed: 0.7, interval: 1.4, lives: 5 },
    normal: { speed: 1.0, interval: 1.0, lives: 3 },
    hard: { speed: 1.5, interval: 0.7, lives: 2 }
  };

  const settings = difficultyMultipliers[difficulty];
  if (settings) {
    obstacleSpeed = BASE_OBSTACLE_SPEED * settings.speed;
    obstacleInterval = BASE_OBSTACLE_INTERVAL / settings.interval;

    if (!isGameStarted) {
      lives = settings.lives;
      updateScore();
    }
  }
}

window.addEventListener("load", () => {

  assetLoader.init();
  audioSystem.initSounds();
  initializePools();
  initMobileControls();
  gameState.init();
  accessibility.init();

  initializeSettingsListeners();

  assetLoader.onProgress((progress) => {
    if (progress >= 1.0) {

      setTimeout(() => {
        initGame();
        initCrabs();
        updateScore();
        checkForSavedGame();
      }, 500);
    }
  });
});
