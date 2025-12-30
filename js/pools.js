export const objectPools = {
    obstacles: [],
    bubbles: [],
    crabs: [],
    pearls: [],
    powerUps: [],
    lifePowerUps: []
};

export function createPool(type, count = 20) {
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
                element.className = 'life-powerup power-up';
                break;
            default:
                element = document.createElement('div');
        }
        element.style.display = 'none';
        objectPools[type].push(element);
    }
}

export function getPooledElement(type) {
    if (objectPools[type] && objectPools[type].length > 0) {
        const element = objectPools[type].pop();
        element.style.display = 'block';
        return element;
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
            element.className = 'life-powerup power-up';
            break;
        default:
            element = document.createElement('div');
    }
    element.style.display = 'block';
    return element;
}

export function returnToPool(element, type) {
    element.style.display = 'none';
    element.style.transform = '';
    element.style.animation = '';
    element.innerHTML = '';
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

export function cleanupObjectPools() {
    Object.keys(objectPools).forEach(type => {
        const pool = objectPools[type];
        if (pool.length > 20) {
            const excess = pool.splice(20);
            excess.forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
        }
    });
}

let poolCleanupInterval;

export function startPoolCleanup() {
    if (poolCleanupInterval) clearInterval(poolCleanupInterval);
    poolCleanupInterval = setInterval(cleanupObjectPools, 30000);
}

export function stopPoolCleanup() {
    if (poolCleanupInterval) {
        clearInterval(poolCleanupInterval);
        poolCleanupInterval = null;
    }
}

export function initializePools() {
    createPool('obstacles', 15);
    createPool('bubbles', 30);
    createPool('crabs', 5);
    createPool('powerUps', 5);
    createPool('lifePowerUps', 5);
}
