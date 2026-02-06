# Project Structure

```
cyber-breach/
│
├── 🎮 GAME FILES
│   ├── index.html          # Main game page (140 lines)
│   ├── styles.css          # All styling & animations (779 lines)
│   └── game.js             # Game logic & progression (631 lines)
│
├── 📚 DOCUMENTATION
│   ├── README.md           # Project overview & how to play
│   ├── QUICKSTART.md       # Getting started guide
│   ├── FEATURES.md         # Feature comparison
│   ├── CHANGELOG.md        # Version history
│   └── PROJECT_STRUCTURE.md # This file
│
├── 🗂️ LEGACY
│   └── cyber-breach.html   # Original single-file version
│
└── ⚙️ CONFIG
    └── .gitignore          # Git ignore rules
```

## File Relationships

```
┌─────────────┐
│ index.html  │
└──────┬──────┘
       │
       ├──────> styles.css  (visual styling)
       │
       └──────> game.js     (game logic)
                    │
                    └──────> localStorage (save data)
```

## Data Flow

```
User Action
    │
    ▼
┌─────────────────┐
│   Event Handler │
│   (game.js)     │
└────────┬────────┘
         │
         ├──────> Update Game State
         │
         ├──────> Update UI (DOM)
         │
         ├──────> Add XP to Profile
         │        │
         │        └──────> Check Level Up
         │                 │
         │                 └──────> Show Effects
         │
         └──────> Save to localStorage
```

## Class Structure

```
PlayerProfile
├── Properties
│   ├── level (current level)
│   ├── totalXP (lifetime XP)
│   ├── currentLevelXP (XP toward next level)
│   ├── highScore
│   ├── totalGames
│   ├── gamesWon
│   ├── bestCombo
│   ├── fastestWin
│   └── totalNodesHacked
│
└── Methods
    ├── load() - Load from localStorage
    ├── save() - Save to localStorage
    ├── reset() - Reset all stats
    ├── getXPNeeded() - Calculate XP for next level
    ├── addXP(amount) - Add XP and check level ups
    └── updateStats(gameData) - Update career stats
```

## Game State Object

```javascript
gameState {
  // Session Data (resets each game)
  score: number
  moves: number
  sessionXP: number
  combo: number
  maxCombo: number
  
  // Game State
  gameStarted: boolean
  activeNode: number | null
  timeStarted: timestamp | null
  timerInterval: interval | null
  
  // Grid State
  hackedNodes: Set<number>
  firewallNodes: Set<number>
  valuableNodes: Set<number>
}
```

## XP Curve Formula

```
XP Required = 100 × Level^1.5

Examples:
Level 1 → 2:  100 XP
Level 2 → 3:  173 XP
Level 3 → 4:  260 XP
Level 4 → 5:  360 XP
Level 5 → 6:  474 XP
Level 10 → 11: 1,000 XP
Level 20 → 21: 2,828 XP
```

## Scoring System

```
Base Score = 100 points
Combo Multiplier = 1 + (combo - 1) × 0.5

Modifiers:
├── Valuable Node: ×1.5 score, ×2 XP
├── Adjacent Node: +200 points
└── Firewall Hit: -50 points, reset combo

Final Score = Base × Multiplier + Bonuses
Final XP = Base XP (25) × Multiplier × Node Type
```

## LocalStorage Schema

```json
{
  "cyberBreachProfile": {
    "level": 5,
    "totalXP": 1234,
    "currentLevelXP": 123,
    "highScore": 5000,
    "totalGames": 42,
    "gamesWon": 30,
    "bestCombo": 15,
    "fastestWin": 180,
    "totalNodesHacked": 1680
  }
}
```

## Event Flow

```
Game Start
    │
    ▼
Initialize Grid
    │
    ▼
User Clicks Node ──────> Is Firewall? ──Yes──> Penalty
    │                           │
    │                          No
    ▼                           │
Start Hack Sequence <───────────┘
    │
    ├──> Show Pattern
    ├──> Start Timer
    └──> Wait for Input
         │
         ├──> Correct? ──Yes──> Complete Hack
         │                      ├── Add Score
         │                      ├── Add XP
         │                      ├── Check Level Up
         │                      └── Check Win
         │
         └──> Wrong? ──Yes──> Fail Sequence
                              └── Reset Combo
```

## CSS Architecture

```
styles.css
├── Base Styles (reset, variables)
├── Layout (grid, containers)
├── Components
│   ├── Nodes
│   ├── Terminal
│   ├── Stats
│   ├── Profile
│   └── Modals
├── Animations
│   ├── Glitch effects
│   ├── Particles
│   ├── Level up
│   └── XP popups
└── Responsive (mobile)
```

## Performance Considerations

- **Particle System**: Limited to 20 particles per effect
- **Terminal Log**: Max 20 entries (auto-cleanup)
- **LocalStorage**: ~5KB data (negligible)
- **Animations**: CSS-based (GPU accelerated)
- **No Dependencies**: Pure vanilla JS (fast load)

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 (not supported - uses modern JS)
