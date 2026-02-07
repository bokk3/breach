// Audio System - Synthetic Cyberpunk Sounds
// Uses Web Audio API to generate sounds (no external files needed)

class AudioSystem {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.3; // Default volume (0-1)
    this.initialized = false;
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.context.destination);
      this.initialized = true;
      console.log('Audio system initialized');
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.enabled = false;
    }
  }

  // Create oscillator for sound generation
  createOscillator(type, frequency, duration, volume = 1) {
    if (!this.enabled || !this.initialized) return null;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.value = volume * this.volume;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    return { osc, gain };
  }

  // Hack success sound (ascending beep)
  playHackSuccess() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sine', 800, 0.2, 0.3);
    
    // Frequency sweep up
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    
    // Envelope
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Hack fail sound (descending buzz)
  playHackFail() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sawtooth', 400, 0.3, 0.4);
    
    // Frequency sweep down
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    // Envelope
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Node click sound (short blip)
  playNodeClick() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sine', 1000, 0.05, 0.2);
    
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Firewall hit sound (harsh buzz)
  playFirewallHit() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    
    // Create two oscillators for harsh sound
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.value = 200;
    osc2.frequency.value = 203; // Slightly detuned for harshness
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.2);
  }

  // Level up sound (triumphant arpeggio)
  playLevelUp() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const { osc, gain } = this.createOscillator('sine', freq, 0.3, 0.25);
      const startTime = now + (i * 0.08);
      
      gain.gain.setValueAtTime(0.25 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // XP gain sound (quick rising tone)
  playXPGain() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('triangle', 600, 0.15, 0.2);
    
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
    
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Combo sound (pitch increases with combo)
  playCombo(comboLevel) {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const baseFreq = 400 + (comboLevel * 50); // Higher pitch for higher combos
    const { osc, gain } = this.createOscillator('sine', baseFreq, 0.1, 0.25);
    
    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Button click sound
  playButtonClick() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('square', 800, 0.05, 0.15);
    
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Victory sound (celebratory melody)
  playVictory() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.15 },  // E5
      { freq: 783.99, time: 0.3 },   // G5
      { freq: 1046.50, time: 0.45 }, // C6
      { freq: 783.99, time: 0.6 },   // G5
      { freq: 1046.50, time: 0.75 }  // C6
    ];
    
    melody.forEach(note => {
      const { osc, gain } = this.createOscillator('sine', note.freq, 0.2, 0.3);
      const startTime = now + note.time;
      
      gain.gain.setValueAtTime(0.3 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Ambient background hum (optional, can be toggled)
  playAmbientHum() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sine', 60, 2, 0.05);
    
    // Very subtle, continuous hum
    gain.gain.setValueAtTime(0.05 * this.volume, now);
    
    osc.start(now);
    osc.stop(now + 2);
  }

  // Hack sequence timer tick
  playTimerTick() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sine', 1200, 0.03, 0.1);
    
    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Space shooter laser sound
  playLaser() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sawtooth', 800, 0.08, 0.15);
    
    // Frequency sweep down for laser effect
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Space shooter explosion
  playExplosion() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    
    // Create noise-like explosion with multiple oscillators
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const osc3 = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc3.type = 'triangle';
    
    osc1.frequency.value = 100;
    osc2.frequency.value = 150;
    osc3.frequency.value = 200;
    
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(this.masterGain);
    
    // Explosive envelope
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    // Frequency sweep down
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(75, now + 0.3);
    osc3.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
    osc3.stop(now + 0.3);
  }

  // Space shooter hit sound
  playHit() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('square', 600, 0.05, 0.2);
    
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Space shooter damage taken
  playDamage() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sawtooth', 200, 0.2, 0.3);
    
    // Harsh damage sound
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Pattern symbol appear sound
  playSymbolAppear() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('triangle', 1500, 0.08, 0.15);
    
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
    
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Correct input sound
  playCorrectInput() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sine', 1000, 0.1, 0.2);
    
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Wrong input sound
  playWrongInput() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sawtooth', 300, 0.15, 0.25);
    
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    
    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Defense warning sound (node about to become firewall)
  playDefenseWarning() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('triangle', 400, 0.5, 0.2);
    
    // Pulsing warning sound
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(500, now + 0.1);
    osc.frequency.setValueAtTime(400, now + 0.2);
    osc.frequency.setValueAtTime(500, now + 0.3);
    osc.frequency.setValueAtTime(400, now + 0.4);
    
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.setValueAtTime(0.1 * this.volume, now + 0.1);
    gain.gain.setValueAtTime(0.2 * this.volume, now + 0.2);
    gain.gain.setValueAtTime(0.1 * this.volume, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Defense activated sound (firewall deployed)
  playDefenseActivated() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    
    // Two-tone alarm
    const { osc: osc1, gain: gain1 } = this.createOscillator('square', 600, 0.4, 0.25);
    const { osc: osc2, gain: gain2 } = this.createOscillator('square', 800, 0.4, 0.25);
    
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.setValueAtTime(800, now + 0.2);
    
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.setValueAtTime(600, now + 0.2);
    
    gain1.gain.setValueAtTime(0.25 * this.volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    gain2.gain.setValueAtTime(0.25 * this.volume, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now);
    osc2.stop(now + 0.4);
  }

  // Error sound (for starter node requirement)
  playError() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    const { osc, gain } = this.createOscillator('sawtooth', 200, 0.3, 0.3);
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Power-up collect sound
  playPowerUpCollect() {
    if (!this.enabled || !this.initialized) return;

    const now = this.context.currentTime;
    
    // Ascending chime
    const { osc: osc1, gain: gain1 } = this.createOscillator('sine', 800, 0.4, 0.3);
    const { osc: osc2, gain: gain2 } = this.createOscillator('sine', 1200, 0.4, 0.3);
    
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
    
    osc2.frequency.setValueAtTime(1200, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
    
    gain1.gain.setValueAtTime(0.3 * this.volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    gain2.gain.setValueAtTime(0.3 * this.volume, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  }

  // Set volume (0-1)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  // Toggle audio on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Mute/unmute
  mute() {
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }

  unmute() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
}

// Create global audio instance
const audio = new AudioSystem();

// Initialize on first user interaction
document.addEventListener('click', () => {
  audio.init();
}, { once: true });

// Export for use in other files
window.audio = audio;
