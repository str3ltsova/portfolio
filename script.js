const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];

const mouse = {
  x: null,
  y: null,
  radius: 80
};

// Настройки
const PARTICLE_SIZE = 1;
const PARTICLE_COLOR = "#bcbcbc";

const ACCENT_COLOR = "#B6FF00"; // лаймовый
const ACCENT_RADIUS = 18;
const ACCENT_DOTS = 8;
const CENTER_SIZE = 3;


// -------------------------
// RESIZE
// -------------------------

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  createParticles();
}


// -------------------------
// CREATE PARTICLES
// -------------------------

function createParticles() {
  particles = [];

  const spacing = 18;

  for (let y = spacing / 2; y < canvas.height; y += spacing) {
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      particles.push({
        x: x,
        y: y,

        originalX: x,
        originalY: y,

        vx: 0,
        vy: 0
      });
    }
  }
}


// -------------------------
// MOUSE
// -------------------------

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
});

canvas.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});


// -------------------------
// PARTICLE MOVEMENT
// -------------------------

function updateParticles() {

  particles.forEach((particle) => {

    if (mouse.x !== null) {

      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius && distance > 0) {

        const angle = Math.atan2(dy, dx);

        const force =
          (mouse.radius - distance) / mouse.radius;

        const strength = force * 8;

        particle.vx += Math.cos(angle) * strength;
        particle.vy += Math.sin(angle) * strength;
      }
    }

    // Возвращаем точки на исходные позиции
    const homeX = particle.originalX - particle.x;
    const homeY = particle.originalY - particle.y;

    particle.vx += homeX * 0.015;
    particle.vy += homeY * 0.015;

    // Трение
    particle.vx *= 0.85;
    particle.vy *= 0.85;

    particle.x += particle.vx;
    particle.y += particle.vy;
  });
}


// -------------------------
// DRAW PARTICLES
// -------------------------

function drawParticles() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Обычные точки
  particles.forEach((particle) => {

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      PARTICLE_SIZE,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = PARTICLE_COLOR;

    ctx.fill();
  });


  // -------------------------
  // CURSOR ACCENT
  // -------------------------

  if (mouse.x !== null) {

    // Центральная точка
    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      CENTER_SIZE,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = ACCENT_COLOR;

    ctx.fill();


    // Кольцо из отдельных точек
    for (let i = 0; i < ACCENT_DOTS; i++) {

      const angle =
        (Math.PI * 2 / ACCENT_DOTS) * i;

      const x =
        mouse.x +
        Math.cos(angle) * ACCENT_RADIUS;

      const y =
        mouse.y +
        Math.sin(angle) * ACCENT_RADIUS;


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        PARTICLE_SIZE + 0.5,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = ACCENT_COLOR;

      ctx.fill();
    }
  }
}


// -------------------------
// ANIMATION
// -------------------------

function animate() {

  updateParticles();

  drawParticles();

  requestAnimationFrame(animate);
}


// -------------------------
// START
// -------------------------

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();
