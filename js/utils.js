export function getRandomRange(min, max) {
    return min + Math.random() * (max - min);
}

export function triggerHaptic(type = 'light', isMobileDevice, hapticPatterns) {
    if ('vibrate' in navigator && isMobileDevice) {
        navigator.vibrate(hapticPatterns[type] || hapticPatterns.light);
    }
}

export function checkCollision(element, fish) {
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
