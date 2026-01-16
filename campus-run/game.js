/**
 * ============================================
 * CAMPUS RUN: THE REUNION CHALLENGE
 * Main Game Logic - 16-BIT EDITION
 * ============================================
 */

// ============================================
// AUDIO MANAGER
// ============================================

const AudioManager = {
    context: null,
    isMuted: false,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    },

    playTone(frequency, duration, type = 'square', volume = 0.2) {
        if (!this.context || this.isMuted) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    // 8-bit style jump sound
    playJump() {
        if (!this.context || this.isMuted) return;
        this.playTone(300, 0.05, 'square', 0.15);
        setTimeout(() => this.playTone(400, 0.05, 'square', 0.12), 50);
        setTimeout(() => this.playTone(500, 0.08, 'square', 0.1), 100);
    },

    // Coin collect sound - 8-bit style
    playCollect() {
        if (!this.context || this.isMuted) return;
        this.playTone(988, 0.08, 'square', 0.2);
        setTimeout(() => this.playTone(1319, 0.15, 'square', 0.18), 80);
    },

    // Trophy/special collect
    playTrophy() {
        if (!this.context || this.isMuted) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.1, 'square', 0.15), i * 60);
        });
    },

    playStumble() {
        if (!this.context || this.isMuted) return;
        this.playTone(150, 0.15, 'square', 0.25);
        setTimeout(() => this.playTone(100, 0.2, 'square', 0.2), 100);
    },

    playVictory() {
        if (!this.context || this.isMuted) return;
        const melody = [523, 523, 523, 659, 784, 659, 784, 1047];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'square', 0.2);
                this.playTone(freq / 2, 0.15, 'square', 0.1);
            }, i * 120);
        });
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
};

// ============================================
// GAME STATE
// ============================================

const GameState = {
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    hasWon: false,

    lastFrameTime: 0,
    gameTime: 0,
    lastSpeedIncrease: 0,
    deltaTime: 0,

    player: {
        x: 100,
        y: 0,
        velocityY: 0,
        isJumping: false,
        isStumbling: false,
        stumbleEndTime: 0,
        animationFrame: 0,
        animationTimer: 0
    },

    obstacles: [],
    collectibles: [],
    backgroundElements: [],

    itemsCollected: 0,
    distance: 0,
    currentCity: 0,
    cityChangeDistance: 0,

    speedMultiplier: 1,
    currentSpeed: GAME_CONFIG.INITIAL_SPEED,

    lastObstacleX: 0,
    lastCollectibleX: 0,
    lastGuaranteedSpawn: 0,

    parallaxOffsets: { far: 0, mid: 0, near: 0 },

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.hasWon = false;

        this.lastFrameTime = 0;
        this.gameTime = 0;
        this.lastSpeedIncrease = 0;

        this.player = {
            x: 100,
            y: 0,
            velocityY: 0,
            isJumping: false,
            isStumbling: false,
            stumbleEndTime: 0,
            animationFrame: 0,
            animationTimer: 0
        };

        this.obstacles = [];
        this.collectibles = [];
        this.backgroundElements = [];

        this.itemsCollected = 0;
        this.distance = 0;
        this.currentCity = 0;
        this.cityChangeDistance = 0;

        this.speedMultiplier = 1;
        this.currentSpeed = GAME_CONFIG.INITIAL_SPEED;

        this.lastObstacleX = 0;
        this.lastCollectibleX = 0;
        this.lastGuaranteedSpawn = 0;

        this.parallaxOffsets = { far: 0, mid: 0, near: 0 };
    }
};

// ============================================
// CANVAS & RENDERING
// ============================================

let canvas, ctx;
let canvasWidth, canvasHeight;
let groundY;

function initCanvas() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Maintain pixel art crispness
    ctx.imageSmoothingEnabled = false;

    groundY = canvasHeight - GAME_CONFIG.GROUND_Y_OFFSET;

    if (!GameState.player.isJumping) {
        GameState.player.y = groundY - PLAYER_CONFIG.height;
    }
}

// ============================================
// BACKGROUND - DYNAMIC CITY SYSTEM
// ============================================

function getCurrentCity() {
    return GAME_CONFIG.CITIES[GameState.currentCity % GAME_CONFIG.CITIES.length];
}

function initBackgrounds() {
    GameState.backgroundElements = [];
    GameState.cityChangeDistance = 2000; // Change city every 2000m

    populateBackgroundForCity(getCurrentCity());
}

function populateBackgroundForCity(city) {
    // Get city-specific and generic elements
    const cityElements = Object.entries(BACKGROUNDS).filter(([name, bg]) =>
        bg.city === city || !bg.city
    );

    let farX = canvasWidth; // Start offscreen to the right

    // Add some variety
    for (let i = 0; i < 8; i++) {
        const [name, bg] = cityElements[Math.floor(Math.random() * cityElements.length)];

        GameState.backgroundElements.push({
            layer: bg.height > 100 ? 'far' : 'mid',
            type: name,
            x: farX,
            y: groundY - bg.height + 10,
            width: bg.width,
            height: bg.height,
            city: bg.city || 'generic'
        });

        farX += bg.width + Math.random() * 150 + 80;
    }
}

function updateParallax(speed) {
    GameState.parallaxOffsets.far += speed * GAME_CONFIG.PARALLAX_SPEEDS.far;
    GameState.parallaxOffsets.mid += speed * GAME_CONFIG.PARALLAX_SPEEDS.mid;
    GameState.parallaxOffsets.near += speed * GAME_CONFIG.PARALLAX_SPEEDS.near;

    // Check for city change
    if (GameState.distance > GameState.cityChangeDistance) {
        GameState.currentCity++;
        GameState.cityChangeDistance += 2000;
        // Add new city elements ahead
        populateBackgroundForCity(getCurrentCity());
    }

    // Update background elements
    GameState.backgroundElements.forEach(elem => {
        const parallaxSpeed = elem.layer === 'far'
            ? GAME_CONFIG.PARALLAX_SPEEDS.far
            : GAME_CONFIG.PARALLAX_SPEEDS.mid;
        elem.x -= speed * parallaxSpeed;
    });

    // Remove off-screen and recycle
    GameState.backgroundElements = GameState.backgroundElements.filter(elem => {
        if (elem.x + elem.width < -100) {
            return false; // Remove
        }
        return true;
    });

    // Ensure we always have background elements ahead
    const rightmostX = Math.max(...GameState.backgroundElements.map(e => e.x + e.width), 0);
    if (rightmostX < canvasWidth * 2) {
        populateBackgroundForCity(getCurrentCity());
    }
}

function renderBackgrounds() {
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.4, '#FFB347');
    gradient.addColorStop(0.7, '#FF8C69');
    gradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, groundY);

    // Render far layer
    GameState.backgroundElements
        .filter(elem => elem.layer === 'far')
        .forEach(elem => {
            const img = AssetCache.get(`bg_${elem.type}`);
            if (img) {
                ctx.globalAlpha = 0.5;
                ctx.drawImage(img, Math.floor(elem.x), Math.floor(elem.y), elem.width, elem.height);
                ctx.globalAlpha = 1;
            }
        });

    // Render mid layer
    GameState.backgroundElements
        .filter(elem => elem.layer === 'mid')
        .forEach(elem => {
            const img = AssetCache.get(`bg_${elem.type}`);
            if (img) {
                ctx.globalAlpha = 0.7;
                ctx.drawImage(img, Math.floor(elem.x), Math.floor(elem.y), elem.width, elem.height);
                ctx.globalAlpha = 1;
            }
        });

    // Draw ground - pixelated style
    ctx.fillStyle = '#4A7C23';
    ctx.fillRect(0, groundY + 8, canvasWidth, canvasHeight - groundY);

    // Pixel grass detail
    ctx.fillStyle = '#3D6B1C';
    for (let x = 0; x < canvasWidth; x += 16) {
        ctx.fillRect(x, groundY + 8, 8, 4);
    }

    // Path
    ctx.fillStyle = '#888';
    ctx.fillRect(0, groundY, canvasWidth, 10);
    ctx.fillStyle = '#777';
    ctx.fillRect(0, groundY + 2, canvasWidth, 2);
}

// ============================================
// PLAYER LOGIC
// ============================================

function playerJump() {
    if (!GameState.player.isJumping && GameState.isRunning && !GameState.isPaused) {
        GameState.player.isJumping = true;
        GameState.player.velocityY = GAME_CONFIG.JUMP_FORCE;
        AudioManager.playJump();
    }
}

function updatePlayer() {
    const player = GameState.player;

    if (player.isJumping) {
        player.velocityY += GAME_CONFIG.GRAVITY;
        player.y += player.velocityY;

        if (player.y >= groundY - PLAYER_CONFIG.height) {
            player.y = groundY - PLAYER_CONFIG.height;
            player.isJumping = false;
            player.velocityY = 0;
        }
    }

    if (player.isStumbling && Date.now() > player.stumbleEndTime) {
        player.isStumbling = false;
    }

    // Faster animation for 16-bit feel
    if (!player.isJumping) {
        player.animationTimer += GameState.deltaTime;
        if (player.animationTimer > 80) {
            player.animationFrame = player.animationFrame === 0 ? 1 : 0;
            player.animationTimer = 0;
        }
    }
}

function renderPlayer() {
    const player = GameState.player;
    let frame = player.isJumping ? 'jump' : (player.animationFrame === 0 ? 'run1' : 'run2');

    const img = AssetCache.get(`player_${frame}`);
    if (img) {
        ctx.save();

        if (player.isStumbling) {
            const stumbleOffset = Math.sin(Date.now() * 0.03) * 4;
            ctx.translate(stumbleOffset, 0);
            ctx.globalAlpha = 0.6;
        }

        // Draw with pixel-perfect positioning
        ctx.drawImage(
            img,
            Math.floor(player.x),
            Math.floor(player.y),
            PLAYER_CONFIG.width,
            PLAYER_CONFIG.height
        );
        ctx.restore();
    }
}

// ============================================
// OBSTACLES & COLLECTIBLES
// ============================================

function getRandomObstacleType() {
    const types = Object.keys(OBSTACLES);
    return types[Math.floor(Math.random() * types.length)];
}

function getRandomCollectibleType() {
    const types = Object.keys(COLLECTIBLES);
    return types[Math.floor(Math.random() * types.length)];
}

function spawnObstacle() {
    const type = getRandomObstacleType();
    const obstacle = OBSTACLES[type];

    GameState.obstacles.push({
        type: type,
        x: canvasWidth + 50,
        y: groundY - obstacle.height + 5,
        width: obstacle.width,
        height: obstacle.height,
        hitboxPadding: obstacle.hitboxPadding
    });

    GameState.lastObstacleX = canvasWidth;
}

function spawnCollectible() {
    if (GameState.itemsCollected >= GAME_CONFIG.ITEMS_TO_WIN) return;

    const type = getRandomCollectibleType();
    const collectible = COLLECTIBLES[type];
    const heightVariation = Math.random() * 80 + 20;

    GameState.collectibles.push({
        type: type,
        x: canvasWidth + 50 + Math.random() * 100,
        y: groundY - collectible.height - heightVariation,
        width: collectible.width,
        height: collectible.height,
        points: collectible.points || 1,
        bobOffset: Math.random() * Math.PI * 2,
        collected: false
    });

    GameState.lastCollectibleX = canvasWidth;
}

function updateObstaclesAndCollectibles(speed) {
    const effectiveSpeed = GameState.player.isStumbling
        ? speed * GAME_CONFIG.STUMBLE_SPEED_MULTIPLIER
        : speed;

    // Update obstacles
    GameState.obstacles.forEach(obs => {
        obs.x -= effectiveSpeed;
    });
    GameState.obstacles = GameState.obstacles.filter(obs => obs.x + obs.width > -100);

    // Update collectibles
    GameState.collectibles.forEach(col => {
        col.x -= effectiveSpeed;
        col.bobOffset += 0.005 * GameState.deltaTime;
    });
    GameState.collectibles = GameState.collectibles.filter(c => c.x + c.width > -100 && !c.collected);

    // Spawn obstacles
    const distFromLastObs = canvasWidth - GameState.lastObstacleX;
    if (distFromLastObs > GAME_CONFIG.MIN_OBSTACLE_GAP) {
        if (Math.random() < GAME_CONFIG.OBSTACLE_SPAWN_CHANCE) {
            spawnObstacle();
        }
    }

    // Spawn collectibles - IMPROVED LOGIC
    const distFromLastCol = canvasWidth - GameState.lastCollectibleX;
    const currentTime = Date.now();

    // Regular spawn chance
    if (distFromLastCol > GAME_CONFIG.MIN_COLLECTIBLE_GAP) {
        if (Math.random() < GAME_CONFIG.COLLECTIBLE_SPAWN_CHANCE) {
            spawnCollectible();
        }
    }

    // GUARANTEED SPAWN - Force spawn if too long without collectibles
    if (currentTime - GameState.lastGuaranteedSpawn > GAME_CONFIG.GUARANTEED_SPAWN_INTERVAL) {
        if (GameState.collectibles.length < 3 && GameState.itemsCollected < GAME_CONFIG.ITEMS_TO_WIN) {
            spawnCollectible();
            GameState.lastGuaranteedSpawn = currentTime;
        }
    }

    // Extra spawn if screen is empty
    if (GameState.collectibles.length === 0 && GameState.itemsCollected < GAME_CONFIG.ITEMS_TO_WIN) {
        spawnCollectible();
        spawnCollectible(); // Spawn two!
        GameState.lastGuaranteedSpawn = currentTime;
    }
}

function renderObstacles() {
    GameState.obstacles.forEach(obs => {
        const img = AssetCache.get(`obstacle_${obs.type}`);
        if (img) {
            ctx.drawImage(img, Math.floor(obs.x), Math.floor(obs.y), obs.width, obs.height);
        }
    });
}

function renderCollectibles() {
    GameState.collectibles.forEach(col => {
        const img = AssetCache.get(`collectible_${col.type}`);
        if (!img) return;

        const bobY = Math.sin(col.bobOffset) * 6;

        ctx.save();

        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10 + Math.sin(col.bobOffset * 2) * 5;

        ctx.drawImage(
            img,
            Math.floor(col.x),
            Math.floor(col.y + bobY),
            col.width,
            col.height
        );

        ctx.restore();
    });
}

// ============================================
// COLLISION DETECTION
// ============================================

function checkCollisions() {
    const player = GameState.player;
    const playerBox = {
        x: player.x + 8,
        y: player.y + 4,
        width: PLAYER_CONFIG.width - 16,
        height: PLAYER_CONFIG.height - 8
    };

    // Check obstacle collisions
    if (!player.isStumbling) {
        for (const obs of GameState.obstacles) {
            const obsBox = {
                x: obs.x + obs.hitboxPadding,
                y: obs.y + obs.hitboxPadding,
                width: obs.width - obs.hitboxPadding * 2,
                height: obs.height - obs.hitboxPadding * 2
            };

            if (boxIntersect(playerBox, obsBox)) {
                player.isStumbling = true;
                player.stumbleEndTime = Date.now() + GAME_CONFIG.STUMBLE_DURATION;
                AudioManager.playStumble();
                break;
            }
        }
    }

    // Check collectible collisions
    for (const col of GameState.collectibles) {
        if (col.collected) continue;

        const bobY = Math.sin(col.bobOffset) * 6;
        const colBox = {
            x: col.x - GAME_CONFIG.COLLECTIBLE_HITBOX_PADDING,
            y: col.y + bobY - GAME_CONFIG.COLLECTIBLE_HITBOX_PADDING,
            width: col.width + GAME_CONFIG.COLLECTIBLE_HITBOX_PADDING * 2,
            height: col.height + GAME_CONFIG.COLLECTIBLE_HITBOX_PADDING * 2
        };

        if (boxIntersect(playerBox, colBox)) {
            col.collected = true;
            GameState.itemsCollected += col.points;

            // Different sounds for different items
            if (col.type === 'trophy' || col.type === 'mascotHoosier') {
                AudioManager.playTrophy();
            } else {
                AudioManager.playCollect();
            }

            showCollectPopup(col.x, col.y + bobY, col.points);

            if (GameState.itemsCollected >= GAME_CONFIG.ITEMS_TO_WIN) {
                triggerWin();
            }
        }
    }
}

function boxIntersect(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function showCollectPopup(x, y, points) {
    const popup = document.createElement('div');
    popup.className = 'collect-popup';
    popup.textContent = `+${points}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.fontFamily = 'monospace';

    document.getElementById('game-container').appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

// ============================================
// WIN CONDITION
// ============================================

function triggerWin() {
    GameState.isRunning = false;
    GameState.hasWon = true;

    localStorage.setItem('campusRunCompleted', 'true');
    AudioManager.playVictory();

    setTimeout(() => {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('win-screen').classList.remove('hidden');
        createConfetti();
    }, 500);
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#990000', '#FFD700', '#FFFFFF', '#4A7C23', '#87CEEB', '#FF6600'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            confetti.style.width = `${8 + Math.random() * 8}px`;
            confetti.style.height = `${8 + Math.random() * 8}px`;

            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 25);
    }
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop(timestamp) {
    if (!GameState.isRunning) return;

    if (!GameState.lastFrameTime) GameState.lastFrameTime = timestamp;
    GameState.deltaTime = timestamp - GameState.lastFrameTime;
    GameState.lastFrameTime = timestamp;
    GameState.gameTime += GameState.deltaTime;

    if (GameState.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Speed increase
    if (GameState.gameTime - GameState.lastSpeedIncrease > GAME_CONFIG.SPEED_INCREASE_INTERVAL) {
        GameState.speedMultiplier = Math.min(
            GameState.speedMultiplier * GAME_CONFIG.SPEED_INCREASE_MULTIPLIER,
            GAME_CONFIG.MAX_SPEED_MULTIPLIER
        );
        GameState.lastSpeedIncrease = GameState.gameTime;
    }

    GameState.currentSpeed = GAME_CONFIG.INITIAL_SPEED * GameState.speedMultiplier;

    // Update
    updateParallax(GameState.currentSpeed);
    updatePlayer();
    updateObstaclesAndCollectibles(GameState.currentSpeed);
    checkCollisions();

    GameState.distance += GameState.currentSpeed * 0.1;

    // Render
    render();
    updateHUD();

    requestAnimationFrame(gameLoop);
}

function render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    renderBackgrounds();
    renderCollectibles();
    renderObstacles();
    renderPlayer();

    // City indicator
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '12px monospace';
    ctx.fillText(`📍 ${getCurrentCity().toUpperCase()}`, 10, canvasHeight - 20);
}

function updateHUD() {
    document.getElementById('bottle-count').textContent =
        `Items: ${GameState.itemsCollected}/${GAME_CONFIG.ITEMS_TO_WIN}`;
    document.getElementById('distance').textContent =
        `Distance: ${Math.floor(GameState.distance)}m`;
}

// ============================================
// GAME CONTROLS
// ============================================

function togglePause() {
    if (!GameState.isRunning) return;
    GameState.isPaused = !GameState.isPaused;
    document.getElementById('pause-overlay').classList.toggle('hidden', !GameState.isPaused);
}

async function startGame() {
    AudioManager.init();
    GameState.reset();

    initBackgrounds();

    GameState.player.y = groundY - PLAYER_CONFIG.height;
    GameState.lastObstacleX = 0;
    GameState.lastCollectibleX = 0;
    GameState.lastGuaranteedSpawn = Date.now();

    // Pre-spawn some collectibles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (GameState.isRunning) spawnCollectible();
        }, 500 + i * 800);
    }

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    GameState.isRunning = true;
    GameState.lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
}

function resetToStart() {
    GameState.reset();

    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('confetti-container').innerHTML = '';

    updateSkipLink();
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', startGame);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            playerJump();
        }
        if (e.code === 'Escape') {
            togglePause();
        }
    });

    document.getElementById('game-canvas').addEventListener('click', playerJump);
    document.getElementById('game-canvas').addEventListener('touchstart', (e) => {
        e.preventDefault();
        playerJump();
    });

    document.getElementById('mute-btn').addEventListener('click', () => {
        const isMuted = AudioManager.toggleMute();
        document.getElementById('sound-icon').textContent = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('pause-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'pause-overlay') togglePause();
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('win-screen').classList.add('hidden');
        document.getElementById('confetti-container').innerHTML = '';
        startGame();
    });

    document.getElementById('continue-btn').addEventListener('click', () => {
        alert('Redirecting to the main invitation site...\nCode: ' + GAME_CONFIG.INVITATION_CODE);
    });

    document.getElementById('copy-code-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(GAME_CONFIG.INVITATION_CODE).then(() => {
            const btn = document.getElementById('copy-code-btn');
            btn.textContent = '✓';
            setTimeout(() => { btn.textContent = '📋'; }, 2000);
        });
    });

    document.getElementById('skip-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('win-screen').classList.remove('hidden');
        createConfetti();
    });

    document.addEventListener('touchmove', (e) => {
        if (GameState.isRunning) e.preventDefault();
    }, { passive: false });
}

function updateSkipLink() {
    const completed = localStorage.getItem('campusRunCompleted');
    const skipLink = document.getElementById('skip-link');
    skipLink.classList.toggle('hidden', completed !== 'true');
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('Campus Run 16-bit: Initializing...');

    initCanvas();
    await AssetCache.preloadAll();
    setupEventListeners();
    updateSkipLink();

    document.getElementById('invitation-code').textContent = GAME_CONFIG.INVITATION_CODE;

    console.log('Campus Run 16-bit: Ready!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
