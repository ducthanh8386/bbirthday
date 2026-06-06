const CONFIG = {
  defaultName: "người đặc biệt",
  introText: "Hôm nay có một điều nhỏ xinh muốn nói với bạn. Nhấn mở thư nhé.",
  letterText:
    "Chúc bạn tuổi mới thật nhiều bình yên, luôn được yêu thương theo cách dịu dàng nhất, và có đủ can đảm để theo đuổi những điều khiến trái tim mình sáng lên.",
  finalText:
    "Mong ngày hôm nay của bạn đầy tiếng cười, có bánh ngon, có người thương ở cạnh, và có thật nhiều khoảnh khắc để sau này nhớ lại vẫn thấy ấm lòng.",
};

const params = new URLSearchParams(window.location.search);
const recipientName = params.get("name") || CONFIG.defaultName;
const letterText = params.get("wish") || CONFIG.letterText;

const introScreen = document.querySelector("#introScreen");
const letterScreen = document.querySelector("#letterScreen");
const partyScreen = document.querySelector("#partyScreen");
const startButton = document.querySelector("#startButton");
const envelopeButton = document.querySelector("#envelopeButton");
const celebrateButton = document.querySelector("#celebrateButton");
const replayButton = document.querySelector("#replayButton");
const typeLine = document.querySelector("#typeLine");
const letterMessage = document.querySelector("#letterMessage");
const finalWish = document.querySelector("#finalWish");
const heartBurst = document.querySelector("#heartBurst");
const confettiCanvas = document.querySelector("#confettiCanvas");
const confettiContext = confettiCanvas.getContext("2d");

let confettiPieces = [];
let fireworks = [];
let confettiAnimation = null;
let lastFireworkTime = 0;

document.querySelectorAll("[data-name]").forEach((node) => {
  node.textContent = recipientName;
});

letterMessage.textContent = letterText;
finalWish.textContent = CONFIG.finalText;

typeText(CONFIG.introText, typeLine);

startButton.addEventListener("click", () => {
  showScreen(letterScreen);
});

envelopeButton.addEventListener("click", () => {
  envelopeButton.classList.add("open");
  createHeartBurst();
  playTinyChime();
  window.setTimeout(() => {
    celebrateButton.classList.remove("hidden");
  }, 720);
});

celebrateButton.addEventListener("click", () => {
  showScreen(partyScreen);
  startConfetti();
});

replayButton.addEventListener("click", () => {
  stopConfetti();
  envelopeButton.classList.remove("open");
  celebrateButton.classList.add("hidden");
  showScreen(letterScreen);
});

window.addEventListener("resize", resizeCanvas);

function showScreen(activeScreen) {
  [introScreen, letterScreen, partyScreen].forEach((screen) => {
    screen.classList.toggle("screen-active", screen === activeScreen);
  });
}

function typeText(text, target) {
  let index = 0;
  target.textContent = "";

  const interval = window.setInterval(() => {
    target.textContent += text[index];
    index += 1;

    if (index >= text.length) {
      window.clearInterval(interval);
    }
  }, 42);
}

function playTinyChime() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const audioContext = new AudioContext();
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime + index * 0.08;

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.32);
  });
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  confettiCanvas.width = Math.floor(window.innerWidth * ratio);
  confettiCanvas.height = Math.floor(window.innerHeight * ratio);
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  confettiContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function startConfetti() {
  resizeCanvas();
  confettiPieces = Array.from({ length: 140 }, () => createConfettiPiece());
  fireworks = [];
  lastFireworkTime = 0;
  animateConfetti();
}

function stopConfetti() {
  if (confettiAnimation) {
    window.cancelAnimationFrame(confettiAnimation);
    confettiAnimation = null;
  }

  confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fireworks = [];
}

function createConfettiPiece() {
  const colors = ["#f06d7f", "#ffd166", "#2bb7a8", "#8467d7", "#ffffff"];

  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * -window.innerHeight,
    size: 6 + Math.random() * 8,
    speed: 2 + Math.random() * 4,
    angle: Math.random() * Math.PI,
    spin: 0.04 + Math.random() * 0.08,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function animateConfetti() {
  confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += Math.sin(piece.angle) * 1.4;
    piece.angle += piece.spin;

    if (piece.y > window.innerHeight + 20) {
      Object.assign(piece, createConfettiPiece(), { y: -20 });
    }

    confettiContext.save();
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.angle);
    confettiContext.fillStyle = piece.color;
    confettiContext.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
    confettiContext.restore();
  });

  drawFireworks();
  confettiAnimation = window.requestAnimationFrame(animateConfetti);
}

function createHeartBurst() {
  heartBurst.textContent = "";

  Array.from({ length: 18 }).forEach((_, index) => {
    const heart = document.createElement("span");
    const distance = -150 + index * 18 + Math.random() * 20;
    const rotation = -60 + Math.random() * 120;
    const colors = ["#f06d7f", "#c83f5b", "#ffd166", "#2bb7a8"];

    heart.className = "heart-particle";
    heart.style.setProperty("--x", `${distance}px`);
    heart.style.setProperty("--r", `${rotation}deg`);
    heart.style.background = colors[index % colors.length];
    heart.style.animationDelay = `${Math.random() * 0.12}s`;
    heartBurst.appendChild(heart);
  });

  window.setTimeout(() => {
    heartBurst.textContent = "";
  }, 1400);
}

function drawFireworks() {
  const now = performance.now();

  if (now - lastFireworkTime > 680) {
    lastFireworkTime = now;
    fireworks.push(createFirework());
  }

  fireworks = fireworks.filter((spark) => spark.life > 0);

  fireworks.forEach((spark) => {
    spark.life -= 1;
    spark.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.025;
      particle.alpha *= 0.97;

      confettiContext.save();
      confettiContext.globalAlpha = particle.alpha;
      confettiContext.fillStyle = particle.color;
      confettiContext.beginPath();
      confettiContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      confettiContext.fill();
      confettiContext.restore();
    });
  });
}

function createFirework() {
  const colors = ["#f06d7f", "#ffd166", "#2bb7a8", "#8467d7", "#ffffff"];
  const originX = window.innerWidth * (0.18 + Math.random() * 0.64);
  const originY = window.innerHeight * (0.16 + Math.random() * 0.36);
  const particles = Array.from({ length: 32 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 32;
    const speed = 1.2 + Math.random() * 2.2;

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 0.92,
      size: 1.6 + Math.random() * 2.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  return {
    life: 68,
    particles,
  };
}
