// Configuration
const CONFIG = {
    maxPlayers: 8,
    raceLength: 25, // Number of words to type
    countdownSeconds: 3
};

// Word list for typing (organized by length for filtering)
const WORDS = [
    // 3 letters
    'car', 'win', 'lap', 'rpm', 'top', 'run', 'gas', 'go', 'max', 'rev',
    // 4 letters
    'race', 'fast', 'zoom', 'dash', 'lead', 'apex', 'gear', 'burn', 'flip', 'jump',
    'skid', 'turn', 'push', 'grip', 'flag', 'time', 'mile', 'drag', 'spin', 'fuel',
    // 5 letters
    'speed', 'drive', 'track', 'boost', 'turbo', 'power', 'brake', 'nitro', 'rapid',
    'swift', 'quick', 'flash', 'racer', 'motor', 'wheel', 'steer', 'shift', 'drift',
    'coupe', 'rally', 'curve', 'start', 'grand', 'super', 'ultra', 'hyper', 'first',
    // 6 letters
    'finish', 'winner', 'engine', 'wheels', 'streak', 'corner', 'racing', 'driver',
    'turbo', 'trophy', 'battle', 'street', 'custom', 'legend', 'master', 'rocket',
    'speedy', 'ground', 'vector', 'thrust', 'cruise', 'sprint', 'octane', 'charge',
    // 7 letters
    'champion', 'victory', 'compete', 'circuit', 'vehicle', 'maximum', 'blaster',
    'cruiser', 'roadway', 'supreme', 'extreme', 'turbine', 'pursuit', 'dragster',
    'machine', 'formula', 'gearbox', 'horsepower', 'highway', 'special', 'perfect',
    // 8 letters
    'throttle', 'steering', 'overtake', 'straight', 'position', 'ultimate', 'velocity',
    'burnout', 'powerful', 'champion', 'aeroport', 'freeway', 'velocity', 'momentum',
    'overdrive', 'manifold', 'traction', 'velocity', 'cylinder', 'dominat', 'champion',
    // 9 letters
    'challenge', 'adrenaline', 'motorsport', 'spectacle', 'precision', 'lightning',
    'scramble', 'dominance', 'explosive', 'adventure', 'excellence', 'supremacy',
    // 10 letters
    'accelerate', 'automobile', 'competition', 'performance', 'challenger', 'combustion',
    'tournament', 'checkpoint', 'supercharg', 'horsepower', 'incredible', 'phenomenal'
];

// Car colors for players
const CAR_COLORS = [
    '#FF4444', '#4444FF', '#44FF44', '#FFFF44', 
    '#FF44FF', '#44FFFF', '#FF8844', '#8844FF'
];

// Game State
class GameState {
    constructor() {
        this.screen = 'lobby';
        this.roomCode = null;
        this.playerId = this.generateId();
        this.playerName = '';
        this.isHost = false;
        this.players = new Map();
        this.gameStarted = false;
        this.raceStartTime = null;
        this.wordsTyped = 0;
        this.currentWord = '';
        this.raceFinished = false;
        this.finishTimes = [];
        this.wordLength = 'random';
        this.filteredWords = [];
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
}

const gameState = new GameState();

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 940;
canvas.height = 400;

// DOM Elements
const screens = {
    lobby: document.getElementById('lobbyScreen'),
    waiting: document.getElementById('waitingRoom'),
    game: document.getElementById('gameScreen'),
    results: document.getElementById('resultsScreen')
};

const elements = {
    playerName: document.getElementById('playerName'),
    roomCode: document.getElementById('roomCode'),
    createRoom: document.getElementById('createRoom'),
    joinRoom: document.getElementById('joinRoom'),
    displayRoomCode: document.getElementById('displayRoomCode'),
    playerCount: document.getElementById('playerCount'),
    playerList: document.getElementById('playerList'),
    startGame: document.getElementById('startGame'),
    leaveRoom: document.getElementById('leaveRoom'),
    wordLength: document.getElementById('wordLength'),
    countdown: document.getElementById('countdown'),
    position: document.getElementById('position'),
    targetWord: document.getElementById('targetWord'),
    typingInput: document.getElementById('typingInput'),
    progressFill: document.getElementById('progressFill'),
    resultsList: document.getElementById('resultsList'),
    playAgain: document.getElementById('playAgain'),
    backToLobby: document.getElementById('backToLobby')
};

// Screen Management
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    gameState.screen = screenName;
}

// Room Management
function createRoom() {
    const name = elements.playerName.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }

    gameState.playerName = name;
    gameState.roomCode = gameState.generateRoomCode();
    gameState.isHost = true;
    
    // Add self as first player
    gameState.players.set(gameState.playerId, {
        id: gameState.playerId,
        name: gameState.playerName,
        isHost: true,
        progress: 0,
        position: 1,
        finished: false,
        finishTime: null
    });

    elements.displayRoomCode.textContent = gameState.roomCode;
    updatePlayerList();
    showScreen('waiting');
}

function joinRoom() {
    const name = elements.playerName.value.trim();
    const code = elements.roomCode.value.trim().toUpperCase();
    
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    if (!code) {
        alert('Please enter a room code');
        return;
    }

    gameState.playerName = name;
    gameState.roomCode = code;
    gameState.isHost = false;
    
    // In a real multiplayer game, this would connect to a server
    // For this demo, we'll simulate it
    alert('In a real implementation, this would connect to the server.\nFor this demo, multiple players would need to share the same browser session.');
    
    // Add self as player
    gameState.players.set(gameState.playerId, {
        id: gameState.playerId,
        name: gameState.playerName,
        isHost: false,
        progress: 0,
        position: 1,
        finished: false,
        finishTime: null
    });

    elements.displayRoomCode.textContent = gameState.roomCode;
    updatePlayerList();
    showScreen('waiting');
}

function leaveRoom() {
    gameState.players.clear();
    gameState.roomCode = null;
    gameState.isHost = false;
    showScreen('lobby');
}

function updatePlayerList() {
    elements.playerCount.textContent = gameState.players.size;
    elements.playerList.innerHTML = '';
    
    gameState.players.forEach((player, id) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        
        const colorIndex = Array.from(gameState.players.keys()).indexOf(id);
        playerDiv.style.borderLeftColor = CAR_COLORS[colorIndex % CAR_COLORS.length];
        
        playerDiv.innerHTML = `
            <div class="player-name">${player.name}</div>
            ${player.isHost ? '<div class="host-badge">HOST</div>' : ''}
        `;
        
        elements.playerList.appendChild(playerDiv);
    });
    
    // Only host can start the game
    if (gameState.isHost) {
        elements.startGame.style.display = 'block';
        elements.startGame.disabled = gameState.players.size < 1;
    } else {
        elements.startGame.style.display = 'none';
    }
}

// Game Logic
function startGame() {
    gameState.gameStarted = true;
    gameState.wordsTyped = 0;
    gameState.raceFinished = false;
    gameState.finishTimes = [];
    
    // Get selected word length
    gameState.wordLength = elements.wordLength.value;
    
    // Filter words based on selected length
    if (gameState.wordLength === 'random') {
        gameState.filteredWords = [...WORDS];
    } else {
        const targetLength = parseInt(gameState.wordLength);
        gameState.filteredWords = WORDS.filter(word => word.length === targetLength);
        
        // Fallback to all words if no words match the selected length
        if (gameState.filteredWords.length === 0) {
            gameState.filteredWords = [...WORDS];
        }
    }
    
    // Reset all players
    gameState.players.forEach(player => {
        player.progress = 0;
        player.position = 1;
        player.finished = false;
        player.finishTime = null;
    });
    
    showScreen('game');
    startCountdown();
}

function startCountdown() {
    let count = CONFIG.countdownSeconds;
    elements.countdown.textContent = count;
    elements.typingInput.disabled = true;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            elements.countdown.textContent = count;
        } else if (count === 0) {
            elements.countdown.textContent = 'GO!';
        } else {
            clearInterval(countdownInterval);
            elements.countdown.textContent = '';
            startRace();
        }
    }, 1000);
}

function startRace() {
    gameState.raceStartTime = Date.now();
    elements.typingInput.disabled = false;
    elements.typingInput.focus();
    nextWord();
    requestAnimationFrame(gameLoop);
}

function nextWord() {
    const wordList = gameState.filteredWords.length > 0 ? gameState.filteredWords : WORDS;
    gameState.currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    elements.targetWord.textContent = gameState.currentWord;
    elements.typingInput.value = '';
    elements.typingInput.className = 'typing-input';
}

function checkTyping() {
    const typed = elements.typingInput.value.trim().toLowerCase();
    const target = gameState.currentWord.toLowerCase();
    
    if (typed === target) {
        elements.typingInput.className = 'typing-input correct';
        gameState.wordsTyped++;
        
        // Update player progress
        const player = gameState.players.get(gameState.playerId);
        if (player && !player.finished) {
            player.progress = (gameState.wordsTyped / CONFIG.raceLength) * 100;
            
            if (player.progress >= 100) {
                finishRace();
            }
        }
        
        setTimeout(nextWord, 300);
    } else if (gameState.currentWord.toLowerCase().startsWith(typed)) {
        elements.typingInput.className = 'typing-input';
    } else {
        elements.typingInput.className = 'typing-input incorrect';
    }
    
    updateProgress();
}

function finishRace() {
    const player = gameState.players.get(gameState.playerId);
    if (player && !player.finished) {
        player.finished = true;
        player.finishTime = Date.now() - gameState.raceStartTime;
        player.progress = 100;
        
        gameState.finishTimes.push({
            playerId: player.id,
            name: player.name,
            time: player.finishTime
        });
        
        elements.typingInput.disabled = true;
        gameState.raceFinished = true;
        
        // Show results after a short delay
        setTimeout(() => {
            showResults();
        }, 2000);
    }
}

function updateProgress() {
    const player = gameState.players.get(gameState.playerId);
    if (player) {
        elements.progressFill.style.width = player.progress + '%';
        
        // Calculate position
        const positions = Array.from(gameState.players.values())
            .sort((a, b) => b.progress - a.progress);
        player.position = positions.findIndex(p => p.id === player.id) + 1;
        
        elements.position.textContent = `${player.position}/${gameState.players.size}`;
    }
}

function drawRacetrack() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Track lanes
    const laneHeight = canvas.height / CONFIG.maxPlayers;
    const playerArray = Array.from(gameState.players.values());
    
    playerArray.forEach((player, index) => {
        const y = index * laneHeight;
        
        // Lane background (alternating colors)
        ctx.fillStyle = index % 2 === 0 ? '#404040' : '#4a4a4a';
        ctx.fillRect(0, y, canvas.width, laneHeight);
        
        // Lane lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Start line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(30, y + 5, 3, laneHeight - 10);
        
        // Finish line
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
            ctx.fillRect(canvas.width - 40, y + i * (laneHeight / 5), 30, laneHeight / 5);
        }
        
        // Draw car
        const carX = 40 + (player.progress / 100) * (canvas.width - 100);
        const carY = y + laneHeight / 2;
        const carIndex = Array.from(gameState.players.keys()).indexOf(player.id);
        
        drawCar(carX, carY, CAR_COLORS[carIndex % CAR_COLORS.length]);
        
        // Player name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(player.name, 5, y + 20);
        
        // Progress percentage
        ctx.textAlign = 'right';
        ctx.fillText(Math.floor(player.progress) + '%', canvas.width - 5, y + 20);
    });
}

function drawCar(x, y, color) {
    ctx.save();
    
    // Shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x - 18, y + 10, 38, 4);
    
    // Darken the color for shading
    const darkerColor = darkenColor(color, 0.7);
    const lighterColor = lightenColor(color, 1.3);
    
    // Rear spoiler
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 18, y - 10, 3, 8);
    ctx.fillRect(x - 20, y - 12, 7, 2);
    
    // Main car body (sleek racing design)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 8);
    ctx.lineTo(x - 12, y - 2);
    ctx.lineTo(x - 8, y - 8);
    ctx.lineTo(x + 10, y - 8);
    ctx.lineTo(x + 18, y - 2);
    ctx.lineTo(x + 18, y + 8);
    ctx.closePath();
    ctx.fill();
    
    // Darker bottom edge
    ctx.fillStyle = darkerColor;
    ctx.fillRect(x - 15, y + 6, 33, 2);
    
    // Car side detail (racing stripe)
    ctx.fillStyle = lighterColor;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 1);
    ctx.lineTo(x + 14, y - 1);
    ctx.lineTo(x + 15, y + 2);
    ctx.lineTo(x - 10, y + 2);
    ctx.closePath();
    ctx.fill();
    
    // Hood/front detail
    ctx.fillStyle = lighterColor;
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 8);
    ctx.lineTo(x + 18, y - 2);
    ctx.lineTo(x + 16, y - 4);
    ctx.lineTo(x + 12, y - 8);
    ctx.closePath();
    ctx.fill();
    
    // Windshield (front)
    ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 8);
    ctx.lineTo(x + 10, y - 8);
    ctx.lineTo(x + 12, y - 4);
    ctx.lineTo(x + 6, y - 4);
    ctx.closePath();
    ctx.fill();
    
    // Windshield highlight
    ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x + 5, y - 7.5);
    ctx.lineTo(x + 9, y - 7.5);
    ctx.lineTo(x + 10, y - 5);
    ctx.lineTo(x + 6, y - 5);
    ctx.closePath();
    ctx.fill();
    
    // Side window
    ctx.fillStyle = 'rgba(80, 150, 220, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6);
    ctx.lineTo(x + 2, y - 6);
    ctx.lineTo(x + 4, y - 3);
    ctx.lineTo(x - 2, y - 3);
    ctx.closePath();
    ctx.fill();
    
    // Wheels (more detailed with rims)
    // Rear wheel
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x - 8, y + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Rear rim
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.arc(x - 8, y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Rear rim spokes
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 8);
        ctx.lineTo(x - 8 + Math.cos(angle) * 2.5, y + 8 + Math.sin(angle) * 2.5);
        ctx.stroke();
    }
    
    // Front wheel
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 10, y + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Front rim
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.arc(x + 10, y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Front rim spokes
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 8);
        ctx.lineTo(x + 10 + Math.cos(angle) * 2.5, y + 8 + Math.sin(angle) * 2.5);
        ctx.stroke();
    }
    
    // Headlights
    ctx.fillStyle = '#FFFF99';
    ctx.fillRect(x + 16, y - 1, 2, 2);
    ctx.fillRect(x + 16, y + 4, 2, 2);
    
    // Headlight glow
    ctx.fillStyle = 'rgba(255, 255, 150, 0.3)';
    ctx.fillRect(x + 18, y - 1, 3, 2);
    ctx.fillRect(x + 18, y + 4, 3, 2);
    
    // Tail lights
    ctx.fillStyle = '#FF3333';
    ctx.fillRect(x - 16, y + 1, 2, 2);
    ctx.fillRect(x - 16, y + 5, 2, 2);
    
    // Air intake/grille detail
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 14, y + 1, 2, 5);
    
    // Racing number (small)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('1', x + 2, y + 2);
    
    ctx.restore();
}

// Helper function to darken a color
function darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to lighten a color
function lightenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
    const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
    const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
    return `rgb(${r}, ${g}, ${b})`;
}

function gameLoop() {
    if (gameState.screen === 'game' && !gameState.raceFinished) {
        drawRacetrack();
        requestAnimationFrame(gameLoop);
    }
}

function showResults() {
    showScreen('results');
    
    // Sort by finish time
    const sortedResults = gameState.finishTimes.sort((a, b) => a.time - b.time);
    
    elements.resultsList.innerHTML = '';
    
    sortedResults.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        
        const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        resultDiv.innerHTML = `
            <div class="rank ${rankClass}">${medal} ${index + 1}</div>
            <div class="player-name">${result.name}</div>
            <div class="time">${(result.time / 1000).toFixed(2)}s</div>
        `;
        
        elements.resultsList.appendChild(resultDiv);
    });
    
    // Show players who didn't finish
    gameState.players.forEach(player => {
        if (!player.finished) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            resultDiv.innerHTML = `
                <div class="rank">-</div>
                <div class="player-name">${player.name}</div>
                <div class="time">DNF</div>
            `;
            elements.resultsList.appendChild(resultDiv);
        }
    });
}

function playAgain() {
    startGame();
}

function backToLobby() {
    gameState.players.clear();
    gameState.roomCode = null;
    gameState.isHost = false;
    gameState.gameStarted = false;
    showScreen('lobby');
}

// Event Listeners
elements.createRoom.addEventListener('click', createRoom);
elements.joinRoom.addEventListener('click', joinRoom);
elements.startGame.addEventListener('click', startGame);
elements.leaveRoom.addEventListener('click', leaveRoom);
elements.playAgain.addEventListener('click', playAgain);
elements.backToLobby.addEventListener('click', backToLobby);

elements.typingInput.addEventListener('input', checkTyping);

elements.playerName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createRoom();
    }
});

elements.roomCode.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
});

// Initialize
showScreen('lobby');
