async (page) => {
  const dir = "/Users/patientmbaya/Desktop/01 Проекты/Portfolio_egen/output/playwright";
  const widths = [360, 768, 1024, 1440];
  const ids = ["about", "person", "moments", "formats", "reviews", "steps", "contact"];
  const shots = [];

  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const id of ids) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      const file = `${dir}/sec-${id}-${w}.png`;
      await page.screenshot({ path: file });
      shots.push(file);
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const samples = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      let bg = cs.backgroundColor;
      let node = el;
      while (node && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) {
        node = node.parentElement;
        bg = node ? getComputedStyle(node).backgroundColor : bg;
      }
      const ratio = (() => {
        const parse = (c) => {
          const m = String(c).match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          return m[1].split(",").map((n) => Number(n.trim()));
        };
        const lin = (v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const L = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
        const f = parse(cs.color);
        const b = parse(bg);
        if (!f || !b) return null;
        const l1 = L(f);
        const l2 = L(b);
        return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
      })();
      return { sel, color: cs.color, bg, size: cs.fontSize, weight: cs.fontWeight, ratio, text: (el.textContent || "").trim().slice(0, 48) };
    };
    return [
      pick(".hero p"),
      pick(".heroFoot"),
      pick(".label"),
      pick(".heading p"),
      pick(".format p"),
      pick(".formatNote"),
      pick(".steps p"),
      pick(".review small"),
      pick(".personFacts p"),
      pick(".statVolume"),
      pick(".contactIntro p"),
      pick(".contactForm label span"),
      pick(".formStatus"),
      pick(".consent"),
      pick(".footer"),
      pick(".offer-price p"),
      pick(".caseGrid span"),
      pick(".intro p em"),
      pick(".statement em"),
      pick(".menuNote"),
    ];
  });

  return { shots: shots.length, samples };
}
