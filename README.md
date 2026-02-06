# CYBER BREACH - Neural Network Infiltration

A cyberpunk-themed hacking game with persistent progression, XP curves, and level tracking.

## Features

### 🎮 Core Gameplay
- **Memory Pattern Minigame**: Memorize and input symbol sequences to hack nodes
- **Strategic Grid**: 8x6 grid with firewalls, valuable nodes, and secure nodes
- **Combo System**: Build combos for massive score and XP multipliers
- **Dynamic Difficulty**: Pattern complexity increases with your combo

### 📈 Progression System
- **Persistent Player Profile**: Your progress is saved across sessions
- **XP Curve**: Exponential leveling system (Level XP = 100 × Level^1.5)
- **Global Level**: Permanent level that persists across all games
- **Session XP**: Track XP earned in current game session

### 📊 Statistics Tracking
- Total games played and won
- Win rate percentage
- High score record
- Best combo achieved
- Fastest win time
- Total nodes hacked across all games

### 🎨 Visual Effects
- Animated cyberpunk grid background
- Scanline CRT effect
- Particle explosions on node hacks
- Level-up flash animations
- XP gain popups
- Neon glow effects

## How to Play

1. **Start**: Click "INITIATE BREACH" to begin
2. **Select Node**: Click any non-firewall node to start a hack sequence
3. **Memorize Pattern**: Remember the symbol sequence shown
4. **Input Pattern**: Click symbols in the correct order before time runs out
5. **Build Combos**: Successfully hack consecutive nodes to increase multipliers
6. **Avoid Firewalls**: Nodes marked with ⚠ will reset your combo and deduct points
7. **Complete**: Hack all non-firewall nodes to win

## Scoring

- **Base Score**: 100 points per node
- **Combo Multiplier**: 1 + (combo - 1) × 0.5
- **Valuable Nodes**: 1.5× score multiplier (yellow bordered)
- **Adjacent Bonus**: 200 points for hacking adjacent nodes
- **Firewall Penalty**: -50 points

## XP System

- **Base XP**: 25 XP per node
- **Combo Multiplier**: Same as score multiplier
- **Valuable Nodes**: 2× XP multiplier
- **Level Requirements**: Exponentially increasing (100, 173, 260, 360, 474...)

## Files

- `index.html` - Main HTML structure
- `styles.css` - Cyberpunk styling and animations
- `game.js` - Game logic, progression system, and localStorage integration

## Technologies

- Vanilla JavaScript (no dependencies)
- CSS3 animations and effects
- LocalStorage for persistent data
- Google Fonts (Orbitron, Share Tech Mono)

## Browser Support

Works in all modern browsers with localStorage support.

---

**Hack the planet! 🌐⚡**
