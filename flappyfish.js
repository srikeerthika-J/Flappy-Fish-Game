// Board setup
let board;
let boardWidth = 1500;
let boardHeight = 720;
let context;

// Fish setup (previously fish setup)
let fishWidth = 65;
let fishHeight = 50;
let fishX = boardWidth / 8;
let fishY = boardHeight / 2;
let fishGif; // Variable to hold the GIF image element

// Fish object (previously fish object)
let fish = {
    x: fishX,
    y: fishY,
    width: fishWidth,
    height: fishHeight
};

// Rocks setup (previously rocks setup)
let rockArray = [];
let rockWidth = 250;
let rockHeight = 512;
let rockX = boardWidth;
let rockY = 0;

// Coin setup
let coinArray = [];
let coinWidth = 40;
let coinHeight = 40;
let coinImg;
let coinsCollected = 0;

// Game physics
let velocityX = -3;
let velocityY = 0;
let gravity = 0.4;

// Game states
let gameOver = false;
let score = 0;
let isPaused = false; // Track the pause state
let gameState = 'home'; // home, game, paused

let rockInterval;
let gameAnimationFrame;
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0; // Get high score from local storage

// Window load event
window.onload = function () {
    // Home Page Setup
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("resumeBtn").addEventListener("click", resumeGame); // Resume button
    document.getElementById("startNewGameBtn").addEventListener("click", startNewGame);
    document.getElementById("quitPauseBtn").addEventListener("click", quitGame);
    document.getElementById("quitBtn").addEventListener("click", quitGame);

    // Canvas setup
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load the GIF (instead of video)
    fishGif = new Image();
    fishGif.src = "assets/fish1.gif"; // Path to your GIF file

    // Load rock images (instead of rocks)
    topRockImg = new Image();
    topRockImg.src = "assets/toprock.png";
    bottomRockImg = new Image();
    bottomRockImg.src = "assets/bottomrock.png";
    coinImg = new Image();
    coinImg.src = "assets/coin.png";  // Coin image

    // Update the high score on the homepage
    document.getElementById("highScoreDisplay").innerText = "High Score: " + highScore;
};

// Start the game
function startGame() {
    // Reset any existing game state
    resetGame();

    // Hide home page, show game screen
    document.getElementById("homePage").style.display = 'none';
    document.getElementById("gameOverPage").style.display = 'none';
    document.getElementById("board").style.display = 'block';

    showCountdown(3, () => {
        gameState = 'game'; // Change state to game
        gameOver = false; // Reset game over state
        startGameLoop(); // Start the game loop
        rockInterval = setInterval(placeRocks, 1500); // Start rock interval
        document.addEventListener("keydown", moveFish); // Allow fish movement
        document.addEventListener("keydown", handlePauseKey); // Handle pause on "P" key
    });
}

// Show countdown before starting the game
function showCountdown(count, callback) {
    const countdownInterval = setInterval(() => {
        context.clearRect(0, 0, board.width, board.height);
        context.fillStyle = "white";
        context.font = "100px sans-serif";
        let textWidth = context.measureText(count).width;
        context.fillText(count, (boardWidth - textWidth) / 2, boardHeight / 2);

        count--;

        if (count < 0) {
            clearInterval(countdownInterval);
            callback(); // Start the game after countdown ends
        }
    }, 1000);
}

// Start the game loop (requestAnimationFrame)
function startGameLoop() {
    gameAnimationFrame = requestAnimationFrame(update);
}

// Update function for the game loop
function update() {
    if (gameOver || isPaused) return; // Do nothing if game is over or paused

    gameAnimationFrame = requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Fish physics (previously fish physics)
    velocityY += gravity;
    fish.y = Math.max(fish.y + velocityY, 0);

    // Draw the GIF image (instead of the video) for the fish
    context.drawImage(fishGif, fish.x, fish.y, fish.width, fish.height);

    if (fish.y > board.height) {
        gameOver = true;
        showGameOverScreen();
        return;
    }

    // Handle rocks (previously rocks)
    for (let i = 0; i < rockArray.length; i++) {
        let rock = rockArray[i];
        rock.x += velocityX;

        // Check if rock is off-screen and should be removed
        if (rock.x < -rock.width) {
            rockArray.splice(i, 1); // Remove rock if off-screen
            i--; // Adjust index after removal
            continue;
        }

        context.drawImage(rock.img, rock.x, rock.y, rock.width, rock.height);

        // Check if the fish passes the rock (without hitting it)
        if (!rock.passed && fish.x > rock.x + rock.width) {
            score += 0.5;
            rock.passed = true;
        }

        // Check for rock collision (fish hits the rock)
        if (detectRockCollision(fish, rock)) {
            gameOver = true;
            showGameOverScreen();
            return;
        }
    }

    // Handle coins
    for (let i = 0; i < coinArray.length; i++) {
        let coin = coinArray[i];
        coin.x += velocityX;

        // Detect coin collision and collect it
        if (detectCoinCollision(fish, coin)) {
            coinArray.splice(i, 1); // Remove collected coin
            coinsCollected++; // Increment coin count
            i--; // Adjust index after removal
        }

        context.drawImage(coin.img, coin.x, coin.y, coinWidth, coinHeight);
    }

    // Display score and coins collected
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("Score: " + score, 5, 45);
    context.fillText("Coins: " + coinsCollected, boardWidth - 200, 45);
}

// Detect collision between fish and rock (front and side margins)
function detectRockCollision(a, b) {
    let frontMargin = 90; // Margin for front collision
    let sideMargin = 42; // Margin for side collision

    // Front collision: check if fish is within the front part of the rock
    let frontCollision = a.x + a.width > b.x + frontMargin && a.x < b.x + b.width - frontMargin;
    // Side collision: check if fish is vertically within the rock's bounds
    let sideCollision = a.y + a.height > b.y + sideMargin && a.y < b.y + b.height - sideMargin;

    return frontCollision && sideCollision;
}

// Detect collision between fish and coin (with margin for collection)
function detectCoinCollision(a, b) {
    let margin = 5; // Small margin to collect coins when near
    return a.x < b.x + b.width - margin && a.x + a.width > b.x + margin && a.y < b.y + b.height - margin && a.y + a.height > b.y + margin;
}

// Pause the game
function pauseGame() {
    isPaused = true;
    cancelAnimationFrame(gameAnimationFrame);
    clearInterval(rockInterval);
    document.getElementById("pausePage").style.display = 'block';
}

// Resume the game
function resumeGame() {
    isPaused = false;
    document.getElementById("pausePage").style.display = 'none';
    startGameLoop(); // Restart the game loop
    rockInterval = setInterval(placeRocks, 1500);
}

// Handle "P" key press to pause the game
function handlePauseKey(e) {
    if (e.code === "KeyP" && !gameOver) {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
}

// Reset the game state and all variables
function resetGame() {
    score = 0;
    coinsCollected = 0; // Reset coin count
    fish.y = fishY;
    velocityY = 0;
    rockArray = [];
    coinArray = []; // Reset coins
    gameOver = false;
    isPaused = false;
    context.clearRect(0, 0, board.width, board.height);

    // Remove previous game loop, intervals, and event listeners
    cancelAnimationFrame(gameAnimationFrame);
    clearInterval(rockInterval);
    document.removeEventListener("keydown", moveFish);
    document.removeEventListener("keydown", handlePauseKey);
}

// Quit the game
function quitGame() {
    cancelAnimationFrame(gameAnimationFrame);
    clearInterval(rockInterval);
    document.removeEventListener("keydown", moveFish);
    document.removeEventListener("keydown", handlePauseKey);
    document.getElementById("homePage").style.display = 'flex';
    document.getElementById("pausePage").style.display = 'none';
    document.getElementById("gameOverPage").style.display = 'none';
    document.getElementById("board").style.display = 'none';
}

// Place new rocks and coin at intervals
function placeRocks() {
    if (gameOver || isPaused) return;

    let randomRockY = rockY - rockHeight / 4 - Math.random() * (rockHeight / 2);
    let openingSpace = board.height / 3;

    // Create top rock
    let topRock = {
        img: topRockImg,
        x: rockX, // Keep rocks off-screen at first
        y: randomRockY,
        width: rockWidth,
        height: rockHeight,
        passed: false
    };
    rockArray.push(topRock);

    // Create bottom rock
    let bottomRock = {
        img: bottomRockImg,
        x: rockX, // Keep rocks off-screen at first
        y: randomRockY + rockHeight + openingSpace,
        width: rockWidth,
        height: rockHeight,
        passed: false
    };
    rockArray.push(bottomRock);

    // Coin between top and bottom rocks
    let coinMiddleY = randomRockY + rockHeight + openingSpace / 2 - coinHeight / 2; // Center between rocks
    let coinMiddle = {
        img: coinImg,
        x: rockX + rockWidth / 2 - coinWidth / 2, // Center horizontally
        y: coinMiddleY,
        width: coinWidth,
        height: coinHeight
    };
    coinArray.push(coinMiddle);

    // Coin at the center of bottom two rocks
    let bottomRocksMiddleY = randomRockY + rockHeight + openingSpace + (board.height - (randomRockY + rockHeight + openingSpace)) / 3 - coinHeight; // Adjusted higher
    let bottomMiddleCoin = {
        img: coinImg,
        x: rockX + rockWidth / 2 - coinWidth / 2 + 100, // Slightly shifted to the right
        y: bottomRocksMiddleY,
        width: coinWidth,
        height: coinHeight
    };
    coinArray.push(bottomMiddleCoin);
}

// Move the fish based on key presses
function moveFish(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        if (!gameOver && !isPaused) {
            velocityY = -6;
        }
    }
}

// Display the game over screen
function showGameOverScreen() {
    context.clearRect(0, 0, board.width, board.height);

    // Set the style for the "GAME OVER" text
    context.fillStyle = "rgb(20, 79, 88)";  // Aquatic blue color
    context.font = "bold 100px 'Luckiest Guy', cursive";  // Use a playful and bold font

    // Measure the width and height of the text
    let textWidth = context.measureText("GAME OVER").width;
    let textHeight = 100;
    let xPosition = (boardWidth - textWidth) / 2;
    let yPosition = (boardHeight + textHeight) / 2;

    // Apply text shadow for a glowing effect
    context.shadowColor = "rgba(0, 184, 212, 1)";
    context.shadowBlur = 20;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    // Draw the text on the canvas
    context.fillText("GAME OVER", xPosition, yPosition);

    // Check and update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore); // Store high score in localStorage
    }

    setTimeout(() => {
        document.getElementById("gameOverPage").style.display = 'block';
        document.getElementById("board").style.display = 'none';
        document.getElementById("finalScore").innerText = `Final Score: ${score}`;
        document.getElementById("finalCoins").innerText = `Coins Collected: ${coinsCollected}`;
        document.getElementById("highScore").innerText = `High Score: ${highScore}`; // Update high score on Game Over page
    }, 2000);
}

// Start a new game
function startNewGame() {
    resetGame();
    startGame();
}
