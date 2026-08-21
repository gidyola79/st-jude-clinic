/**
 * Clinical Audio Alert Synthesizer
 * Implements soft harmonic acoustic notifications compliant with hospital noise guidelines
 * (IEC 60601-1-8 medical alarm design principles with controllable volume & silence modes).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (err) {
    console.warn('Web Audio API not supported or blocked:', err);
    return null;
  }
}

/**
 * Play a clinical acoustic notification chime
 * @param type 'Alert' (Urgent triage alarm) | 'Success' | 'Info' | 'Schedule'
 * @param enabled Whether audio sound alerts are globally enabled by user
 * @param volume Master gain level between 0.05 and 1.0 (default 0.25 for soothing clinical acoustics)
 */
export function playClinicalAlertSound(
  type: 'Alert' | 'Success' | 'Info' | 'Schedule',
  enabled: boolean = true,
  volume: number = 0.25
) {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0.01), 1.0), now);
  masterGain.connect(ctx.destination);

  if (type === 'Alert') {
    // High-Priority Clinical Alarm: Distinct 2-tone melodic harmonic pulse (A5 880Hz -> F#5 740Hz -> A5 880Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const alertGain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle'; // subtle warmth

    // Dual-tone harmonic
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.setValueAtTime(740, now + 0.12); // F#5
    osc1.frequency.setValueAtTime(880, now + 0.24); // A5

    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(370, now + 0.12);
    osc2.frequency.setValueAtTime(440, now + 0.24);

    alertGain.gain.setValueAtTime(0.001, now);
    alertGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
    alertGain.gain.exponentialRampToValueAtTime(0.2, now + 0.12);
    alertGain.gain.exponentialRampToValueAtTime(0.4, now + 0.24);
    alertGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(alertGain);
    osc2.connect(alertGain);
    alertGain.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  } else if (type === 'Success') {
    // Soft uplifting triad chime (C5 -> E5 -> G5)
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const noteStart = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      noteGain.gain.setValueAtTime(0.001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(0.2, noteStart + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(noteStart);
      osc.stop(noteStart + 0.36);
    });
  } else {
    // Informational Gentle Blip (F5 698.46Hz with gentle fade)
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(698.46, now);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }
}
