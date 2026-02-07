// Space Shooter Minigame - Alternative to hack sequence
// Vanilla JS version using Three.js

class SpaceShooterMinigame {
  constructor(difficulty = 1) {
    this.difficulty = difficulty;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.enemyBullets = [];
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastShot = 0;
    this.lastEnemySpawn = 0;
    this.score = 0;
    this.health = 100;
    this.enemiesDestroyed = 0;
    this.targetEnemies = 5 + (difficulty * 2); // More enemies for higher difficulty
    this.animationId = null;
    this.isRunning = false;
    this.onComplete = null;
    this.onFail = null;
  }

  init(container) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 10, 50);
    
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.position.y = 2;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000011);
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 5);
    this.scene.add(directionalLight);

    // Player ship
    const playerGeometry = new THREE.ConeGeometry(0.3, 1, 4);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.3
    });
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.rotation.x = Math.PI / 2;
    this.scene.add(this.player);

    // Create starfield
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);

    // Input handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);

    this.isRunning = true;
    this.animate();
  }

  handleKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      this.shootBullet();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  handleMouseMove(e) {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  handleClick() {
    this.shootBullet();
  }

  shootBullet() {
    const now = Date.now();
    if (now - this.lastShot < 150) return;
    this.lastShot = now;

    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      emissive: 0x00ffff
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(this.player.position);
    bullet.velocity = new THREE.Vector3(0, 0, -1);
    this.scene.add(bullet);
    this.bullets.push(bullet);

    if (window.audio) window.audio.playNodeClick();
  }

  spawnEnemy() {
    const enemyGeometry = new THREE.OctahedronGeometry(0.4);
    const enemyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff0044,
      emissive: 0xff0044,
      emissiveIntensity: 0.3
    });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    
    enemy.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5,
      -20
    );
    
    enemy.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      0.03 + (this.difficulty * 0.01)
    );
    
    enemy.health = 1;
    enemy.lastShot = 0;
    
    this.scene.add(enemy);
    this.enemies.push(enemy);
  }

  createExplosion(position, color) {
    for (let i = 0; i < 15; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05);
      const particleMaterial = new THREE.MeshBasicMaterial({ color });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(position);
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      particle.life = 30;
      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());

    // Rotate stars
    this.stars.rotation.y += 0.0002;

    // Player movement
    const moveSpeed = 0.1;
    if (this.keys['a'] || this.keys['arrowleft']) this.player.position.x -= moveSpeed;
    if (this.keys['d'] || this.keys['arrowright']) this.player.position.x += moveSpeed;
    if (this.keys['w'] || this.keys['arrowup']) this.player.position.y += moveSpeed;
    if (this.keys['s'] || this.keys['arrowdown']) this.player.position.y -= moveSpeed;

    // Clamp player position
    this.player.position.x = Math.max(-8, Math.min(8, this.player.position.x));
    this.player.position.y = Math.max(-4, Math.min(4, this.player.position.y));

    // Player look at mouse
    this.player.rotation.z = -this.mouseX * 0.3;

    // Spawn enemies
    const now = Date.now();
    const spawnRate = Math.max(500, 2000 - (this.difficulty * 200));
    if (this.enemies.length < this.targetEnemies && now - this.lastEnemySpawn > spawnRate) {
      this.spawnEnemy();
      this.lastEnemySpawn = now;
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position.add(bullet.velocity);

      if (bullet.position.z < -25) {
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
      }
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.position.add(enemy.velocity);
      enemy.rotation.x += 0.02;
      enemy.rotation.y += 0.03;

      // Remove if too close (player took damage)
      if (enemy.position.z > 5) {
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);
        this.health -= 20;
        if (window.audio) window.audio.playFirewallHit();
        
        if (this.health <= 0) {
          this.fail();
          return;
        }
      }
    }

    // Check bullet-enemy collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (bullet.position.distanceTo(enemy.position) < 0.5) {
          enemy.health--;
          this.scene.remove(bullet);
          this.bullets.splice(i, 1);
          
          if (enemy.health <= 0) {
            this.createExplosion(enemy.position, 0xff0044);
            this.scene.remove(enemy);
            this.enemies.splice(j, 1);
            this.score += 10;
            this.enemiesDestroyed++;
            
            if (window.audio) window.audio.playCorrectInput();
            
            // Check win condition
            if (this.enemiesDestroyed >= this.targetEnemies) {
              this.complete();
              return;
            }
          }
          break;
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.position.add(particle.velocity);
      particle.life--;
      particle.material.opacity = particle.life / 30;
      particle.material.transparent = true;

      if (particle.life <= 0) {
        this.scene.remove(particle);
        this.particles.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  complete() {
    this.isRunning = false;
    if (window.audio) window.audio.playHackSuccess();
    if (this.onComplete) {
      this.onComplete(this.score);
    }
    this.cleanup();
  }

  fail() {
    this.isRunning = false;
    if (window.audio) window.audio.playHackFail();
    if (this.onFail) {
      this.onFail();
    }
    this.cleanup();
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Clean up Three.js objects
    this.bullets.forEach(b => this.scene.remove(b));
    this.enemies.forEach(e => this.scene.remove(e));
    this.particles.forEach(p => this.scene.remove(p));
  }
}

// Export for use in game.js
window.SpaceShooterMinigame = SpaceShooterMinigame;
