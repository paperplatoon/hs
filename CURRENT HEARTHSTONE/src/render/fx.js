// Lightweight FX: canvas particles + impact flash

export function initFx(container) {
  const canvas = document.createElement('canvas');
  canvas.id = 'fx-layer';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = [];
  let raf = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function loop() {
    if (particles.length === 0) { raf = null; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = performance.now();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const dt = Math.min(32, now - p.t) / 1000; // cap dt
      p.t = now;
      p.vx *= 0.98; p.vy = p.vy * 0.98 + 30 * dt; // gravity-like
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  }

  function ensureLoop() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function emberBurst(x, y, n = 14) {
    const colors = ['#ff6a00', '#ffb08a', '#e53935'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 120 + Math.random() * 120;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 80,
        size: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.8,
        t: performance.now(),
      });
    }
    ensureLoop();
  }

  function smokePuff(x, y, n = 12) {
    const colors = ['rgba(20,20,24,0.6)', 'rgba(30,30,36,0.45)', 'rgba(50,50,60,0.35)'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 60;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 50,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.7 + Math.random() * 0.6,
        maxLife: 1.2,
        t: performance.now(),
      });
    }
    ensureLoop();
  }

  function impactFlash(el) {
    el.classList.add('u-flash');
    setTimeout(() => el.classList.remove('u-flash'), 160);
  }

  window.addEventListener('resize', resize);
  resize();

  return { emberBurst, smokePuff, impactFlash, resize };
}
