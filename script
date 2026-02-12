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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function placeNoButton(x, y) {
  const rect = noBtn.getBoundingClientRect();
  const padding = 12;

  const maxX = window.innerWidth - rect.width - padding;
  const maxY = window.innerHeight - rect.height - padding;

  const nx = clamp(x, padding, maxX);
  const ny = clamp(y, padding, maxY);

  noBtn.style.position = "fixed";
  noBtn.style.left = `${nx}px`;
  noBtn.style.top = `${ny}px`;
}

function teleportNoButton() {
  const padding = 12;
  const rect = noBtn.getBoundingClientRect();

  const x = padding + Math.random() * (window.innerWidth - rect.width - padding * 2);
  const y = padding + Math.random() * (window.innerHeight - rect.height - padding * 2);

  placeNoButton(x, y);
}

function updateTrolling() {
  dodgeLevel = Math.min(dodgeLevel + 1, trollLines.length - 1);
  subtitle.textContent = trollLines[dodgeLevel];
  hint.textContent = `No attempts: ${dodges} (this is being monitored)`;
}

function dodge(pointerX, pointerY) {
  dodges += 1;
  updateTrolling();

  // Increase difficulty
  const base = 110;
  const boost = dodgeLevel * 25;

  // Move away from pointer direction
  const dx = (Math.random() > 0.5 ? 1 : -1) * (base + boost);
  const dy = (Math.random() > 0.5 ? 1 : -1) * (base + boost);

  // Sometimes just teleport (trolling peak)
  if (dodgeLevel >= 5 && Math.random() < 0.55) {
    teleportNoButton();
    noBtn.style.transform = "scale(0.98) rotate(-2deg)";
    setTimeout(() => (noBtn.style.transform = ""), 140);
    return;
  }

  placeNoButton(pointerX + dx, pointerY + dy);

  // Make it slightly smaller as you keep trying
  const scale = clamp(1 - dodges * 0.02, 0.72, 1);
  noBtn.style.transform = `scale(${scale})`;
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
}

yesBtn.addEventListener("click", winScreen);

// Desktop: dodge on hover / mouse move near
noBtn.addEventListener("mouseenter", (e) => {
  dodge(e.clientX, e.clientY);
});

// Mobile: dodge on touchstart (so they can’t tap it)
noBtn.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  dodge(t.clientX, t.clientY);
  e.preventDefault();
}, { passive: false });

// If someone actually clicks No (rare), punish politely
noBtn.addEventListener("click", () => {
  subtitle.textContent = "Nice try. That click has been rejected by the system.";
  teleportNoButton();
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

// Start with No inside the card area (then it escapes later)
window.addEventListener("load", () => {
  subtitle.textContent = trollLines[0];
});

// Keep No visible on resize
window.addEventListener("resize", () => {
  // If we've already moved it to fixed coords, bring it back in bounds
  if (noBtn.style.position === "fixed") {
    teleportNoButton();
  }
});
