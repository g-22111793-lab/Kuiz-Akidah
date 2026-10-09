// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Player paddle (left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    dx: 5,
    dy: 5,
    speed: 5
};

// Keyboard input tracking
const keys = {};

// Mouse tracking
let mouseY = canvas.height / 2;

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', toggleGame);
document.getElementById('resetBtn').addEventListener('click', resetScore);

// Toggle game state
function toggleGame() {
    gameRunning = !gameRunning;
    const btn = document.getElementById('startBtn');
    btn.textContent = gameRunning ? 'Pause Game' : 'Start Game';
    
    if (gameRunning) {
        gameLoop();
    }
}

// Reset score
function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Handle player paddle movement
function handlePlayerMovement() {
    // Arrow keys or WASD movement
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.dy = -paddleSpeed;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.dy = paddleSpeed;
    } else {
        player.dy = 0;
    }

    // Mouse movement
    const mouseSpeed = 5;
    if (mouseY < player.y + player.height / 2) {
        player.dy = -mouseSpeed;
    } else if (mouseY > player.y + player.height / 2) {
        player.dy = mouseSpeed;
    }

    // Update player position
    player.y += player.dy;

    // Collision with walls
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Handle computer AI paddle movement
function handleComputerMovement() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const aiSpeed = 4.5;

    if (computerCenter < ballCenter - 35) {
        computer.dy = aiSpeed;
    } else if (computerCenter > ballCenter + 35) {
        computer.dy = -aiSpeed;
    } else {
        computer.dy = 0;
    }

    // Update computer position
    computer.y += computer.dy;

    // Collision with walls
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with left paddle (player)
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on paddle movement
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy += deltaY * 0.1;
    }

    // Ball collision with right paddle (computer)
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on paddle movement
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy += deltaY * 0.1;
    }

    // Scoring - ball goes off screen left
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }

    // Scoring - ball goes off screen right
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawPaddle(player);
    drawPaddle(computer);

    // Draw ball
    drawBall();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    handlePlayerMovement();
    handleComputerMovement();
    updateBall();
    draw();

    requestAnimationFrame(gameLoop);
}

// Initialize
updateScore();
draw();
