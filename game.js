// Game Constants
const GRID_SIZE = 48;
const FIREWALL_COUNT = 8;
const SYMBOLS = ['◆', '▲', '●', '■', '★', '✦', '◈', '◉'];

// Progressive Difficulty System
const DIFFICULTY_SYSTEM = {
  getMinigameDifficulty: (nodesHacked) => {
    // Start at 1, increase every 5 nodes, cap at 10
    return Math.min(1 + Math.floor(nodesHacked / 5), 10);
  },
  getPatternLength: (difficulty) => {
    // Pattern: 2-8 symbols
    return Math.min(2 + difficulty, 8);
  },
  getPatternTime: (difficulty) => {
    // Time: 10s down to 5s
    return Math.max(10000 - (difficulty * 500), 5000);
  },
  getCodeLength: (difficulty) => {
    // Code Breaker: 3-6 digits
    if (difficulty <= 2) return 3;
    if (difficulty <= 5) return 4;
    if (difficulty <= 7) return 5;
    return 6;
  },
  getCodeAttempts: (difficulty) => {
    // Attempts: 7 down to 4
    return Math.max(7 - Math.floor(difficulty / 3), 4);
  },
  getShooterEnemies: (difficulty) => {
    // Enemies: 2-8
    return Math.min(2 + difficulty, 8);
  },
  getShooterSpeed: (difficulty) => {
    // Enemy speed multiplier: 1.0 to 1.5
    return 1.0 + (difficulty * 0.05);
  }
};

// Power-Up System
const POWERUP_TYPES = {
  TIME_FREEZE: {
    id: 'time_freeze',
    name: 'TIME FREEZE',
    icon: '⏸',
    color: '#00ffff',
    duration: 15000,
    description: 'Pause defense timer for 15s'
  },
  SHIELD: {
    id: 'shield',
    name: 'SHIELD',
    icon: '🛡',
    color: '#ffff00',
    duration: null,
    description: 'Next firewall hit is free'
  },
  DOUBLE_XP: {
    id: 'double_xp',
    name: 'DOUBLE XP',
    icon: '✨',
    color: '#ff00ff',
    duration: 30000,
    description: '2x XP for 30s'
  },
  EASY_MODE: {
    id: 'easy_mode',
    name: 'EASY MODE',
    icon: '🎯',
    color: '#00ff00',
    duration: 20000,
    description: 'Reduce difficulty for 20s'
  },
  REVEAL: {
    id: 'reveal',
    name: 'REVEAL',
    icon: '👁',
    color: '#ff6400',
    duration: null,
    description: 'Show next threatened node'
  }
};

const POWERUP_CONFIG = {
  dropChance: 0.15, // 15% chance per node
  maxActive: 3, // Max 3 power-ups on grid at once
  valuableNodeBonus: 0.25 // +25% chance from valuable nodes
};

// Defense System Configuration
const DEFENSE_SYSTEM = {
  enabled: true,
  conversionInterval: 15000, // Convert a node every 15 seconds
  warningTime: 5000, // Show warning 5 seconds before conversion
  maxDefenses: 20, // Maximum number of nodes that can become firewalls
  spreadFromHacked: true // Defenses spread from hacked nodes
};

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
  defenseTimer: null,
  activeNode: null,
  starterNode: null,
  hackedNodes: new Set(),
  firewallNodes: new Set(),
  valuableNodes: new Set(),
  threatenedNodes: new Set(),
  powerUpNodes: new Map(), // Map of node index -> powerup type
  activePowerUps: new Map(), // Map of powerup id -> expiry time
  gameStarted: false,
  combo: 0,
  maxCombo: 0,
  defensesCreated: 0,
  currentDifficulty: 1
};

let hackSequence = {
  pattern: [],
  input: [],
  timeLimit: 8000,
  startTime: null,
  timerInterval: null,
  pendingNode: null,
  pendingElement: null,
  difficulty: 1,
  baseDifficulty: 1
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
  gameState.threatenedNodes.clear();
  
  // Select starter node (center-ish area for better gameplay)
  const centerStart = Math.floor(GRID_SIZE / 2) - 4;
  const centerEnd = Math.floor(GRID_SIZE / 2) + 4;
  gameState.starterNode = centerStart + Math.floor(Math.random() * (centerEnd - centerStart));
  
  while (gameState.firewallNodes.size < FIREWALL_COUNT) {
    const index = Math.floor(Math.random() * GRID_SIZE);
    // Don't place firewalls on or adjacent to starter node
    if (index !== gameState.starterNode && !isAdjacentTo(index, gameState.starterNode)) {
      gameState.firewallNodes.add(index);
    }
  }

  const valuableCount = 6;
  while (gameState.valuableNodes.size < valuableCount) {
    const index = Math.floor(Math.random() * GRID_SIZE);
    if (!gameState.firewallNodes.has(index) && index !== gameState.starterNode) {
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
    
    if (i === gameState.starterNode) {
      node.classList.add('starter');
      const icon = document.createElement('div');
      icon.className = 'node-icon';
      icon.textContent = '⚡';
      inner.appendChild(icon);
    } else if (gameState.firewallNodes.has(i)) {
      node.classList.add('firewall');
      const icon = document.createElement('div');
      icon.className = 'node-icon';
      icon.textContent = '⚠';
      inner.appendChild(icon);
    } else if (gameState.valuableNodes.has(i)) {
      node.classList.add('type-valuable');
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

// Check if two nodes are adjacent
function isAdjacentTo(index1, index2) {
  const cols = 8;
  const row1 = Math.floor(index1 / cols);
  const col1 = index1 % cols;
  const row2 = Math.floor(index2 / cols);
  const col2 = index2 % cols;
  
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  
  return (rowDiff <= 1 && colDiff <= 1) && (index1 !== index2);
}

// Handle node click
function handleNodeClick(index, nodeElement) {
  if (!gameState.gameStarted) {
    addLog('> BREACH NOT INITIATED. START THE GAME FIRST.', 'error');
    return;
  }

  // Starter node - must be clicked first
  if (gameState.activeNode === null && index !== gameState.starterNode) {
    addLog('> ACCESS DENIED. BEGIN AT ENTRY POINT (⚡)', 'error');
    if (window.audio) window.audio.playError();
    
    // Flash the starter node
    const starterElement = document.querySelector(`[data-index="${gameState.starterNode}"]`);
    if (starterElement) {
      starterElement.classList.add('flash-hint');
      setTimeout(() => starterElement.classList.remove('flash-hint'), 1000);
    }
    return;
  }

  if (gameState.hackedNodes.has(index)) {
    addLog('> NODE ALREADY COMPROMISED', 'error');
    return;
  }

  if (gameState.firewallNodes.has(index)) {
    // Check for shield power-up
    if (gameState.activePowerUps.has('shield')) {
      gameState.activePowerUps.delete('shield');
      addLog(`> SHIELD ABSORBED FIREWALL HIT!`, 'success');
      createParticles(nodeElement, '#ffff00');
      if (window.audio) window.audio.playPowerUpCollect();
      return;
    }
    
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
  
  // Calculate difficulty based on progress
  hackSequence.baseDifficulty = gameState.currentDifficulty;
  
  // Apply Easy Mode power-up
  if (gameState.activePowerUps.has('easy_mode')) {
    hackSequence.difficulty = Math.max(1, hackSequence.baseDifficulty - 2);
    addLog(`> EASY MODE ACTIVE - Difficulty reduced!`, 'success');
  } else {
    hackSequence.difficulty = hackSequence.baseDifficulty;
  }
  
  // Pattern minigame uses progressive difficulty
  const patternLength = DIFFICULTY_SYSTEM.getPatternLength(hackSequence.difficulty);
  hackSequence.timeLimit = DIFFICULTY_SYSTEM.getPatternTime(hackSequence.difficulty);
  
  hackSequence.pattern = [];
  for (let i = 0; i < patternLength; i++) {
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

  addLog(`> INITIATING BREACH SEQUENCE - DIFFICULTY ${hackSequence.difficulty}`, 'warning');
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
  
  // Check for power-up collection
  if (gameState.powerUpNodes.has(index)) {
    collectPowerUp(index);
  }
  
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
  let xpGain = Math.floor(baseXP * comboMultiplier);
  
  // Apply Double XP power-up
  if (gameState.activePowerUps.has('double_xp')) {
    xpGain *= 2;
    addLog(`> DOUBLE XP ACTIVE! +${xpGain}XP`, 'success');
  }
  
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
  
  // Update difficulty based on progress
  gameState.currentDifficulty = DIFFICULTY_SYSTEM.getMinigameDifficulty(gameState.hackedNodes.size);
  
  // Chance to spawn power-up on nearby nodes
  const adjacentNodes = getAdjacentNodes(index);
  adjacentNodes.forEach(adjIndex => {
    if (!gameState.hackedNodes.has(adjIndex) && 
        !gameState.firewallNodes.has(adjIndex) &&
        !gameState.powerUpNodes.has(adjIndex)) {
      spawnPowerUp(adjIndex);
    }
  });
  
  // Highlight adjacent nodes (in range)
  highlightAdjacentNodes(index);
  
  createParticles(nodeElement, '#00ffff');
  updateProgress();
  updatePowerUpDisplay();
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

// Highlight nodes adjacent to the active node
function highlightAdjacentNodes(activeIndex) {
  // Remove all previous highlights
  document.querySelectorAll('.node').forEach(node => {
    node.classList.remove('in-range', 'connection-line-top', 'connection-line-right', 
                          'connection-line-bottom', 'connection-line-left');
  });
  
  const adjacentIndices = getAdjacentNodes(activeIndex);
  const cols = 8;
  const activeRow = Math.floor(activeIndex / cols);
  const activeCol = activeIndex % cols;
  
  adjacentIndices.forEach(adjIndex => {
    const nodeElement = document.querySelector(`[data-index="${adjIndex}"]`);
    if (!nodeElement) return;
    
    // Don't highlight already hacked nodes or firewalls
    if (gameState.hackedNodes.has(adjIndex) || gameState.firewallNodes.has(adjIndex)) {
      return;
    }
    
    // Add in-range class
    nodeElement.classList.add('in-range');
    
    // Add connection line direction
    const adjRow = Math.floor(adjIndex / cols);
    const adjCol = adjIndex % cols;
    
    if (adjRow < activeRow) nodeElement.classList.add('connection-line-bottom');
    if (adjRow > activeRow) nodeElement.classList.add('connection-line-top');
    if (adjCol < activeCol) nodeElement.classList.add('connection-line-right');
    if (adjCol > activeCol) nodeElement.classList.add('connection-line-left');
  });
}

// Defense System Functions
function startDefenseSystem() {
  if (!DEFENSE_SYSTEM.enabled) return;
  
  gameState.defensesCreated = 0;
  
  // Start the defense timer
  gameState.defenseTimer = setInterval(() => {
    if (gameState.defensesCreated >= DEFENSE_SYSTEM.maxDefenses) {
      addLog('> MAXIMUM NETWORK DEFENSES DEPLOYED', 'warning');
      clearInterval(gameState.defenseTimer);
      return;
    }
    
    // Select a node to threaten
    const targetNode = selectNodeForDefense();
    if (targetNode !== null) {
      threatenNode(targetNode);
      
      // After warning time, convert to firewall
      setTimeout(() => {
        convertToFirewall(targetNode);
      }, DEFENSE_SYSTEM.warningTime);
    }
  }, DEFENSE_SYSTEM.conversionInterval);
  
  addLog('> WARNING: NETWORK DEFENSE SYSTEM ACTIVATED', 'error');
  addLog('> NODES WILL DEVELOP FIREWALLS OVER TIME', 'warning');
}

function selectNodeForDefense() {
  // Find nodes that can become firewalls
  const candidates = [];
  
  for (let i = 0; i < GRID_SIZE; i++) {
    // Skip if already firewall, hacked, threatened, starter, or valuable
    if (gameState.firewallNodes.has(i) || 
        gameState.hackedNodes.has(i) || 
        gameState.threatenedNodes.has(i) ||
        i === gameState.starterNode ||
        gameState.valuableNodes.has(i)) {
      continue;
    }
    
    // Prefer nodes adjacent to hacked nodes (spreading defense)
    if (DEFENSE_SYSTEM.spreadFromHacked && gameState.hackedNodes.size > 0) {
      const adjacentToHacked = Array.from(gameState.hackedNodes).some(hackedIndex => {
        return isAdjacentTo(i, hackedIndex);
      });
      
      if (adjacentToHacked) {
        candidates.push({ index: i, priority: 2 });
      } else {
        candidates.push({ index: i, priority: 1 });
      }
    } else {
      candidates.push({ index: i, priority: 1 });
    }
  }
  
  if (candidates.length === 0) return null;
  
  // Sort by priority and pick from top candidates
  candidates.sort((a, b) => b.priority - a.priority);
  const topPriority = candidates[0].priority;
  const topCandidates = candidates.filter(c => c.priority === topPriority);
  
  return topCandidates[Math.floor(Math.random() * topCandidates.length)].index;
}

function threatenNode(index) {
  gameState.threatenedNodes.add(index);
  const nodeElement = document.querySelector(`[data-index="${index}"]`);
  
  if (nodeElement) {
    nodeElement.classList.add('threatened');
    addLog(`> NODE ${index} DEVELOPING FIREWALL DEFENSES...`, 'warning');
    
    if (window.audio) window.audio.playDefenseWarning();
  }
}

function convertToFirewall(index) {
  // Check if node was hacked in the meantime
  if (gameState.hackedNodes.has(index)) {
    gameState.threatenedNodes.delete(index);
    const nodeElement = document.querySelector(`[data-index="${index}"]`);
    if (nodeElement) {
      nodeElement.classList.remove('threatened');
    }
    addLog(`> NODE ${index} SECURED BEFORE FIREWALL DEPLOYMENT`, 'success');
    return;
  }
  
  gameState.threatenedNodes.delete(index);
  gameState.firewallNodes.add(index);
  gameState.defensesCreated++;
  
  const nodeElement = document.querySelector(`[data-index="${index}"]`);
  if (nodeElement) {
    // Remove old classes
    nodeElement.classList.remove('threatened', 'type-secure', 'type-data', 'type-network', 'type-standard');
    nodeElement.classList.add('firewall');
    
    // Update icon
    const iconElement = nodeElement.querySelector('.node-icon');
    if (iconElement) {
      iconElement.textContent = '⚠';
    }
    
    // Visual effect
    createParticles(nodeElement, '#ffff00');
    
    addLog(`> FIREWALL DEPLOYED AT NODE ${index}!`, 'error');
    
    if (window.audio) window.audio.playDefenseActivated();
  }
}

// Power-Up System Functions
function spawnPowerUp(nodeIndex) {
  // Check if we already have max power-ups
  if (gameState.powerUpNodes.size >= POWERUP_CONFIG.maxActive) return;
  
  // Check if this node already has a power-up
  if (gameState.powerUpNodes.has(nodeIndex)) return;
  
  // Calculate drop chance
  let chance = POWERUP_CONFIG.dropChance;
  if (gameState.valuableNodes.has(nodeIndex)) {
    chance += POWERUP_CONFIG.valuableNodeBonus;
  }
  
  // Roll for drop
  if (Math.random() > chance) return;
  
  // Select random power-up type
  const types = Object.values(POWERUP_TYPES);
  const powerUp = types[Math.floor(Math.random() * types.length)];
  
  // Add to game state
  gameState.powerUpNodes.set(nodeIndex, powerUp);
  
  // Add visual indicator
  const nodeElement = document.querySelector(`[data-index="${nodeIndex}"]`);
  if (nodeElement && !gameState.hackedNodes.has(nodeIndex)) {
    const powerUpIcon = document.createElement('div');
    powerUpIcon.className = 'powerup-icon';
    powerUpIcon.textContent = powerUp.icon;
    powerUpIcon.style.color = powerUp.color;
    powerUpIcon.style.textShadow = `0 0 15px ${powerUp.color}`;
    nodeElement.appendChild(powerUpIcon);
    
    addLog(`> POWER-UP DETECTED: ${powerUp.name}`, 'success');
  }
}

function collectPowerUp(nodeIndex) {
  const powerUp = gameState.powerUpNodes.get(nodeIndex);
  if (!powerUp) return;
  
  // Remove from node
  gameState.powerUpNodes.delete(nodeIndex);
  
  // Activate power-up
  activatePowerUp(powerUp);
  
  // Visual feedback
  const nodeElement = document.querySelector(`[data-index="${nodeIndex}"]`);
  if (nodeElement) {
    const powerUpIcon = nodeElement.querySelector('.powerup-icon');
    if (powerUpIcon) powerUpIcon.remove();
  }
  
  // Play sound
  if (window.audio) window.audio.playPowerUpCollect();
}

function activatePowerUp(powerUp) {
  addLog(`> POWER-UP ACTIVATED: ${powerUp.name}!`, 'success');
  addLog(`> ${powerUp.description}`, 'warning');
  
  // Apply power-up effect
  switch (powerUp.id) {
    case 'time_freeze':
      activateTimeFreeze(powerUp.duration);
      break;
    case 'shield':
      activateShield();
      break;
    case 'double_xp':
      activateDoubleXP(powerUp.duration);
      break;
    case 'easy_mode':
      activateEasyMode(powerUp.duration);
      break;
    case 'reveal':
      activateReveal();
      break;
  }
  
  // Show power-up notification
  showPowerUpNotification(powerUp);
}

function activateTimeFreeze(duration) {
  const expiryTime = Date.now() + duration;
  gameState.activePowerUps.set('time_freeze', expiryTime);
  
  // Pause defense timer
  if (gameState.defenseTimer) {
    clearInterval(gameState.defenseTimer);
    gameState.defenseTimer = null;
  }
  
  // Resume after duration
  setTimeout(() => {
    gameState.activePowerUps.delete('time_freeze');
    if (gameState.gameStarted && DEFENSE_SYSTEM.enabled) {
      startDefenseSystem();
    }
    addLog('> TIME FREEZE EXPIRED', 'warning');
  }, duration);
}

function activateShield() {
  gameState.activePowerUps.set('shield', Infinity);
  addLog('> SHIELD ACTIVE - Next firewall hit is free!', 'success');
}

function activateDoubleXP(duration) {
  const expiryTime = Date.now() + duration;
  gameState.activePowerUps.set('double_xp', expiryTime);
  
  setTimeout(() => {
    gameState.activePowerUps.delete('double_xp');
    addLog('> DOUBLE XP EXPIRED', 'warning');
  }, duration);
}

function activateEasyMode(duration) {
  const expiryTime = Date.now() + duration;
  gameState.activePowerUps.set('easy_mode', expiryTime);
  
  setTimeout(() => {
    gameState.activePowerUps.delete('easy_mode');
    addLog('> EASY MODE EXPIRED', 'warning');
  }, duration);
}

function activateReveal() {
  // Find next node that will be threatened
  const candidates = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!gameState.firewallNodes.has(i) && 
        !gameState.hackedNodes.has(i) && 
        !gameState.threatenedNodes.has(i) &&
        i !== gameState.starterNode &&
        !gameState.valuableNodes.has(i)) {
      candidates.push(i);
    }
  }
  
  if (candidates.length > 0) {
    const revealIndex = candidates[Math.floor(Math.random() * candidates.length)];
    const nodeElement = document.querySelector(`[data-index="${revealIndex}"]`);
    if (nodeElement) {
      nodeElement.classList.add('revealed-threat');
      setTimeout(() => nodeElement.classList.remove('revealed-threat'), 5000);
      addLog(`> NODE ${revealIndex} WILL BE THREATENED SOON!`, 'warning');
    }
  }
}

function showPowerUpNotification(powerUp) {
  const notification = document.createElement('div');
  notification.className = 'powerup-notification';
  notification.innerHTML = `
    <div class="powerup-notif-icon" style="color: ${powerUp.color}; text-shadow: 0 0 20px ${powerUp.color};">
      ${powerUp.icon}
    </div>
    <div class="powerup-notif-text">
      <div class="powerup-notif-name">${powerUp.name}</div>
      <div class="powerup-notif-desc">${powerUp.description}</div>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

function updatePowerUpDisplay() {
  // Update active power-ups display
  const container = document.getElementById('activePowerUps');
  const containerWrapper = document.getElementById('activePowerUpsContainer');
  if (!container || !containerWrapper) return;
  
  container.innerHTML = '';
  
  if (gameState.activePowerUps.size === 0) {
    containerWrapper.style.display = 'none';
    return;
  }
  
  containerWrapper.style.display = 'flex';
  
  gameState.activePowerUps.forEach((expiryTime, powerUpId) => {
    const powerUp = Object.values(POWERUP_TYPES).find(p => p.id === powerUpId);
    if (!powerUp) return;
    
    const remaining = expiryTime === Infinity ? '∞' : Math.ceil((expiryTime - Date.now()) / 1000) + 's';
    
    const element = document.createElement('div');
    element.className = 'active-powerup';
    element.style.borderColor = powerUp.color;
    element.innerHTML = `
      <span class="active-powerup-icon" style="color: ${powerUp.color};">${powerUp.icon}</span>
      <span class="active-powerup-time">${remaining}</span>
    `;
    container.appendChild(element);
  });
}

// Update power-up display every second
setInterval(() => {
  if (gameState.gameStarted) {
    updatePowerUpDisplay();
  }
}, 1000);

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
  gameState.defensesCreated = 0;
  
  scoreEl.textContent = '0';
  movesEl.textContent = '0';
  sessionXPEl.textContent = '0';
  
  initGrid();
  startTimer();
  startDefenseSystem();
  
  addLog('> BREACH INITIATED', 'success');
  addLog(`> ENTRY POINT: NODE ${gameState.starterNode} (⚡)`, 'success');
  addLog('> COMPLETE HACK SEQUENCES TO INFILTRATE NODES', 'warning');
  addLog('> BUILD COMBOS AND LEVEL UP FOR MASSIVE REWARDS!', 'warning');
  
  if (window.audio) window.audio.playButtonClick();
});

function resetGame() {
  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  if (gameState.defenseTimer) clearInterval(gameState.defenseTimer);
  if (hackSequence.timerInterval) clearInterval(hackSequence.timerInterval);
  
  hackModal.classList.remove('show');
  
  gameState = {
    score: 0,
    moves: 0,
    sessionXP: 0,
    timeStarted: null,
    timerInterval: null,
    defenseTimer: null,
    activeNode: null,
    starterNode: null,
    hackedNodes: new Set(),
    firewallNodes: new Set(),
    valuableNodes: new Set(),
    threatenedNodes: new Set(),
    powerUpNodes: new Map(),
    activePowerUps: new Map(),
    gameStarted: false,
    combo: 0,
    maxCombo: 0,
    defensesCreated: 0,
    currentDifficulty: 1
  };
  
  hackSequence = {
    pattern: [],
    input: [],
    timeLimit: 8000,
    startTime: null,
    timerInterval: null,
    pendingNode: null,
    pendingElement: null,
    difficulty: 1,
    baseDifficulty: 1
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
let currentMinigame = 'pattern'; // 'pattern', 'shooter', or 'codebreaker'
let activeShooterGame = null;
let activeCodeBreakerGame = null;

// Toggle minigame type
document.getElementById('minigameToggle').addEventListener('click', () => {
  if (currentMinigame === 'pattern') {
    currentMinigame = 'shooter';
  } else if (currentMinigame === 'shooter') {
    currentMinigame = 'codebreaker';
  } else {
    currentMinigame = 'pattern';
  }
  
  const btn = document.getElementById('minigameToggle');
  btn.textContent = `MINIGAME: ${currentMinigame.toUpperCase()}`;
  
  if (window.audio) window.audio.playButtonClick();
  
  addLog(`> MINIGAME MODE: ${currentMinigame.toUpperCase()}`, 'success');
});

// Modified startHackSequence to support all minigames
const originalStartHackSequence = startHackSequence;
startHackSequence = function(index, nodeElement) {
  if (currentMinigame === 'shooter') {
    startShooterMinigame(index, nodeElement);
  } else if (currentMinigame === 'codebreaker') {
    startCodeBreakerMinigame(index, nodeElement);
  } else {
    originalStartHackSequence(index, nodeElement);
  }
};

// Space Shooter Minigame Integration
function startShooterMinigame(index, nodeElement) {
  hackSequence.pendingNode = index;
  hackSequence.pendingElement = nodeElement;
  
  // Use progressive difficulty
  hackSequence.baseDifficulty = gameState.currentDifficulty;
  hackSequence.difficulty = gameState.activePowerUps.has('easy_mode') 
    ? Math.max(1, hackSequence.baseDifficulty - 2)
    : hackSequence.baseDifficulty;
  
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

// Code Breaker Minigame Integration
function startCodeBreakerMinigame(index, nodeElement) {
  hackSequence.pendingNode = index;
  hackSequence.pendingElement = nodeElement;
  
  // Use progressive difficulty
  hackSequence.baseDifficulty = gameState.currentDifficulty;
  hackSequence.difficulty = gameState.activePowerUps.has('easy_mode') 
    ? Math.max(1, hackSequence.baseDifficulty - 2)
    : hackSequence.baseDifficulty;
  
  const codebreakerModal = document.getElementById('codebreakerModal');
  const codebreakerGame = document.getElementById('codebreakerGame');
  
  codebreakerModal.classList.add('show');
  addLog(`> INITIATING CODE BREACH - DIFFICULTY ${hackSequence.difficulty}`, 'warning');
  
  // Create code breaker instance
  activeCodeBreakerGame = new CodeBreakerMinigame(hackSequence.difficulty);
  
  // Set up callbacks
  activeCodeBreakerGame.onComplete = (score) => {
    codebreakerModal.classList.remove('show');
    codebreakerGame.innerHTML = '';
    completeHackSequence();
  };
  
  activeCodeBreakerGame.onFail = () => {
    codebreakerModal.classList.remove('show');
    codebreakerGame.innerHTML = '';
    failHackSequence();
  };
  
  // Initialize game
  activeCodeBreakerGame.init(codebreakerGame);
}

function updateShooterHUD() {
  if (!activeShooterGame) return;
  
  document.getElementById('shooterEnemies').textContent = 
    `${activeShooterGame.enemiesDestroyed} / ${activeShooterGame.targetEnemies}`;
  
  document.getElementById('shooterScore').textContent = activeShooterGame.score;
  
  const healthBar = document.getElementById('shooterHealth');
  healthBar.style.width = `${activeShooterGame.health}%`;
}
