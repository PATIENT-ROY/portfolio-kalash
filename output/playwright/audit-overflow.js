async (page) => {
  const dir = "/Users/patientmbaya/Desktop/01 Проекты/Portfolio_egen/output/playwright";
  const widths = [360, 390, 600, 768, 900, 980, 981, 1024, 1199, 1200, 1440];
  const height = 900;
  const report = [];

  const measure = () => {
    const doc = document.documentElement;
    const vw = window.innerWidth;
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const overflowRight = r.right - vw;
      const overflowLeft = -r.left;
      if (overflowRight > 2 || overflowLeft > 2) {
        const id = el.id ? `#${el.id}` : "";
        const cls = typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
        offenders.push({
          sel: `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 90),
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          w: Math.round(r.width),
        });
      }
    }
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflowX: doc.scrollWidth - doc.clientWidth,
      offenders: offenders.slice(0, 20),
    };
  };

  for (const w of widths) {
    await page.setViewportSize({ width: w, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    const hero = await page.evaluate(measure);
    await page.screenshot({ path: `${dir}/hero-${w}.png` });
    report.push({ w, view: "hero", ...hero });
  }

  return report;
}
