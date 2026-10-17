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

const menuBtn = document.querySelector(".menuBtn");
const menu = document.getElementById("site-menu");

function setMenu(open) {
  menuBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    menu.hidden = false;
    lockPage();
    requestAnimationFrame(() => menu.classList.add("is-open"));
    menu.querySelector(".menuClose").focus();
    return;
  }
  menu.classList.remove("is-open");
  let closed = false;
  const finish = () => {
    if (closed || menu.classList.contains("is-open")) return;
    closed = true;
    menu.hidden = true;
    unlockPage();
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
  menuBtn.focus();
}

menuBtn.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (event) => {
  if (event.target === menu) setMenu(false);
});
menu.querySelector(".menuClose").addEventListener("click", () => setMenu(false));
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) setMenu(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 980 && !menu.hidden) setMenu(false);
});

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
