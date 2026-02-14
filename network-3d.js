// 3D Network Visualization System
// Transforms the 2D grid into an immersive 3D network with fiber optic connections

class Network3D {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.nodes = [];
    this.cables = [];
    this.nodeObjects = new Map(); // Map index -> THREE.Object3D
    this.cableObjects = new Map(); // Map "index1-index2" -> THREE.Line
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredNode = null;
    this.autoRotate = true;
    this.autoRotateSpeed = 0.001;
    
    this.init();
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0015);
    this.scene.fog = new THREE.Fog(0x0a0015, 20, 50);
    
    // Create camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.set(0, 8, 20);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 50);
    pointLight2.position.set(-10, 5, -10);
    this.scene.add(pointLight2);
    
    // Event listeners
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this));
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Start animation loop
    this.animate();
  }
  
  // Generate 3D positions for nodes in layered depth layout
  generateNodePositions(nodeCount, cols = 8) {
    const positions = [];
    const rows = Math.ceil(nodeCount / cols);
    const depthLayers = 3; // Near, mid, far
    
    for (let i = 0; i < nodeCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Calculate X and Y positions (spread across grid)
      const x = (col - cols / 2 + 0.5) * 2.5;
      const y = -(row - rows / 2 + 0.5) * 2.5;
      
      // Calculate Z position (depth layers with some randomness)
      const layer = Math.floor(Math.random() * depthLayers);
      const z = -layer * 4 + (Math.random() - 0.5) * 2;
      
      positions.push({ x, y, z });
    }
    
    return positions;
  }
  
  // Create the network with nodes and connections
  createNetwork(nodeData) {
    // Clear existing network
    this.clearNetwork();
    
    // Generate 3D positions
    const positions = this.generateNodePositions(nodeData.length);
    
    // Create nodes
    nodeData.forEach((data, index) => {
      this.createNode(index, positions[index], data);
    });
    
    // Create connections between adjacent nodes
    this.createConnections(nodeData);
  }
  
  // Create a single node
  createNode(index, position, data) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);
    group.userData = { index, data };
    
    // Node geometry - icosahedron for interesting shape
    const geometry = new THREE.IcosahedronGeometry(0.4, 0);
    
    // Material based on node type
    let color = 0x00ffff; // Default cyan
    let emissive = 0x00ffff;
    let emissiveIntensity = 0.5;
    
    if (data.type === 'starter') {
      color = 0x00ff64;
      emissive = 0x00ff64;
      emissiveIntensity = 0.8;
    } else if (data.type === 'firewall') {
      color = 0xffff00;
      emissive = 0xffff00;
      emissiveIntensity = 0.6;
    } else if (data.type === 'valuable') {
      color = 0xffff00;
      emissive = 0xffff00;
      emissiveIntensity = 0.7;
    }
    
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: emissiveIntensity,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    
    // Outer glow shell
    const glowGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowMesh);
    
    // Add to scene
    this.scene.add(group);
    this.nodeObjects.set(index, group);
    
    // Store node data
    this.nodes[index] = {
      position,
      group,
      mesh,
      glowMesh,
      data,
      rotation: Math.random() * Math.PI * 2
    };
  }
  
  // Create connections (cables) between nodes
  createConnections(nodeData) {
    const cols = 8;
    
    nodeData.forEach((data, index) => {
      // Connect to adjacent nodes (right, down, diagonal)
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      // Right neighbor
      if (col < cols - 1) {
        this.createCable(index, index + 1);
      }
      
      // Down neighbor
      if (row < Math.floor(nodeData.length / cols) - 1) {
        this.createCable(index, index + cols);
      }
      
      // Diagonal neighbors (some connections)
      if (col < cols - 1 && row < Math.floor(nodeData.length / cols) - 1 && Math.random() > 0.5) {
        this.createCable(index, index + cols + 1);
      }
    });
  }
  
  // Create a cable between two nodes
  createCable(index1, index2) {
    const node1 = this.nodes[index1];
    const node2 = this.nodes[index2];
    
    if (!node1 || !node2) return;
    
    const points = [
      new THREE.Vector3(node1.position.x, node1.position.y, node1.position.z),
      new THREE.Vector3(node2.position.x, node2.position.y, node2.position.z)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    
    const key = `${Math.min(index1, index2)}-${Math.max(index1, index2)}`;
    this.cableObjects.set(key, line);
  }
  
  // Update node state (hacked, threatened, etc.)
  updateNodeState(index, state) {
    const node = this.nodes[index];
    if (!node) return;
    
    let color, emissive, emissiveIntensity, glowOpacity;
    
    switch (state) {
      case 'hacked':
        color = 0xff00ff;
        emissive = 0xff00ff;
        emissiveIntensity = 0.8;
        glowOpacity = 0.4;
        break;
      case 'active':
        color = 0x00ffff;
        emissive = 0x00ffff;
        emissiveIntensity = 1.0;
        glowOpacity = 0.5;
        break;
      case 'threatened':
        color = 0xff6400;
        emissive = 0xff6400;
        emissiveIntensity = 0.7;
        glowOpacity = 0.4;
        break;
      case 'in-range':
        color = 0xffff00;
        emissive = 0xffff00;
        emissiveIntensity = 0.6;
        glowOpacity = 0.3;
        break;
      default:
        return;
    }
    
    node.mesh.material.color.setHex(color);
    node.mesh.material.emissive.setHex(emissive);
    node.mesh.material.emissiveIntensity = emissiveIntensity;
    node.glowMesh.material.color.setHex(color);
    node.glowMesh.material.opacity = glowOpacity;
    
    node.data.state = state;
  }
  
  // Update cable state between two nodes
  updateCableState(index1, index2, state) {
    const key = `${Math.min(index1, index2)}-${Math.max(index1, index2)}`;
    const cable = this.cableObjects.get(key);
    if (!cable) return;
    
    let color, opacity;
    
    switch (state) {
      case 'hacked':
        color = 0xff00ff;
        opacity = 0.8;
        break;
      case 'active':
        color = 0x00ffff;
        opacity = 0.6;
        break;
      case 'threatened':
        color = 0xff6400;
        opacity = 0.5;
        break;
      default:
        color = 0x00ffff;
        opacity = 0.3;
    }
    
    cable.material.color.setHex(color);
    cable.material.opacity = opacity;
  }
  
  // Mouse move handler for hover effects
  onMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast to find hovered node
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      Array.from(this.nodeObjects.values()).map(g => g.children[0])
    );
    
    // Reset previous hover
    if (this.hoveredNode !== null) {
      const node = this.nodes[this.hoveredNode];
      if (node && node.data.state !== 'active') {
        node.mesh.scale.set(1, 1, 1);
        node.glowMesh.scale.set(1, 1, 1);
      }
    }
    
    // Apply new hover
    if (intersects.length > 0) {
      const group = intersects[0].object.parent;
      const index = group.userData.index;
      this.hoveredNode = index;
      
      const node = this.nodes[index];
      if (node) {
        node.mesh.scale.set(1.2, 1.2, 1.2);
        node.glowMesh.scale.set(1.2, 1.2, 1.2);
      }
      
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.hoveredNode = null;
      this.renderer.domElement.style.cursor = 'default';
    }
  }
  
  // Mouse down handler
  onMouseDown(event) {
    this.isDragging = false;
    this.mouseDownTime = Date.now();
  }
  
  // Mouse up handler
  onMouseUp(event) {
    const clickDuration = Date.now() - this.mouseDownTime;
    if (clickDuration < 200) { // Quick click, not drag
      this.onClick(event);
    }
  }
  
  // Click handler for node selection
  onClick(event) {
    if (this.hoveredNode !== null && typeof this.onNodeClick === 'function') {
      this.onNodeClick(this.hoveredNode);
    }
  }
  
  // Resize handler
  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }
  
  // Animation loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const time = Date.now() * 0.001;
    
    // Rotate nodes
    this.nodes.forEach((node, index) => {
      if (node && node.mesh) {
        node.mesh.rotation.x = time * 0.3 + node.rotation;
        node.mesh.rotation.y = time * 0.2 + node.rotation;
        
        // Pulse effect
        const pulse = Math.sin(time * 2 + index * 0.5) * 0.1 + 1;
        node.glowMesh.scale.set(pulse, pulse, pulse);
      }
    });
    
    // Auto-rotate camera
    if (this.autoRotate) {
      this.camera.position.x = Math.sin(time * this.autoRotateSpeed) * 20;
      this.camera.position.z = Math.cos(time * this.autoRotateSpeed) * 20;
      this.camera.lookAt(0, 0, 0);
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  // Clear the network
  clearNetwork() {
    // Remove all nodes
    this.nodeObjects.forEach(obj => {
      this.scene.remove(obj);
      obj.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    this.nodeObjects.clear();
    
    // Remove all cables
    this.cableObjects.forEach(cable => {
      this.scene.remove(cable);
      cable.geometry.dispose();
      cable.material.dispose();
    });
    this.cableObjects.clear();
    
    this.nodes = [];
    this.cables = [];
  }
  
  // Cleanup
  dispose() {
    this.clearNetwork();
    
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.removeEventListener('click', this.onClick.bind(this));
    
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Network3D;
}
