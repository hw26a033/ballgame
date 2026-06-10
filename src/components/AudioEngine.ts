class AudioEngine {
  private ctx: AudioContext | null = null;
  private rollOsc: OscillatorNode | null = null;
  private rollGain: GainNode | null = null;
  private isRollingActive = false;

  private init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API is not supported in this browser.');
    }
  }

  playJump() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playBounce() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playBoost() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);

    const biquad = this.ctx.createBiquadFilter();
    biquad.type = 'lowpass';
    biquad.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(biquad);
    biquad.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playCheckpoint() {
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    osc1.frequency.setValueAtTime(554.37, this.ctx.currentTime + 0.1); // C#5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
    osc2.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.4);
    osc2.stop(this.ctx.currentTime + 0.4);
  }

  playFall() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  playGoal() {
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Beautiful C Major Arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.0, this.ctx!.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx!.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.4);
    });
  }

  startRollingLoop() {
    this.init();
    if (!this.ctx || this.isRollingActive) return;

    try {
      this.rollOsc = this.ctx.createOscillator();
      this.rollGain = this.ctx.createGain();

      this.rollOsc.type = 'triangle';
      // Low rumble
      this.rollOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      // Low pass filter to make it sound muffled/heavy
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, this.ctx.currentTime);

      this.rollGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.rollOsc.connect(filter);
      filter.connect(this.rollGain);
      this.rollGain.connect(this.ctx.destination);

      this.rollOsc.start();
      this.isRollingActive = true;
    } catch {
      this.isRollingActive = false;
    }
  }

  updateRollingSound(speed: number, isGrounded: boolean) {
    if (!this.ctx || !this.isRollingActive || !this.rollGain || !this.rollOsc) return;

    try {
      if (this.ctx.state === 'suspended') {
        // Resume on click
        return;
      }

      if (!isGrounded || speed < 0.1) {
        // Shhhh
        this.rollGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.05);
      } else {
        // Speed up to 15m/s map to pitch and volume
        const targetVol = Math.min(0.2, (speed / 10) * 0.12);
        const targetFreq = 45 + Math.min(80, (speed / 10) * 60);

        this.rollGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
        this.rollOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      }
    } catch {
      // Ignored
    }
  }

  stopRollingLoop() {
    if (this.rollOsc) {
      try {
        this.rollOsc.stop();
        this.rollOsc.disconnect();
      } catch {}
      this.rollOsc = null;
    }
    this.rollGain = null;
    this.isRollingActive = false;
  }

  // Resume context in response to user interaction
  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

export const gameAudio = new AudioEngine();
export default gameAudio;
