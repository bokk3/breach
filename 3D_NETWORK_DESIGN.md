# 3D Network Grid Design

## Concept
Transform the flat 2D grid into a 3D network visualization where nodes are positioned at varying depths in space, connected by glowing fiber optic cables. This creates a more realistic representation of network topology and makes distance/connectivity more intuitive.

## Visual Design

### Node Positioning
- **Depth Layers**: 3-4 layers of depth (near, mid, far)
- **Spacing**: Nodes spread across X, Y, and Z axes
- **Layout**: Organic network topology (not rigid grid)
- **Camera**: Perspective view with slight rotation capability

### Fiber Optic Cables
- **Connections**: Visible lines between adjacent nodes
- **Glow Effect**: Pulsing neon glow along cables
- **Data Flow**: Animated particles traveling along cables
- **Color Coding**:
  - Cyan: Available connections
  - Magenta: Hacked connections (data flowing)
  - Yellow: Threatened connections
  - Red: Firewall connections

### Node Appearance
- **3D Geometry**: Octahedron or icosahedron shapes
- **Rotation**: Slow idle rotation
- **Glow**: Outer glow shell
- **Pulsing**: Breathing animation
- **Hover Effect**: Expand and brighten
- **Icons**: Floating sprites above nodes

## Technical Implementation

### Three.js Setup
```javascript
- Scene with dark background (space-like)
- Perspective camera with orbit controls
- Ambient + point lights for atmosphere
- Post-processing bloom for glow effects
```

### Node Structure
```javascript
{
  position: { x, y, z },
  geometry: THREE.IcosahedronGeometry,
  material: THREE.MeshPhongMaterial (emissive),
  connections: [nodeIndices],
  state: 'available' | 'hacked' | 'firewall' | 'threatened'
}
```

### Cable System
```javascript
- THREE.Line or THREE.TubeGeometry
- Animated shader for glow
- Particle system for data flow
- Dynamic color based on node states
```

## Interaction Design

### Camera Controls
- **Mouse Drag**: Rotate camera around network
- **Scroll**: Zoom in/out
- **Auto-Rotate**: Slow rotation when idle
- **Focus**: Camera moves to active node

### Node Selection
- **Raycasting**: Click detection in 3D space
- **Highlight**: Glow intensifies on hover
- **Range Indicator**: Adjacent nodes pulse
- **Path Visualization**: Show possible routes

### Visual Feedback
- **Hack Animation**: Node explodes with particles
- **Connection Pulse**: Energy travels along cable
- **Network Spread**: Visualize breach propagation
- **Defense Activation**: Red warning pulses

## Layout Algorithms

### Option 1: Force-Directed Graph
- Nodes repel each other
- Connections act as springs
- Natural organic layout
- Computationally intensive

### Option 2: Layered Depth
- Starter node at front (Z=0)
- Nodes spread in layers (Z=1, 2, 3)
- Firewalls at deeper layers
- Valuable nodes at medium depth

### Option 3: Clustered Network
- Nodes grouped in clusters
- Clusters at different depths
- Connections between clusters
- Represents network segments

**Recommended**: Option 2 (Layered Depth) for performance and clarity

## Distance Mechanics

### Path Length
- **Physical Distance**: Actual 3D distance between nodes
- **Cable Length**: Visible connection length
- **Hop Count**: Number of nodes in path
- **Difficulty Modifier**: Deeper nodes = harder

### Adjacency Rules
- **3D Distance**: Nodes within radius are adjacent
- **Max Connections**: 3-6 connections per node
- **Depth Preference**: Connect to similar depth first
- **Cross-Layer**: Some connections span depths

## Performance Optimization

### LOD (Level of Detail)
- Distant nodes use simpler geometry
- Reduce particle effects at distance
- Cull off-screen elements

### Instancing
- Use THREE.InstancedMesh for nodes
- Batch similar materials
- Reduce draw calls

### Particle Pooling
- Reuse particle objects
- Limit active particles
- Efficient animation loops

## Mobile Considerations

### Simplified 3D
- Fewer nodes visible at once
- Simpler geometry (lower poly count)
- Reduced particle effects
- Touch controls for rotation

### Fallback Option
- Toggle between 2D and 3D views
- Auto-detect device capability
- Graceful degradation

## UI Integration

### HUD Overlay
- Stats remain in 2D overlay
- Tooltips follow 3D nodes
- Minimap shows network topology
- Depth indicator

### Camera Modes
- **Free Rotate**: Manual camera control
- **Follow Mode**: Camera tracks active node
- **Overview**: Zoom out to see full network
- **Focus**: Zoom to specific node

## Animation Timeline

### Initial Load
1. Fade in background (0-0.5s)
2. Nodes appear one by one (0.5-2s)
3. Cables draw between nodes (2-3s)
4. Camera rotates to starting position (3-4s)

### Hack Sequence
1. Camera focuses on target node (0.5s)
2. Node pulses during minigame
3. Success: Explosion + cable activation
4. Camera pulls back to show network

### Defense Activation
1. Threatened node glows orange
2. Warning particles orbit node
3. Conversion: Red pulse along cables
4. Firewall node turns red

## Shader Effects

### Node Glow Shader
```glsl
- Fresnel effect for edge glow
- Pulsing emission intensity
- Color interpolation for states
- Vertex displacement for pulse
```

### Cable Shader
```glsl
- Animated UV scrolling
- Gradient along length
- Glow intensity variation
- Particle trail effect
```

### Post-Processing
- Bloom for overall glow
- Chromatic aberration (subtle)
- Vignette for focus
- Optional: Scanline effect

## Accessibility

### Motion Sensitivity
- Option to reduce rotation
- Disable auto-rotate
- Slower animations
- Static camera mode

### Visual Clarity
- High contrast colors
- Clear node states
- Text labels option
- Zoom controls

## Implementation Phases

### Phase 1: Basic 3D Grid
- Convert 2D positions to 3D
- Render nodes as spheres
- Basic camera controls
- Click detection

### Phase 2: Connections
- Draw cables between nodes
- Animated glow effect
- Connection state colors
- Data flow particles

### Phase 3: Advanced Effects
- Custom shaders
- Particle systems
- Post-processing
- Camera animations

### Phase 4: Polish
- Performance optimization
- Mobile support
- Accessibility options
- Visual refinements

## Code Structure

```javascript
// New file: network-3d.js

class Network3D {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer();
    this.nodes = [];
    this.cables = [];
    this.raycaster = new THREE.Raycaster();
  }
  
  initNodes(nodeData) { }
  createNode(index, position, type) { }
  createCable(node1, node2) { }
  updateNodeState(index, state) { }
  animateHack(index) { }
  render() { }
}
```

## Benefits

### Immersion
- More realistic network representation
- Spatial awareness of network topology
- Engaging visual experience
- "Hacker" aesthetic

### Gameplay
- Distance becomes meaningful
- Strategic path planning
- Visual network understanding
- Depth adds complexity

### Aesthetics
- Modern, impressive visuals
- Shareable screenshots/videos
- Professional appearance
- Unique selling point

## Challenges

### Complexity
- More code to maintain
- Performance considerations
- Mobile compatibility
- Learning curve for users

### Solutions
- Modular architecture
- Performance profiling
- Fallback 2D mode
- Tutorial/onboarding

## Estimated Effort

- **Phase 1**: 4-6 hours (basic 3D)
- **Phase 2**: 3-4 hours (connections)
- **Phase 3**: 4-6 hours (effects)
- **Phase 4**: 2-3 hours (polish)
- **Total**: 13-19 hours

## Success Metrics

- Frame rate: 60fps on desktop, 30fps on mobile
- Load time: <3 seconds
- User engagement: Increased session length
- Visual appeal: Positive feedback
- Performance: No crashes or lag

## Conclusion

A 3D network visualization would significantly enhance the game's visual appeal and make the network infiltration concept more tangible. The fiber optic cable representation creates a clear mental model of connectivity and distance, while the depth layers add strategic complexity. With proper optimization and fallback options, this can work across all devices while providing a premium, immersive experience.
