# Quick Start Guide

## Installation

No installation required! Just open `index.html` in your browser.

### Option 1: Direct Open
1. Double-click `index.html`
2. Game opens in your default browser

### Option 2: Local Server (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with npx)
npx serve

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## First Time Playing

1. **Start Game**: Click "INITIATE BREACH"
2. **Click a Node**: Select any non-firewall node (avoid ⚠ symbols)
3. **Memorize Pattern**: Watch the symbols displayed
4. **Input Pattern**: Click symbols in correct order before timer runs out
5. **Build Combos**: Keep hacking successfully to increase multipliers
6. **Win**: Hack all 40 non-firewall nodes

## Tips for Beginners

### 🎯 Strategy
- Start with nodes away from firewalls
- Build combos slowly - accuracy > speed
- Valuable nodes (yellow border) give 2× XP
- Adjacent nodes give bonus points

### 💡 Pattern Memory
- Say symbols out loud as you memorize
- Group symbols in pairs (easier to remember)
- Use the 2-second display time wisely
- Don't panic - timer is generous at first

### 📈 Progression
- XP persists across games - you never lose progress
- Higher levels unlock bragging rights
- Each game contributes to your career stats
- Win rate matters - quality over quantity

## Understanding the UI

### Top Section (Persistent)
- **AGENT [Level]**: Your permanent level
- **Total XP**: Cumulative XP across all games
- **High Score**: Your best game score
- **XP Bar**: Progress to next level

### Middle Section (Session)
- **Score**: Current game points
- **Combo**: Current combo multiplier
- **Moves**: Nodes hacked this game
- **Time**: Game duration
- **Session XP**: XP earned this game

### Bottom Section
- **Progress Bar**: % of nodes hacked
- **Terminal**: Game log and messages
- **Buttons**: Start, Reset, View Stats

## Keyboard Shortcuts

Currently mouse-only, but you can:
- Click nodes to hack
- Click symbols to input pattern
- Click buttons for actions

## Troubleshooting

### Game won't start
- Make sure JavaScript is enabled
- Try a different browser (Chrome, Firefox, Edge)
- Check browser console for errors (F12)

### Progress not saving
- Check if cookies/localStorage are enabled
- Don't use incognito/private mode
- Clear browser cache and try again

### Performance issues
- Close other browser tabs
- Disable browser extensions
- Try a different browser

## Advanced Tips

### Combo Mastery
- Combo multiplier: `1 + (combo - 1) × 0.5`
- At combo 10: 5.5× multiplier!
- One mistake resets to 0

### XP Optimization
- Focus on valuable nodes (yellow)
- Maintain high combos
- Complete games for full XP

### Score Maximization
- Plan your path through the grid
- Chain adjacent nodes for 200pt bonus
- Avoid firewalls at all costs (-50pts)

## Need Help?

Check the README.md for detailed game mechanics and scoring information.

---

**Good luck, Agent! 🚀**
