const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const hint = document.getElementById("hint");

const win = document.getElementById("win");
const confetti = document.getElementById("confetti");
const shareBtn = document.getElementById("shareBtn");
const copied = document.getElementById("copied");

let dodgeLevel = 0;
let dodges = 0;

/** Progressive difficulty **/
let yesScale = 1;

/** Swarm **/
let swarmActive = false;
let clones = [];

const trollLines = [
  "Choose wisely. There are… consequences.",
  "No? interesting choice… 👀",
  "Are you sure? Like… emotionally sure?",
  "You’re really trying to press No huh 😭",
  "Bro it’s Valentine’s… don’t do this to me.",
  "Ok. New rule: No is illegal.",
  "Stop. STOP. I’m getting attached.",
  "Fine. Try harder 😈",
];

let released = false;

const card = document.getElementById("card");

function getViewport() {
  const vv = window.visualViewport;
  if (vv) {
    return {
      left: vv.offsetLeft,
      top: vv.offsetTop,
      width: vv.width,
      height: vv.height,
    };
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

function expandRect(r, m) {
  return {
    left: r.left - m,
    top: r.top - m,
    right: r.right + m,
    bottom: r.bottom + m,
    width: r.width + m * 2,
    height: r.height + m * 2,
  };
}

function rectsOverlap(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

function getForbiddenRects() {
  const r = card.getBoundingClientRect();
  return [expandRect(r, 18)];
}

function isForbidden(x, y, btnRect) {
  const candidate = {
    left: x,
    top: y,
    right: x + btnRect.width,
    bottom: y + btnRect.height,
  };
  return getForbiddenRects().some((fr) => rectsOverlap(candidate, fr));
}

function releaseNoButton() {
  if (released) return;
  released = true;

  const r = noBtn.getBoundingClientRect();
  noBtn.style.position = "fixed";
  noBtn.style.left = `${r.left}px`;
  noBtn.style.top = `${r.top}px`;
  noBtn.style.zIndex = "9999";
}


function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function placeButton(btn, x, y) {
  const rect = btn.getBoundingClientRect();
  const padding = 16;

  const vp = getViewport();

  const minX = vp.left + padding;
  const minY = vp.top + padding;
  const maxX = vp.left + vp.width - rect.width - padding;
  const maxY = vp.top + vp.height - rect.height - padding;

  if (maxX < minX || maxY < minY) {
    btn.style.position = "fixed";
    btn.style.left = `${minX}px`;
    btn.style.top = `${minY}px`;
    btn.style.zIndex = btn.style.zIndex || "9999";
    return;
  }

  let nx = clamp(x, minX, maxX);
  let ny = clamp(y, minY, maxY);

  btn.style.zIndex = btn.style.zIndex || "9999";

  if (isForbidden(nx, ny, rect)) {
    teleportButton(btn);
    return;
  }

  btn.style.position = "fixed";
  btn.style.left = `${nx}px`;
  btn.style.top = `${ny}px`;
}

function teleportButton(btn) {
  const rect = btn.getBoundingClientRect();
  const padding = 12;

  const vp = getViewport();

  const minX = vp.left + padding;
  const minY = vp.top + padding;
  const maxX = vp.left + vp.width - rect.width - padding;
  const maxY = vp.top + vp.height - rect.height - padding;

  if (maxX < minX || maxY < minY) {
    btn.style.position = "fixed";
    btn.style.left = `${minX}px`;
    btn.style.top = `${minY}px`;
    btn.style.zIndex = btn.style.zIndex || "9999";
    return;
  }

  // Try a bunch of spots inside the *visible* viewport
  for (let i = 0; i < 40; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);

    if (!isForbidden(x, y, rect)) {
      btn.style.position = "fixed";
      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
      btn.style.zIndex = btn.style.zIndex || "9999";
      return;
    }
  }

  // Fallback
  btn.style.position = "fixed";
  btn.style.left = `${minX}px`;
  btn.style.top = `${minY}px`;
  btn.style.zIndex = btn.style.zIndex || "9999";
}

function updateTrolling() {
  dodgeLevel = Math.min(dodgeLevel + 1, trollLines.length - 1);
  subtitle.textContent = trollLines[dodgeLevel];
  hint.textContent = `No attempts: ${dodges} (this is being monitored)`;
}

/** (2) Progressive pressure: Yes grows each dodge */
function updateYesPressure() {
  const target = clamp(1 + dodges * 0.06, 1, 1.65);
  yesScale = target;
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.filter = `brightness(${clamp(1 + dodges * 0.03, 1, 1.25)})`;
}

/** (3) Spawn a swarm of fake No buttons */
function activateSwarm() {
  if (swarmActive) return;
  swarmActive = true;

  subtitle.textContent = "Oh you like NO? Here's MORE NO. 😈";
  spawnHearts(20);

  const count = 6;
  for (let i = 0; i < count; i++) {
    const clone = noBtn.cloneNode(true);
    clone.classList.add("clone");
    clone.removeAttribute("id");
    clone.style.zIndex = "9998";

    // Slightly different label sometimes
    const labels = ["No 🙃", "Nope 😭", "Nah 😈", "Not today 🧍", "NO ❌", "??? 🤨"];
    clone.textContent = labels[i % labels.length];

    document.body.appendChild(clone);
    clones.push(clone);

    requestAnimationFrame(() => teleportButton(clone));

    // Make clones dodge too
    clone.addEventListener("mouseenter", (e) => {
      dodgeButton(clone, e.clientX, e.clientY, true);
    });

    clone.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        dodgeButton(clone, t.clientX, t.clientY, true);
        e.preventDefault();
      },
      { passive: false }
    );

    // Clicking clones trolls
    clone.addEventListener("click", () => {
      subtitle.textContent = "That one was fake. Skill issue.";
      spawnHearts(12);
      teleportButton(clone);
    });
  }
}

function cleanupSwarm() {
  clones.forEach((c) => c.remove());
  clones = [];
  swarmActive = false;
}

/** Main dodge for original No button */
function dodge(pointerX, pointerY) {
  dodges += 1;

  releaseNoButton();

  updateTrolling();
  updateYesPressure();

  if (dodges === 5) activateSwarm();

  dodgeButton(noBtn, pointerX, pointerY, false);
}


/** Generic dodge for any button (real No or clone) */
function dodgeButton(btn, pointerX, pointerY, isClone) {
  // Increase difficulty
  const base = isClone ? 90 : 110;
  const boost = dodgeLevel * 25;

  const dx = (Math.random() > 0.5 ? 1 : -1) * (base + boost);
  const dy = (Math.random() > 0.5 ? 1 : -1) * (base + boost);

  // Teleport sometimes when trolling peaks
  const teleportChance = dodgeLevel >= 5 ? 0.55 : 0.15;

  if (Math.random() < teleportChance) {
    teleportButton(btn);
    btn.style.transform = "scale(0.98) rotate(-2deg)";
    setTimeout(() => (btn.style.transform = ""), 140);
  } else {
    placeButton(btn, pointerX + dx, pointerY + dy);
  }

  // Make the real No smaller as you keep trying
  if (!isClone) {
    const scale = clamp(1 - dodges * 0.02, 0.72, 1);
    btn.style.transform = `scale(${scale})`;
  } else {
    // clones get a tiny bit chaotic too
    const s = clamp(1 - dodges * 0.01, 0.8, 1);
    btn.style.transform = `scale(${s}) rotate(${(Math.random() - 0.5) * 8}deg)`;
  }
}

function spawnHearts(count = 70) {
  const emojis = ["💖", "💘", "💗", "💕", "💞", "❤️"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "heart";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.animationDuration = `${2.2 + Math.random() * 2.6}s`;
    el.style.fontSize = `${14 + Math.random() * 18}px`;
    el.style.opacity = `${0.6 + Math.random() * 0.4}`;
    el.style.transform = `translateY(-10vh) rotate(${Math.random() * 180}deg)`;
    confetti.appendChild(el);

    setTimeout(() => el.remove(), 5200);
  }
}

function winScreen() {
  win.classList.remove("hidden");
  title.textContent = "W decision 😌💖";
  subtitle.textContent = "Screenshot this. It’s legally binding.";
  spawnHearts(90);
  cleanupSwarm();
}

yesBtn.addEventListener("click", winScreen);

// Desktop: dodge on hover
noBtn.addEventListener("mouseenter", (e) => {
  dodge(e.clientX, e.clientY);
});

// Mobile: dodge on touchstart
noBtn.addEventListener(
  "touchstart",
  (e) => {
    const t = e.touches[0];
    dodge(t.clientX, t.clientY);
    e.preventDefault();
  },
  { passive: false }
);

// If someone clicks the real No (rare), punish politely
noBtn.addEventListener("click", () => {
  subtitle.textContent = "Nice try. That click has been rejected by the system.";
  teleportButton(noBtn);
  spawnHearts(12);
});

// Share button: copy a cute line
shareBtn.addEventListener("click", async () => {
  const text = "You are officially my Valentine 💖 (I have evidence 😈)";
  try {
    await navigator.clipboard.writeText(text);
    copied.textContent = "Copied ✅ Now send it like you meant it.";
  } catch {
    copied.textContent = "Couldn’t auto-copy 😅 Just manually copy: " + text;
  }
});

window.addEventListener("load", () => {
  subtitle.textContent = trollLines[0];
});

window.addEventListener("resize", () => {
  if (noBtn.style.position === "fixed") teleportButton(noBtn);
  if (swarmActive) clones.forEach((c) => teleportButton(c));
});
