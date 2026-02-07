import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Crosshair, Heart, Trophy, Zap, RotateCcw } from 'lucide-react';

const SpaceShooter = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameover
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('spaceShooterHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('spaceShooterHighScore', score.toString());
    }
  }, [score, highScore]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setWave(1);
  }, []);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const resumeGame = useCallback(() => {
    setGameState('playing');
  }, []);

  // Main game loop
  useEffect(() => {
    if (!canvasRef.current || gameState !== 'playing') return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 50);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    // Player ship
    const playerGeometry = new THREE.ConeGeometry(0.3, 1, 4);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.3
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.rotation.x = Math.PI / 2;
    scene.add(player);

    // Game state
    const game = {
      player,
      enemies: [],
      bullets: [],
      particles: [],
      enemyBullets: [],
      keys: {},
      mouseX: 0,
      mouseY: 0,
      lastShot: 0,
      lastEnemySpawn: 0,
      enemySpawnRate: 2000,
      currentWave: 1,
      enemiesInWave: 5,
      enemiesSpawned: 0,
      score: 0,
      health: 100
    };

    gameRef.current = game;

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
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Input handlers
    const handleKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e) => {
      game.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      game.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleClick = () => {
      shootBullet();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Shoot bullet
    function shootBullet() {
      const now = Date.now();
      if (now - game.lastShot < 150) return;
      game.lastShot = now;

      const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const bulletMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff
      });
      const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
      bullet.position.copy(player.position);
      bullet.velocity = new THREE.Vector3(0, 0, -1);
      scene.add(bullet);
      game.bullets.push(bullet);
    }

    // Spawn enemy
    function spawnEnemy() {
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
        0.05
      );
      
      enemy.health = 1 + Math.floor(game.currentWave / 3);
      enemy.lastShot = 0;
      
      scene.add(enemy);
      game.enemies.push(enemy);
      game.enemiesSpawned++;
    }

    // Create explosion particles
    function createExplosion(position, color) {
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
        scene.add(particle);
        game.particles.push(particle);
      }
    }

    // Animation loop
    let animationId;
    let lastTime = Date.now();
    
    function animate() {
      animationId = requestAnimationFrame(animate);
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      // Rotate stars
      stars.rotation.y += 0.0002;

      // Player movement
      const moveSpeed = 0.1;
      if (game.keys['a'] || game.keys['arrowleft']) player.position.x -= moveSpeed;
      if (game.keys['d'] || game.keys['arrowright']) player.position.x += moveSpeed;
      if (game.keys['w'] || game.keys['arrowup']) player.position.y += moveSpeed;
      if (game.keys['s'] || game.keys['arrowdown']) player.position.y -= moveSpeed;

      // Clamp player position
      player.position.x = Math.max(-8, Math.min(8, player.position.x));
      player.position.y = Math.max(-4, Math.min(4, player.position.y));

      // Player look at mouse
      const targetX = game.mouseX * 5;
      const targetY = game.mouseY * 3;
      player.rotation.z = -game.mouseX * 0.3;

      // Spawn enemies
      if (game.enemiesSpawned < game.enemiesInWave && now - game.lastEnemySpawn > game.enemySpawnRate) {
        spawnEnemy();
        game.lastEnemySpawn = now;
      }

      // Check wave completion
      if (game.enemiesSpawned >= game.enemiesInWave && game.enemies.length === 0) {
        game.currentWave++;
        game.enemiesInWave += 3;
        game.enemiesSpawned = 0;
        game.enemySpawnRate = Math.max(500, game.enemySpawnRate - 100);
        setWave(game.currentWave);
      }

      // Update bullets
      for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        bullet.position.add(bullet.velocity);

        if (bullet.position.z < -25) {
          scene.remove(bullet);
          game.bullets.splice(i, 1);
        }
      }

      // Update enemies
      for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        enemy.position.add(enemy.velocity);
        enemy.rotation.x += 0.02;
        enemy.rotation.y += 0.03;

        // Enemy shooting
        if (now - enemy.lastShot > 2000 && Math.random() < 0.01) {
          enemy.lastShot = now;
          const enemyBullet = new THREE.Mesh(
            new THREE.SphereGeometry(0.08),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          enemyBullet.position.copy(enemy.position);
          const direction = new THREE.Vector3()
            .subVectors(player.position, enemy.position)
            .normalize()
            .multiplyScalar(0.1);
          enemyBullet.velocity = direction;
          scene.add(enemyBullet);
          game.enemyBullets.push(enemyBullet);
        }

        // Remove if too close
        if (enemy.position.z > 5) {
          scene.remove(enemy);
          game.enemies.splice(i, 1);
          game.health -= 10;
          setHealth(game.health);
          if (game.health <= 0) {
            setGameState('gameover');
          }
        }
      }

      // Update enemy bullets
      for (let i = game.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = game.enemyBullets[i];
        bullet.position.add(bullet.velocity);

        // Check collision with player
        if (bullet.position.distanceTo(player.position) < 0.5) {
          scene.remove(bullet);
          game.enemyBullets.splice(i, 1);
          game.health -= 5;
          setHealth(game.health);
          createExplosion(bullet.position, 0xff0000);
          if (game.health <= 0) {
            setGameState('gameover');
          }
          continue;
        }

        if (bullet.position.z > 10 || bullet.position.z < -30) {
          scene.remove(bullet);
          game.enemyBullets.splice(i, 1);
        }
      }

      // Check bullet-enemy collisions
      for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        for (let j = game.enemies.length - 1; j >= 0; j--) {
          const enemy = game.enemies[j];
          if (bullet.position.distanceTo(enemy.position) < 0.5) {
            enemy.health--;
            scene.remove(bullet);
            game.bullets.splice(i, 1);
            
            if (enemy.health <= 0) {
              createExplosion(enemy.position, 0xff0044);
              scene.remove(enemy);
              game.enemies.splice(j, 1);
              game.score += 10;
              setScore(game.score);
            }
            break;
          }
        }
      }

      // Update particles
      for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];
        particle.position.add(particle.velocity);
        particle.life--;
        particle.material.opacity = particle.life / 30;
        particle.material.transparent = true;

        if (particle.life <= 0) {
          scene.remove(particle);
          game.particles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-start">
            {/* Score */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">SCORE</span>
              </div>
              <div className="text-3xl font-bold text-white">{score}</div>
              <div className="text-xs text-gray-400">High: {highScore}</div>
            </div>

            {/* Wave */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Zap className="w-5 h-5" />
                <span className="font-bold">WAVE</span>
              </div>
              <div className="text-3xl font-bold text-white">{wave}</div>
            </div>

            {/* Health */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <Heart className="w-5 h-5" />
                <span className="font-bold">HEALTH</span>
              </div>
              <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${health}%` }}
                />
              </div>
              <div className="text-sm text-white mt-1">{health}%</div>
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <div className="text-white text-sm text-center">
              <span className="text-cyan-400">WASD</span> or <span className="text-cyan-400">Arrows</span> to move • 
              <span className="text-cyan-400"> SPACE</span> or <span className="text-cyan-400">Click</span> to shoot • 
              <span className="text-cyan-400"> ESC</span> to pause
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="text-center">
            <div className="mb-8">
              <Crosshair className="w-24 h-24 mx-auto text-cyan-400 mb-4" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                SPACE SHOOTER
              </h1>
              <p className="text-xl text-gray-300">Defend against the alien invasion!</p>
            </div>

            {highScore > 0 && (
              <div className="mb-6 text-yellow-400">
                <Trophy className="w-6 h-6 inline mr-2" />
                High Score: {highScore}
              </div>
            )}

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-12 py-4 rounded-lg text-xl font-bold hover:scale-105 transition-transform shadow-lg"
            >
              START GAME
            </button>

            <div className="mt-8 text-gray-400 text-sm max-w-md mx-auto">
              <p className="mb-2">🎮 Use WASD or Arrow keys to move</p>
              <p className="mb-2">🔫 Press SPACE or Click to shoot</p>
              <p>💥 Destroy enemies before they reach you!</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center bg-gray-900 p-12 rounded-2xl border-2 border-red-500">
            <h2 className="text-5xl font-bold text-red-500 mb-4">GAME OVER</h2>
            
            <div className="mb-6">
              <div className="text-gray-400 mb-2">Final Score</div>
              <div className="text-4xl font-bold text-white mb-4">{score}</div>
              
              <div className="text-gray-400 mb-2">Wave Reached</div>
              <div className="text-3xl font-bold text-purple-400 mb-4">{wave}</div>
              
              {score === highScore && score > 0 && (
                <div className="text-yellow-400 text-xl mb-4">
                  🏆 NEW HIGH SCORE! 🏆
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {gameState === 'playing' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <Crosshair className="w-8 h-8 text-cyan-400 opacity-50" />
        </div>
      )}
    </div>
  );
};

export default SpaceShooter;
