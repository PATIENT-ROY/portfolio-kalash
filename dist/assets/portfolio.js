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
      {
        src: "assets/event-wedding/wedding-3.webp",
        alt: "Невеста и жених спиной к кадру на каменной террасе, за ними горы",
        caption: "Церемония на террасе. Пара спиной к кадру, за ними горы.",
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
      {
        src: "assets/event-dinner/dinner-3.webp",
        alt: "Женя с микрофоном, гости за столами поднимают руки",
        caption: "Женя с микрофоном. Гости поднимают руки над столами.",
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
      {
        src: "assets/event-corporate/corporate-3.webp",
        alt: "Общая фотография команды, Женя в первом ряду",
        caption: "Общая фотография. Женя в первом ряду справа.",
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
  document.querySelector(".siteHeader .brand")?.toggleAttribute("inert", on);
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
    panel.addEventListener("transitionend", (event) => {
      if (event.target !== panel) return;
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

const maxChatUrl = ""; // Добавить подтверждённую ссылку владельца на чат MAX.
const maxIconPath = "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm-5 6h2l3 3 3-3h2v8h-2v-5l-3 3-3-3v5H7Z";

function bindReach(form) {
  const reach = form.querySelector(".reach");
  const input = reach.querySelector("input");
  const tabs = [...reach.querySelectorAll("[data-reach]")];
  const sendButton = form.querySelector(".sendBtn");
  const sendIcon = sendButton.querySelector("path");
  const telegramIconPath = sendIcon.getAttribute("d");
  reach.querySelector(".reachIconPhone path").setAttribute("d", maxIconPath);

  function apply(next) {
    reach.dataset.mode = next;
    const phone = next === "phone";
    tabs.forEach((tab) => {
      const on = tab.dataset.reach === next;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    input.setCustomValidity("");
    input.type = phone ? "tel" : "text";
    input.inputMode = phone ? "tel" : "text";
    input.autocomplete = phone ? "tel" : "off";
    input.placeholder = phone ? "Ваш номер" : "Ваш Telegram";
    input.maxLength = phone ? 22 : 64;
    sendButton.querySelector("span").textContent = phone ? "Отправить в MAX" : "Отправить в Telegram";
    sendIcon.setAttribute("d", phone ? maxIconPath : telegramIconPath);
    form.querySelector(".formStatus").textContent = phone
      ? (maxChatUrl ? "Откроется чат в MAX. Отправьте заявку в мессенджере." : "Чат MAX пока недоступен. Для отправки заявки выберите Telegram.")
      : "Откроется чат с Женей в Telegram. Сообщение уйдёт, когда нажмёте отправить уже там.";
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      apply(tab.dataset.reach);
      input.focus();
    });
    tab.addEventListener("keydown", (event) => {
      const dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
        : 0;
      if (!dir) return;
      event.preventDefault();
      const next = tabs[(index + dir + tabs.length) % tabs.length];
      apply(next.dataset.reach);
      next.focus();
    });
  });

  input.addEventListener("input", () => input.setCustomValidity(""));
  apply(reach.dataset.mode === "phone" ? "phone" : "telegram");
}

function contactText(mode, raw) {
  const value = clean(raw);
  if (mode === "phone") {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15 ? value : "";
  }
  const handle = value
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(handle) ? `@${handle}` : "";
}

function bindRequestForm(form) {
  const dateField = form.elements.namedItem("date");
  const status = form.querySelector(".formStatus");
  const contactInput = form.querySelector(".reach input");
  dateField.min = isoToday;
  dateField.addEventListener("input", () => dateField.setCustomValidity(""));
  form.elements.namedItem("name").addEventListener("input", (event) => {
    event.currentTarget.setCustomValidity("");
  });
  form.elements.namedItem("consent").addEventListener("change", (event) => {
    event.currentTarget.setCustomValidity("");
  });
  bindReach(form);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = clean(data.get("name"));
    const dateValue = String(data.get("date") || "");
    const nameInput = form.elements.namedItem("name");
    const consent = form.elements.namedItem("consent");
    const mode = form.querySelector(".reach").dataset.mode === "phone" ? "phone" : "telegram";
    const contact = contactText(mode, data.get("contact"));
    nameInput.setCustomValidity(name ? "" : "Напишите, как к вам обращаться.");
    dateField.setCustomValidity(
      dateValue && dateValue < isoToday ? "Эта дата уже прошла. Выберите день события." : "",
    );
    contactInput.setCustomValidity(contact
      ? ""
      : (mode === "phone"
        ? "Напишите номер, по которому вам можно позвонить."
        : "Напишите ник в Telegram, например @name."));
    consent.setCustomValidity(consent.checked ? "" : "Нужно согласие на обработку персональных данных.");
    if (!form.reportValidity()) return;
    nameInput.setCustomValidity("");
    contactInput.setCustomValidity("");

    const [year, month, day] = dateValue.split("-");
    const request = [
      `Здравствуйте, Женя! Меня зовут ${name}. Хочу обсудить мероприятие.`,
      `Тип события: ${clean(data.get("event"))}`,
      `Дата: ${day}.${month}.${year}`,
      `Количество гостей: ${clean(data.get("guests"))}.`,
      mode === "phone" ? `Телефон: ${contact}` : `Telegram: ${contact}`,
    ].join("\n");

    if (mode === "phone" && !maxChatUrl) {
      status.textContent = "Чат MAX пока недоступен. Для отправки заявки выберите Telegram.";
      return;
    }
    const url = mode === "phone" ? maxChatUrl : `https://t.me/+79122204032?text=${encodeURIComponent(request)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    status.textContent = opened
      ? (mode === "phone" ? "Открыт чат в MAX." : "Открыт чат с Женей в Telegram. Осталось нажать «Отправить».")
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
  const touchLayout = window.matchMedia("(pointer: coarse), (max-width: 650px)").matches;
  const initialFocus = touchLayout ? requestDialog.querySelector("[data-request-close]") : (next || select);
  initialFocus.focus({ preventScroll: true });
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

const clientNames = [
  "Авито",
  "Золотое Яблоко",
  "УралТрансЭкспедиция",
  "Сима-ленд",
  "Контур",
  "Жизньмарт",
  "Синара",
  "УБРиР",
];

const clientShapes = ["oval", "ticket", "rect", "wave", "oval", "rect", "ticket", "wave"];
const clientTilts = [-6, 4, -2, 5, -4, 3, -5, 2];

function clientShapeSvg(shape, tone) {
  const fill = tone === "ink" ? "#1b2c21" : "#f7f5ee";
  if (shape === "ticket") {
    return `<svg class="clientShape" viewBox="0 0 280 96" preserveAspectRatio="none" aria-hidden="true"><path fill="${fill}" d="M22 2h236c12 0 20 8 20 18v12a16 16 0 0 0 0 32v12c0 10-8 18-20 18H22c-12 0-20-8-20-18V64a16 16 0 0 0 0-32V20C2 10 10 2 22 2Z"/></svg>`;
  }
  return `<svg class="clientShape" viewBox="0 0 260 108" preserveAspectRatio="none" aria-hidden="true"><path fill="${fill}" d="M36 16c22-14 48-8 74-2 28 6 40-12 72-6 22 4 40-2 52 16 14 20 18 28 8 46-8 16 6 28-8 40-18 14-48 6-78 12-32 6-52-8-82 2-22 8-46-4-52-24-8-22 2-36 8-52 4-14 8-20 6-32Z"/></svg>`;
}

function mountClientStickers() {
  const list = document.querySelector(".clientStickers");
  if (!list) return;
  const items = clientNames.map((name, index) => {
    const shape = clientShapes[index % clientShapes.length];
    const tone = index % 2 ? "ink" : "cream";
    const sticker = document.createElement("li");
    sticker.className = "clientSticker";
    sticker.dataset.shape = shape;
    sticker.dataset.tone = tone;
    if (name.length > 16) sticker.dataset.long = "true";
    sticker.style.setProperty("--tilt-base", `${clientTilts[index % clientTilts.length]}deg`);
    if (shape === "ticket" || shape === "wave") sticker.insertAdjacentHTML("beforeend", clientShapeSvg(shape, tone));
    const label = document.createElement("span");
    label.textContent = name;
    sticker.append(label);
    return sticker;
  });
  list.replaceChildren(...items);
}

mountClientStickers();

function bindClientPlayground() {
  const section = document.querySelector(".clients");
  const stage = document.querySelector(".clientStage");
  const list = document.querySelector(".clientStickers");
  if (!section || !stage || !list || typeof Matter === "undefined") return;

  const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Sleeping } = Matter;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stickers = [...list.querySelectorAll(".clientSticker")];
  const spots = [
    [0.16, 0.58],
    [0.42, 0.52],
    [0.74, 0.56],
    [0.24, 0.78],
    [0.5, 0.8],
    [0.76, 0.76],
    [0.36, 0.36],
    [0.64, 0.34],
  ];

  let engine = null;
  let runner = null;
  let loopOn = false;
  let playing = false;
  let dragging = false;
  let walls = [];
  let pointer = null;
  let pairs = [];
  let pointerAim = null;
  let pointerVel = { x: 0, y: 0 };

  function canPlay() {
    return fine.matches && !reduce.matches && window.innerWidth > 700;
  }

  function syncStickers() {
    pairs.forEach(({ el, body, w, h }) => {
      el.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0) rotate(${body.angle}rad)`;
    });
  }

  function layoutWalls() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const thick = 180;
    const edge = {
      isStatic: true,
      restitution: 0.5,
      friction: 0.25,
      label: "wall",
    };
    walls.forEach((wall) => Composite.remove(engine.world, wall));
    walls = [
      Bodies.rectangle(width / 2, height - 12 + thick / 2, width + thick * 2, thick, edge),
      Bodies.rectangle(width / 2, -thick / 2, width + thick * 2, thick, edge),
      Bodies.rectangle(10 - thick / 2, height / 2, thick, height + thick * 2, edge),
      Bodies.rectangle(width - 10 + thick / 2, height / 2, thick, height + thick * 2, edge),
    ];
    Composite.add(engine.world, walls);
    pairs.forEach(({ body, w, h }) => {
      const x = Math.min(width - w / 2 - 16, Math.max(w / 2 + 16, body.position.x));
      const y = Math.min(height - h / 2 - 20, Math.max(h / 2 + 12, body.position.y));
      if (x !== body.position.x || y !== body.position.y) Body.setPosition(body, { x, y });
    });
  }

  function parkPointer() {
    pointerAim = null;
    pointerVel = { x: 0, y: 0 };
    if (!pointer) return;
    Body.setPosition(pointer, { x: -400, y: -400 });
    Body.setVelocity(pointer, { x: 0, y: 0 });
  }

  function build() {
    const sizes = stickers.map((el) => ({ w: el.offsetWidth, h: el.offsetHeight }));
    section.classList.add("is-play");
    stickers.forEach((el, index) => {
      el.style.width = `${sizes[index].w}px`;
      el.style.height = `${sizes[index].h}px`;
    });

    engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1;
    engine.positionIterations = 10;
    engine.velocityIterations = 8;

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    pairs = stickers.map((el, index) => {
      const { w, h } = sizes[index];
      const spot = spots[index % spots.length];
      const x = Math.min(width - w / 2 - 16, Math.max(w / 2 + 16, width * spot[0]));
      const y = Math.min(height - h / 2 - 28, Math.max(h / 2 + 16, height * spot[1]));
      const shape = el.dataset.shape;
      const radius = shape === "oval" ? Math.max(4, Math.min(w, h) / 2 - 1) : shape === "wave" ? 26 : 16;
      const body = Bodies.rectangle(x, y, w, h, {
        restitution: 0.55,
        friction: 0.12,
        frictionStatic: 0.18,
        frictionAir: 0.014,
        density: 0.0018,
        chamfer: { radius: Math.min(radius, h / 2 - 1, w / 2 - 1) },
        sleepThreshold: 40,
        label: "sticker",
      });
      Body.setAngle(body, (clientTilts[index % clientTilts.length] * Math.PI) / 180);
      Body.setInertia(body, body.inertia * 3.4);
      return { el, body, w, h, home: body.angle };
    });
    Composite.add(engine.world, pairs.map((pair) => pair.body));
    layoutWalls();

    pointer = Bodies.circle(-400, -400, 26, {
      restitution: 0.15,
      friction: 0,
      frictionAir: 0,
      density: 0.05,
      label: "pointer",
      collisionFilter: { category: 0x0002, mask: 0x0001 },
    });
    Composite.add(engine.world, pointer);

    const mouse = Mouse.create(stage);
    stage.removeEventListener("wheel", mouse.mousewheel);
    stage.removeEventListener("touchmove", mouse.mousemove);
    stage.removeEventListener("touchstart", mouse.mousedown);
    stage.removeEventListener("touchend", mouse.mouseup);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      collisionFilter: { category: 0x0001, mask: 0x0001 },
      constraint: { stiffness: 0.65, damping: 0.2, length: 0 },
    });
    Composite.add(engine.world, mouseConstraint);

    Events.on(mouseConstraint, "startdrag", (event) => {
      dragging = true;
      if (event.body) event.body.plugin.dragged = true;
      pairs.forEach((pair) => pair.el.classList.toggle("is-grabbed", pair.body === event.body));
      parkPointer();
    });
    Events.on(mouseConstraint, "enddrag", (event) => {
      dragging = false;
      if (event.body) event.body.plugin.dragged = false;
      stickers.forEach((el) => el.classList.remove("is-grabbed"));
    });

    let lastMove = null;
    stage.addEventListener("mousemove", (event) => {
      if (!playing) return;
      const rect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (dragging) {
        parkPointer();
        lastMove = null;
        return;
      }
      const now = performance.now();
      if (lastMove) {
        const dt = Math.max(8, now - lastMove.t);
        let vx = ((x - lastMove.x) / dt) * 16.67;
        let vy = ((y - lastMove.y) / dt) * 16.67;
        const speed = Math.hypot(vx, vy);
        const cap = 34;
        if (speed > cap) {
          vx *= cap / speed;
          vy *= cap / speed;
        }
        pointerVel = { x: vx, y: vy };
      }
      pointerAim = { x, y };
      lastMove = { x, y, t: now };
    });
    stage.addEventListener("mouseleave", () => {
      lastMove = null;
      parkPointer();
    });

    Events.on(engine, "beforeUpdate", () => {
      if (!pointer) return;
      if (dragging || !pointerAim) {
        Body.setPosition(pointer, { x: -400, y: -400 });
        Body.setVelocity(pointer, { x: 0, y: 0 });
        return;
      }
      Body.setPosition(pointer, pointerAim);
      Body.setVelocity(pointer, pointerVel);
      Sleeping.set(pointer, false);
    });
    Events.on(engine, "afterUpdate", () => {
      pairs.forEach(({ body, home }) => {
        if (dragging && body.plugin.dragged) return;
        if (body.speed > 2.4) return;
        let delta = home - body.angle;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        if (Math.abs(delta) < 0.012 && Math.abs(body.angularVelocity) < 0.012) return;
        Body.setAngularVelocity(body, body.angularVelocity * 0.8 + delta * 0.14);
      });
      syncStickers();
    });

    runner = Runner.create();
    Runner.run(runner, engine);
    loopOn = true;
    playing = true;
    syncStickers();
  }

  function pause() {
    playing = false;
    if (runner) runner.enabled = false;
  }

  function resume() {
    if (!canPlay()) return;
    if (!engine) {
      const start = () => {
        if (!engine && canPlay()) build();
      };
      if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(start);
      else start();
      return;
    }
    section.classList.add("is-play");
    pairs.forEach(({ el, w, h }) => {
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    });
    playing = true;
    if (!loopOn) {
      Runner.run(runner, engine);
      loopOn = true;
      return;
    }
    runner.enabled = true;
  }

  function stopPlay() {
    pause();
    parkPointer();
    dragging = false;
    section.classList.remove("is-play");
    stickers.forEach((el) => {
      el.style.transform = "";
      el.style.width = "";
      el.style.height = "";
      el.classList.remove("is-grabbed");
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!canPlay()) return;
      if (entry.isIntersecting) resume();
      else pause();
    });
  }, { threshold: 0.08 });

  function syncMode() {
    if (!canPlay()) {
      stopPlay();
      return;
    }
    observer.observe(section);
  }

  syncMode();
  fine.addEventListener("change", syncMode);
  reduce.addEventListener("change", syncMode);
  window.addEventListener("resize", () => {
    if (!canPlay()) {
      stopPlay();
      return;
    }
    if (engine && section.classList.contains("is-play")) layoutWalls();
    else observer.observe(section);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pause();
      return;
    }
    const box = section.getBoundingClientRect();
    if (box.bottom > 0 && box.top < window.innerHeight) resume();
  });
}

bindClientPlayground();

const revealTargets = document.querySelectorAll(
  ".door, .doors .heading, .intro, .personImage, .personCopy, #moments .heading, .album-card, .caseSection, .videoSection, .formatSection .heading, .formatGroupTitle, .format, .clients, .reviews .heading, .review, #steps > .label, #steps > h2, .steps li, .contactIntro, .contactForm",
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

// Keep the decorative label playful with a mouse, still with touch/reduced motion.
function bindPlayfulSticker() {
  const sticker = document.querySelector('.heroSticker');
  const area = document.querySelector('.heroVisual');
  if (!sticker || !area) return;
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  let origin = null;
  let lastMove = -Infinity;

  function reset() {
    sticker.style.transition = 'none';
    sticker.style.removeProperty('--escape-x');
    sticker.style.removeProperty('--escape-y');
    sticker.classList.toggle('is-playful', mouse.matches && !reduceMotion.matches);
    const bounds = area.getBoundingClientRect();
    const rect = sticker.getBoundingClientRect();
    origin = mouse.matches && !reduceMotion.matches
      ? { x: rect.left - bounds.left, y: rect.top - bounds.top } : null;
    sticker.style.removeProperty('transition');
    lastMove = -Infinity;
  }

  document.addEventListener('pointermove', (event) => {
    if (!origin || event.pointerType !== 'mouse' || performance.now() - lastMove < 300) return;
    if (document.querySelector('dialog[open]') || !document.getElementById('site-menu').hidden) return;
    const rect = sticker.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - clamp(event.clientX, rect.left, rect.right),
      event.clientY - clamp(event.clientY, rect.top, rect.bottom),
    );
    if (distance > 65) return;
    const bounds = area.getBoundingClientRect();
    const headerBottom = document.querySelector('.siteHeader').getBoundingClientRect().bottom;
    // Include the separate decorative arrow and keep clear of the sticky header.
    const minX = Math.max(36, 36 - bounds.left);
    const maxX = Math.min(bounds.width, innerWidth - bounds.left) - rect.width - 8;
    const minY = Math.max(28, headerBottom + 28 - bounds.top);
    const maxY = Math.min(bounds.height, innerHeight - bounds.top) - rect.height - 24;
    if (maxX <= minX || maxY <= minY) return;
    const x = rect.left - bounds.left;
    const y = rect.top - bounds.top;
    // The reference marks a top band plus two side corridors around the face.
    // Desktop has copy on the left, so use only the portrait half there.
    const photoLeft = innerWidth >= 1200 ? bounds.width * 0.48 : 0;
    const photoWidth = bounds.width - photoLeft;
    const zones = [
      { left: photoLeft + photoWidth * 0.05, right: bounds.width, bottom: bounds.height * 0.24 },
      { left: photoLeft + photoWidth * 0.05, right: photoLeft + photoWidth * 0.41, bottom: bounds.height * 0.53 },
      { left: photoLeft + photoWidth * 0.80, right: bounds.width, bottom: bounds.height * 0.45 },
    ].map(zone => ({
      left: Math.max(minX, zone.left + 28),
      right: Math.min(maxX, zone.right - rect.width - 8),
      top: minY,
      bottom: Math.min(maxY, zone.bottom - rect.height - 12),
    })).filter(zone => zone.right >= zone.left && zone.bottom >= zone.top);
    // Both endpoints must share a rectangle: the whole transition then avoids the face.
    const corridors = zones.filter(zone => x >= zone.left - 1 && x <= zone.right + 1
      && y >= zone.top - 1 && y <= zone.bottom + 1);
    const candidates = corridors.flatMap(zone =>
      [[-190, -110], [-190, 110], [190, -110], [190, 110]].map(([dx, dy]) => ({
        x: clamp(x + dx, zone.left, zone.right),
        y: clamp(y + dy, zone.top, zone.bottom),
      })));
    if (!candidates.length) return;
    const score = (p) => Math.hypot(bounds.left + p.x + rect.width / 2 - event.clientX,
      bounds.top + p.y + rect.height / 2 - event.clientY);
    candidates.sort((a, b) => score(b) - score(a));
    sticker.style.setProperty('--escape-x', `${candidates[0].x - origin.x}px`);
    sticker.style.setProperty('--escape-y', `${candidates[0].y - origin.y}px`);
    lastMove = performance.now();
  }, { passive: true });
  window.addEventListener('resize', reset);
  mouse.addEventListener('change', reset);
  reduceMotion.addEventListener('change', reset);
  reset();
}
bindPlayfulSticker();
