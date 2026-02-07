# Defense Timer System - Complete

## Overview
Added a dynamic defense system where nodes gradually develop firewalls over time, creating urgency and strategic gameplay. Players must start from a designated entry point (starter node) and race against the network's defensive response.

## Key Features

### 1. **Starter Node (⚡)**
- Designated entry point for each game
- Spawns in center area of grid (better gameplay balance)
- Must be clicked first before any other nodes
- Glowing green appearance with pulsing animation
- Cannot have firewalls adjacent to it
- Clearly marked with lightning bolt icon

### 2. **Defense Timer System**
- Activates when game starts
- Converts nodes to firewalls every 15 seconds
- Shows 5-second warning before conversion
- Maximum 20 additional firewalls can be created
- Prioritizes nodes adjacent to hacked nodes (strategic spreading)

### 3. **Threatened Nodes**
- Orange/red pulsing animation
- Warning appears 5 seconds before firewall deployment
- Can be saved by hacking before conversion completes
- Visual shake effect and rotating core
- Audio warning plays when threatened

## Configuration

```javascript
const DEFENSE_SYSTEM = {
  enabled: true,                    // Toggle system on/off
  conversionInterval: 15000,        // 15 seconds between conversions
  warningTime: 5000,                // 5 second warning
  maxDefenses: 20,                  // Max additional firewalls
  spreadFromHacked: true            // Prioritize adjacent nodes
};
```

## Gameplay Flow

### Game Start
1. Grid initializes with starter node (⚡)
2. 8 initial firewalls placed (not near starter)
3. Defense timer begins
4. Player must click starter node first

### During Game
1. Every 15 seconds, system selects a node to threaten
2. Node turns orange and pulses (5-second warning)
3. After 5 seconds, node becomes firewall (⚠)
4. If player hacks threatened node in time, it's saved
5. Process repeats until max defenses reached

### Node Selection Priority
- **Priority 2**: Nodes adjacent to hacked nodes (spreading defense)
- **Priority 1**: All other available nodes
- **Excluded**: Starter, valuable, already firewall, already hacked, already threatened

## Visual States

### Starter Node
- **Color**: Green (#00ff64)
- **Icon**: ⚡ (lightning bolt)
- **Effect**: Pulsing glow animation
- **Size**: Larger icon (2rem)
- **Shadow**: 25-40px green glow

### Threatened Node
- **Color**: Orange to red (#ff6400 to #ff0000)
- **Animation**: Pulsing border, shaking icon, rotating core
- **Duration**: 5 seconds
- **Effect**: Warning pulse every 1 second

### Firewall Node (Converted)
- **Color**: Yellow (#ffff00)
- **Icon**: ⚠ (warning)
- **Effect**: Particle burst on conversion
- **Penalty**: -50 points if clicked

## Audio Feedback

### New Sounds Added

1. **playDefenseWarning()**
   - Pulsing triangle wave (400-500 Hz)
   - 0.5 second duration
   - Plays when node becomes threatened

2. **playDefenseActivated()**
   - Two-tone alarm (600-800 Hz)
   - Square wave for harsh sound
   - 0.4 second duration
   - Plays when firewall deploys

3. **playError()**
   - Descending sawtooth (200-100 Hz)
   - 0.3 second duration
   - Plays when clicking wrong node first

## Game State Updates

### New Properties
```javascript
gameState = {
  // ... existing properties
  defenseTimer: null,              // Defense system interval
  starterNode: null,               // Entry point index
  threatenedNodes: new Set(),      // Nodes about to convert
  defensesCreated: 0               // Counter for max limit
};
```

## Strategic Implications

### For Players
- **Time Pressure**: Must move quickly before nodes convert
- **Path Planning**: Consider which nodes to hack first
- **Risk/Reward**: Save threatened nodes for bonus satisfaction
- **Entry Point**: Must start from designated node

### Difficulty Scaling
- Early game: Plenty of time between conversions
- Mid game: Defenses start spreading near hacked nodes
- Late game: Maximum defenses reached, stable difficulty

## Terminal Messages

### Game Start
```
> BREACH INITIATED
> ENTRY POINT: NODE 24 (⚡)
> WARNING: NETWORK DEFENSE SYSTEM ACTIVATED
> NODES WILL DEVELOP FIREWALLS OVER TIME
```

### During Game
```
> NODE 15 DEVELOPING FIREWALL DEFENSES...
> FIREWALL DEPLOYED AT NODE 15!
> NODE 23 SECURED BEFORE FIREWALL DEPLOYMENT
```

### Max Defenses
```
> MAXIMUM NETWORK DEFENSES DEPLOYED
```

### Wrong Start
```
> ACCESS DENIED. BEGIN AT ENTRY POINT (⚡)
```

## CSS Classes

### .node.starter
- Green theme with pulsing glow
- Larger icon with glow animation
- Enhanced visibility

### .node.threatened
- Orange/red warning colors
- Pulsing border animation
- Shaking icon effect
- Rotating core

### .node.flash-hint
- Flashes 3 times when player clicks wrong node
- Scales up to 1.1x
- Intense glow effect

## Functions Added

### startDefenseSystem()
- Initializes defense timer
- Runs every 15 seconds
- Stops at max defenses

### selectNodeForDefense()
- Finds eligible nodes
- Prioritizes adjacent to hacked
- Returns random from top priority

### threatenNode(index)
- Adds threatened class
- Logs warning message
- Plays warning sound

### convertToFirewall(index)
- Checks if node was saved
- Converts to firewall
- Updates icon and classes
- Plays activation sound
- Creates particle effect

### isAdjacentTo(index1, index2)
- Checks if two nodes are adjacent
- Includes diagonal adjacency
- Used for starter placement and defense spreading

## Balance Considerations

### Timing
- **15 seconds**: Enough time to complete 1-2 hacks
- **5 second warning**: Gives player chance to react
- **20 max defenses**: Prevents game from becoming impossible

### Starter Node Placement
- Center area (indices 20-28 approximately)
- Ensures fair starting position
- No firewalls immediately adjacent

### Conversion Priority
- Adjacent nodes create strategic pressure
- Forces player to consider path
- Rewards efficient routing

## Testing Checklist

- [x] Starter node spawns in center area
- [x] Player must click starter first
- [x] Flash hint shows when clicking wrong node
- [x] Defense timer starts on game start
- [x] Nodes show warning 5 seconds before conversion
- [x] Threatened nodes can be saved by hacking
- [x] Firewalls deploy after warning period
- [x] Max defense limit works correctly
- [x] Defense timer stops at max
- [x] Defense timer clears on reset
- [x] Audio plays for warnings and activations
- [x] Particles appear on firewall deployment
- [x] Terminal messages display correctly
- [x] Adjacent node priority works
- [x] Starter node excluded from conversions
- [x] Valuable nodes excluded from conversions

## Future Enhancements (Optional)

- Difficulty modes (faster/slower conversions)
- Visual countdown timer for next conversion
- Defense system "waves" that speed up over time
- Power-ups to slow or stop defense system
- Achievement for saving X threatened nodes
- Visual connection lines showing defense spread
- Different defense patterns (random vs strategic)

## Files Modified

1. **game.js**
   - Added DEFENSE_SYSTEM config
   - Added defense timer functions
   - Updated game state
   - Modified initGrid for starter node
   - Updated handleNodeClick for starter requirement
   - Added isAdjacentTo helper function

2. **styles.css**
   - Added .node.starter styles
   - Added .node.threatened styles
   - Added .node.flash-hint animation
   - Added starterPulse animation
   - Added starterGlow animation
   - Added threatenedWarning animation
   - Added threatenedShake animation

3. **audio.js**
   - Added playDefenseWarning()
   - Added playDefenseActivated()
   - Added playError()

## Performance Notes

- Defense timer uses setInterval (efficient)
- Threatened nodes tracked in Set (O(1) lookup)
- Node selection optimized with priority system
- Animations use CSS (GPU accelerated)
- Audio uses Web Audio API (low overhead)

---

The defense timer system adds strategic depth and urgency to the game while maintaining balance and fairness. Players must now think ahead and move quickly, creating a more engaging and challenging experience!
