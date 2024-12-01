const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById('startScreen');
const tutorialScreen = document.getElementById('tutorialScreen');
const startButton = document.getElementById('startButton');
const closeTutorialButton = document.getElementById('closeTutorialButton');
const scoreDisplay = document.getElementById('scoreDisplay');

let running = false;
let score = 0;
let dragging = false;
let player = { x: canvas.width / 2, y: canvas.height - 150, radius: 40, emoji: '👦🏼', immune: false };
let obstacles = [];
let powerUps = [];
let gameSpeed = 1;

startButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startScreen.style.display = 'none';
    running = true;
    initGame();
});

closeTutorialButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tutorialScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (Math.hypot(touch.clientX - player.x, touch.clientY - player.y) < player.radius) dragging = true;
});

canvas.addEventListener('touchmove', (e) => {
    if (dragging) {
        const touch = e.touches[0];
        player.x = touch.clientX;
        player.y = touch.clientY;
    }
});

canvas.addEventListener('touchend', () => dragging = false);

function initGame() {
    obstacles = [];
    powerUps = [];
    score = 0;
    gameSpeed = 1;
    spawnObjects();
    gameLoop();
}

function spawnObjects() {
    setInterval(() => {
        if (running) {
            const x = Math.random() * canvas.width;
            obstacles.push({ x, y: -50, radius: 20, emoji: '💣', speed: 5 * gameSpeed });
        }
    }, 1000);

    setInterval(() => {
        if (running) {
            const x = Math.random() * canvas.width;
            const chance = Math.random();
            if (chance < 0.05) powerUps.push({ x, y: -50, radius: 30, emoji: '🏎️', speed: 4 * gameSpeed, points: 10000 });
            else if (chance < 0.2) powerUps.push({ x, y: -50, radius: 30, emoji: '⭐', speed: 3 * gameSpeed, immunity: 3 });
            else if (chance < 0.27) powerUps.push({ x, y: -50, radius: 30, emoji: '⏳', speed: 2 * gameSpeed, slow: 10 });
            else if (chance < 0.0001) powerUps.push({ x, y: -50, radius: 30, emoji: '🍀', speed: 1.5 * gameSpeed, points: 1000000 });
        }
    }, 3000);
}

function gameLoop() {
    if (!running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${player.radius * 2}px Arial`;
    ctx.fillText(player.emoji, player.x - player.radius, player.y + player.radius / 2);

    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        if (checkCollision(player, obstacle) && !player.immune) {
            running = false;
            alert('Game Over!');
        }
        if (obstacle.y > canvas.height) obstacles.splice(index, 1);
        ctx.fillText(obstacle.emoji, obstacle.x - obstacle.radius, obstacle.y + obstacle.radius / 2);
    });

    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.speed;
        if (checkCollision(player, powerUp)) {
            if (powerUp.points) score += powerUp.points;
            if (powerUp.immunity) grantImmunity(powerUp.immunity);
            if (powerUp.slow) activateSlowMotion(powerUp.slow);
            powerUps.splice(index, 1);
        }
        if (powerUp.y > canvas.height) powerUps.splice(index, 1);
        ctx.fillText(powerUp.emoji, powerUp.x - powerUp.radius, powerUp.y + powerUp.radius / 2);
    });

    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    if (score % 100000 === 0) gameSpeed += 0.2;

    requestAnimationFrame(gameLoop);
}

function grantImmunity(duration) {
    player.immune = true;
    setTimeout(() => player.immune = false, duration * 1000);
}

function activateSlowMotion(duration) {
    gameSpeed = 0.5;
    setTimeout(() => gameSpeed = 1, duration * 1000);
}

function checkCollision(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return dist < a.radius + b.radius;
}