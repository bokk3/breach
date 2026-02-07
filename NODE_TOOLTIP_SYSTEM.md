# Node Tooltip System

## Overview
Added a dynamic, translucent tooltip system that displays detailed information about nodes when hovering (desktop) or tapping (mobile).

## Features

### Tooltip Information Displayed
- **Node Index**: Shows which node you're inspecting
- **Node Type**: Entry Point, Firewall, Valuable Data, Secure Node, Data Node, Network Node, or Standard
- **Status**: Current state of the node
  - BREACHED (magenta) - Already hacked
  - PROTECTED (yellow) - Firewall node
  - THREAT DETECTED (orange, pulsing) - About to become firewall
  - IN RANGE (yellow) - Adjacent to active node, can be hacked
  - START HERE (green) - Entry point node
  - Available (default) - Not yet interacted with
- **Rewards**: Shows potential points and XP gain (with combo multiplier)
  - Displays "2x XP active!" when Double XP power-up is active
  - Shows higher rewards for valuable nodes
- **Power-Up**: If a power-up is present on the node, displays icon and name
- **Difficulty**: Current minigame difficulty level (only shown for unhacked nodes)

### Visual Design
- **Translucent Background**: Dark background (95% opacity) with cyan border
- **Cyberpunk Aesthetic**: Matches game's neon style with glowing effects
- **Clipped Corners**: Polygon clip-path for futuristic look
- **Color-Coded Status**: Different colors for different node states
- **Smooth Animations**: Fade-in and scale transition (0.2s)
- **Smart Positioning**: Automatically adjusts to avoid going off-screen

### Interaction
- **Desktop**: Hover over any node to see tooltip
- **Mobile**: Tap a node to show tooltip, tap outside to hide
- **Auto-Hide**: Tooltip disappears when mouse leaves node (with 100ms delay)
- **Game State Aware**: Only shows when game has started

### Responsive Design
- **Desktop**: Full-size tooltip (200-300px width)
- **Tablet** (≤768px): Slightly smaller (180-250px width)
- **Mobile** (≤480px): Compact version (160-220px width)
- **Font sizes scale down** on smaller screens for readability

## Implementation Details

### JavaScript Functions
1. **`showNodeTooltip(index, nodeElement, event)`**
   - Creates/updates tooltip element
   - Gathers node information via `getNodeInfo()`
   - Positions tooltip near cursor/touch point
   - Handles screen edge detection

2. **`hideNodeTooltip()`**
   - Hides tooltip with 100ms delay
   - Allows smooth transition between nodes

3. **`getNodeInfo(index)`**
   - Collects all relevant node data
   - Calculates potential rewards with combo multipliers
   - Determines node type, status, and power-ups
   - Returns structured info object

### CSS Classes
- `.node-tooltip` - Main tooltip container
- `.tooltip-header` - Node title section
- `.tooltip-section` - Each info row
- `.tooltip-label` - Left-side labels
- `.tooltip-value` - Right-side values
- `.tooltip-rewards` - Green-colored rewards text
- `.tooltip-powerup` - Highlighted power-up section
- `.status-*` - Color-coded status classes

### Event Listeners
- `mouseenter` on nodes - Show tooltip (desktop)
- `mouseleave` on nodes - Hide tooltip (desktop)
- `touchstart` on nodes - Show tooltip (mobile)
- `touchstart` on document - Hide tooltip when tapping outside (mobile)

## Usage Tips
- **Strategic Planning**: Use tooltips to see which nodes give best rewards
- **Power-Up Hunting**: Quickly identify nodes with power-ups
- **Threat Awareness**: See which nodes are about to become firewalls
- **Combo Optimization**: Check reward multipliers before hacking
- **Difficulty Check**: Know what difficulty you'll face before engaging

## Technical Notes
- Tooltip element is created once and reused for performance
- Position calculation prevents tooltip from going off-screen edges
- Touch events prevent default to avoid conflicts with click handlers
- Z-index: 2500 ensures tooltip appears above all game elements
- Pointer-events: none prevents tooltip from blocking interactions

## Future Enhancements
- Add node history (times hacked, success rate)
- Show estimated time until threatened nodes convert
- Display adjacent node count
- Add keyboard shortcut to toggle tooltips
- Implement tooltip pinning for mobile users
