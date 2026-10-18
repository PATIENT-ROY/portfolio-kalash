const albums = {
  garden: {
    title: "Там, где свои люди",
    images: [
      {
        src: "assets/event-wedding/event-wedding-cover.webp",
        alt: "Женя в смокинге говорит в микрофон на церемонии",
        caption: "Женя на церемонии. Микрофон на стойке, в руках текст.",
      },
      {
        src: "assets/event-wedding/wedding-1.webp",
        alt: "Пара на церемонии на воздухе, гости сидят спиной к кадру",
        caption: "Церемония на воздухе. Пара стоит к гостям спиной, за ними вода.",
      },
      {
        src: "assets/event-wedding/wedding-2.webp",
        alt: "Гости аплодируют невесте на церемонии",
        caption: "Гости уже на ногах. Невеста в кадре со спины.",
      },
    ],
  },
  evening: {
    title: "Вечер при свечах",
    images: [
      {
        src: "assets/event-dinner/event-dinner-cover.webp",
        alt: "Женя с гостьей на вечере",
        caption: "Женя в зале. Вечер уже идёт, гости рядом.",
      },
      {
        src: "assets/event-dinner/dinner-1.webp",
        alt: "Накрытый стол со свечами и белыми цветами",
        caption: "Стол накрыт. Свечи горят, гости ещё не сели.",
      },
      {
        src: "assets/event-dinner/dinner-2.webp",
        alt: "Гости за ужином при свечах",
        caption: "Гости за столом. Разговор, бокалы, свечи.",
      },
    ],
  },
  corporate: {
    title: "Вместе вне офиса",
    images: [
      {
        src: "assets/event-corporate/event-corporate-cover.webp",
        alt: "Женя с микрофоном у стола с гостями",
        caption: "Женя у стола. Гости уже разговаривают, не ждут конкурса.",
      },
      {
        src: "assets/event-corporate/corporate-1.webp",
        alt: "Гости с бокалами стоят у круглого стола",
        caption: "Гости с бокалами. Сцены ещё нет, вечер уже идёт.",
      },
      {
        src: "assets/event-corporate/corporate-2.webp",
        alt: "Гости за столами аплодируют в зале",
        caption: "Зал аплодирует. Гости сидят, свет уже вечерний.",
      },
    ],
  },
};

let lockedScroll = 0;

function lockPage() {
  lockedScroll = window.scrollY;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = gap > 0 ? `${gap}px` : "";
  document.body.style.top = `-${lockedScroll}px`;
  document.documentElement.classList.add("modal-open");
}

function unlockPage() {
  document.documentElement.classList.remove("modal-open");
  document.body.style.top = "";
  document.body.style.paddingRight = "";
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, lockedScroll);
  root.style.scrollBehavior = previous;
}

const dialog = document.getElementById("portfolio-dialog");
const image = document.getElementById("dialog-image");
const title = document.getElementById("dialog-title");
const description = document.getElementById("dialog-description");
const count = document.getElementById("dialog-count");
const prev = document.getElementById("dialog-prev");
const next = document.getElementById("dialog-next");
const momentOrder = ["garden", "evening", "corporate"];
let currentAlbum = "garden";
let currentIndex = 0;

function renderSlide() {
  const album = albums[currentAlbum];
  const slide = album.images[currentIndex];
  const single = album.images.length < 2;
  title.textContent = album.title;
  image.src = slide.src;
  image.alt = slide.alt;
  description.textContent = slide.caption;
  count.textContent = `${currentIndex + 1} / ${album.images.length}`;
  count.hidden = single;
  prev.setAttribute("aria-label", single ? "Предыдущий момент" : "Предыдущий кадр");
  next.setAttribute("aria-label", single ? "Следующий момент" : "Следующий кадр");
  dialog.querySelectorAll("[data-moment]").forEach((button) => {
    const on = button.dataset.moment === currentAlbum;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  });
  image.classList.remove("is-in");
  void image.offsetWidth;
  image.classList.add("is-in");
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let albumBusy = false;
let flightToken = 0;
let flightMode = "";

function coverRect(key) {
  const card = document.querySelector(`[data-album="${key}"]`);
  if (!card) return null;
  const rect = card.getBoundingClientRect();
  return rect.width > 20 && rect.height > 20 ? rect : null;
}

function clearImageFlight() {
  image.style.transform = "";
  image.style.transition = "";
  image.style.transformOrigin = "";
  image.classList.remove("is-from-card");
  dialog.classList.remove("is-shared");
  albumBusy = false;
}

function flyImage(from, to, token) {
  const sx = from.width / to.width;
  const sy = from.height / to.height;
  image.classList.add("is-from-card");
  image.style.transformOrigin = "top left";
  image.style.transition = "none";
  image.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`;
  image.getBoundingClientRect();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    requestAnimationFrame(() => {
      if (token !== flightToken) {
        finish();
        return;
      }
      image.style.transition = "transform 0.55s cubic-bezier(.22, .7, .2, 1)";
      image.style.transform = "translate(0px, 0px) scale(1, 1)";
      image.addEventListener("transitionend", (event) => {
        if (event.propertyName === "transform") finish();
      });
      setTimeout(finish, 640);
    });
  });
}

async function openAlbum(key, index = 0) {
  currentAlbum = key;
  currentIndex = index;
  renderSlide();
  if (dialog.open) return;
  lockPage();
  dialog.showModal();
}

function closeAlbum() {
  if (!dialog.open) return;
  dialog.close();
  unlockIfClear();
}

function moveMoment(delta) {
  if (albumBusy) return;
  const index = momentOrder.indexOf(currentAlbum);
  currentAlbum = momentOrder[(index + delta + momentOrder.length) % momentOrder.length];
  currentIndex = 0;
  renderSlide();
}

function moveSlide(delta) {
  if (albumBusy) return;
  const slides = albums[currentAlbum].images;
  if (slides.length < 2) {
    moveMoment(delta);
    return;
  }
  currentIndex = (currentIndex + delta + slides.length) % slides.length;
  renderSlide();
}

document.querySelectorAll("[data-album]").forEach((button) => {
  button.addEventListener("click", () => {
    openAlbum(button.dataset.album, Number(button.dataset.index || 0));
  });
});

dialog.querySelector(".dialog-close").addEventListener("click", () => closeAlbum());
prev.addEventListener("click", () => moveSlide(-1));
next.addEventListener("click", () => moveSlide(1));
dialog.querySelectorAll("[data-moment]").forEach((button) => {
  button.addEventListener("click", () => {
    if (albumBusy) return;
    currentAlbum = button.dataset.moment;
    currentIndex = 0;
    renderSlide();
  });
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeAlbum();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAlbum();
});
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveSlide(-1);
  if (event.key === "ArrowRight") moveSlide(1);
});
dialog.addEventListener("close", () => {
  clearImageFlight();
  unlockIfClear();
});

const menuBtn = document.querySelector(".menuBtn");
const menu = document.getElementById("site-menu");
let menuAnchor = "";

function setPageInert(on) {
  document.querySelector(".skip")?.toggleAttribute("inert", on);
  document.querySelector("main")?.toggleAttribute("inert", on);
  document.querySelector(".footer")?.toggleAttribute("inert", on);
  document.querySelector(".siteHeader .nav")?.toggleAttribute("inert", on);
}

function setMenu(open, options = {}) {
  menuBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    menuAnchor = "";
    menu.hidden = false;
    lockPage();
    setPageInert(true);
    requestAnimationFrame(() => menu.classList.add("is-open"));
    menu.querySelector(".menuClose").focus();
    return;
  }
  menuAnchor = options.anchor || "";
  const restoreFocus = options.restoreFocus !== false && !menuAnchor;
  menu.classList.remove("is-open");
  let closed = false;
  const finish = () => {
    if (closed || menu.classList.contains("is-open")) return;
    closed = true;
    menu.hidden = true;
    setPageInert(false);
    const anchor = menuAnchor;
    menuAnchor = "";
    if (!document.querySelector("dialog[open]")) unlockPage();
    if (anchor) {
      const target = document.querySelector(anchor);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.scrollIntoView({ block: "start" });
        target.focus({ preventScroll: true });
      }
    } else if (restoreFocus) {
      menuBtn.focus();
    }
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
  } else {
    const panel = menu.querySelector(".menuPanel");
    const timer = setTimeout(finish, 500);
    panel.addEventListener("transitionend", () => {
      clearTimeout(timer);
      finish();
    }, { once: true });
  }
}

menuBtn.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (event) => {
  if (event.target === menu) setMenu(false);
});
menu.querySelector(".menuClose").addEventListener("click", () => setMenu(false));
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    const href = link.getAttribute("href") || "";
    const samePage = href.startsWith("#");
    setMenu(false, { restoreFocus: false, anchor: samePage ? href : "" });
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) setMenu(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 980 && !menu.hidden) setMenu(false, { restoreFocus: false });
});

function unlockIfClear() {
  const siteMenu = document.getElementById("site-menu");
  if (document.querySelector("dialog[open]")) return;
  if (siteMenu && !siteMenu.hidden) return;
  unlockPage();
}

const today = new Date();
const isoToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

function bindRequestForm(form) {
  const dateField = form.elements.namedItem("date");
  const status = form.querySelector(".formStatus");
  dateField.min = isoToday;
  dateField.addEventListener("input", () => dateField.setCustomValidity(""));
  form.elements.namedItem("name").addEventListener("input", (event) => {
    event.currentTarget.setCustomValidity("");
  });
  form.elements.namedItem("consent").addEventListener("change", (event) => {
    event.currentTarget.setCustomValidity("");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = clean(data.get("name"));
    const dateValue = String(data.get("date") || "");
    const nameInput = form.elements.namedItem("name");
    const consent = form.elements.namedItem("consent");
    nameInput.setCustomValidity(name ? "" : "Напишите, как к вам обращаться.");
    dateField.setCustomValidity(
      dateValue && dateValue < isoToday ? "Эта дата уже прошла. Выберите день события." : "",
    );
    consent.setCustomValidity(consent.checked ? "" : "Нужно согласие на обработку персональных данных.");
    if (!form.reportValidity()) return;
    nameInput.setCustomValidity("");

    const [year, month, day] = dateValue.split("-");
    const request = [
      `Здравствуйте, Женя! Меня зовут ${name}. Хочу обсудить мероприятие.`,
      `Тип события: ${clean(data.get("event"))}`,
      `Дата: ${day}.${month}.${year}`,
      `Количество гостей: ${clean(data.get("guests"))}.`,
    ].join("\n");

    const via = event.submitter?.value === "max" ? "max" : "telegram";
    const text = encodeURIComponent(request);
    const url = via === "max"
      ? `https://max.ru/:share?text=${text}`
      : `https://t.me/+79122204032?text=${text}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    status.textContent = opened
      ? (via === "max"
        ? "Max открыт с готовым текстом. Найдите Женю по номеру +7 912 220-40-32 и отправьте."
        : "Открыт чат с Женей в Telegram. Осталось нажать «Отправить».")
      : "Браузер заблокировал окно. Разрешите всплывающие и нажмите кнопку ещё раз.";
  });
}

bindRequestForm(document.getElementById("event-form"));

const offers = {
  Свадьба: {
    kicker: "01 / Для двоих и близких",
    title: "Свадьба",
    lead: "Вечер вокруг вашей истории. Конкурсы на потеху залу в программу не входят.",
    includes: [
      "Сценарий под пару: кто в зале, какой тон, что важно",
      "День целиком — от сбора гостей до финала",
      "Церемония отдельной позицией, если она нужна",
      "Женя не выводит гостей выступать и не ставит конкурсы ради смеха зала",
    ],
  },
  Юбилей: {
    kicker: "02 / Для главного человека",
    title: "Юбилей",
    lead: "Вечер для человека и тех, кто его знает. Истории, поздравления и время, чтобы гости успели поговорить, а не только посмотреть программу.",
    includes: [
      "Разговор с именинником и семьёй до даты",
      "Сценарий под возраст и компанию",
      "Ведение: сбор, тосты, поздравления, танец",
      "Место для живого общения, без гонки по таймингу",
    ],
  },
  "Новогодний корпоратив": {
    kicker: "Конец года",
    title: "Новогодний корпоратив",
    lead: "Праздничный вечер для команды. Женя держит темп и оставляет место для тостов, без конкурсов, в которых людей заставляют выступать.",
    includes: [
      "Разговор до даты: традиции компании, кого отметить и чего лучше не касаться",
      "Сбор гостей и праздничная часть",
      "Тосты и поздравления без обязательного выхода каждого к микрофону",
      "Финал вечера в нужном темпе",
    ],
  },
  "День рождения компании": {
    kicker: "Для команды",
    title: "День рождения компании",
    lead: "Вечер про компанию и людей, которые её сделали. Не презентация, где микрофон идет по кругу.",
    includes: [
      "Разговор до даты: повод, кого отметить и чего лучше не касаться",
      "Сбор гостей и торжественная часть",
      "Истории и поздравления без обязательных тостов",
      "Темп, в котором команда успевает поговорить",
    ],
  },
  "Отчётный вечер": {
    kicker: "Спикеры и переходы",
    title: "Отчётный вечер",
    lead: "Цифры, выступления, переходы. Женя держит внимание, пока меняется спикер или слайд.",
    includes: [
      "Регламент и порядок выступлений до даты",
      "Ведение: вход, объявления, переходы, финал",
      "Зал не проваливается между блоками",
      "Подстройка, если программа сдвигается",
    ],
  },
  "Официальное мероприятие": {
    kicker: "Регламент",
    title: "Официальное мероприятие",
    lead: "Протокол, официальный тон, представление участников и паузы там, где они нужны.",
    includes: [
      "Регламент и список выступающих",
      "Представление гостей и участников",
      "Ведение в заданном тоне",
      "Без отсебятины там, где её не просили",
    ],
  },
  Вечеринка: {
    kicker: "Темп",
    title: "Вечеринка",
    lead: "Темп вечера для этой компании. Игры только если они подходят этим людям.",
    includes: [
      "Разговор до даты: кто в зале, что можно и что нельзя",
      "Темп вечера и вовлечение",
      "Игры только если они подходят этим людям",
      "Подстройка по ходу вечера",
    ],
  },
  "Голос за кадром": {
    kicker: "Без выхода на сцену",
    title: "Голос за кадром",
    lead: "Жени нет в кадре. Его голос ведёт программу: встречает, объявляет, задаёт ритм.",
    includes: [
      "Сценарий объявлений до даты",
      "Голосовое ведение от входа до финала",
      "Переходы между активностями",
      "Тон под зал, без выхода на сцену",
    ],
  },
};

const offerDialog = document.getElementById("offer-dialog");
const offerIncludes = document.getElementById("offer-includes");
let offerEvent = "";

function openOffer(name) {
  const offer = offers[name];
  if (!offer) return;
  offerEvent = name;
  document.getElementById("offer-kicker").textContent = offer.kicker;
  document.getElementById("offer-title").textContent = offer.title;
  document.getElementById("offer-lead").textContent = offer.lead;
  offerIncludes.replaceChildren(
    ...offer.includes.map((item, index) => {
      const row = document.createElement("li");
      const mark = document.createElement("b");
      mark.textContent = String(index + 1).padStart(2, "0");
      row.append(mark, document.createTextNode(item));
      return row;
    }),
  );
  document.getElementById("offer-extra").textContent =
    "В оплату входит ведение вечера. Длительность, команда, аппаратура и выезд считаются отдельно — цифру Женя называет после разговора о дате и городе.";
  lockPage();
  offerDialog.showModal();
}

document.querySelectorAll("[data-event]").forEach((card) => {
  card.addEventListener("click", () => openOffer(card.dataset.event));
});

offerDialog.addEventListener("click", (event) => {
  if (event.target === offerDialog || event.target.closest("[data-offer-close]")) offerDialog.close();
});
offerDialog.addEventListener("close", () => {
  if (requestDialog.open) return;
  unlockIfClear();
});

const requestDialog = document.getElementById("request-dialog");
const requestForm = document.getElementById("request-form");

function openRequest(eventName) {
  const select = requestForm.elements.namedItem("event");
  if (eventName) select.value = eventName;
  if (!document.documentElement.classList.contains("modal-open")) lockPage();
  requestDialog.showModal();
  const next = [...requestForm.elements].find((field) => field.willValidate && field.type !== "checkbox" && !field.value);
  (next || select).focus();
}

document.getElementById("offer-cta").addEventListener("click", () => {
  openRequest(offerEvent);
  if (offerDialog.open) offerDialog.close();
});

requestDialog.addEventListener("click", (event) => {
  if (event.target === requestDialog || event.target.closest("[data-request-close]")) requestDialog.close();
});
requestDialog.addEventListener("close", unlockIfClear);
bindRequestForm(requestForm);

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

const albumGrid = document.querySelector(".album-grid");
const albumScroll = document.querySelector(".albumScroll");
const albumScrollBar = document.querySelector(".albumScrollBar");

function syncAlbumScroll() {
  if (!albumGrid || !albumScroll || !albumScrollBar) return;
  const max = albumGrid.scrollWidth - albumGrid.clientWidth;
  if (max <= 1) {
    albumScroll.hidden = true;
    return;
  }
  albumScroll.hidden = false;
  const view = albumGrid.clientWidth / albumGrid.scrollWidth;
  const progress = albumGrid.scrollLeft / max;
  albumScrollBar.style.width = `${view * 100}%`;
  albumScrollBar.style.transform = `translateX(${progress * ((1 - view) / view) * 100}%)`;
}

if (albumGrid) {
  albumGrid.addEventListener("scroll", syncAlbumScroll, { passive: true });
  window.addEventListener("resize", syncAlbumScroll);
  syncAlbumScroll();
}

const revealTargets = document.querySelectorAll(
  ".door, .doors .heading, .intro, .personImage, .personCopy, #moments .heading, .album-card, .caseSection, .videoSection, .formatSection .heading, .formatGroupTitle, .format, .statement, .reviews .heading, .review, #steps > .label, #steps > h2, .steps li, .contactIntro, .contactForm",
);

revealTargets.forEach((node) => {
  node.classList.add("reveal");
  if (node.classList.contains("personCopy")) {
    node.style.setProperty("--reveal-delay", "200ms");
    return;
  }
  const siblings = [...node.parentElement.children].filter((child) => child.matches(".album-card, .format, .review, .steps li"));
  const index = siblings.indexOf(node);
  const step = node.matches(".steps li") ? 110 : 80;
  if (index > 0) node.style.setProperty("--reveal-delay", `${index * step}ms`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-in");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealTargets.forEach((node) => node.classList.add("is-in"));
} else {
  revealTargets.forEach((node) => revealObserver.observe(node));
}

const scrollProgress = document.querySelector(".scrollProgress");

function syncScrollProgress() {
  if (!scrollProgress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 1 ? Math.min(1, window.scrollY / max) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
}

window.addEventListener("scroll", syncScrollProgress, { passive: true });
window.addEventListener("resize", syncScrollProgress);
syncScrollProgress();

const motionOk = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (motionOk) {
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".heroVisual");
  if (hero) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const px = `${(-x * 9).toFixed(1)}px`;
      const py = `${(-y * 8).toFixed(1)}px`;
      hero.style.setProperty("--px", px);
      hero.style.setProperty("--py", py);
      heroVisual?.style.setProperty("--px", px);
      heroVisual?.style.setProperty("--py", py);
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.removeProperty("--px");
      hero.style.removeProperty("--py");
      heroVisual?.style.removeProperty("--px");
      heroVisual?.style.removeProperty("--py");
    });
  }
}

const reviewRail = document.querySelector(".reviewGrid");
const reviewDots = document.querySelector(".reviewDots");
if (reviewRail && reviewDots) {
  const reviewCards = [...reviewRail.querySelectorAll(".review")];
  reviewCards.forEach((card, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Отзыв ${index + 1}`);
    dot.addEventListener("click", () => {
      const pad = parseFloat(getComputedStyle(reviewRail).paddingLeft) || 0;
      reviewRail.scrollTo({
        left: card.offsetLeft - pad,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    });
    reviewDots.append(dot);
  });

  const syncReviewDots = () => {
    const center = reviewRail.scrollLeft + reviewRail.clientWidth / 2;
    let active = 0;
    reviewCards.forEach((card, index) => {
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const best = reviewCards[active].offsetLeft + reviewCards[active].offsetWidth / 2;
      if (Math.abs(mid - center) < Math.abs(best - center)) active = index;
    });
    [...reviewDots.children].forEach((dot, index) => {
      if (index === active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const showReviewCards = () => {
    if (!window.matchMedia("(max-width: 850px)").matches) return;
    reviewCards.forEach((card) => card.classList.add("is-in"));
  };

  reviewRail.addEventListener("scroll", syncReviewDots, { passive: true });
  window.addEventListener("resize", () => {
    showReviewCards();
    syncReviewDots();
  });
  showReviewCards();
  syncReviewDots();
}

const yearsStat = document.querySelector(".statYears b");
if (yearsStat && !reduceMotion.matches) {
  const countYears = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    countYears.disconnect();
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - (1 - t) ** 3;
      yearsStat.textContent = String(Math.round(eased * 7));
      if (t < 1) requestAnimationFrame(tick);
    };
    yearsStat.textContent = "0";
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  countYears.observe(yearsStat);
}
