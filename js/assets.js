export const preloadedImages = new Map();

export const assetLoader = {
    totalAssets: 0,
    loadedAssets: 0,
    failedAssets: 0,
    loadingCallbacks: [],

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
        };
        img.src = src;
    },

    markAssetComplete(required, failed = false) {
        if (failed) this.failedAssets++;
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
        if (progressBar) progressBar.style.width = `${progress * 100}%`;
        if (progressText) progressText.textContent = `Loading... ${Math.round(progress * 100)}%`;
        this.loadingCallbacks.forEach(callback => callback(progress));
    },

    onLoadingComplete() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.style.display = 'none';
        const startScreen = document.getElementById('start-screen');
        if (startScreen) startScreen.style.display = 'flex';
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
