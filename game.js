// Configuration
const CONFIG = {
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

// Car color for player
const CAR_COLOR = '#FF4444';

// Game State
class GameState {
    constructor() {
        this.screen = 'lobby';
        this.playerId = this.generateId();
        this.playerName = '';
        this.gameStarted = false;
        this.raceStartTime = null;
        this.wordsTyped = 0;
        this.currentWord = '';
        this.raceFinished = false;
        this.finishTime = null;
        this.wordLength = 'random';
        this.filteredWords = [];
        this.wpm = 0;
        this.progress = 0;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

const gameState = new GameState();

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 940;
canvas.height = 50;

// DOM Elements
const screens = {
    lobby: document.getElementById('lobbyScreen'),
    game: document.getElementById('gameScreen'),
    results: document.getElementById('resultsScreen')
};

const elements = {
    playerName: document.getElementById('playerName'),
    startGame: document.getElementById('startGame'),
    wordLength: document.getElementById('wordLength'),
    countdown: document.getElementById('countdown'),
    position: document.getElementById('position'),
    targetWord: document.getElementById('targetWord'),
    typingInput: document.getElementById('typingInput'),
    resultsList: document.getElementById('resultsList'),
    playAgain: document.getElementById('playAgain'),
    backToLobby: document.getElementById('backToLobby'),
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage'),
    closeModal: document.getElementById('closeModal')
};

// Modal functions
function showErrorModal(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.remove('hidden');
}

function closeErrorModal() {
    elements.errorModal.classList.add('hidden');
}

// Screen Management
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    gameState.screen = screenName;
}

// Game Logic
function startGame() {
    const name = elements.playerName.value.trim();
    if (!name) {
        showErrorModal('Please enter your name');
        return;
    }

    gameState.playerName = name;
    gameState.wordLength = elements.wordLength.value;
    
    gameState.gameStarted = true;
    gameState.wordsTyped = 0;
    gameState.raceFinished = false;
    gameState.progress = 0;
    gameState.finishTime = null;
    
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
    gameState.wpm = 0;
    elements.typingInput.disabled = false;
    elements.typingInput.focus();
    elements.position.textContent = '0 WPM';
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
        
        // Update progress
        gameState.progress = (gameState.wordsTyped / CONFIG.raceLength) * 100;
        
        if (gameState.progress >= 100) {
            finishRace();
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
    if (!gameState.raceFinished) {
        gameState.raceFinished = true;
        gameState.finishTime = Date.now() - gameState.raceStartTime;
        gameState.progress = 100;
        
        elements.typingInput.disabled = true;
        
        // Show results after a short delay
        setTimeout(() => {
            showResults();
        }, 2000);
    }
}

function updateProgress() {
    // Calculate WPM (Words Per Minute)
    if (gameState.raceStartTime && gameState.wordsTyped > 0) {
        const timeElapsed = (Date.now() - gameState.raceStartTime) / 1000 / 60; // in minutes
        gameState.wpm = Math.round(gameState.wordsTyped / timeElapsed);
        elements.position.textContent = gameState.wpm + ' WPM';
    } else {
        elements.position.textContent = '0 WPM';
    }
}

function drawRacetrack() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Single track lane
    const laneHeight = canvas.height;
    const y = 0;
    
    // Lane background
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, y, canvas.width, laneHeight);
    
    // Lane lines (top and bottom)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Start line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30, y + 5, 3, laneHeight - 10);
    
    // Finish line
    const checkeredHeight = laneHeight / 5;
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(canvas.width - 40, y + i * checkeredHeight, 30, checkeredHeight);
    }
    
    // Draw car
    const carX = 40 + (gameState.progress / 100) * (canvas.width - 100);
    const carY = laneHeight / 2;
    
    drawCar(carX, carY, CAR_COLOR);
    
    // Player name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(gameState.playerName, 10, 25);
    
    // Progress percentage
    ctx.textAlign = 'right';
    ctx.fillText(Math.floor(gameState.progress) + '%', canvas.width - 10, 25);
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
    
    elements.resultsList.innerHTML = '';
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';
    
    const finalWPM = gameState.wpm;
    const timeSeconds = (gameState.finishTime / 1000).toFixed(2);
    
    resultDiv.innerHTML = `
        <div class="rank first">🥇 1</div>
        <div class="player-name">${gameState.playerName}</div>
        <div class="time">${timeSeconds}s (${finalWPM} WPM)</div>
    `;
    
    elements.resultsList.appendChild(resultDiv);
}

function playAgain() {
    startGame();
}

function backToLobby() {
    gameState.gameStarted = false;
    showScreen('lobby');
}

// Event Listeners
elements.startGame.addEventListener('click', startGame);
elements.playAgain.addEventListener('click', playAgain);
elements.closeModal.addEventListener('click', closeErrorModal);
elements.backToLobby.addEventListener('click', backToLobby);

elements.typingInput.addEventListener('input', checkTyping);

elements.playerName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

// Initialize
showScreen('lobby');
