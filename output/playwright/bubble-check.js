async (page) => {
  const dir = "/Users/patientmbaya/Desktop/01 Проекты/Portfolio_egen/output/playwright";
  await page.goto("http://127.0.0.1:8877/dist/index.html", { waitUntil: "networkidle" });
  const shots = [];
  for (const [w, h] of [[1440, 900], [1200, 800], [1024, 768], [768, 900], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${dir}/bubble-${w}.png` });
    const info = await page.evaluate(() => {
      const group = document.querySelector(".heroSticker");
      const bubble = document.querySelector(".heroStickerBubble");
      const dot = document.querySelector(".heroStickerDots i:last-child");
      const cs = getComputedStyle(group);
      const br = bubble.getBoundingClientRect();
      const dr = dot.getBoundingClientRect();
      const face = document.querySelector(".heroPortraitLabel")?.getBoundingClientRect();
      return {
        animation: cs.animationName,
        transform: cs.transform,
        bubble: { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height) },
        dot: { x: Math.round(dr.x), y: Math.round(dr.y), w: Math.round(dr.width) },
        labelTop: face ? Math.round(face.top) : null,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    shots.push({ w, h, ...info });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const motion = await page.evaluate(async () => {
    const group = document.querySelector(".heroSticker");
    const bubble = document.querySelector(".heroStickerBubble");
    const dot = document.querySelector(".heroStickerDots i:last-child");
    const anim = group.getAnimations().find((item) => item.animationName === "heroStickerFloat");
    const rel = () => {
      const b = bubble.getBoundingClientRect();
      const d = dot.getBoundingClientRect();
      return { dx: Math.round(d.left - b.left), dy: Math.round(d.top - b.top), gx: Math.round(b.left), gy: Math.round(b.top) };
    };
    if (!anim) return { missing: true };
    anim.pause();
    anim.currentTime = 0;
    const a = rel();
    anim.currentTime = 3200;
    const b = rel();
    return { a, b, sameOffset: a.dx === b.dx && a.dy === b.dy, groupMoved: a.gx !== b.gx || a.gy !== b.gy };
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  const reduced = await page.evaluate(() => getComputedStyle(document.querySelector(".heroSticker")).animationName);
  await page.screenshot({ path: `${dir}/bubble-1440-reduced.png` });

  return { shots, motion, reduced };
}
