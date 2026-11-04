"use client";
// Âm thanh đúng / sai / hoàn thành (tạo bằng Web Audio, không cần file mp3)
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}
function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, a.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}
export const sfx = {
  correct() {
    tone(660, 0, 0.12);
    tone(990, 0.1, 0.18);
  },
  wrong() {
    tone(220, 0, 0.18, "square", 0.08);
    tone(180, 0.15, 0.25, "square", 0.08);
  },
  tap() {
    tone(520, 0, 0.05, "triangle", 0.08);
  },
  done() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.2));
  },
};
