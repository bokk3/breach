# Changelog

## Version 2.0.0 - Full Project Transformation (2026-02-06)

### 🎉 Major Changes
- **Complete Restructure**: Split monolithic HTML into modular project
- **Persistent Progression**: Added LocalStorage-based save system
- **Career Statistics**: Comprehensive stat tracking across all games
- **XP Curve System**: Exponential leveling with formula-based progression

### ✨ New Features

#### Progression System
- Player profile with permanent level
- Total XP tracking across all sessions
- Exponential XP curve (100 × Level^1.5)
- Multi-level gain support
- Session XP display

#### Statistics Tracking
- Total games played and won
- Win rate percentage calculation
- High score record
- Best combo achieved
- Fastest win time
- Total nodes hacked (lifetime)
- Dedicated stats modal

#### UI Enhancements
- Separated persistent profile from session stats
- Global XP bar with level progress
- Victory screen with detailed stats
- Stats button for career overview
- Better visual hierarchy

### 🏗️ Technical Improvements
- Modular file structure (HTML/CSS/JS separation)
- PlayerProfile class for state management
- LocalStorage integration
- Improved code organization
- Better maintainability

### 📁 New Files
- `index.html` - Main game page
- `styles.css` - All styling and animations
- `game.js` - Game logic and progression
- `README.md` - Project documentation
- `FEATURES.md` - Feature comparison
- `QUICKSTART.md` - Getting started guide
- `CHANGELOG.md` - This file
- `.gitignore` - Git ignore rules

### 🔄 Retained Features
- Memory pattern minigame
- Combo system with multipliers
- Firewall nodes
- Valuable nodes (2× XP)
- Particle effects
- Cyberpunk aesthetic
- Terminal logging
- Dynamic difficulty scaling
- Responsive design
- All original animations

### 📊 Statistics
- Original: 1 file, 1546 lines
- Enhanced: 3 core files, 1550 lines total
  - index.html: 140 lines
  - styles.css: 779 lines
  - game.js: 631 lines

### 🐛 Bug Fixes
- Fixed class method scoping in PlayerProfile
- Improved error handling for localStorage
- Better state management

---

## Version 1.0.0 - Original Game

### Features
- Single-file HTML game
- Memory pattern minigame
- Basic scoring system
- Combo mechanics
- Firewall obstacles
- Cyberpunk visual theme
- Particle effects
- Terminal logging
