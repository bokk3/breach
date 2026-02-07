# CYBER BREACH - Neural Network Infiltration

A cyberpunk-themed hacking game with persistent progression, cloud sync, multiple minigames, and strategic power-ups.

## 🎮 Features

### Core Gameplay
- **Three Minigames**: Choose between Pattern Memory, Space Shooter, or Code Breaker
- **Strategic Grid**: 8×6 grid with diverse node types and dynamic defenses
- **Combo System**: Build combos for massive score and XP multipliers
- **Progressive Difficulty**: Minigames get harder as you hack more nodes (1-10 difficulty scale)
- **Defense System**: Nodes develop firewalls over time - hack fast or get blocked!
- **Entry Point**: Must start at the starter node (⚡) before spreading through the network

### 🎯 Minigames
1. **Pattern Memory**: Memorize and input symbol sequences (2-8 symbols, 10s-5s time)
2. **Space Shooter**: 3D space combat with aim assist and rapid fire (2-8 enemies)
3. **Code Breaker**: Mastermind-style logic puzzle (3-6 digits, 7-4 attempts)

### ⚡ Power-Up System
- **Time Freeze** ⏸: Pause defense timer for 15 seconds
- **Shield** 🛡: Next firewall hit is free
- **Double XP** ✨: 2× XP for 30 seconds
- **Easy Mode** 🎯: Reduce difficulty for 20 seconds
- **Reveal** 👁: Show next threatened node
- 15% drop chance per node (40% on valuable nodes)
- Max 3 power-ups on grid at once

### 📈 Progression System
- **Cloud Sync**: Firebase authentication with Google Sign-In
- **XP Curve**: Exponential leveling (Level XP = 100 × Level^1.5)
- **Global Level**: Permanent level across all games
- **Session XP**: Track XP earned in current session
- **Smart Merging**: Cloud saves take highest values from local vs cloud

### 📊 Statistics Tracking
- Total games played and won
- Win rate percentage
- High score record
- Best combo achieved
- Fastest win time
- Total nodes hacked across all games

### 🎨 Node Types & Visual Effects
- **Entry Point** ⚡: Required starting node (green glow)
- **Firewall** ⚠: Protected nodes that reset combo (-50 points)
- **Valuable Data** ◆: 2× XP and 1.5× points (yellow glow)
- **Secure Node** ●: Standard security node
- **Data Node** ■: Information storage node
- **Network Node** ▲: Connection hub node
- **Standard Node** ○: Basic network node

### 🎯 Visual Indicators
- **Hacked Nodes**: Magenta glow with diagonal breach pattern
- **In-Range Nodes**: Yellow highlight with bouncing icons and connection lines
- **Active Node**: Cyan glow with expanding ring animation
- **Threatened Nodes**: Orange warning with shake animation (5s before firewall)
- **Node Tooltips**: Hover/tap to see detailed stats, rewards, and power-ups

### 🔊 Audio System
- 12+ synthetic sound effects using Web Audio API
- Hack success/fail, node clicks, level up, XP gain
- Combo sounds, firewall hits, defense warnings
- Space shooter sounds: laser, explosion, hit, damage
- Volume control and mute toggle
- No external audio files needed

### 📱 Mobile Optimized
- Fully responsive design (5 breakpoints)
- Touch-optimized controls (44×44px minimum tap targets)
- Scrollable modals for small screens
- No zoom on double-tap
- Works on phones, tablets, and desktop

## 🎮 How to Play

### Getting Started
1. **Login**: Sign in with Google or email, or play as guest
2. **Start Game**: Click "INITIATE BREACH" to begin
3. **Entry Point**: Click the starter node (⚡) to begin your infiltration
4. **Choose Minigame**: Toggle between Pattern, Shooter, or Code Breaker modes

### Pattern Memory Mode
1. Memorize the symbol sequence shown
2. Input symbols in correct order before time runs out
3. Difficulty increases: 2-8 symbols, 10s-5s time limit

### Space Shooter Mode
1. Use WASD or Arrow keys to move your ship
2. Hold Space or Mouse button for rapid fire
3. Destroy all enemies before they destroy you
4. Aim assist helps bullets track nearby enemies

### Code Breaker Mode
1. Guess the secret numeric code
2. Use feedback to narrow down possibilities:
   - 🟢 Correct digit in correct position
   - 🟡 Correct digit in wrong position
   - ⚫ Digit not in code
3. Use hints after 3 attempts if needed

### Strategy Tips
- **Build Combos**: Hack adjacent nodes for bonus points
- **Collect Power-Ups**: Look for floating icons on nodes
- **Watch Threats**: Orange nodes will become firewalls in 5 seconds
- **Use Tooltips**: Hover/tap nodes to see rewards and difficulty
- **Time Management**: Defense system creates firewalls every 15 seconds
- **Shield Strategy**: Save shield power-up for valuable nodes near firewalls

## 💯 Scoring

- **Base Score**: 100 points per node
- **Combo Multiplier**: 1 + (combo - 1) × 0.5
- **Valuable Nodes**: 1.5× score multiplier
- **Adjacent Bonus**: 200 points for hacking adjacent nodes
- **Firewall Penalty**: -50 points (unless you have shield)

## ⭐ XP System

- **Base XP**: 25 XP per node
- **Combo Multiplier**: Same as score multiplier
- **Valuable Nodes**: 2× XP multiplier
- **Double XP Power-Up**: 2× all XP gains for 30 seconds
- **Level Requirements**: Exponentially increasing (100, 173, 260, 360, 474...)

## 🚀 Deployment

### Cloudflare Pages (Recommended)
1. Push code to GitHub repository
2. Connect to Cloudflare Pages
3. Deploy automatically on every commit
4. Live at: https://breach-64d.pages.dev/

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Enable Firestore Database
4. Copy config to `auth.js` (lines 4-10)
5. See `FIREBASE_SETUP.md` for detailed instructions

### Android App
Use Capacitor to convert to native Android app:
```bash
npm install
npm run build-android
```
See `ANDROID_APP_GUIDE.md` for complete instructions.

## 📁 Files

### Core Game Files
- `index.html` - Main HTML structure with modals
- `styles.css` - Cyberpunk styling, animations, and responsive design
- `game.js` - Main game logic, progression, power-ups, tooltips

### Minigame Files
- `spaceshooter-minigame.js` - 3D space shooter with Three.js
- `codebreaker-minigame.js` - Logic puzzle minigame

### System Files
- `audio.js` - Web Audio API sound system
- `auth.js` - Firebase authentication and cloud sync

### Documentation
- `README.md` - This file
- `FEATURES.md` - Detailed feature list
- `FIREBASE_SETUP.md` - Firebase configuration guide
- `ANDROID_APP_GUIDE.md` - Android deployment guide
- `NODE_TOOLTIP_SYSTEM.md` - Tooltip implementation details
- `POWERUPS_AND_DIFFICULTY.md` - Power-up and difficulty system
- Plus 15+ other documentation files

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **3D Graphics**: Three.js (for space shooter)
- **Audio**: Web Audio API (synthetic sounds)
- **Backend**: Firebase (Authentication + Firestore)
- **Storage**: LocalStorage + Cloud Sync
- **Deployment**: Cloudflare Pages
- **Mobile**: Capacitor (optional, for Android app)
- **Fonts**: Google Fonts (Orbitron, Share Tech Mono)

## 🌐 Browser Support

Works in all modern browsers with:
- ES6+ JavaScript support
- Web Audio API
- LocalStorage
- WebGL (for space shooter)
- CSS3 animations

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is open source and available for educational purposes.

---

**Hack the planet! 🌐⚡**

*Deployed at: https://breach-64d.pages.dev/*
