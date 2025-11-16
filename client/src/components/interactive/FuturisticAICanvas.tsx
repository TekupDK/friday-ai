import { useEffect, useRef } from "react";

type Vec2 = { x: number; y: number };

type Node = {
  pos: Vec2;
  vel: Vec2;
  targetVel: Vec2;
  radius: number; // 1.5–2.5 (diameter 3–5)
  pulsePeriod: number; // 0.5–1.5s
  pulseOffset: number;
};

type Particle = {
  pos: Vec2;
  vel: Vec2;
  alpha: number; // 0.05–0.1
};

type LightPatch = {
  pos: Vec2;
  radius: number;
  alpha: number; // 0.2–0.3
};

type Connection = [number, number];

const MIDNIGHT_NAVY = "#191970"; // base
const NEON_CYAN = "#00FFFF"; // nodes + lines

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function length(v: Vec2) {
  return Math.hypot(v.x, v.y);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function FuturisticAICanvas({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.style.pointerEvents = "none";

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0;
    let height = 0;

    const isMobile = () =>
      Math.min(window.innerWidth, window.innerHeight) < 640;

    let nodes: Node[] = [];
    let particles: Particle[] = [];
    let lights: LightPatch[] = [];
    let connections: Connection[] = [];
    let lastConnUpdate = 0;
    let connInterval = rand(2000, 3000);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      width = canvas.width;
      height = canvas.height;
    }

    function init() {
      resize();
      nodes = [];
      particles = [];
      lights = [];
      connections = [];

      const area = (width / dpr) * (height / dpr);
      const nodeCount = clamp(Math.floor(area / 7000), 70, 100);
      const particleCount = clamp(Math.floor(area / 2500), 140, 200);
      const lightCount = clamp(isMobile() ? 4 : 5, 3, 5);

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          pos: { x: rand(0, width), y: rand(0, height) },
          vel: { x: rand(-0.018, 0.018), y: rand(-0.018, 0.018) },
          targetVel: { x: rand(-0.018, 0.018), y: rand(-0.018, 0.018) },
          radius: rand(1.9 * dpr, 2.3 * dpr),
          pulsePeriod: rand(0.9, 1.2),
          pulseOffset: rand(0, Math.PI * 2),
        });
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          pos: { x: rand(0, width), y: rand(0, height) },
          vel: { x: rand(-0.01, 0.01), y: rand(-0.01, 0.01) },
          alpha: rand(0.06, 0.08),
        });
      }

      for (let i = 0; i < lightCount; i++) {
        lights.push({
          pos: {
            x: rand(width * 0.1, width * 0.9),
            y: rand(height * 0.1, height * 0.9),
          },
          radius: rand(140 * dpr, 240 * dpr),
          alpha: rand(0.2, 0.24),
        });
      }

      lastConnUpdate = 0;
      connInterval = rand(2200, 2600);
    }

    function recomputeConnections() {
      connections = [];
      const maxDist = 160 * dpr;
      for (let i = 0; i < nodes.length; i++) {
        // connect to up to 3 nearest neighbors within maxDist
        const distances: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].pos.x - nodes[j].pos.x;
          const dy = nodes[i].pos.y - nodes[j].pos.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) distances.push({ j, d });
        }
        distances.sort((a, b) => a.d - b.d);
        const count = Math.min(3, distances.length);
        for (let k = 0; k < count; k++) {
          connections.push([i, distances[k].j]);
        }
      }
    }

    let lastTime = performance.now();
    let rafId = 0;
    let isPaused = false;

    // Respect user preference for reduced motion
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReducedMotion) {
      isPaused = true;
    }

    function step(now: number) {
      if (isPaused) {
        rafId = requestAnimationFrame(step);
        return;
      }
      const dtMs = now - lastTime;
      lastTime = now;
      const dt = dtMs / 1000; // seconds

      update(dt, now / 1000);
      draw(now / 1000);

      rafId = requestAnimationFrame(step);
    }

    function update(dt: number, t: number) {
      // update nodes
      for (const n of nodes) {
        // gentle easing towards target velocity
        n.vel.x = lerp(n.vel.x, n.targetVel.x, 0.02);
        n.vel.y = lerp(n.vel.y, n.targetVel.y, 0.02);

        n.pos.x += n.vel.x * dt * 60 * dpr; // scale so ~1 CSS px/sec
        n.pos.y += n.vel.y * dt * 60 * dpr;

        if (n.pos.x < 0) n.pos.x += width;
        if (n.pos.y < 0) n.pos.y += height;
        if (n.pos.x > width) n.pos.x -= width;
        if (n.pos.y > height) n.pos.y -= height;

        // occasionally change target velocity for organic motion
        if (Math.random() < 0.005) {
          const tx = rand(-0.02, 0.02);
          const ty = rand(-0.02, 0.02);
          n.targetVel = { x: tx, y: ty };
        }
      }

      // update particles
      for (const p of particles) {
        p.pos.x += p.vel.x * dt * 60 * dpr;
        p.pos.y += p.vel.y * dt * 60 * dpr;
        if (p.pos.x < 0) p.pos.x += width;
        if (p.pos.y < 0) p.pos.y += height;
        if (p.pos.x > width) p.pos.x -= width;
        if (p.pos.y > height) p.pos.y -= height;
      }

      // connections recompute
      lastConnUpdate += dt * 1000;
      if (lastConnUpdate >= connInterval) {
        recomputeConnections();
        lastConnUpdate = 0;
        connInterval = rand(2000, 3000);
      }
    }

    function draw(t: number) {
      // base fill
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = MIDNIGHT_NAVY;
      ctx.fillRect(0, 0, width, height);

      // large diffuse light patches
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(20px)";
      for (const l of lights) {
        const grad = ctx.createRadialGradient(
          l.pos.x,
          l.pos.y,
          0,
          l.pos.x,
          l.pos.y,
          l.radius
        );
        grad.addColorStop(0, `rgba(0,255,255,${l.alpha})`);
        grad.addColorStop(1, "rgba(0,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(l.pos.x, l.pos.y, l.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.filter = "none";

      // fine particles
      ctx.globalCompositeOperation = "source-over";
      for (const p of particles) {
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fillRect(p.pos.x, p.pos.y, 1, 1);
      }

      // connections with subtle glow
      ctx.strokeStyle = NEON_CYAN;
      ctx.lineWidth = 0.85;
      ctx.shadowColor = NEON_CYAN;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      for (const [i, j] of connections) {
        const a = nodes[i].pos;
        const b = nodes[j].pos;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // nodes with pulse
      for (const n of nodes) {
        const phase = (t + n.pulseOffset) / n.pulsePeriod;
        const pulse = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2)); // 0.7–1.0
        const r = n.radius * pulse;
        ctx.fillStyle = NEON_CYAN;
        ctx.shadowColor = NEON_CYAN;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(n.pos.x, n.pos.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // center focus brightness boost (10–15%) with circular vignette 200px
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(30px)"; // minimum 30px blur-radius for transitions
      const centerX = width / 2;
      const centerY = height / 2;
      const focusRadius = 240 * dpr;
      const focusGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        focusRadius
      );
      focusGrad.addColorStop(0, "rgba(0,255,255,0.12)");
      focusGrad.addColorStop(1, "rgba(0,255,255,0)");
      ctx.fillStyle = focusGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, focusRadius, 0, Math.PI * 2);
      ctx.fill();

      // soft edge vignette to avoid sharp borders
      ctx.globalCompositeOperation = "source-over";
      const vignette = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.max(width, height) * 0.35,
        centerX,
        centerY,
        Math.max(width, height) * 0.7
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.filter = "none";

      ctx.restore();
    }

    const ro = new ResizeObserver(() => {
      resize();
      init();
      recomputeConnections();
    });

    // Force initial resize after layout with multiple attempts
    const forceResize = () => {
      resize();
      init();
      recomputeConnections();
    };

    // Try immediately and after layout
    setTimeout(forceResize, 0);
    setTimeout(forceResize, 100);
    setTimeout(forceResize, 500);

    init();
    recomputeConnections();
    lastTime = performance.now();
    rafId = requestAnimationFrame(step);

    // Pause animation when tab is hidden
    const onVisibility = () => {
      isPaused = document.visibilityState === "hidden" || prefersReducedMotion;
    };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0"}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
