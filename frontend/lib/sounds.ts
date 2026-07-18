// Sound utilities — generated via Web Audio API, no external files required.

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx || _ctx.state === 'closed') {
      _ctx = new AudioContext();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

// ── Message notification — two ascending tones ────────────────────
export function playMessageSound(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 880, t, 0.13, 0.22);
  tone(ctx, 1174, t + 0.14, 0.16, 0.18);
}

// ── Ringtone — repeating pulse pattern ───────────────────────────
let _ringStopped = false;

export function startRingtone(): void {
  stopRingtone();
  _ringStopped = false;

  function ring() {
    if (_ringStopped) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    tone(ctx, 740, t, 0.18, 0.38);
    tone(ctx, 740, t + 0.28, 0.18, 0.38);
    setTimeout(ring, 1800);
  }

  ring();
}

export function stopRingtone(): void {
  _ringStopped = true;
}
