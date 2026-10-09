/**
 * Canvas Share Poster Generator
 * Generates an official "Office Escape Certificate / Workplace Freedom Report"
 */

export function generatePoster(state, ending, playerName = '打工人小李') {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 800;
    const height = 1120;
    canvas.width = width;
    canvas.height = height;

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative grid pattern
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, height - 40);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 40, y);
      ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner gold border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Corner tech notches
    const cornerSize = 18;
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(26, 26, cornerSize, cornerSize);
    ctx.fillRect(width - 26 - cornerSize, 26, cornerSize, cornerSize);
    ctx.fillRect(26, height - 26 - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(width - 26 - cornerSize, height - 26 - cornerSize, cornerSize, cornerSize);

    // Header Tag
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICE ESCAPE TACTICAL OPERATION', width / 2, 85);

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('准点下班战役 · 荣誉裁定书', width / 2, 140);

    // Subtitle bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(100, 165, width - 200, 2);

    // Player Identification Card
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 195, width - 120, 95, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('行动特工：', 90, 235);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(playerName, 205, 235);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('行动代码：', 90, 270);
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`FRIDAY-${state.getTimeString().replace(':', '')}-ESCAPE`, 205, 270);

    // Rank Badge Circle
    const isWin = ending.type === 'victory';
    const badgeColor = isWin ? '#10b981' : '#f43f5e';

    ctx.save();
    ctx.beginPath();
    ctx.arc(670, 242, 38, 0, Math.PI * 2);
    ctx.fillStyle = isWin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = badgeColor;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '900 32px sans-serif';
    ctx.fillStyle = badgeColor;
    ctx.fillText(ending.rank, 670, 253);
    ctx.restore();

    // Ending Main Title Card
    ctx.fillStyle = isWin ? 'rgba(6, 78, 59, 0.4)' : 'rgba(136, 19, 55, 0.4)';
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 315, width - 120, 120, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '40px sans-serif';
    ctx.fillText(ending.badge, width / 2, 365);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`【${ending.title}】`, width / 2, 410);

    // Narrative Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 455, width - 120, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    wrapText(ctx, ending.description.replace(/\n/g, ' '), 90, 495, width - 180, 32);

    // Quote Box
    ctx.font = 'italic 19px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText(`“${ending.quote}”`, width / 2, 645);

    // Stats Grid Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.strokeStyle = '#475569';
    roundRect(ctx, 60, 695, width - 120, 190, 16);
    ctx.fill();
    ctx.stroke();

    const stats = [
      { label: '打卡/结束时刻', val: state.getTimeString(), icon: '🕒' },
      { label: '老板怀疑度', val: `${state.suspicion}%`, icon: '👁️' },
      { label: '剩余精气神', val: `${state.energy}%`, icon: '⚡' },
      { label: '周旋回合数', val: `${state.turns} 回合`, icon: '🔄' }
    ];

    stats.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const startX = 90 + col * 330;
      const startY = 740 + row * 75;

      ctx.textAlign = 'left';
      ctx.font = '22px sans-serif';
      ctx.fillText(item.icon, startX, startY);

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label, startX + 36, startY - 2);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.val, startX + 36, startY + 28);
    });

    // Official Red Seal Stamp (Rotated)
    ctx.save();
    ctx.translate(640, 960);
    ctx.rotate((-12 * Math.PI) / 180);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('准点下班战役指导组', 0, -22);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('★ 特许放行 ★', 0, 10);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('拒绝加班 · 阖家欢乐', 0, 36);

    ctx.restore();

    // Footer Watermark
    ctx.textAlign = 'center';
    ctx.font = '16px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('《准点下班大作战：逃离老板视线》· Cloudflare Pages 全球发布', width / 2, 1060);

    resolve(canvas.toDataURL('image/png'));
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split('');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
