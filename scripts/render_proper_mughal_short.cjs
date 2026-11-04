const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PORT = 8425;
const FFMPEG = "C:\\Users\\Aman Talukdar\\AppData\\Local\\Programs\\Python\\Python313\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe";
const AUDIO_FILE = path.join(process.cwd(), 'mughal_final_cinematic_audio.mp3');
const FINAL_OUTPUT_MP4 = path.join(process.cwd(), 'mughal_empire_1min_cinematic_short.mp4');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rise and Fall of the Mughal Empire (1-Min Cinema)</title>
  <style>
    body, html { margin: 0; padding: 0; background: #050608; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { width: 450px; height: 800px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); border-radius: 24px; }
    #hud { position: fixed; top: 15px; left: 15px; color: #F59E0B; font-family: monospace; font-size: 14px; z-index: 100; text-shadow: 0 2px 4px black; }
  </style>
</head>
<body>
  <div id="hud">INITIALIZING 1-MINUTE CINEMA ENGINE...</div>
  <canvas id="c" width="1080" height="1920"></canvas>
  <audio id="audio" src="/audio" preload="auto"></audio>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const hud = document.getElementById('hud');
    const audio = document.getElementById('audio');

    const TOTAL_DURATION = 68.0; // Exact length of Christopher Neural voice narration
    const W = 1080;
    const H = 1920;

    // Cannon boom events in seconds (matches audio synthesis)
    const cannonEvents = [5.5, 8.2, 11.0, 43.0, 49.5];
    let screenShake = 0;

    // Particles system (sparks, smoke, embers, gold dust)
    const sparks = [];
    const smokePuffs = [];
    const goldDust = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 1,
      vy: -Math.random() * 0.8 - 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.3
    }));

    // Cannonball trajectories
    const cannonballs = [];

    function triggerCannon(t) {
      screenShake = 18;
      // Spawn cannonballs arching from bottom left to top right
      cannonballs.push({
        sx: W * 0.22,
        sy: H * 0.62,
        tx: W * (0.65 + Math.random() * 0.2),
        ty: H * (0.32 + Math.random() * 0.15),
        startTime: t,
        dur: 0.9
      });
      // Spawn muzzle flash & smoke
      for (let i = 0; i < 25; i++) {
        sparks.push({
          x: W * 0.22,
          y: H * 0.62,
          vx: (Math.random() * 12 + 6) * Math.cos(-0.6 + (Math.random() - 0.5) * 0.8),
          vy: (Math.random() * 12 + 6) * Math.sin(-0.6 + (Math.random() - 0.5) * 0.8),
          life: 1.0,
          color: Math.random() > 0.3 ? '#FFA500' : '#FFD700'
        });
      }
      for (let i = 0; i < 15; i++) {
        smokePuffs.push({
          x: W * 0.22 + (Math.random() - 0.5) * 30,
          y: H * 0.62 + (Math.random() - 0.5) * 30,
          r: Math.random() * 25 + 15,
          vx: (Math.random() - 0.3) * 1.5,
          vy: -Math.random() * 2 - 1,
          alpha: 0.8,
          life: 1.0
        });
      }
    }

    function render(time) {
      // Screen shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (screenShake > 0.1) {
        shakeX = (Math.random() - 0.5) * screenShake;
        shakeY = (Math.random() - 0.5) * screenShake;
        screenShake *= 0.88;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Check cannon triggers
      for (let ce of cannonEvents) {
        if (Math.abs(time - ce) < 0.035 && !ce.triggered) {
          triggerCannon(time);
          ce.triggered = true;
        }
      }

      // ACT TIMINGS:
      // Act 1: 0.0 - 17.5s (Babur, Khyber Pass & Panipat 1526)
      // Act 2: 17.5 - 35.0s (Akbar the Great, Taj Mahal, 24% World Wealth)
      // Act 3: 35.0 - 52.0s (Aurangzeb, 27-Year Deccan War, Treasury Drain)
      // Act 4: 52.0 - 68.0s (1857 Fall of Delhi, Zafar Exile, 331-Year Legacy)

      // =========================================================================
      // 1. DYNAMIC BACKGROUND ATMOSPHERE (SHIFTS ACROSS THE 4 ACTS)
      // =========================================================================
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      if (time < 17.5) {
        // Act 1: Golden Dawn over Hindu Kush mountain passes
        bgGrad.addColorStop(0, '#120E08');
        bgGrad.addColorStop(0.4, '#24160A');
        bgGrad.addColorStop(0.75, '#1A0D07');
        bgGrad.addColorStop(1, '#080504');
      } else if (time < 35.0) {
        // Act 2: Rich Imperial Gold & Saffron Mughal Opulence
        bgGrad.addColorStop(0, '#1A140B');
        bgGrad.addColorStop(0.35, '#38220A');
        bgGrad.addColorStop(0.7, '#1E1408');
        bgGrad.addColorStop(1, '#0C0905');
      } else if (time < 52.0) {
        // Act 3: Fiery Storm Crimson & Smoke of Deccan Wars
        bgGrad.addColorStop(0, '#1C0A0A');
        bgGrad.addColorStop(0.4, '#3A1010');
        bgGrad.addColorStop(0.75, '#220808');
        bgGrad.addColorStop(1, '#0A0303');
      } else {
        // Act 4: Twilight Melancholic Sepia & Ink Wash of 1857
        bgGrad.addColorStop(0, '#0F1116');
        bgGrad.addColorStop(0.45, '#181A22');
        bgGrad.addColorStop(0.8, '#0F1015');
        bgGrad.addColorStop(1, '#060709');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Perspective War Grid (Subtle tactical lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1.5;
      const gridSize = 72;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Floating dust / embers
      for (let g of goldDust) {
        g.y += g.vy;
        g.x += g.vx;
        if (g.y < 0) g.y = H;
        if (g.x < 0) g.x = W;
        if (g.x > W) g.x = 0;
        ctx.fillStyle = time >= 35.0 && time < 52.0 ? '#EF4444' : '#F59E0B';
        ctx.globalAlpha = g.alpha * (0.6 + Math.sin(time * 3 + g.x) * 0.3);
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // =========================================================================
      // 2. TOP BRANDING & SMOOTH RUNTIME TIMER (NOT 4 BROKEN SLIDES!)
      // =========================================================================
      const topY = 70;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('INFRATECHAI', W * 0.07, topY);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '700 17px monospace';
      ctx.fillText('// CINEMA DOCUMENTARY', W * 0.07 + 175, topY - 1);

      // Continuous 60s Timeline Progress Bar (Smooth, no slide cuts)
      const barX = W * 0.07;
      const barY = topY + 20;
      const barW = W * 0.86;
      const barH = 5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 2.5);
      ctx.fill();

      const progress = Math.min(1, time / TOTAL_DURATION);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 2.5);
      ctx.fill();

      // Time code MM:SS
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '700 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText((mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs + ' / 01:08', W * 0.93, topY);

      // =========================================================================
      // 3. ACT-BY-ACT CINEMATIC STAGE ANIMATION
      // =========================================================================
      const stageY = H * 0.44;

      if (time < 17.5) {
        // -----------------------------------------------------------------------
        // ACT 1: BABUR & THE 1526 CANNONS OF PANIPAT
        // -----------------------------------------------------------------------
        // Act Badge
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(W * 0.07, 140, 240, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = '900 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1526 • PANIPAT CAMPAIGN', W * 0.07 + 120, 163);

        // Headline
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 46px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('THE GUNPOWDER REVOLUTION', W * 0.07, 226);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 24px -apple-system, sans-serif';
        ctx.fillText('Babur Brings Ottoman Field Artillery Across Khyber Pass', W * 0.07, 268);

        // Animated Battlefield Map
        const mapX = W * 0.07;
        const mapY = 320;
        const mapW = W * 0.86;
        const mapH = 680;

        ctx.fillStyle = 'rgba(20, 16, 12, 0.85)';
        ctx.beginPath();
        ctx.roundRect(mapX, mapY, mapW, mapH, 24);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B60';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Topographic Contour Lines of Panipat Battlefield
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1.5;
        for (let r = 1; r <= 5; r++) {
          ctx.beginPath();
          ctx.ellipse(mapX + mapW * 0.5, mapY + mapH * 0.45, 120 * r * 0.6, 80 * r * 0.6, 0.1, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Enemy Army: Sultan Ibrahim Lodi (Top - Crimson Red)
        ctx.fillStyle = '#EF4444';
        ctx.font = '800 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▲ SULTAN IBRAHIM LODI (100,000 TROOPS + 1,000 WAR ELEPHANTS) ▲', mapX + mapW / 2, mapY + 45);

        // Draw 6 War Elephant Silhouettes at top
        for (let el = 0; el < 6; el++) {
          const ex = mapX + 80 + el * 135;
          const ey = mapY + 95;
          ctx.fillStyle = '#7F1D1D';
          ctx.beginPath();
          ctx.ellipse(ex, ey, 24, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          // Tusks
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ex + 18, ey);
          ctx.lineTo(ex + 28, ey + 6);
          ctx.stroke();
        }

        // Babur's Ottoman Cannons Line (Bottom - Golden)
        ctx.fillStyle = '#10B981';
        ctx.font = '800 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼ BABUR’S ARTILLERY CORPS (12,000 TROOPS + OTTOMAN CANNONS) ▼', mapX + mapW / 2, mapY + mapH - 35);

        // Draw 5 Cannons firing
        for (let c = 0; c < 5; c++) {
          const cx = mapX + 90 + c * 160;
          const cy = mapY + mapH - 95;

          // Wheels
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx - 10, cy, 14, 0, Math.PI * 2);
          ctx.stroke();

          // Barrel aiming up
          ctx.fillStyle = '#F59E0B';
          ctx.save();
          ctx.translate(cx, cy - 6);
          ctx.rotate(-0.65);
          ctx.fillRect(0, -6, 38, 12);
          ctx.restore();
        }

        // Draw In-Flight Cannonballs & Parabolic Trails
        for (let cb of cannonballs) {
          const dt = (time - cb.startTime) / cb.dur;
          if (dt >= 0 && dt <= 1.0) {
            const curX = cb.sx + (cb.tx - cb.sx) * dt;
            const arcH = Math.sin(dt * Math.PI) * 220;
            const curY = cb.sy + (cb.ty - cb.sy) * dt - arcH;

            // Trail
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cb.sx, cb.sy);
            ctx.quadraticCurveTo((cb.sx + cb.tx) / 2, Math.min(cb.sy, cb.ty) - 220, curX, curY);
            ctx.stroke();

            // Cannonball glowing head
            ctx.fillStyle = '#FF4500';
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(curX, curY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Draw Smoke Puffs
        for (let sp of smokePuffs) {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.r += 0.4;
          sp.alpha *= 0.97;
          ctx.fillStyle = 'rgba(180, 160, 140, ' + sp.alpha * 0.4 + ')';
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Sparks
        for (let sk of sparks) {
          sk.x += sk.vx;
          sk.y += sk.vy;
          sk.life -= 0.03;
          if (sk.life > 0) {
            ctx.fillStyle = sk.color;
            ctx.beginPath();
            ctx.arc(sk.x, sk.y, 3 * sk.life, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Real-time telemetry banner
        ctx.fillStyle = '#14161F';
        ctx.beginPath();
        ctx.roundRect(mapX + 24, mapY + mapH - 180, mapW - 48, 64, 16);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('LIVE BATTLE TELEMETRY:', mapX + 44, mapY + mapH - 148);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 16px monospace';
        ctx.fillText('LODI ELEPHANTS PANIC • SULTANATE CRUSHED IN 4 HOURS', mapX + 44, mapY + mapH - 128);

      } else if (time < 35.0) {
        // -----------------------------------------------------------------------
        // ACT 2: AKBAR THE GREAT, TAJ MAHAL & 24% WORLD WEALTH
        // -----------------------------------------------------------------------
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(W * 0.07, 140, 240, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = '900 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1556 – 1658 • GOLDEN ERA', W * 0.07 + 120, 163);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 46px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('AKBAR THE GREAT & TAJ MAHAL', W * 0.07, 226);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 24px -apple-system, sans-serif';
        ctx.fillText('Commanding 24.2% of the Entire World’s Economic Output', W * 0.07, 268);

        // Animated Golden Dome of Taj Mahal Drawing Itself
        const domeX = W * 0.5;
        const domeY = 720;
        const drawProgress = Math.min(1, (time - 17.5) / 5.0);

        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 15;

        // Base plinth
        ctx.strokeRect(W * 0.15, domeY + 140, W * 0.7, 20);

        // Main Taj Dome contour
        ctx.beginPath();
        ctx.moveTo(domeX - 140, domeY + 140);
        ctx.lineTo(domeX - 140, domeY + 40);
        ctx.bezierCurveTo(domeX - 140, domeY - 120, domeX, domeY - 220, domeX, domeY - 240);
        ctx.bezierCurveTo(domeX, domeY - 220, domeX + 140, domeY - 120, domeX + 140, domeY + 40);
        ctx.lineTo(domeX + 140, domeY + 140);
        ctx.stroke();

        // Finial spear at top
        ctx.beginPath();
        ctx.moveTo(domeX, domeY - 240);
        ctx.lineTo(domeX, domeY - 310);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(domeX, domeY - 275, 12, 0, Math.PI * 2);
        ctx.stroke();

        // 4 Minarets (Pillars on sides)
        [domeX - 280, domeX - 200, domeX + 200, domeX + 280].forEach(mx => {
          ctx.beginPath();
          ctx.moveTo(mx, domeY + 140);
          ctx.lineTo(mx, domeY - 160);
          ctx.stroke();
          // Minaret crown
          ctx.beginPath();
          ctx.arc(mx, domeY - 170, 10, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.restore();

        // Kinetic 3D Rotating Imperial Crest
        ctx.save();
        ctx.translate(domeX, 500);
        ctx.rotate(time * 0.4);
        for (let i = 0; i < 18; i++) {
          const ang = (i * Math.PI * 2) / 18;
          ctx.strokeStyle = i % 2 === 0 ? '#F59E0B80' : '#FFFFFF30';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * 160, Math.sin(ang) * 160);
          ctx.stroke();
        }
        ctx.restore();

        // Wealth Counter Card
        const gdpX = W * 0.12;
        const gdpY = 930;
        const gdpW = W * 0.76;
        const gdpH = 130;

        ctx.fillStyle = 'rgba(20, 24, 34, 0.92)';
        ctx.beginPath();
        ctx.roundRect(gdpX, gdpY, gdpW, gdpH, 24);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GLOBAL ECONOMIC SUPERPOWER • WEALTH SHARE', gdpX + gdpW / 2, gdpY + 36);

        // Dynamic counter
        const counterVal = (5.0 + Math.min(1, (time - 17.5) / 10.0) * 19.2).toFixed(1);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 52px -apple-system, sans-serif';
        ctx.fillText(counterVal + '% OF WORLD GDP', gdpX + gdpW / 2, gdpY + 95);

      } else if (time < 52.0) {
        // -----------------------------------------------------------------------
        // ACT 3: AURANGZEB & THE 27-YEAR DECCAN WAR ATTRITION
        // -----------------------------------------------------------------------
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.roundRect(W * 0.07, 140, 260, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1681 – 1707 • DECCAN SIEGES', W * 0.07 + 130, 163);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 46px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('AURANGZEB’S 27-YEAR ATTRITION', W * 0.07, 226);

        ctx.fillStyle = '#EF4444';
        ctx.font = '800 24px -apple-system, sans-serif';
        ctx.fillText('Imperial Overstretch & Relentless Maratha Guerrilla Strikes', W * 0.07, 268);

        // Animated Deccan War Map
        const dMapX = W * 0.07;
        const dMapY = 320;
        const dMapW = W * 0.86;
        const dMapH = 460;

        ctx.fillStyle = 'rgba(28, 12, 12, 0.9)';
        ctx.beginPath();
        ctx.roundRect(dMapX, dMapY, dMapW, dMapH, 24);
        ctx.fill();
        ctx.strokeStyle = '#EF444480';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4 Deccan Fortresses under siege (Golconda, Bijapur, Raigad, Gingee)
        const forts = [
          { name: 'GOLCONDA FORT', x: dMapX + dMapW * 0.35, y: dMapY + 110 },
          { name: 'BIJAPUR SULTANATE', x: dMapX + dMapW * 0.65, y: dMapY + 160 },
          { name: 'RAIGAD (MARATHA HQ)', x: dMapX + dMapW * 0.28, y: dMapY + 280 },
          { name: 'GINGEE SIEGE (9 YRS)', x: dMapX + dMapW * 0.72, y: dMapY + 340 }
        ];

        forts.forEach((ft, i) => {
          // Siege pulse ring
          const ringPulse = 20 + Math.sin(time * 5 + i) * 10;
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ft.x, ft.y, ringPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Fort icon
          ctx.fillStyle = '#7F1D1D';
          ctx.fillRect(ft.x - 16, ft.y - 16, 32, 32);
          ctx.strokeStyle = '#FCA5A5';
          ctx.strokeRect(ft.x - 16, ft.y - 16, 32, 32);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '800 13px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(ft.name, ft.x, ft.y + 36);
        });

        // Maratha Cavalry Saffron Arrows attacking supply lines
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        const dashOffset = (time * 40) % 14;
        ctx.lineDashOffset = -dashOffset;

        ctx.beginPath();
        ctx.moveTo(dMapX + 60, dMapY + 280);
        ctx.lineTo(dMapX + dMapW * 0.5, dMapY + 200);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draining Imperial Gold Treasury Bar
        const tBarX = W * 0.07;
        const tBarY = 820;
        const tBarW = W * 0.86;
        const tBarH = 140;

        ctx.fillStyle = 'rgba(20, 10, 10, 0.95)';
        ctx.beginPath();
        ctx.roundRect(tBarX, tBarY, tBarW, tBarH, 24);
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = '800 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CRITICAL ALERT: IMPERIAL COFFERS ATTRITION', tBarX + 24, tBarY + 36);

        // Treasury depletion meter
        const drain = Math.max(0.06, 1.0 - (time - 35.0) / 15.0);
        const meterW = tBarW - 48;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(tBarX + 24, tBarY + 54, meterW, 28, 14);
        ctx.fill();

        ctx.fillStyle = drain > 0.4 ? '#F59E0B' : '#EF4444';
        ctx.beginPath();
        ctx.roundRect(tBarX + 24, tBarY + 54, meterW * drain, 28, 14);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(drain * 100) + '% TREASURY REMAINING', tBarX + tBarW - 24, tBarY + 115);

      } else {
        // -----------------------------------------------------------------------
        // ACT 4: THE 1857 COLLAPSE & EXILE OF BAHADUR SHAH ZAFAR
        // -----------------------------------------------------------------------
        ctx.fillStyle = '#6B7280';
        ctx.beginPath();
        ctx.roundRect(W * 0.07, 140, 240, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1857 • THE FINAL COLLAPSE', W * 0.07 + 120, 163);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 46px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('THE FALL OF DELHI & EXILE', W * 0.07, 226);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '800 24px -apple-system, sans-serif';
        ctx.fillText('Three Centuries of Dynastic Glory Vanish Forever', W * 0.07, 268);

        // Shattering Peacock Crown Silhouette
        const crownX = W * 0.5;
        const crownY = 560;

        ctx.save();
        ctx.translate(crownX, crownY);

        // Golden glowing crown base
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';

        ctx.beginPath();
        ctx.moveTo(-160, 40);
        ctx.lineTo(-180, -60);
        ctx.lineTo(-80, 0);
        ctx.lineTo(0, -110); // Center peak
        ctx.lineTo(80, 0);
        ctx.lineTo(180, -60);
        ctx.lineTo(160, 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing fracture cracks splitting crown
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, -110);
        ctx.lineTo(-15, -40);
        ctx.lineTo(20, 10);
        ctx.lineTo(-10, 40);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Urdu Calligraphy Poetic Verse Card (Bahadur Shah Zafar)
        const poemX = W * 0.07;
        const poemY = 700;
        const poemW = W * 0.86;
        const poemH = 170;

        ctx.fillStyle = 'rgba(15, 17, 24, 0.95)';
        ctx.beginPath();
        ctx.roundRect(poemX, poemY, poemW, poemH, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LAST EMPEROR • POET BAHADUR SHAH ZAFAR (EXILED TO BURMA)', poemX + poemW / 2, poemY + 36);

        ctx.fillStyle = '#E5E7EB';
        ctx.font = 'italic 600 20px Georgia, serif';
        ctx.fillText('“Kitna hai bad-naseeb Zafar dafn ke liye...', poemX + poemW / 2, poemY + 80);
        ctx.fillText('do gaz zameen bhi na mili koo-e-yaar mein”', poemX + poemW / 2, poemY + 115);

        ctx.fillStyle = '#9CA3AF';
        ctx.font = '600 13px -apple-system, sans-serif';
        ctx.fillText('(Not even two yards of earth granted for burial in his homeland)', poemX + poemW / 2, poemY + 145);

        // Final Memorial Monolith Card
        const memX = W * 0.07;
        const memY = 900;
        const memW = W * 0.86;
        const memH = 110;

        ctx.fillStyle = '#111318';
        ctx.beginPath();
        ctx.roundRect(memX, memY, memW, memH, 20);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 26px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('THE MUGHAL EMPIRE: 1526 – 1857', memX + memW / 2, memY + 48);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 13px monospace';
        ctx.fillText('331 YEARS • 4,000,000 SQ KM • VANISHED INTO ETERNITY', memX + memW / 2, memY + 82);
      }

      // =========================================================================
      // 4. SUBTITLE CAPTION STRIP (DYNAMIC NARRATION SYNCED TEXT)
      // =========================================================================
      const capY = H * 0.74;
      const capW = W * 0.86;
      const capX = W * 0.07;
      const capH = 175;

      ctx.fillStyle = 'rgba(10, 12, 18, 0.88)';
      ctx.beginPath();
      ctx.roundRect(capX, capY, capW, capH, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Determine current spoken sentence
      let subTitle = '';
      let subHighlight = '';
      if (time < 6.0) {
        subTitle = 'In 1526, Babur crossed the rugged Khyber Pass with an army outnumbered five to one.';
        subHighlight = 'KHYBER PASS // BABUR ADVANCES';
      } else if (time < 12.0) {
        subTitle = 'At Panipat, thunderous Ottoman field artillery sent Sultan Lodi’s war elephants into blind panic.';
        subHighlight = 'DEAFENING CANNONS // ELEPHANTS ROUTED';
      } else if (time < 17.5) {
        subTitle = 'The Delhi Sultanate collapsed in hours. The Mughal Empire was officially born.';
        subHighlight = 'PANIPAT VICTORY // EMPIRE FOUNDED';
      } else if (time < 23.5) {
        subTitle = 'His grandson, Akbar the Great, forged an empire of staggering wealth and religious tolerance.';
        subHighlight = 'AKBAR THE GREAT // NAVRATNAS';
      } else if (time < 30.0) {
        subTitle = 'Shah Jahan immortalized love in the marble domes of the Taj Mahal as trade flooded the realm.';
        subHighlight = 'TAJ MAHAL // MARBLE WONDER';
      } else if (time < 35.0) {
        subTitle = 'By the height of the golden era, the Mughals controlled 24.2% of the entire world economy.';
        subHighlight = '24.2% OF GLOBAL WEALTH';
      } else if (time < 42.0) {
        subTitle = 'Then came Aurangzeb. In 27 years of brutal warfare, he marched south to conquer the Deccan.';
        subHighlight = 'AURANGZEB // 27-YEAR ATTRITION';
      } else if (time < 48.0) {
        subTitle = 'The royal treasury drained dry while Maratha guerrilla cavalry struck supply lines by night.';
        subHighlight = 'TREASURY DRAINED // MARATHA GUERRILLAS';
      } else if (time < 54.0) {
        subTitle = 'When he died, the empire shattered into chaos as the British East India Company claimed the spoils.';
        subHighlight = 'CHAOS // EAST INDIA COMPANY';
      } else {
        subTitle = 'In 1857, poet-emperor Bahadur Shah Zafar was exiled to Burma. 331 years of glory vanished forever.';
        subHighlight = '1857 EXILE // END OF AN ERA';
      }

      ctx.fillStyle = '#F59E0B';
      ctx.font = '800 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('NARRATION [STUDIO VOICE]: ' + subHighlight, capX + 28, capY + 36);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 24px -apple-system, sans-serif';
      
      // Word wrap
      const words = subTitle.split(' ');
      let line = '';
      let curLineY = capY + 76;
      for (let w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > capW - 56) {
          ctx.fillText(line, capX + 28, curLineY);
          line = w + ' ';
          curLineY += 34;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, capX + 28, curLineY);

      // Bottom Audio Waveform
      const footY = H * 0.94;
      const bCount = 42;
      const bW = 6;
      const bGap = 8;
      const startX = (W - (bCount * (bW + bGap))) / 2;

      for (let b = 0; b < bCount; b++) {
        const h = 8 + Math.sin(time * 14 + b * 0.4) * 22;
        ctx.fillStyle = b % 3 === 0 ? '#F59E0B' : 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(startX + b * (bW + bGap), footY - h / 2, bW, h, 3);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '700 17px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('@infratechai • Code-Driven Documentary Cinema', W / 2, footY + 40);

      ctx.restore();
    }

    // MediaRecorder Stream Pipeline
    let startTime = null;
    let recorder = null;
    let chunks = [];

    async function startRecording() {
      hud.innerText = "RECORDING 60 FPS VIDEO WITH REAL NARRATION...";
      audio.play().catch(e => console.log('Audio play error:', e));

      const stream = canvas.captureStream(60);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12000000 });
      recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        hud.innerText = "UPLOADING 1-MINUTE VIDEO BUFFER TO DISK...";
        const blob = new Blob(chunks, { type: mimeType });
        const arrayBuf = await blob.arrayBuffer();
        await fetch('/upload_video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: arrayBuf
        });
        hud.innerText = "COMPLETE! EXPORTING MP4...";
      };

      recorder.start(1000);
      startTime = performance.now();

      function animate(now) {
        const elapsed = (now - startTime) / 1000;
        render(elapsed);
        hud.innerText = "RECORDING: " + elapsed.toFixed(1) + "s / " + TOTAL_DURATION.toFixed(1) + "s (" + Math.round((elapsed / TOTAL_DURATION) * 100) + "%)";

        if (elapsed < TOTAL_DURATION) {
          requestAnimationFrame(animate);
        } else {
          recorder.stop();
        }
      }
      requestAnimationFrame(animate);
    }

    setTimeout(startRecording, 1200);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.method === 'GET' && req.url === '/audio') {
    const stat = fs.statSync(AUDIO_FILE);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size
    });
    fs.createReadStream(AUDIO_FILE).pipe(res);
  } else if (req.method === 'POST' && req.url === '/upload_video') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const rawWebm = path.join(process.cwd(), 'raw_canvas_stream.webm');
      fs.writeFileSync(rawWebm, Buffer.concat(chunks));
      console.log(`\n[VIDEO] Raw video canvas stream captured: ${rawWebm}`);
      console.log(`[FFMPEG] Muxing video stream + studio audio narration with ffmpeg...`);

      // Mux with ffmpeg into crystal-clear MP4 with AAC audio
      const cmd = `"${FFMPEG}" -y -i "${rawWebm}" -i "${AUDIO_FILE}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${FINAL_OUTPUT_MP4}"`;
      try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`\n========================================================================`);
        console.log(`[SUCCESS] 1-MINUTE PROPER ANIMATED VIDEO WITH NARRATION GENERATED!`);
        console.log(`[OUTPUT] ${FINAL_OUTPUT_MP4}`);
        const stat = fs.statSync(FINAL_OUTPUT_MP4);
        console.log(`[SIZE] ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`========================================================================\n`);
      } catch (err) {
        console.error('FFmpeg mux error:', err);
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');

      setTimeout(() => {
        process.exit(0);
      }, 800);
    });
  }
});

server.listen(PORT, () => {
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
  console.log(`[CHROME] Launching headless browser to synthesize 60 FPS animation...`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=1080,1920',
    `http://localhost:${PORT}/`
  ];

  spawn(chromePath, chromeArgs);
});
