import React, { useEffect, useRef } from 'react';

/**
 * JarvisVocalCore Component
 * Dynamic, interactive holographic Iron Man J.A.R.V.I.S. / F.R.I.D.A.Y. MK VII vocal interface core
 * Adapted directly from voice/j_a_r_v_i_s_mk_vii_dynamic_vocal_interface.html
 */
export const JarvisVocalCore = ({
  mode = 'listening', // 'connecting' | 'listening' | 'user_speaking' | 'thinking' | 'ai_speaking'
  agent = 'jarvis',   // 'jarvis' | 'friday'
  onCoreClick,
  gain = 1.4
}) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    energy: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    pitchHz: 148,
    time: 0,
    radarAngle: -0.35,
    ringRot1: 0,
    ringRot2: 0,
    ringRot3: 0,
    shockwaves: [],
    lastShockwaveTime: 0,
    freqData: new Uint8Array(64),
    micActive: false,
    audioCtx: null,
    analyser: null,
    micStream: null
  });

  const modeRef = useRef(mode);
  const agentRef = useRef(agent);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    agentRef.current = agent;
  }, [agent]);

  // Real microphone audio analyzer connection for authentic vocal reactions
  useEffect(() => {
    let active = true;
    const connectMic = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);

        stateRef.current.audioCtx = audioCtx;
        stateRef.current.analyser = analyser;
        stateRef.current.micStream = stream;
        stateRef.current.micActive = true;
      } catch (err) {
        stateRef.current.micActive = false;
      }
    };

    connectMic();

    return () => {
      active = false;
      if (stateRef.current.micStream) {
        stateRef.current.micStream.getTracks().forEach(t => t.stop());
      }
      if (stateRef.current.audioCtx) {
        try { stateRef.current.audioCtx.close(); } catch {}
      }
      stateRef.current.micActive = false;
    };
  }, []);

  // Main 60fps Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const particles = [];
    const PARTICLE_COUNT = 48;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.12,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      const state = stateRef.current;
      const currentMode = modeRef.current;
      const isFriday = agentRef.current === 'friday';

      const pal = isFriday
        ? {
            rgb: '244, 63, 94',       // Stark Rose / Coral
            secRgb: '0, 229, 255',    // Cyan secondary
            dangerRgb: '251, 191, 36' // Gold warning
          }
        : {
            rgb: '0, 229, 255',       // Cyan Primary
            secRgb: '8, 145, 178',    // Deep Blue secondary
            dangerRgb: '244, 63, 94'  // Rose warning
          };

      const rgb = pal.rgb;
      const secRgb = pal.secRgb;
      const dangerRgb = pal.dangerRgb;

      const dt = 0.016;
      state.time += dt;

      // Update Audio Metrics
      if (currentMode === 'user_speaking' && state.micActive && state.analyser) {
        state.analyser.getByteFrequencyData(state.freqData);
        let bassSum = 0, midSum = 0, trebleSum = 0;
        for (let i = 1; i < 8; i++) bassSum += state.freqData[i];
        for (let i = 8; i < 24; i++) midSum += state.freqData[i];
        for (let i = 24; i < 48; i++) trebleSum += state.freqData[i];

        const rawBass = Math.min(1, (bassSum / (7 * 255)) * gain * 1.4);
        const rawMid = Math.min(1, (midSum / (16 * 255)) * gain * 1.5);
        const rawTreble = Math.min(1, (trebleSum / (24 * 255)) * gain * 1.6);
        const rawEnergy = Math.min(1, rawBass * 0.45 + rawMid * 0.4 + rawTreble * 0.15);

        state.bass += (rawBass - state.bass) * 0.32;
        state.mid += (rawMid - state.mid) * 0.32;
        state.treble += (rawTreble - state.treble) * 0.32;
        state.energy += (rawEnergy - state.energy) * 0.32;
        state.pitchHz = Math.round(110 + state.mid * 220 + state.treble * 130);
      } else if (currentMode === 'ai_speaking') {
        const t = state.time;
        const phraseGate = Math.sin(t * 1.25) > -0.6 ? 1 : 0.15;
        const syllableWave =
          0.45 * Math.max(0, Math.sin(t * 11.5)) +
          0.38 * Math.max(0, Math.sin(t * 7.8 + 1.2)) +
          0.25 * Math.cos(t * 18.2 - 0.7);

        const targetEnergy = Math.min(1, (0.16 + syllableWave * 0.74 * phraseGate) * (gain * 0.8));
        const targetBass = Math.min(1, targetEnergy * (0.85 + 0.25 * Math.sin(t * 8.5)));
        const targetMid = Math.min(1, targetEnergy * (0.95 + 0.3 * Math.cos(t * 14.2)));
        const targetTreble = Math.min(1, targetEnergy * (0.7 + 0.4 * Math.sin(t * 22.5)));

        state.energy += (targetEnergy - state.energy) * 0.28;
        state.bass += (targetBass - state.bass) * 0.25;
        state.mid += (targetMid - state.mid) * 0.28;
        state.treble += (targetTreble - state.treble) * 0.3;
        state.pitchHz = Math.round(120 + state.mid * 190 + state.treble * 110);

        for (let i = 0; i < 48; i++) {
          const norm = i / 48;
          const formant1 = Math.exp(-Math.pow((norm - 0.2) / 0.12, 2));
          const formant2 = Math.exp(-Math.pow((norm - 0.48) / 0.15, 2));
          const wave = formant1 * state.bass * 235 + formant2 * state.mid * 240;
          state.freqData[i] = Math.min(255, Math.max(8, Math.floor(wave)));
        }
      } else if (currentMode === 'thinking') {
        const spinPulse = 0.35 + 0.25 * Math.sin(state.time * 16);
        state.energy += (spinPulse - state.energy) * 0.3;
        state.bass = state.energy * 0.4;
        state.mid = state.energy * 1.2;
        state.treble = state.energy * 1.4;
        state.pitchHz = 380 + Math.round(Math.sin(state.time * 16) * 110);
      } else {
        // Idle listening breathing
        const idlePulse = 0.06 + 0.035 * Math.sin(state.time * 2.4);
        state.energy += (idlePulse - state.energy) * 0.14;
        state.bass = state.energy * 0.8;
        state.mid = state.energy * 0.6;
        state.treble = state.energy * 0.4;
        state.pitchHz = 110 + Math.round(Math.sin(state.time * 0.9) * 8);
        for (let i = 0; i < 48; i++) {
          state.freqData[i] = Math.max(4, Math.floor(12 * Math.sin(i * 0.25 + state.time * 2)));
        }
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.46;
      const baseRadius = Math.min(width, height) * 0.22;
      const clampedRadius = Math.max(75, Math.min(145, baseRadius));
      const e = state.energy;
      const isSpeaking = e > 0.08 && currentMode !== 'idle';

      // Shockwave rings
      if (isSpeaking && e > 0.45 && state.time - state.lastShockwaveTime > 0.25) {
        state.shockwaves.push({
          r: clampedRadius * 1.05,
          alpha: 0.45 * e,
          speed: 2.2 + e * 2.5
        });
        state.lastShockwaveTime = state.time;
      }

      // LAYER A: Off-Center Faint Orbital Circles
      ctx.save();
      ctx.strokeStyle = `rgba(${rgb}, ${0.05 + e * 0.04})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx + clampedRadius * 0.6, cy + clampedRadius * 1.6, clampedRadius * 2.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // LAYER B: Bioluminescent Floating Dust Particles
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const speedMult = 1 + e * 3.5;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
        p.phase += p.speed * speedMult;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const twinkle = 0.5 + 0.5 * Math.sin(p.phase);
        const alpha = p.alpha * twinkle * (0.8 + e * 0.6);
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.shadowColor = `rgba(${rgb}, 0.8)`;
        ctx.shadowBlur = p.size * 3.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + e * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // LAYER C: Ambient Radial Core Bloom
      const bloomRadius = clampedRadius * (1.85 + e * 0.65);
      const bloomGrad = ctx.createRadialGradient(cx, cy, clampedRadius * 0.1, cx, cy, bloomRadius);
      bloomGrad.addColorStop(0, `rgba(${rgb}, ${0.18 + e * 0.24})`);
      bloomGrad.addColorStop(0.45, `rgba(${secRgb}, ${0.08 + e * 0.12})`);
      bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, bloomRadius, 0, Math.PI * 2);
      ctx.fill();

      // LAYER D: Expanding Shockwaves
      ctx.save();
      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.r += sw.speed;
        sw.alpha *= 0.96;
        if (sw.alpha <= 0.01) {
          state.shockwaves.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(${rgb}, ${sw.alpha})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Rotations
      const rotSpeed = currentMode === 'thinking' ? 0.045 : (0.008 + e * 0.035);
      state.radarAngle += rotSpeed * 1.4;
      state.ringRot1 += rotSpeed * 0.9;
      state.ringRot2 -= rotSpeed * 1.15;
      state.ringRot3 += rotSpeed * 1.6;

      // LAYER E: Outer Containment Ring & Translucent Band
      const outerR = clampedRadius * (1.0 + state.bass * 0.08);
      const innerR = clampedRadius * (0.74 + state.mid * 0.06);

      ctx.save();
      ctx.strokeStyle = `rgba(${rgb}, ${0.52 + e * 0.38})`;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = `rgba(${rgb}, 0.75)`;
      ctx.shadowBlur = 14 + e * 18;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent Band
      ctx.strokeStyle = `rgba(${rgb}, ${0.08 + e * 0.1})`;
      ctx.lineWidth = (outerR - innerR) * 0.74;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, (outerR + innerR) * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Boundary Ring
      ctx.strokeStyle = `rgba(${rgb}, ${0.38 + e * 0.38})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // LAYER F: Counter-Rotating Dashed Technical Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(state.ringRot2);
      ctx.strokeStyle = `rgba(${rgb}, ${0.42 + e * 0.4})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, innerR * 0.93, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Segmented Jarvis Arc Brackets
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(state.ringRot1);
      ctx.strokeStyle = `rgba(${rgb}, ${0.25 + e * 0.6})`;
      ctx.lineWidth = 2.4;
      const arcR = outerR * (1.06 + e * 0.07);
      for (let k = 0; k < 3; k++) {
        const startA = (k * Math.PI * 2) / 3;
        const spanA = 0.45 + e * 0.38;
        ctx.beginPath();
        ctx.arc(0, 0, arcR, startA, startA + spanA);
        ctx.stroke();
      }
      ctx.restore();

      // LAYER G: Rotating Radar Sweep Wedge
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(state.radarAngle);
      const sweepSpan = 0.52 + e * 0.28;
      const sweepSteps = 24;
      for (let s = 0; s < sweepSteps; s++) {
        const frac = s / sweepSteps;
        const a0 = -sweepSpan * (1 - frac);
        const a1 = -sweepSpan * (1 - (s + 1) / sweepSteps) + 0.005;
        const sliceAlpha = Math.pow(frac, 1.8) * (0.24 + e * 0.3);
        ctx.fillStyle = `rgba(${rgb}, ${sliceAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerR * 0.99, a0, a1);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = `rgba(${rgb}, ${0.5 + e * 0.45})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(outerR * 0.99, 0);
      ctx.stroke();
      ctx.restore();

      // LAYER H: 360° Radial Frequency Spectrum Bars
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(state.ringRot3 * 0.25);
      const numBars = 56;
      for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2;
        const binVal = (state.freqData[i % 40] || 0) / 255;
        const barLen = 2 + Math.pow(binVal, 1.35) * (clampedRadius * 0.4) * (0.25 + e * 1.4);

        const rStart = innerR * 0.98;
        const rEnd = rStart + barLen;

        const x1 = Math.cos(angle) * rStart;
        const y1 = Math.sin(angle) * rStart;
        const x2 = Math.cos(angle) * rEnd;
        const y2 = Math.sin(angle) * rEnd;

        ctx.strokeStyle = binVal > 0.65 && currentMode === 'user_speaking'
          ? `rgba(${dangerRgb}, ${0.55 + binVal * 0.45})`
          : `rgba(${rgb}, ${0.2 + binVal * 0.75})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // LAYER I: Dynamic Harmonic Liquid Waveform Rings
      if (e > 0.03) {
        ctx.save();
        ctx.translate(cx, cy);

        const waveLayers = [
          { radius: innerR * 0.72, amp: clampedRadius * 0.16 * state.bass, freq1: 3, freq2: 7, speed: 4.2, alpha: 0.8, width: 1.8, useSecondary: false },
          { radius: innerR * 0.56, amp: clampedRadius * 0.14 * state.mid, freq1: 5, freq2: 9, speed: -5.6, alpha: 0.6, width: 1.4, useSecondary: true },
          { radius: innerR * 0.40, amp: clampedRadius * 0.11 * state.treble, freq1: 4, freq2: 12, speed: 7.1, alpha: 0.7, width: 1.2, useSecondary: false }
        ];

        waveLayers.forEach((wl) => {
          ctx.beginPath();
          const points = 100;
          for (let j = 0; j <= points; j++) {
            const theta = (j / points) * Math.PI * 2;
            const harmonic =
              Math.sin(theta * wl.freq1 + state.time * wl.speed) * 0.6 +
              Math.cos(theta * wl.freq2 - state.time * wl.speed * 1.3) * 0.4;
            const r = wl.radius + harmonic * wl.amp;
            const px = Math.cos(theta) * r;
            const py = Math.sin(theta) * r;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          const strokeRgb = wl.useSecondary ? secRgb : rgb;
          ctx.strokeStyle = `rgba(${strokeRgb}, ${wl.alpha * Math.min(1, e * 1.9)})`;
          ctx.lineWidth = wl.width;
          ctx.shadowColor = `rgba(${rgb}, 0.75)`;
          ctx.shadowBlur = 10 * e;
          ctx.stroke();
        });

        ctx.restore();
      }

      // LAYER J: Inner Vocal Nucleus & Orbiting Nodes
      ctx.save();
      const nucleusR = Math.max(3, clampedRadius * (0.03 + e * 0.16));
      const nucGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucleusR * 2.5);
      nucGrad.addColorStop(0, `rgba(255, 255, 255, ${0.45 + e * 0.6})`);
      nucGrad.addColorStop(0.4, `rgba(${rgb}, ${0.35 + e * 0.6})`);
      nucGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, nucleusR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting blip nodes
      const node1Angle = state.ringRot1 * 0.7 + 1.1;
      const node1R = innerR * 0.54;
      ctx.fillStyle = `rgba(${rgb}, 0.9)`;
      ctx.shadowColor = `rgba(${rgb}, 1)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(node1Angle) * node1R, cy + Math.sin(node1Angle) * node1R, 2.2, 0, Math.PI * 2);
      ctx.fill();

      const node2Angle = state.ringRot2 * 0.9 + 0.85;
      const node2R = innerR * 0.93;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(node2Angle) * node2R, cy + Math.sin(node2Angle) * node2R, 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gain]);

  return (
    <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={onCoreClick}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default JarvisVocalCore;
