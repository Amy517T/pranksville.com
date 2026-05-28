let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playAmbientDrone() {
  const ctx = getCtx();
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(55, ctx.currentTime);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(58, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
  gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 4);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start();
  osc2.start();

  return { stop: () => { osc1.stop(); osc2.stop(); } };
}

export function playJumpscare() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);

  // Add noise burst
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
  }
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start();
}

export function playWhisper() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.sin((i / bufferSize) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * 0.05 * envelope;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  filter.Q.setValueAtTime(5, ctx.currentTime);

  source.buffer = buffer;
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export function playDoorSlam() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.exp(-t * 15);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  // Low thud
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(40, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
  oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playCreepy() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 2);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1);
  gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 2.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2.5);
}

export function playPossession() {
  const ctx = getCtx();
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100 + i * 33, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50 + i * 20, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
  }
}

export function playHeartbeat() {
  const ctx = getCtx();
  const playBeat = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, time);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.15);
  };
  playBeat(ctx.currentTime);
  playBeat(ctx.currentTime + 0.2);
}

export function playPursuitWarning() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

export const soundMap: Record<string, () => void> = {
  jumpscare: playJumpscare,
  whisper: playWhisper,
  door_slam: playDoorSlam,
  creepy: playCreepy,
  possession: playPossession,
  illusion: playCreepy,
  mirror: playWhisper,
  shadow: playCreepy,
};
