const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8421;
const OUTPUT_FILE = path.join(process.cwd(), 'generated_mughal_empire_test_video.webm');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mughal Empire - Animation Generator</title>
  <style>
    body, html { margin: 0; padding: 0; background: #080A0F; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { width: 360px; height: 640px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border-radius: 20px; }
    #status { position: fixed; top: 10px; left: 10px; color: #10B981; font-family: monospace; font-size: 14px; z-index: 100; }
  </style>
</head>
<body>
  <div id="status">INITIALIZING CINEMA ENGINE...</div>
  <canvas id="c" width="1080" height="1920"></canvas>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const statusEl = document.getElementById('status');

    const TOTAL_DURATION = 12.0; // 4 scenes x 3.0s
    const targetW = 1080;
    const targetH = 1920;
    const accent = '#F59E0B'; // Golden amber imperial hue

    const scenes = [
      {
        id: 's1',
        title: 'PANIPAT 1526',
        duration: 3.0,
        visualType: 'radar',
        tag: '1526 FIRST CONQUEST',
        mainText: 'GUNPOWDER REVOLUTION AT PANIPAT.',
        subText: 'Babur crossed the rugged Khyber Pass with Ottoman field artillery, toppling Ibrahim Lodi’s massive war elephant army in hours.',
        metric: '1526 AD',
        startNum: 1500,
        endNum: 1526,
        numSuffix: ' AD'
      },
      {
        id: 's2',
        title: 'GOLDEN AGE',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'IMPERIAL GOLDEN AGE',
        mainText: 'AKBAR UNIFIES THE SUBCONTINENT.',
        subText: 'Religious syncretism, nine imperial courtiers, and unmatched agrarian wealth propelled the Mughal realm to over 24% of world economic output.',
        metric: '24.2% WORLD GDP',
        startNum: 5,
        endNum: 24.2,
        numSuffix: '% GDP'
      },
      {
        id: 's3',
        title: 'DECCAN CRISIS',
        duration: 3.0,
        visualType: 'pipeline',
        tag: 'AURANGZEB ATTRITION',
        mainText: 'THE 27-YEAR DECCAN WAR OF ATTRITION.',
        subText: 'Relentless southern military campaigns drained imperial coffers, alienating regional chieftains and igniting fierce Maratha guerrilla resistance.',
        metric: '27 YEAR WAR',
        startNum: 1,
        endNum: 27,
        numSuffix: ' YRS'
      },
      {
        id: 's4',
        title: '1857 FALL',
        duration: 3.0,
        visualType: 'terminal',
        tag: 'THE FINAL EXILE',
        mainText: 'THE 1857 COLLAPSE OF DELHI.',
        subText: 'Bahadur Shah Zafar stood as the last titular monarch as the East India Company seized Delhi, ending over three centuries of dynastic grandeur.',
        metric: '1857 AD',
        startNum: 1526,
        endNum: 1857,
        numSuffix: ' AD'
      }
    ];

    // Load Impasto Poster Artwork
    const posterImg = new Image();
    posterImg.crossOrigin = 'anonymous';
    posterImg.src = 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/impasto/poster.jpg';

    // Particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.0008,
      speedY: -Math.random() * 0.001 - 0.0003,
      alpha: Math.random() * 0.7 + 0.2
    }));

    // Audio Engine
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    masterGain.connect(dest);

    // Audio Beat Timer (120 BPM)
    let beatStep = 0;
    setInterval(() => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      beatStep++;

      // Kick drum on quarters
      if (beatStep % 4 === 0) {
        const kickOsc = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.12);
      }

      // Warm analog chord pad
      if (beatStep % 8 === 0) {
        const chords = [220, 261.63, 329.63, 392];
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(chords[(beatStep / 8) % chords.length], now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.3);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.6);
      }
    }, 125);

    function getCurrentScene(time) {
      let acc = 0;
      for (let i = 0; i < scenes.length; i++) {
        if (time < acc + scenes[i].duration || i === scenes.length - 1) {
          const localTime = Math.max(0, time - acc);
          return {
            scene: scenes[i],
            index: i,
            sceneLocalTime: localTime,
            progress: Math.min(1, localTime / scenes[i].duration)
          };
        }
        acc += scenes[i].duration;
      }
      return { scene: scenes[0], index: 0, sceneLocalTime: 0, progress: 0 };
    }

    function render(currentTime) {
      const { scene, index, sceneLocalTime, progress } = getCurrentScene(currentTime);

      // 1. CLEAR & OBSIDIAN BASE
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.fillStyle = '#080A0F';
      ctx.fillRect(0, 0, targetW, targetH);

      // 2. DRAW VIVID POSTER ARTWORK BACKDROP (60% VIBRANCY)
      if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
        ctx.save();
        const zoom = 1.02 + Math.sin(currentTime * 0.22) * 0.035;
        const drawW = targetW * zoom;
        const drawH = targetH * zoom;
        const drawX = (targetW - drawW) / 2;
        const drawY = (targetH - drawH) / 2;

        ctx.globalAlpha = 0.58;
        ctx.drawImage(posterImg, drawX, drawY, drawW, drawH);

        const vigGrad = ctx.createRadialGradient(
          targetW / 2, targetH * 0.46, targetW * 0.22,
          targetW / 2, targetH / 2, targetW * 0.78
        );
        vigGrad.addColorStop(0, 'rgba(8, 10, 15, 0.10)');
        vigGrad.addColorStop(0.65, 'rgba(8, 10, 15, 0.48)');
        vigGrad.addColorStop(1, 'rgba(8, 10, 15, 0.86)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.restore();
      }

      // 3. ATMOSPHERIC MESH AURA
      const auraX = targetW * (0.5 + Math.sin(currentTime * 0.8) * 0.15);
      const auraY = targetH * (0.4 + Math.cos(currentTime * 0.7) * 0.1);
      const auraRadius = Math.max(targetW, targetH) * 0.7;
      const auraGrad = ctx.createRadialGradient(auraX, auraY, 60, auraX, auraY, auraRadius);
      auraGrad.addColorStop(0, accent + '45');
      auraGrad.addColorStop(0.5, accent + '15');
      auraGrad.addColorStop(1, 'rgba(8, 10, 15, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, targetW, targetH);

      // 4. PERSPECTIVE FLOOR GRID
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      const gridOffset = (currentTime * 40) % gridSize;
      for (let x = 0; x < targetW; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, targetH);
        ctx.stroke();
      }
      for (let y = gridOffset; y < targetH; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(targetW, y);
        ctx.stroke();
      }

      // 5. FLOATING PARTICLES
      ctx.save();
      for (let p = 0; p < particles.length; p++) {
        const pt = particles[p];
        pt.x += pt.speedX;
        pt.y += pt.speedY;
        if (pt.y < 0) pt.y = 1;
        if (pt.x < 0) pt.x = 1;
        if (pt.x > 1) pt.x = 0;
        ctx.fillStyle = accent;
        ctx.globalAlpha = pt.alpha * (0.5 + Math.sin(currentTime * 2 + p) * 0.2);
        ctx.beginPath();
        ctx.arc(pt.x * targetW, pt.y * targetH, pt.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 6. TOP BRANDING POD
      const headerY = targetH * 0.05;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '800 24px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('INFRATECHAI', targetW * 0.07, headerY);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '600 18px -apple-system, sans-serif';
      ctx.fillText('• MUGHAL EMPIRE CINEMA', targetW * 0.07 + 175, headerY);

      const pillX = targetW * 0.93;
      ctx.fillStyle = 'rgba(20, 21, 24, 0.85)';
      ctx.beginPath();
      ctx.roundRect(pillX - 110, headerY - 22, 110, 32, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(pillX - 90, headerY - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('60 FPS', pillX - 50, headerY - 2);
      ctx.restore();

      // 7. NARRATIVE HEADLINE & TAG SECTION
      const enterEase = Math.min(1, Math.max(0, sceneLocalTime * 2.8));
      const smoothEase = 1 - Math.pow(1 - enterEase, 3);
      const textOffsetY = (1 - smoothEase) * 30;

      ctx.save();
      ctx.globalAlpha = smoothEase;

      const tagY = targetH * 0.09 + textOffsetY * 0.5;
      ctx.fillStyle = accent + '25';
      const tagText = scene.tag;
      ctx.font = '800 18px -apple-system, sans-serif';
      const tagMetrics = ctx.measureText(tagText);
      const tagPadding = 20;

      ctx.beginPath();
      ctx.roundRect(targetW * 0.07, tagY - 24, tagMetrics.width + tagPadding * 2, 38, 19);
      ctx.fill();
      ctx.strokeStyle = accent + '70';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.textAlign = 'left';
      ctx.fillText(tagText, targetW * 0.07 + tagPadding, tagY);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '700 18px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('0' + (index + 1) + ' / 04', targetW * 0.93, tagY);

      // Headline
      const headlineY = tagY + 54 + textOffsetY;
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';

      const maxTextW = targetW * 0.86;
      const words = (scene.mainText || '').split(' ');
      let line = '';
      let curY = headlineY;
      const lineHeight = 48 * 1.15;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextW && n > 0) {
          ctx.fillText(line, targetW * 0.07, curY);
          line = words[n] + ' ';
          curY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, targetW * 0.07, curY);
      ctx.restore();

      // 8. CENTER VISUAL STAGE: DEDICATED VISUAL ACTORS
      const stageCenterY = targetH * 0.44;
      const stageCenterX = targetW * 0.5;
      const stageRadius = targetW * 0.38;
      const visualType = scene.visualType;

      if (visualType === 'radar') {
        // Draw Battlefield Radar Sweep
        ctx.save();
        const radGrad = ctx.createRadialGradient(stageCenterX, stageCenterY, 10, stageCenterX, stageCenterY, stageRadius);
        radGrad.addColorStop(0, accent + '30');
        radGrad.addColorStop(0.6, accent + '10');
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(stageCenterX, stageCenterY, stageRadius, 0, Math.PI * 2);
        ctx.fill();

        for (let r = 1; r <= 4; r++) {
          const curR = (stageRadius / 4) * r;
          ctx.strokeStyle = r === 4 ? accent + '80' : 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.arc(stageCenterX, stageCenterY, curR, 0, Math.PI * 2);
          ctx.stroke();
        }

        const sweepAngle = (currentTime * 2.5) % (Math.PI * 2);
        ctx.save();
        ctx.translate(stageCenterX, stageCenterY);
        ctx.rotate(sweepAngle);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(stageRadius, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, stageRadius, -0.4, 0);
        ctx.closePath();
        ctx.fillStyle = accent + '25';
        ctx.fill();
        ctx.restore();

        const blips = [
          { a: 0.8, d: 0.35, label: 'BABUR FIELD ARTILLERY' },
          { a: 2.2, d: 0.65, label: 'LODI ELEPHANT FLANK' },
          { a: 3.7, d: 0.50, label: 'PANIPAT PLAIN' },
          { a: 5.1, d: 0.80, label: 'DELHI SULTANATE' }
        ];

        blips.forEach((b, idx) => {
          const bx = stageCenterX + Math.cos(b.a) * (stageRadius * b.d);
          const by = stageCenterY + Math.sin(b.a) * (stageRadius * b.d);
          const pulse = Math.sin(currentTime * 4 + idx) * 0.5 + 0.5;

          ctx.strokeStyle = accent;
          ctx.beginPath();
          ctx.arc(bx, by, 6 + pulse * 14, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 11px monospace';
          ctx.fillText(b.label, bx + 10, by + 4);
        });
        ctx.restore();

      } else if (visualType === 'pipeline') {
        // Draw Deccan War Logistics Pipeline
        ctx.save();
        const pipeW = targetW * 0.88;
        const pipeH = targetH * 0.22;
        const pipeX = stageCenterX - pipeW / 2;
        const pipeY = stageCenterY - pipeH / 2;

        ctx.fillStyle = 'rgba(16, 20, 30, 0.82)';
        ctx.beginPath();
        ctx.roundRect(pipeX, pipeY, pipeW, pipeH, 20);
        ctx.fill();
        ctx.strokeStyle = accent + '40';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '800 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DECCAN MILITARY EXPEDITION // SIEGE PIPELINE', pipeX + 20, pipeY + 24);

        ctx.fillStyle = accent;
        ctx.textAlign = 'right';
        ctx.fillText('27 YEARS', pipeX + pipeW - 20, pipeY + 24);

        const stages = [
          { name: 'DELHI COFFERS', sub: 'Imperial Treasury', status: 'PASS' },
          { name: 'SOUTHERN MARCH', sub: '170,000 Cavalry', status: 'PASS' },
          { name: 'DECCAN SIEGE', sub: 'Guerrilla Blockade', status: 'ACTIVE' },
          { name: 'EXHAUSTION', sub: 'Treasury Drain', status: 'READY' }
        ];

        const stageGap = (pipeW - 48) / stages.length;
        const nodeCenterY = pipeY + pipeH * 0.58;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pipeX + 24 + stageGap * 0.5, nodeCenterY);
        ctx.lineTo(pipeX + pipeW - 24 - stageGap * 0.5, nodeCenterY);
        ctx.stroke();

        const packetTravel = (currentTime * 1.5) % 1;
        const packetX = (pipeX + 24 + stageGap * 0.5) + (pipeW - 48 - stageGap) * packetTravel;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(packetX, nodeCenterY, 6, 0, Math.PI * 2);
        ctx.fill();

        stages.forEach((st, idx) => {
          const nx = pipeX + 24 + stageGap * (idx + 0.5);
          const isActive = st.status === 'ACTIVE';
          const isPass = st.status === 'PASS';

          ctx.fillStyle = isActive ? accent + '35' : isPass ? '#10B98125' : '#1F2433';
          ctx.beginPath();
          ctx.arc(nx, nodeCenterY, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isActive ? accent : isPass ? '#10B981' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '800 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(isPass ? '✔' : isActive ? '⚡' : '•', nx, nodeCenterY + 4);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 11px -apple-system, sans-serif';
          ctx.fillText(st.name, nx, nodeCenterY + 36);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.font = '600 9px monospace';
          ctx.fillText(st.sub, nx, nodeCenterY + 48);
        });
        ctx.restore();

      } else if (visualType === 'terminal') {
        // Draw 1857 Historical Chronicle Terminal
        ctx.save();
        const termW = targetW * 0.86;
        const termH = targetH * 0.25;
        const termX = stageCenterX - termW / 2;
        const termY = stageCenterY - termH / 2;

        ctx.fillStyle = '#10121A';
        ctx.beginPath();
        ctx.roundRect(termX, termY, termW, termH, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const headH = 38;
        ctx.fillStyle = '#181A24';
        ctx.beginPath();
        ctx.roundRect(termX, termY, termW, headH, [20, 20, 0, 0]);
        ctx.fill();

        ['#FF5F56', '#FFBD2E', '#27C93F'].forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(termX + 24 + idx * 18, termY + headH / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '600 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('mughal_annals_1857.history — Imperial Transition', stageCenterX, termY + 23);

        const lines = [
          { text: '// [DELHI CHRONICLE] 14 SEPTEMBER 1857 SIEGE', color: 'rgba(255,255,255,0.4)', prefix: '01' },
          { text: 'const sovereign = "Bahadur Shah Zafar";', color: '#93C5FD', prefix: '02' },
          { text: '- Imperial Dynasty: In sovereign control since 1526', color: '#F87171', prefix: '03' },
          { text: '+ East India Company takes Red Fort garrison', color: '#FCD34D', prefix: '04' },
          { text: '+ Zafar exiled to Rangoon, Burma under guard', color: '#4ADE80', prefix: '05' },
          { text: '✔ 331 YEARS DYNASTIC LINE DRAWN TO HISTORICAL CLOSE', color: accent, prefix: '06', bold: true }
        ];

        const startY = termY + headH + 34;
        const lineGap = 28;
        ctx.textAlign = 'left';

        lines.forEach((cl, idx) => {
          const curY = startY + idx * lineGap;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.font = '500 11px monospace';
          ctx.fillText(cl.prefix, termX + 20, curY);

          ctx.fillStyle = cl.color;
          ctx.font = cl.bold ? '800 13px monospace' : '600 12px monospace';
          ctx.fillText(cl.text, termX + 48, curY);
        });
        ctx.restore();

      } else {
        // Imperial 3D Keynote Crest Medallion (Akbar Golden Age)
        ctx.save();
        ctx.translate(stageCenterX, stageCenterY);
        ctx.rotate(currentTime * 0.3);
        for (let i = 0; i < 24; i++) {
          const ang = (i * Math.PI * 2) / 24;
          ctx.strokeStyle = i % 2 === 0 ? accent + '25' : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * (stageRadius * 1.3), Math.sin(ang) * (stageRadius * 1.3));
          ctx.stroke();
        }
        ctx.restore();

        const medGrad = ctx.createRadialGradient(stageCenterX, stageCenterY, 10, stageCenterX, stageCenterY, stageRadius * 0.7);
        medGrad.addColorStop(0, '#252936');
        medGrad.addColorStop(0.7, '#14161F');
        medGrad.addColorStop(1, '#0C0E14');
        ctx.fillStyle = medGrad;
        ctx.beginPath();
        ctx.arc(stageCenterX, stageCenterY, stageRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = accent;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 36px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('24.2%', stageCenterX, stageCenterY - 8);

        ctx.fillStyle = accent;
        ctx.font = '800 13px monospace';
        ctx.fillText('GLOBAL GDP SHARE', stageCenterX, stageCenterY + 18);
        ctx.restore();
      }

      // 9. LOWER NARRATIVE SUBTITLE POD
      const lowerCardY = targetH * 0.67;
      const lowerCardW = targetW * 0.86;
      const lowerCardX = targetW * 0.07;
      const lowerCardH = targetH * 0.16;

      ctx.save();
      ctx.fillStyle = 'rgba(16, 20, 30, 0.78)';
      ctx.beginPath();
      ctx.roundRect(lowerCardX, lowerCardY, lowerCardW, lowerCardH, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = 'rgba(229, 231, 238, 0.9)';
      ctx.font = '500 22px -apple-system, sans-serif';
      ctx.textAlign = 'left';

      const subWords = (scene.subText || '').split(' ');
      let sLine = '';
      let sCurY = lowerCardY + 40;
      const sLineH = 32;
      const maxSubW = lowerCardW - 48;

      for (let n = 0; n < subWords.length; n++) {
        const testLine = sLine + subWords[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxSubW && n > 0) {
          ctx.fillText(sLine, lowerCardX + 24, sCurY);
          sLine = subWords[n] + ' ';
          sCurY += sLineH;
        } else {
          sLine = testLine;
        }
      }
      ctx.fillText(sLine, lowerCardX + 24, sCurY);

      if (scene.metric) {
        const metricBarY = lowerCardY + lowerCardH - 42;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(lowerCardX + 32, metricBarY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '700 13px monospace';
        ctx.fillText('HISTORICAL TELEMETRY', lowerCardX + 48, metricBarY + 5);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(scene.metric, lowerCardX + lowerCardW - 24, metricBarY + 6);
      }
      ctx.restore();

      // 10. BOTTOM VISUALIZER & BRAND
      const footerY = targetH * 0.89;
      const barCount = 36;
      const barWidth = 8;
      const barSpacing = 10;
      const visualizerStartX = (targetW - (barCount * (barWidth + barSpacing))) / 2;

      for (let b = 0; b < barCount; b++) {
        const barHeight = 12 + Math.sin(currentTime * 10 + b * 0.35) * 20;
        ctx.fillStyle = b % 4 === 0 ? accent : 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.roundRect(visualizerStartX + b * (barWidth + barSpacing), footerY - barHeight / 2, barWidth, barHeight, 4);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '700 20px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('@infratechai • Code-Driven Documentary Cinema', targetW / 2, footerY + 44);

      // Segment Progress Bars
      const progY = 24;
      const progH = 6;
      const progTotalW = targetW - 64;
      const segSpacing = 10;
      const segW = (progTotalW - segSpacing * (scenes.length - 1)) / scenes.length;

      let accTime = 0;
      for (let s = 0; s < scenes.length; s++) {
        const segX = 32 + s * (segW + segSpacing);
        const scDuration = scenes[s].duration;
        let segFill = 0;
        if (currentTime >= accTime + scDuration) {
          segFill = 1;
        } else if (currentTime > accTime) {
          segFill = (currentTime - accTime) / scDuration;
        }
        accTime += scDuration;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(segX, progY, segW, progH, 3);
        ctx.fill();

        if (segFill > 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(segX, progY, segW * segFill, progH, 3);
          ctx.fill();
        }
      }
    }

    // Start Video Recording with MediaRecorder
    let startTime = null;
    let isRecording = false;
    let recorder = null;
    let chunks = [];

    async function startGeneration() {
      statusEl.innerText = "STARTING 60 FPS RECORDING...";
      const canvasStream = canvas.captureStream(60);
      const audioTracks = dest.stream.getAudioTracks();
      const combinedTracks = [...canvasStream.getVideoTracks(), ...audioTracks];
      const stream = new MediaStream(combinedTracks);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
      recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      
      recorder.onstop = async () => {
        statusEl.innerText = "UPLOADING GENERATED VIDEO TO DISK...";
        const blob = new Blob(chunks, { type: mimeType });
        const arrayBuf = await blob.arrayBuffer();
        await fetch('/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: arrayBuf
        });
        statusEl.innerText = "VIDEO GENERATED SUCCESSFULLY! EXITING.";
      };

      recorder.start(1000);
      isRecording = true;
      startTime = performance.now();

      function loop(now) {
        const elapsed = (now - startTime) / 1000;
        render(elapsed);
        statusEl.innerText = "RECORDING: " + elapsed.toFixed(1) + "s / " + TOTAL_DURATION.toFixed(1) + "s (" + Math.round((elapsed / TOTAL_DURATION) * 100) + "%)";

        if (elapsed < TOTAL_DURATION) {
          requestAnimationFrame(loop);
        } else {
          recorder.stop();
        }
      }

      requestAnimationFrame(loop);
    }

    // Wait 1.5s for poster to load before starting render
    setTimeout(startGeneration, 1500);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.method === 'POST' && req.url === '/upload') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(OUTPUT_FILE, buffer);
      console.log(`\n======================================================`);
      console.log(`[CINEMA ENGINE] TEST VIDEO GENERATED SUCCESSFULLY!`);
      console.log(`[PATH] ${OUTPUT_FILE}`);
      console.log(`[SIZE] ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`======================================================\n`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');

      setTimeout(() => {
        process.exit(0);
      }, 500);
    });
  }
});

server.listen(PORT, () => {
  console.log(`[CINEMA ENGINE] Headless server listening on http://localhost:${PORT}`);
  console.log(`[CHROME] Launching headless browser to synthesize 60 FPS video...`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=1280,1920',
    `http://localhost:${PORT}`
  ];

  const chrome = spawn(chromePath, chromeArgs);
  chrome.on('error', err => {
    console.error('Failed to spawn Chrome:', err);
    process.exit(1);
  });
});
