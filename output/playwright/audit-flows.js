async (page) => {
  const dir = "/Users/patientmbaya/Desktop/01 Проекты/Portfolio_egen/output/playwright";
  const out = { console: [], requests: [], flows: {} };

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") out.console.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400) out.requests.push(`${res.status()} ${res.url()}`);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:8765/dist/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const hidden = await page.evaluate(() => {
    return [...document.querySelectorAll(".reveal:not(.is-in)")].map((el) => el.className.toString().slice(0, 80));
  });
  out.flows.stillHiddenAfterLoad = hidden;

  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/menu-390.png` });
  const menuA11y = await page.evaluate(() => {
    const menu = document.getElementById("site-menu");
    const focusables = [...document.querySelectorAll("a, button, input, select, textarea")].filter((el) => {
      if (el.closest("[hidden]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const outside = focusables.filter((el) => !menu.contains(el)).map((el) => (el.getAttribute("aria-label") || el.textContent || el.className).toString().trim().slice(0, 40));
    return {
      expanded: document.querySelector(".menuBtn").getAttribute("aria-expanded"),
      hidden: menu.hidden,
      outsideCount: outside.length,
      outside: outside.slice(0, 8),
    };
  });
  out.flows.menu = menuA11y;

  const before = await page.evaluate(() => window.scrollY);
  await page.locator("#site-menu a[href='#person']").click();
  await page.waitForTimeout(700);
  const afterNav = await page.evaluate(() => ({
    y: window.scrollY,
    hash: location.hash,
    focus: document.activeElement?.className || document.activeElement?.tagName,
    menuHidden: document.getElementById("site-menu").hidden,
  }));
  out.flows.menuNav = { before, afterNav };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  out.flows.escape = await page.evaluate(() => ({
    hidden: document.getElementById("site-menu").hidden,
    focus: document.activeElement.className,
  }));

  await page.locator("[data-album='garden']").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/album-390.png` });
  const album = await page.evaluate(() => {
    const img = document.getElementById("dialog-image");
    const dialog = document.getElementById("portfolio-dialog");
    const r = dialog.getBoundingClientRect();
    return {
      open: dialog.open,
      alt: img.alt,
      src: img.getAttribute("src"),
      title: document.getElementById("dialog-title").textContent,
      dialogOverflow: Math.round(r.bottom - window.innerHeight),
      dialogLeft: Math.round(r.left),
      dialogRight: Math.round(r.right - window.innerWidth),
    };
  });
  await page.locator("#dialog-next").click();
  await page.waitForTimeout(200);
  const nextAlt = await page.locator("#dialog-image").getAttribute("alt");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  out.flows.album = { ...album, nextAlt, closed: await page.evaluate(() => !document.getElementById("portfolio-dialog").open) };

  await page.locator("[data-event='Свадьба']").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/offer-390.png` });
  const offer = await page.evaluate(() => {
    const d = document.getElementById("offer-dialog");
    const r = d.getBoundingClientRect();
    return {
      open: d.open,
      title: document.getElementById("offer-title").textContent,
      items: document.querySelectorAll("#offer-includes li").length,
      overflowBottom: Math.round(r.bottom - window.innerHeight),
      scrollHeight: d.scrollHeight,
      clientHeight: d.clientHeight,
    };
  });
  await page.locator("#offer-cta").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/request-390.png` });
  out.flows.offerThenRequest = {
    offer,
    requestOpen: await page.evaluate(() => document.getElementById("request-dialog").open),
    offerStillOpen: await page.evaluate(() => document.getElementById("offer-dialog").open),
    eventValue: await page.locator("#request-form select[name='event']").inputValue(),
  };
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  out.flows.afterRequestEscape = await page.evaluate(() => ({
    request: document.getElementById("request-dialog").open,
    offer: document.getElementById("offer-dialog").open,
    locked: document.documentElement.classList.contains("modal-open"),
  }));
  if (out.flows.afterRequestEscape.offer) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }
  out.flows.afterSecondEscape = await page.evaluate(() => ({
    request: document.getElementById("request-dialog").open,
    offer: document.getElementById("offer-dialog").open,
    locked: document.documentElement.classList.contains("modal-open"),
  }));

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.locator("#event-form button[value='telegram']").click();
  await page.waitForTimeout(200);
  out.flows.emptySubmit = await page.evaluate(() => ({
    invalid: !document.getElementById("event-form").checkValidity(),
    opened: window.__opened || null,
  }));

  await page.evaluate(() => {
    window.__opened = [];
    window.open = (url) => {
      window.__opened.push(String(url));
      return { closed: false };
    };
  });
  await page.locator("#event-form select[name='event']").selectOption("Свадьба");
  await page.locator("#event-form input[name='date']").fill("2026-12-01");
  await page.locator("#event-form input[name='guests']").fill("80");
  await page.locator("#event-form input[name='name']").fill("Тест Аудит");
  await page.locator("#consent").check();
  await page.locator("#event-form button[value='telegram']").click();
  await page.waitForTimeout(200);
  const opened = await page.evaluate(() => window.__opened);
  out.flows.telegramStub = {
    opened,
    status: await page.locator("#form-status").innerText(),
    host: opened?.[0] ? new URL(opened[0]).host : null,
  };

  await page.evaluate(() => { window.__opened = []; });
  await page.locator("#event-form button[value='max']").click();
  await page.waitForTimeout(150);
  const maxOpened = await page.evaluate(() => window.__opened);
  out.flows.maxStub = {
    host: maxOpened?.[0] ? new URL(maxOpened[0]).host : null,
    hasText: maxOpened?.[0]?.includes("text=") || false,
  };

  const socials = await page.evaluate(() => {
    const links = [...document.querySelectorAll(".contactSocial")].map((el) => {
      const r = el.getBoundingClientRect();
      return { t: el.textContent.trim(), left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width) };
    });
    return links;
  });
  out.flows.socials390 = socials;

  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForTimeout(200);
  out.flows.socials360 = await page.evaluate(() => {
    return [...document.querySelectorAll(".contactSocial")].map((el) => {
      const r = el.getBoundingClientRect();
      return { t: el.textContent.trim(), left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), w: Math.round(r.width) };
    });
  });

  await page.screenshot({ path: `${dir}/contact-social-360.png` });

  const targets = await page.evaluate(() => {
    const sel = "a, button, input, select";
    const small = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.width < 24 || r.height < 24) {
        small.push({
          t: (el.getAttribute("aria-label") || el.name || el.textContent || el.className).toString().trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
    return small.slice(0, 20);
  });
  out.flows.smallTargets360 = targets;

  await page.goto("http://127.0.0.1:8765/dist/privacy.html", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Меню" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/legal-menu-390.png` });
  out.flows.legalMenu = await page.evaluate(() => ({
    labels: [...document.querySelectorAll(".menuSocial a")].map((a) => a.getAttribute("aria-label")),
    expanded: document.querySelector(".menuBtn").getAttribute("aria-expanded"),
  }));
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("http://127.0.0.1:8765/dist/index.html", { waitUntil: "networkidle" });
  await page.locator("#steps").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${dir}/steps-1024x768.png` });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/contact-1024x768.png` });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#formats").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/formats-1440.png` });

  return out;
}
