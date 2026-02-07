// Game Constants
const GRID_SIZE = 48;
const FIREWALL_COUNT = 8;
const SYMBOLS = ['◆', '▲', '●', '■', '★', '✦', '◈', '◉'];

// XP Curve Configuration
const XP_CURVE = {
  baseXP: 100,
  exponent: 1.5,
  calculateXPForLevel: (level) => {
    return Math.floor(XP_CURVE.baseXP * Math.pow(level, XP_CURVE.exponent));
  }
};

// Player Profile (Persistent)
class PlayerProfile {
  constructor() {
    this.load();
  }

  load() {
    const saved = localStorage.getItem('cyberBreachProfile');
    if (saved) {
      const data = JSON.parse(saved);
      this.level = data.level || 1;
      this.totalXP = data.totalXP || 0;
      this.currentLevelXP = data.currentLevelXP || 0;
      this.highScore = data.highScore || 0;
      this.totalGames = data.totalGames || 0;
      this.gamesWon = data.gamesWon || 0;
      this.bestCombo = data.bestCombo || 0;
      this.fastestWin = data.fastestWin || null;
      this.totalNodesHacked = data.totalNodesHacked || 0;
    } else {
      this.reset();
    }
  }

  reset() {
    this.level = 1;
    this.totalXP = 0;
    this.currentLevelXP = 0;
    this.highScore = 0;
    this.totalGames = 0;
    this.gamesWon = 0;
    this.bestCombo = 0;
    this.fastestWin = null;
    this.totalNodesHacked = 0;
  }

  save() {
    localStorage.setItem('cyberBreachProfile', JSON.stringify({
      level: this.level,
      totalXP: this.totalXP,
      currentLevelXP: this.currentLevelXP,
      highScore: this.highScore,
      totalGames: this.totalGames,
      gamesWon: this.gamesWon,
      bestCombo: this.bestCombo,
      fastestWin: this.fastestWin,
      totalNodesHacked: this.totalNodesHacked
    }));
    
    // Save to cloud if user is logged in
    if (typeof window.saveProfileToCloud === 'function') {
      window.saveProfileToCloud();
    }
  }

  getXPNeeded() {
    return XP_CURVE.calculateXPForLevel(this.level);
  }

  addXP(amount) {
    this.totalXP += amount;
    this.currentLevelXP += amount;
    
    const levelsGained = [];
    let xpNeeded = this.getXPNeeded();
    
    while (this.currentLevelXP >= xpNeeded) {
      this.currentLevelXP -= xpNeeded;
      this.level++;
      levelsGained.push(this.level);
      xpNeeded = this.getXPNeeded();
    }
    
    this.save();
    return levelsGained;
  }

  updateStats(gameData) {
    this.totalGames++;
    if (gameData.won) this.gamesWon++;
    if (gameData.score > this.highScore) this.highScore = gameData.score;
    if (gameData.combo > this.bestCombo) this.bestCombo = gameData.combo;
    if (gameData.won && (!this.fastestWin || gameData.time < this.fastestWin)) {
      this.fastestWin = gameData.time;
    }
    this.totalNodesHacked += gameData.nodesHacked;
    this.save();
  }
}

// Game State
let profile = new PlayerProfile();
let gameState = {
  score: 0,
  moves: 0,
  sessionXP: 0,
  timeStarted: null,
  timerInterval: null,
  activeNode: null,
  hackedNodes: new Set(),
  firewallNodes: new Set(),
  valuableNodes: new Set(),
  gameStarted: false,
  combo: 0,
  maxCombo: 0
};

let hackSequence = {
  pattern: [],
  input: [],
  timeLimit: 8000,
  startTime: null,
  timerInterval: null,
  pendingNode: null,
  pendingElement: null,
  difficulty: 3
};

// DOM Elements
const grid = document.getElementById('grid');
const terminal = document.getElementById('terminal');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const sessionXPEl = document.getElementById('sessionXP');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progressText');
const victory = document.getElementById('victory');
const hackModal = document.getElementById('hackModal');
const statsModal = document.getElementById('statsModal');

// Profile UI Elements
const playerLevelEl = document.getElementById('playerLevel');
const totalXPEl = document.getElementById('totalXP');
const highScoreEl = document.getElementById('highScore');
const globalXPBar = document.getElementById('globalXPBar');
const globalXPBarText = document.getElementById('globalXPBarText');

// Initialize UI
function updateProfileUI() {
  playerLevelEl.textContent = profile.level;
  totalXPEl.textContent = profile.totalXP;
  highScoreEl.textContent = profile.highScore;
  
  const xpNeeded = profile.getXPNeeded();
  const percentage = (profile.currentLevelXP / xpNeeded) * 100;
  globalXPBar.style.width = percentage + '%';
  globalXPBarText.textContent = `Level ${profile.level} - ${profile.currentLevelXP} / ${xpNeeded} XP`;
}

// Initialize grid with procedural generation
function initGrid() {
  grid.innerHTML = '';
  gameState.hackedNodes.clear();
  gameState.firewallNodes.clear();
  gameState.valuableNodes.clear();
  
  while (gameState.firewallNodes.size < FIREWALL_COUNT) {
    gameState.firewallNodes.add(Math.floor(Math.random() * GRID_SIZE));
  }

  const valuableCount = 6;
  while (gameState.valuableNodes.size < valuableCount) {
    const index = Math.floor(Math.random() * GRID_SIZE);
    if (!gameState.firewallNodes.has(index)) {
      gameState.valuableNodes.add(index);
    }
  }
  
  for (let i = 0; i < GRID_SIZE; i++) {
    const node = document.createElement('div');
    node.className = 'node';
    node.dataset.index = i;
    
    // Add inner elements for decoration
    const inner = document.createElement('div');
    inner.className = 'node-inner';
    
    const core = document.createElement('div');
    core.className = 'node-core';
    
    const pulse = document.createElement('div');
    pulse.className = 'node-pulse';
    
    if (gameState.firewallNodes.has(i)) {
      node.classList.add('firewall');
      // Add firewall icon
      const icon = document.createElement('div');
      icon.className = 'node-icon';
      icon.textContent = '⚠';
      inner.appendChild(icon);
    } else if (gameState.valuableNodes.has(i)) {
      node.classList.add('type-valuable');
      // Add valuable icon
      const icon = document.createElement('div');
      icon.className = 'node-icon';
      icon.textContent = '◆';
      inner.appendChild(icon);
    } else {
      // Random node types for variety
      const rand = Math.random();
      if (rand < 0.2) {
        node.classList.add('type-secure');
        const icon = document.createElement('div');
        icon.className = 'node-icon';
        icon.textContent = '●';
        inner.appendChild(icon);
      } else if (rand < 0.4) {
        node.classList.add('type-data');
        const icon = document.createElement('div');
        icon.className = 'node-icon';
        icon.textContent = '■';
        inner.appendChild(icon);
      } else if (rand < 0.6) {
        node.classList.add('type-network');
        const icon = document.createElement('div');
        icon.className = 'node-icon';
        icon.textContent = '▲';
        inner.appendChild(icon);
      } else {
        node.classList.add('type-standard');
        const icon = document.createElement('div');
        icon.className = 'node-icon';
        icon.textContent = '○';
        inner.appendChild(icon);
      }
    }
    
    inner.appendChild(core);
    inner.appendChild(pulse);
    node.appendChild(inner);
    
    node.addEventListener('click', () => handleNodeClick(i, node));
    grid.appendChild(node);
  }
}

// Handle node click
function handleNodeClick(index, nodeElement) {
  if (!gameState.gameStarted) {
    addLog('> BREACH NOT INITIATED. START THE GAME FIRST.', 'error');
    return;
  }

  if (gameState.hackedNodes.has(index)) {
    addLog('> NODE ALREADY COMPROMISED', 'error');
    return;
  }

  if (gameState.firewallNodes.has(index)) {
    addLog(`> FIREWALL DETECTED AT NODE ${index}! -50 POINTS`, 'error');
    gameState.score = Math.max(0, gameState.score - 50);
    gameState.combo = 0;
    comboEl.textContent = 'x0';
    createParticles(nodeElement, '#ff0000');
    scoreEl.textContent = gameState.score;
    if (window.audio) window.audio.playFirewallHit();
    return;
  }

  if (window.audio) window.audio.playNodeClick();
  startHackSequence(index, nodeElement);
}

// Start hack sequence
function startHackSequence(index, nodeElement) {
  hackSequence.pendingNode = index;
  hackSequence.pendingElement = nodeElement;
  hackSequence.difficulty = Math.min(3 + Math.floor(gameState.combo / 3), 7);
  
  hackSequence.pattern = [];
  for (let i = 0; i < hackSequence.difficulty; i++) {
    hackSequence.pattern.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }
  hackSequence.input = [];
  
  hackModal.classList.add('show');
  displayPattern();
  createInputGrid();
  updateHackProgress();
  
  hackSequence.startTime = Date.now();
  const timerFill = document.getElementById('hackTimer');
  
  hackSequence.timerInterval = setInterval(() => {
    const elapsed = Date.now() - hackSequence.startTime;
    const remaining = Math.max(0, hackSequence.timeLimit - elapsed);
    const percentage = (remaining / hackSequence.timeLimit) * 100;
    timerFill.style.width = percentage + '%';
    if (remaining <= 0) failHackSequence();
  }, 50);

  addLog(`> INITIATING BREACH SEQUENCE - LEVEL ${hackSequence.difficulty}`, 'warning');
}

function displayPattern() {
  const patternDiv = document.getElementById('hackPattern');
  patternDiv.innerHTML = '';
  hackSequence.pattern.forEach((symbol, index) => {
    const symbolEl = document.createElement('div');
    symbolEl.className = 'pattern-symbol';
    symbolEl.textContent = symbol;
    symbolEl.style.setProperty('--index', index);
    patternDiv.appendChild(symbolEl);
    
    // Play sound for each symbol
    if (window.audio) {
      setTimeout(() => window.audio.playSymbolAppear(), index * 100);
    }
  });
}

function createInputGrid() {
  const gridDiv = document.getElementById('hackInputGrid');
  gridDiv.innerHTML = '';
  const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
  shuffled.forEach(symbol => {
    const key = document.createElement('button');
    key.className = 'hack-key';
    key.textContent = symbol;
    key.addEventListener('click', () => handleSymbolInput(symbol, key));
    gridDiv.appendChild(key);
  });
}

function handleSymbolInput(symbol, keyElement) {
  const currentIndex = hackSequence.input.length;
  if (currentIndex >= hackSequence.pattern.length) return;
  
  hackSequence.input.push(symbol);
  
  if (symbol === hackSequence.pattern[currentIndex]) {
    keyElement.classList.add('correct');
    updateHackProgress();
    if (window.audio) window.audio.playCorrectInput();
    if (hackSequence.input.length === hackSequence.pattern.length) {
      setTimeout(() => completeHackSequence(), 300);
    }
  } else {
    keyElement.classList.add('wrong');
    if (window.audio) window.audio.playWrongInput();
    setTimeout(() => failHackSequence(), 500);
  }
  
  setTimeout(() => keyElement.classList.remove('correct', 'wrong'), 500);
}

function updateHackProgress() {
  document.getElementById('hackProgress').textContent = 
    `${hackSequence.input.length} / ${hackSequence.pattern.length}`;
}

// Complete hack sequence
function completeHackSequence() {
  clearInterval(hackSequence.timerInterval);
  hackModal.classList.remove('show');
  
  const index = hackSequence.pendingNode;
  const nodeElement = hackSequence.pendingElement;
  
  gameState.moves++;
  movesEl.textContent = gameState.moves;
  gameState.combo++;
  if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;

  let bonus = 100;
  let baseXP = 25;
  
  if (gameState.valuableNodes.has(index)) {
    baseXP *= 2;
    bonus *= 1.5;
    addLog(`> VALUABLE NODE DISCOVERED! BONUS XP!`, 'success');
  }
  
  if (gameState.activeNode !== null) {
    const adjacentNodes = getAdjacentNodes(gameState.activeNode);
    if (adjacentNodes.includes(index)) bonus = 200;
  }
  
  const comboMultiplier = 1 + (gameState.combo - 1) * 0.5;
  bonus = Math.floor(bonus * comboMultiplier);
  const xpGain = Math.floor(baseXP * comboMultiplier);
  
  addLog(`> NODE ${index} BREACHED! COMBO x${gameState.combo} +${bonus} +${xpGain}XP`, 'success');

  gameState.score += bonus;
  gameState.sessionXP += xpGain;
  scoreEl.textContent = gameState.score;
  sessionXPEl.textContent = gameState.sessionXP;
  comboEl.textContent = `x${gameState.combo}`;
  comboEl.style.animation = 'none';
  setTimeout(() => comboEl.style.animation = 'pulse 0.5s', 10);
  
  if (gameState.activeNode !== null) {
    document.querySelector(`[data-index="${gameState.activeNode}"]`).classList.remove('active');
  }
  
  gameState.activeNode = index;
  nodeElement.classList.add('active', 'hacked');
  gameState.hackedNodes.add(index);
  
  createParticles(nodeElement, '#00ffff');
  updateProgress();
  addXPToProfile(xpGain, nodeElement);
  
  // Play sounds
  if (window.audio) {
    window.audio.playHackSuccess();
    window.audio.playCombo(gameState.combo);
    window.audio.playXPGain();
  }

  if (gameState.hackedNodes.size >= GRID_SIZE - FIREWALL_COUNT) {
    endGame(true);
  }
}

function addXPToProfile(amount, sourceElement) {
  const rect = sourceElement.getBoundingClientRect();
  const xpPopup = document.createElement('div');
  xpPopup.className = 'xp-popup';
  xpPopup.textContent = `+${amount} XP`;
  xpPopup.style.left = rect.left + rect.width / 2 + 'px';
  xpPopup.style.top = rect.top + 'px';
  document.body.appendChild(xpPopup);
  setTimeout(() => xpPopup.remove(), 2000);
  
  const levelsGained = profile.addXP(amount);
  updateProfileUI();
  
  levelsGained.forEach(level => {
    showLevelUp(level);
  });
}

function showLevelUp(level) {
  const flash = document.createElement('div');
  flash.className = 'level-up-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
  
  const levelUpText = document.createElement('div');
  levelUpText.className = 'level-up-text';
  levelUpText.textContent = `LEVEL ${level}!`;
  document.body.appendChild(levelUpText);
  setTimeout(() => levelUpText.remove(), 2000);
  
  // Play level up sound
  if (window.audio) window.audio.playLevelUp();
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.top = Math.random() * window.innerHeight + 'px';
      particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      particle.style.boxShadow = `0 0 20px hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(particle);
      
      let y = parseInt(particle.style.top);
      const animate = () => {
        y -= 5;
        particle.style.top = y + 'px';
        if (y > -50) requestAnimationFrame(animate);
        else particle.remove();
      };
      animate();
    }, i * 20);
  }
  
  addLog(`> >>> LEVEL UP! NOW LEVEL ${level} <<<`, 'success');
  addLog(`> INFILTRATION CAPABILITIES ENHANCED`, 'success');
}

function failHackSequence() {
  clearInterval(hackSequence.timerInterval);
  hackModal.classList.remove('show');
  gameState.combo = 0;
  comboEl.textContent = 'x0';
  addLog('> BREACH SEQUENCE FAILED! COMBO RESET', 'error');
  if (window.audio) window.audio.playHackFail();
}

function getAdjacentNodes(index) {
  const cols = 8;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const adjacent = [];
  
  if (col > 0) adjacent.push(index - 1);
  if (col < cols - 1) adjacent.push(index + 1);
  if (row > 0) adjacent.push(index - cols);
  if (row < GRID_SIZE / cols - 1) adjacent.push(index + cols);
  
  return adjacent;
}

function updateProgress() {
  const percentage = Math.round((gameState.hackedNodes.size / (GRID_SIZE - FIREWALL_COUNT)) * 100);
  progressBar.style.width = percentage + '%';
  progressText.textContent = `${percentage}% INFILTRATED`;
}

function addLog(message, type = '') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type ? 'log-' + type : ''}`;
  entry.textContent = message;
  terminal.appendChild(entry);
  terminal.scrollTop = terminal.scrollHeight;
  if (terminal.children.length > 20) terminal.removeChild(terminal.firstChild);
}

function createParticles(element, color) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.background = color;
    particle.style.boxShadow = `0 0 10px ${color}`;
    document.body.appendChild(particle);
    
    const angle = (Math.PI * 2 * i) / 20;
    const velocity = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let x = centerX, y = centerY, opacity = 1;
    const animate = () => {
      x += vx;
      y += vy;
      opacity -= 0.02;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.opacity = opacity;
      if (opacity > 0) requestAnimationFrame(animate);
      else particle.remove();
    };
    animate();
  }
}

function startTimer() {
  gameState.timeStarted = Date.now();
  gameState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (gameState.gameStarted) return;
  
  gameState.gameStarted = true;
  gameState.score = 0;
  gameState.moves = 0;
  gameState.sessionXP = 0;
  gameState.activeNode = null;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  
  scoreEl.textContent = '0';
  movesEl.textContent = '0';
  sessionXPEl.textContent = '0';
  
  initGrid();
  startTimer();
  addLog('> BREACH INITIATED', 'success');
  addLog('> COMPLETE HACK SEQUENCES TO INFILTRATE NODES', 'warning');
  addLog('> BUILD COMBOS AND LEVEL UP FOR MASSIVE REWARDS!', 'warning');
  
  if (window.audio) window.audio.playButtonClick();
});

function resetGame() {
  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  if (hackSequence.timerInterval) clearInterval(hackSequence.timerInterval);
  
  hackModal.classList.remove('show');
  
  gameState = {
    score: 0,
    moves: 0,
    sessionXP: 0,
    timeStarted: null,
    timerInterval: null,
    activeNode: null,
    hackedNodes: new Set(),
    firewallNodes: new Set(),
    valuableNodes: new Set(),
    gameStarted: false,
    combo: 0,
    maxCombo: 0
  };
  
  hackSequence = {
    pattern: [],
    input: [],
    timeLimit: 8000,
    startTime: null,
    timerInterval: null,
    pendingNode: null,
    pendingElement: null,
    difficulty: 3
  };
  
  scoreEl.textContent = '0';
  movesEl.textContent = '0';
  sessionXPEl.textContent = '0';
  comboEl.textContent = 'x0';
  timerEl.textContent = '00:00';
  progressBar.style.width = '0%';
  progressText.textContent = '0% INFILTRATED';
  victory.classList.remove('show');
  
  terminal.innerHTML = `
    <div class="log-entry log-success">> SYSTEM INITIALIZED</div>
    <div class="log-entry">> AWAITING CONNECTION...</div>
    <div class="log-entry log-warning">> SELECT A NODE TO BEGIN INFILTRATION</div>
  `;
  
  initGrid();
}

document.getElementById('resetBtn').addEventListener('click', resetGame);
document.getElementById('playAgainBtn').addEventListener('click', resetGame);

function endGame(won) {
  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  
  const timeElapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);
  
  profile.updateStats({
    won: won,
    score: gameState.score,
    combo: gameState.maxCombo,
    time: timeElapsed,
    nodesHacked: gameState.hackedNodes.size
  });
  
  updateProfileUI();
  
  if (won) {
    addLog('> NETWORK FULLY COMPROMISED!', 'success');
    addLog(`> FINAL SCORE: ${gameState.score}`, 'success');
    addLog(`> SESSION XP EARNED: ${gameState.sessionXP}`, 'success');
    
    document.getElementById('victoryScore').textContent = gameState.score;
    document.getElementById('victoryXP').textContent = gameState.sessionXP;
    document.getElementById('victoryTime').textContent = formatTime(timeElapsed);
    victory.classList.add('show');
    
    if (window.audio) window.audio.playVictory();
  }
}

// Stats Modal
document.getElementById('statsBtn').addEventListener('click', () => {
  document.getElementById('totalGames').textContent = profile.totalGames;
  document.getElementById('gamesWon').textContent = profile.gamesWon;
  const winRate = profile.totalGames > 0 
    ? Math.round((profile.gamesWon / profile.totalGames) * 100) 
    : 0;
  document.getElementById('winRate').textContent = winRate + '%';
  document.getElementById('statsTotalXP').textContent = profile.totalXP;
  document.getElementById('statsLevel').textContent = profile.level;
  document.getElementById('statsHighScore').textContent = profile.highScore;
  document.getElementById('bestCombo').textContent = profile.bestCombo;
  document.getElementById('fastestWin').textContent = 
    profile.fastestWin ? formatTime(profile.fastestWin) : '--:--';
  document.getElementById('totalNodes').textContent = profile.totalNodesHacked;
  
  statsModal.classList.add('show');
});

document.getElementById('closeStatsBtn').addEventListener('click', () => {
  statsModal.classList.remove('show');
});

// Initialize on load
updateProfileUI();
initGrid();


// Audio Controls
document.getElementById('audioToggle').addEventListener('click', () => {
  if (window.audio) {
    const enabled = window.audio.toggle();
    const icon = document.getElementById('audioIcon');
    const btn = document.getElementById('audioToggle');
    
    if (enabled) {
      icon.textContent = '🔊';
      btn.classList.remove('muted');
      window.audio.unmute();
    } else {
      icon.textContent = '🔇';
      btn.classList.add('muted');
      window.audio.mute();
    }
    
    if (window.audio) window.audio.playButtonClick();
  }
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
  if (window.audio) {
    const volume = e.target.value / 100;
    window.audio.setVolume(volume);
  }
});

// Add button click sounds to all buttons
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.audio && btn.id !== 'audioToggle') {
      window.audio.playButtonClick();
    }
  });
});


// Minigame System
let currentMinigame = 'pattern'; // 'pattern' or 'shooter'
let activeShooterGame = null;

// Toggle minigame type
document.getElementById('minigameToggle').addEventListener('click', () => {
  currentMinigame = currentMinigame === 'pattern' ? 'shooter' : 'pattern';
  const btn = document.getElementById('minigameToggle');
  btn.textContent = `MINIGAME: ${currentMinigame.toUpperCase()}`;
  
  if (window.audio) window.audio.playButtonClick();
  
  addLog(`> MINIGAME MODE: ${currentMinigame.toUpperCase()}`, 'success');
});

// Modified startHackSequence to support both minigames
const originalStartHackSequence = startHackSequence;
startHackSequence = function(index, nodeElement) {
  if (currentMinigame === 'shooter') {
    startShooterMinigame(index, nodeElement);
  } else {
    originalStartHackSequence(index, nodeElement);
  }
};

// Space Shooter Minigame Integration
function startShooterMinigame(index, nodeElement) {
  hackSequence.pendingNode = index;
  hackSequence.pendingElement = nodeElement;
  hackSequence.difficulty = Math.min(3 + Math.floor(gameState.combo / 3), 7);
  
  const shooterModal = document.getElementById('shooterModal');
  const shooterGame = document.getElementById('shooterGame');
  
  shooterModal.classList.add('show');
  addLog(`> INITIATING SPACE COMBAT - DIFFICULTY ${hackSequence.difficulty}`, 'warning');
  
  // Create shooter instance
  activeShooterGame = new SpaceShooterMinigame(hackSequence.difficulty);
  
  // Set up callbacks
  activeShooterGame.onComplete = (score) => {
    shooterModal.classList.remove('show');
    shooterGame.innerHTML = '';
    completeHackSequence();
  };
  
  activeShooterGame.onFail = () => {
    shooterModal.classList.remove('show');
    shooterGame.innerHTML = '';
    failHackSequence();
  };
  
  // Initialize game
  activeShooterGame.init(shooterGame);
  
  // Update HUD
  updateShooterHUD();
  const hudInterval = setInterval(() => {
    if (!activeShooterGame || !activeShooterGame.isRunning) {
      clearInterval(hudInterval);
      return;
    }
    updateShooterHUD();
  }, 100);
}

function updateShooterHUD() {
  if (!activeShooterGame) return;
  
  document.getElementById('shooterEnemies').textContent = 
    `${activeShooterGame.enemiesDestroyed} / ${activeShooterGame.targetEnemies}`;
  
  document.getElementById('shooterScore').textContent = activeShooterGame.score;
  
  const healthBar = document.getElementById('shooterHealth');
  healthBar.style.width = `${activeShooterGame.health}%`;
}
