async (page) => {
  const dir = "/Users/patientmbaya/Desktop/01 Проекты/Portfolio_egen/output/playwright";
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const failed = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:8765/dist/index.html", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/re-menu-390.png` });
  const menu = await page.evaluate(() => {
    const panel = document.querySelector(".menuPanel").getBoundingClientRect();
    const brand = document.querySelector(".brand").getBoundingClientRect();
    const menuEl = document.getElementById("site-menu");
    const outside = [...document.querySelectorAll("a, button, input, select, textarea")].filter((el) => {
      if (menuEl.contains(el)) return false;
      if (el.closest("[inert]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).length;
    return {
      panelWidth: Math.round(panel.width),
      viewport: window.innerWidth,
      brandRight: Math.round(brand.right),
      panelLeft: Math.round(panel.left),
      coversBrand: panel.left <= brand.left + 2,
      outside,
      inertMain: document.querySelector("main").hasAttribute("inert"),
    };
  });
  await page.locator("#site-menu a[href='#person']").click();
  await page.waitForTimeout(800);
  const nav = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    hash: location.hash,
    focusId: document.activeElement?.id || "",
    menuHidden: document.getElementById("site-menu").hidden,
    locked: document.documentElement.classList.contains("modal-open"),
    personTop: Math.round(document.getElementById("person").getBoundingClientRect().top),
  }));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  const escaped = await page.evaluate(() => ({
    hidden: document.getElementById("site-menu").hidden,
    inert: document.querySelector("main").hasAttribute("inert"),
    focus: document.activeElement.className,
  }));

  await page.locator("[data-event='Юбилей']").click();
  await page.waitForTimeout(300);
  await page.locator("#offer-cta").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/re-request-390.png` });
  const dialogs = await page.evaluate(() => ({
    offer: document.getElementById("offer-dialog").open,
    request: document.getElementById("request-dialog").open,
    event: document.querySelector("#request-form select").value,
    locked: document.documentElement.classList.contains("modal-open"),
  }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  const afterOneEscape = await page.evaluate(() => ({
    offer: document.getElementById("offer-dialog").open,
    request: document.getElementById("request-dialog").open,
    locked: document.documentElement.classList.contains("modal-open"),
  }));

  await page.locator("[data-album='evening']").click();
  await page.waitForTimeout(300);
  const album = await page.evaluate(() => ({
    open: document.getElementById("portfolio-dialog").open,
    title: document.getElementById("dialog-title").textContent,
    pressed: document.querySelector("[data-moment='evening']").getAttribute("aria-pressed"),
  }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  const targets = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    };
    return {
      consent: box("#consent"),
      vk: box(".contactSocial[href*='vk.ru']"),
      dot: box(".reviewDots button"),
    };
  });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  await page.goto("http://127.0.0.1:8765/dist/privacy.html", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/re-legal-menu-390.png` });
  const legal = await page.evaluate(() => ({
    labels: [...document.querySelectorAll(".menuSocial a")].map((a) => a.getAttribute("aria-label")),
    outside: [...document.querySelectorAll("a, button")].filter((el) => {
      const menu = document.getElementById("site-menu");
      if (menu.contains(el) || el.closest("[inert]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0;
    }).length,
  }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:8765/dist/index.html", { waitUntil: "networkidle" });
  const motion = await page.evaluate(() => getComputedStyle(document.querySelector(".stripTrack")).animationName);
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const motionMenu = await page.evaluate(() => document.getElementById("site-menu").hidden);

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("http://127.0.0.1:8765/dist/index.html", { waitUntil: "networkidle" });
  const overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.setViewportSize({ width: 768, height: 1024 });
  const overflow768 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.setViewportSize({ width: 1024, height: 768 });
  const overflow1024 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.setViewportSize({ width: 1440, height: 900 });
  const overflow1440 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  return { errors, failed, menu, nav, escaped, dialogs, afterOneEscape, album, targets, overflow, legal, motion, motionMenu, overflow360, overflow768, overflow1024, overflow1440 };
}
