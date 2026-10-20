async (page) => {
  const dir = "/Users/patientmbaya/Desktop/01 Проекты/Portfolio_egen/output/playwright";
  await page.goto("http://127.0.0.1:8878/dist/index.html", { waitUntil: "networkidle" });
  const shots = [];
  for (const [w, h] of [[1440, 900], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => {
      const group = document.querySelector(".heroSticker");
      const anim = group.getAnimations().find((item) => item.animationName === "heroStickerFloat");
      if (anim) {
        anim.pause();
        anim.currentTime = 0;
      }
    });
    await page.screenshot({ path: `${dir}/speech-${w}.png` });
    const info = await page.evaluate(() => {
      const group = document.querySelector(".heroSticker");
      const bubble = document.querySelector(".heroStickerBubble");
      const tail = document.querySelector(".heroStickerTail");
      const br = bubble.getBoundingClientRect();
      const tr = tail.getBoundingClientRect();
      const gr = group.getBoundingClientRect();
      const cs = getComputedStyle(group);
      return {
        animation: cs.animationName,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bubble: { l: Math.round(br.left), r: Math.round(br.right), t: Math.round(br.top), b: Math.round(br.bottom) },
        tail: { l: Math.round(tr.left), r: Math.round(tr.right), t: Math.round(tr.top), b: Math.round(tr.bottom) },
        groupRight: Math.round(gr.right),
        vw: window.innerWidth,
        clipped: tr.left < 0 || tr.right > window.innerWidth || br.right > window.innerWidth,
      };
    });
    shots.push({ w, ...info });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const motion = await page.evaluate(() => {
    const group = document.querySelector(".heroSticker");
    const bubble = document.querySelector(".heroStickerBubble");
    const tail = document.querySelector(".heroStickerTail");
    const anim = group.getAnimations().find((item) => item.animationName === "heroStickerFloat");
    const rel = () => {
      const b = bubble.getBoundingClientRect();
      const t = tail.getBoundingClientRect();
      return { dx: Math.round(t.left - b.left), dy: Math.round(t.top - b.bottom), bx: Math.round(b.left) };
    };
    if (!anim) return { missing: true };
    anim.pause();
    anim.currentTime = 0;
    const a = rel();
    anim.currentTime = 4000;
    const b = rel();
    return { a, b, groupMoved: a.bx !== b.bx };
  });
  return { shots, motion };
}
