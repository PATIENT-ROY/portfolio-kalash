async (page) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:8765/dist/index.html", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(300);
  const outside = await page.evaluate(() => {
    const menu = document.getElementById("site-menu");
    return [...document.querySelectorAll("a, button, input, select, textarea")].filter((el) => {
      if (menu.contains(el) || el.closest("[inert]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map((el) => el.className || el.tagName);
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  await page.locator("#contact").scrollIntoViewIfNeeded();
  const vkHit = await page.evaluate(() => {
    const el = document.querySelector(".contactSocial[href*='vk.ru']");
    const r = el.getBoundingClientRect();
    const probe = document.elementFromPoint(r.left - 10, r.top + r.height / 2);
    return {
      box: { w: Math.round(r.width), h: Math.round(r.height) },
      hit: probe === el || el.contains(probe),
      probe: probe?.className || probe?.tagName || "",
    };
  });

  await page.evaluate(() => {
    window.__opened = [];
    window.open = (url) => {
      window.__opened.push(String(url));
      return {};
    };
  });
  await page.locator("#event-form select[name='event']").selectOption("Юбилей");
  await page.locator("#event-form input[name='date']").fill("2026-11-20");
  await page.locator("#event-form input[name='guests']").fill("40");
  await page.locator("#event-form input[name='name']").fill("Проверка");
  await page.locator("#consent").check();
  await page.locator("#event-form button[value='telegram']").click();
  const opened = await page.evaluate(() => window.__opened[0] || "");
  let host = "";
  try { host = new URL(opened).host; } catch { host = "bad"; }

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(300);
  const menu768 = await page.evaluate(() => {
    const panel = document.querySelector(".menuPanel").getBoundingClientRect();
    const brand = document.querySelector(".brand").getBoundingClientRect();
    return {
      panelLeft: Math.round(panel.left),
      panelWidth: Math.round(panel.width),
      brandRight: Math.round(brand.right),
      brandCut: panel.left < brand.right - 4 && panel.left > brand.left,
    };
  });

  return { errors, outside, vkHit, host, hasText: opened.includes("text="), menu768 };
}
