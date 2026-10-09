/**
 * Web Audio API Sound Synthesizer
 * Generates all 8-bit / retro sound effects and ambient tension music without external asset dependencies.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = typeof localStorage !== 'undefined' ? localStorage.getItem('escape_work_muted') === 'true' : false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.bgmStep = 0;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('escape_work_muted', this.isMuted);
    }
    if (this.isMuted) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15, pitchBend = null) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (pitchBend) {
        osc.frequency.exponentialRampToValueAtTime(pitchBend, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback failsafe
    }
  }

  // Sound Effects
  playClick() {
    this.playTone(800, 'triangle', 0.04, 0.1, 400);
  }

  playType() {
    this.playTone(1200, 'square', 0.02, 0.03, 900);
  }

  playAlert() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Siren beep beep
    [0, 0.15, 0.3].forEach((delay) => {
      setTimeout(() => {
        this.playTone(880, 'sawtooth', 0.1, 0.2, 440);
      }, delay * 1000);
    });
  }

  playSuccess() {
    if (this.isMuted) return;
    // Ascending arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.18);
      }, idx * 100);
    });
  }

  playDing() {
    // Elevator chime (two high bells)
    this.playTone(1046.5, 'sine', 0.4, 0.2); // C6
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.5, 0.2); // E6
    }, 150);
  }

  playItem() {
    // Shimmer sparkle
    const notes = [784, 987, 1174, 1568];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.08, 0.12);
      }, idx * 60);
    });
  }

  playFail() {
    if (this.isMuted) return;
    // Sad brass trombone descending
    const notes = [370, 349, 330, 261];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.18, freq * 0.85);
      }, idx * 180);
    });
  }

  // Tension Lo-fi BGM (Subtle pulsing rhythm)
  startBgm() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    this.bgmStep = 0;

    const baseFrequencies = [110, 110, 130.81, 98]; // A2, A2, C3, G2

    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.bgmPlaying) return;
      const freq = baseFrequencies[this.bgmStep % baseFrequencies.length];
      this.playTone(freq, 'triangle', 0.2, 0.05);

      if (this.bgmStep % 2 === 1) {
        // High tick
        this.playTone(800, 'sine', 0.03, 0.02);
      }
      this.bgmStep++;
    }, 450);
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new SoundEngine();
