export let isMobileDevice = false;
export const touchControls = {
    joystick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0, radius: 60 },
    movement: { x: 0, y: 0 }
};

export function detectMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768) ||
        ('ontouchstart' in window);
}

export function initMobileControls(togglePause, setDifficulty, gameData, difficulties) {
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
        const currentIndex = difficulties.indexOf(gameData.currentDifficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        setDifficulty(difficulties[nextIndex], gameData);
    });
}

export function updateFishPosition(gameData, fish) {
    if (!isMobileDevice || !gameData.isGameStarted || gameData.isPaused || gameData.gameOver) return;

    const moveSpeed = gameData.isPoweredUp ? 25 : 15;
    const sensitivity = 3;
    const deltaX = touchControls.movement.x * moveSpeed * sensitivity;
    const deltaY = -touchControls.movement.y * moveSpeed * sensitivity;

    gameData.fishLeft = Math.max(0, Math.min(gameData.fishLeft + deltaX, window.innerWidth - 80));
    gameData.fishBottom = Math.max(0, Math.min(gameData.fishBottom + deltaY, window.innerHeight - 60));

    fish.style.left = `${gameData.fishLeft}px`;
    fish.style.bottom = `${gameData.fishBottom}px`;

    if (Math.abs(deltaX) > 1) {
        fish.style.transform = deltaX > 0 ? 'scaleX(1)' : 'scaleX(-1)';
    } else if (Math.abs(deltaY) > 1) {
        fish.style.transform = deltaY > 0 ? 'rotate(-15deg)' : 'rotate(15deg)';
    } else {
        fish.style.transform = 'rotate(0deg)';
    }
}

export function handleKeyboard(e, gameData, fish, restartGame, togglePause, setDifficulty) {
    if (gameData.gameOver && (e.key === "r" || e.key === "R")) {
        restartGame();
        return;
    }

    if (e.key === "p" || e.key === "P") {
        togglePause();
        return;
    }

    if (!gameData.isGameStarted || gameData.isPaused || gameData.gameOver) return;
    if (isMobileDevice && touchControls.joystick.active) return;

    const moveSpeed = gameData.isPoweredUp ? 25 : 15;
    let newTransform = fish.style.transform;

    switch (e.key) {
        case "ArrowUp":
            gameData.fishBottom = Math.min(gameData.fishBottom + moveSpeed, window.innerHeight - 50);
            newTransform = "rotate(-15deg)";
            break;
        case "ArrowDown":
            gameData.fishBottom = Math.max(gameData.fishBottom - moveSpeed, 0);
            newTransform = "rotate(15deg)";
            break;
        case "ArrowLeft":
            gameData.fishLeft = Math.max(gameData.fishLeft - moveSpeed, 0);
            newTransform = "scaleX(-1)";
            break;
        case "ArrowRight":
            gameData.fishLeft = Math.min(gameData.fishLeft + moveSpeed, window.innerWidth - 80);
            newTransform = "scaleX(1)";
            break;
        case "1":
        case "2":
        case "3":
            setDifficulty(["easy", "normal", "hard"][parseInt(e.key) - 1], gameData);
            break;
    }

    fish.style.bottom = `${gameData.fishBottom}px`;
    fish.style.left = `${gameData.fishLeft}px`;
    fish.style.transform = newTransform;
}

export function resetFishRotation(e, fish, gameData) {
    if (["ArrowUp", "ArrowDown"].includes(e.key) && !gameData.gameOver) {
        fish.style.transform = "rotate(0deg)";
    }
}
