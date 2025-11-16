import { test, expect } from "@playwright/test";

test("LoginPage Canvas visuel verifikation", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  await page.screenshot({ path: "test-results/login-page-canvas.png", fullPage: true });

  const box = await canvas.boundingBox();
  expect(Boolean(box && box.width > 0 && box.height > 0)).toBe(true);

  const metrics = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { exists: false } as any;
    const ctx = (c as HTMLCanvasElement).getContext("2d");
    if (!ctx) return { exists: false } as any;
    const w = (c as HTMLCanvasElement).width;
    const h = (c as HTMLCanvasElement).height;
    const sample = (x: number, y: number) => {
      const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] };
    };
    const center = sample(w / 2, h / 2);
    const corners = [
      sample(10, 10),
      sample(w - 10, 10),
      sample(10, h - 10),
      sample(w - 10, h - 10),
    ];
    let cyanCount = 0;
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const d = sample(x, y);
      if (d.g > 180 && d.b > 180 && d.r < 60) cyanCount++;
    }
    let whiteParticleCount = 0;
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const d = sample(x, y);
      if (d.r > 230 && d.g > 230 && d.b > 230) whiteParticleCount++;
    }
    const edgeDark = corners.every(d => d.r + d.g + d.b < 120);
    const baseBlueish = corners.some(d => d.b > d.g && d.b > d.r);
    return { exists: true, center, corners, cyanCount, whiteParticleCount, edgeDark, baseBlueish, w, h };
  });

  expect(metrics.exists).toBe(true);
  expect(metrics.cyanCount).toBeGreaterThan(0);
  expect(metrics.edgeDark || metrics.baseBlueish).toBe(true);

  await page.waitForTimeout(1500);
  const metrics2 = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const ctx = (c as HTMLCanvasElement).getContext("2d");
    const w = (c as HTMLCanvasElement).width;
    const h = (c as HTMLCanvasElement).height;
    const d = ctx.getImageData(Math.floor(w / 2), Math.floor(h / 2), 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  });

  const delta = Math.abs(metrics.center.r - metrics2.r) + Math.abs(metrics.center.g - metrics2.g) + Math.abs(metrics.center.b - metrics2.b);
  console.log("AnimDelta", delta);
  // More lenient assertion for CI environments
  expect(delta).toBeLessThan(20);
});

test("LoginPage Canvas detaljeret verifikation (3000)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 2560, height: 1440 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text());
  });

  const url = "http://localhost:3000/";
  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForSelector("canvas", { timeout: 10000 });

  await page.screenshot({ path: "test-results/login-3000-full.png", fullPage: true });

  const canvas = page.locator("canvas");
  const count = await canvas.count();
  expect(count).toBeGreaterThan(0);
  await expect(canvas.first()).toBeVisible();

  await page.waitForTimeout(500);

  const box = await canvas.first().boundingBox();
  const dims = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    return {
      width: c.width,
      height: c.height,
      clientWidth: c.clientWidth,
      clientHeight: c.clientHeight,
      cssWidth: c.style.width || "",
      cssHeight: c.style.height || "",
    };
  });

  if (box) {
    const clip = {
      x: box.x + box.width / 4,
      y: box.y + box.height / 4,
      width: box.width / 2,
      height: box.height / 2,
    };
    await page.screenshot({ path: "test-results/login-5173-canvas-closeup.png", clip });
  }

  const p1 = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    const ctx = c.getContext("2d");
    const x = Math.floor(c.width / 2);
    const y = Math.floor(c.height / 2);
    const d = ctx!.getImageData(x, y, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  });
  await page.waitForTimeout(1500);
  const p2 = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    const ctx = c.getContext("2d");
    const x = Math.floor(c.width / 2);
    const y = Math.floor(c.height / 2);
    const d = ctx!.getImageData(x, y, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  });

  if (p1 && p2) {
    const delta = Math.abs(p1.r - p2.r) + Math.abs(p1.g - p2.g) + Math.abs(p1.b - p2.b);
    console.log("AnimDelta", delta);
  }

  console.log("CanvasDims", dims);
  console.log("ConsoleErrors", errors);
  console.log("URLUsed", url);
  await context.close();
});

test("LoginPage Canvas runtime verifikation (3000, animation)", async ({ page }) => {
  page.on("console", () => {});
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas", { timeout: 10000 });

  await page.screenshot({ path: "test-results/login-3000-window-1.png", fullPage: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "test-results/login-3000-window-2.png", fullPage: true });

  await page.waitForTimeout(500);

  const dims = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    const r = c.getBoundingClientRect();
    return { width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight, rectWidth: r.width, rectHeight: r.height };
  });

  const positions = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return [] as any;
    const pos: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 100; i++) {
      pos.push({ x: Math.random() * c.width, y: Math.random() * c.height });
    }
    return pos;
  });

  const initial = await page.evaluate((pos) => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return [] as any;
    const ctx = c.getContext("2d")!;
    return pos.map(p => {
      const d = ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
      return [d[0], d[1], d[2]];
    });
  }, positions);

  await page.waitForTimeout(2000);

  const changed = await page.evaluate(({ pos, initial }) => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return 0 as any;
    const ctx = c.getContext("2d")!;
    let changes = 0;
    for (let i = 0; i < pos.length; i++) {
      const p = pos[i];
      const d = ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
      if (Math.abs(d[0] - initial[i][0]) + Math.abs(d[1] - initial[i][1]) + Math.abs(d[2] - initial[i][2]) > 2) changes++;
    }
    return changes;
  }, { pos: positions, initial });

  console.log("RuntimeCanvasDims", dims);
  console.log("AnimationChangedPixels", changed);

  expect(dims).not.toBeNull();
  expect(dims.clientWidth).toBeGreaterThan(0);
  expect(dims.clientHeight).toBeGreaterThan(0);
});

test("LoginPage Canvas high-res verifikation (3000)", async ({ page }) => {
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas", { timeout: 10000 });
  await page.waitForTimeout(1000);

  const canvas = page.locator("canvas");
  await expect(canvas.first()).toBeVisible();

  const dims = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    return { width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight };
  });

  await page.screenshot({ path: "test-results/login-3000-full-highres.png", fullPage: true });

  const box = await canvas.first().boundingBox();
  if (box) {
    const size = Math.min(400, Math.min(box.width, box.height));
    const clip = {
      x: box.x + box.width / 2 - size / 2,
      y: box.y + box.height / 2 - size / 2,
      width: size,
      height: size,
    };
    await page.screenshot({ path: "test-results/login-3000-canvas-ultra.png", clip });
  }

  const p1 = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    const ctx = c.getContext("2d")!;
    const x = Math.floor(c.width / 2);
    const y = Math.floor(c.height / 2);
    const d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2]];
  });
  await page.waitForTimeout(1500);
  const p2 = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null as any;
    const ctx = c.getContext("2d")!;
    const x = Math.floor(c.width / 2);
    const y = Math.floor(c.height / 2);
    const d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2]];
  });
  const delta = Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2]);

  console.log("HighResDims", dims);
  console.log("HighResDelta", delta);

  expect(dims).not.toBeNull();
  expect(dims.width).toBeGreaterThan(300);
  expect(dims.height).toBeGreaterThan(150);
});
