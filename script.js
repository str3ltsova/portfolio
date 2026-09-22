const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];

const mouse = {
  x: null,
  y: null,
  radius: 30
};


// =========================
// НАСТРОЙКИ
// =========================

const PARTICLE_SIZE = 2.4;
const PARTICLE_COLOR = "#333333";

const LIME_COLOR = "#F36D07";

const CURSOR_SIZE = 5;

// Насколько далеко курсор окрашивает точки
const COLOR_RADIUS = 38;

// Расстояние между точками
const SPACING = 18;


// =========================
// RESIZE
// =========================

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  createParticles();
}


// =========================
// СОЗДАНИЕ СЕТКИ
// =========================

function createParticles() {

  particles = [];

  for (
    let y = SPACING / 2;
    y < canvas.height;
    y += SPACING
  ) {

    for (
      let x = SPACING / 2;
      x < canvas.width;
      x += SPACING
    ) {

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


// =========================
// КУРСОР
// =========================

canvas.addEventListener("mousemove", (event) => {

  const rect = canvas.getBoundingClientRect();

  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;

});


canvas.addEventListener("mouseleave", () => {

  mouse.x = null;
  mouse.y = null;

});


// =========================
// ДВИЖЕНИЕ ТОЧЕК
// =========================

function updateParticles() {

  particles.forEach((particle) => {

    if (mouse.x !== null) {

      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );


      // Разлёт точек от курсора
      if (
        distance < mouse.radius &&
        distance > 0
      ) {

        const angle = Math.atan2(dy, dx);

        const force =
          (mouse.radius - distance) /
          mouse.radius;

        const strength = force * 8;

        particle.vx +=
          Math.cos(angle) * strength;

        particle.vy +=
          Math.sin(angle) * strength;
      }
    }


    // Возвращаем точку
    // на исходную позицию

    const homeX =
      particle.originalX - particle.x;

    const homeY =
      particle.originalY - particle.y;


    particle.vx += homeX * 0.015;
    particle.vy += homeY * 0.015;


    // Плавность движения

    particle.vx *= 0.85;
    particle.vy *= 0.85;


    particle.x += particle.vx;
    particle.y += particle.vy;

  });
}


// =========================
// ОТРИСОВКА
// =========================

function drawParticles() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // -------------------------
  // ТОЧКИ СЕТКИ
  // -------------------------

  particles.forEach((particle) => {

    let color = PARTICLE_COLOR;
    let size = PARTICLE_SIZE;


    // Если курсор находится
    // внутри canvas

    if (mouse.x !== null) {

      const dx =
        particle.x - mouse.x;

      const dy =
        particle.y - mouse.y;


      const distance = Math.sqrt(
        dx * dx + dy * dy
      );


      // -------------------------
      // ОКРАШИВАНИЕ ТОЧЕК
      // -------------------------

      if (distance < COLOR_RADIUS) {

        /*
          intensity:

          1 = точка прямо возле курсора

          0 = край зоны воздействия
        */

        const intensity =
          1 - distance / COLOR_RADIUS;


        /*
          Только ближайшие точки
          становятся зелёными.

          Это не создаёт искусственное
          кольцо — окрашиваются
          реальные точки сетки.
        */

        if (intensity > 0.15) {

          color = LIME_COLOR;


          // Ближайшие точки
          // немного крупнее

          size =
            PARTICLE_SIZE +
            intensity * 1.2;
        }
      }
    }


    // Рисуем точку

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = color;

    ctx.fill();

  });


  // -------------------------
  // ЦЕНТРАЛЬНАЯ ТОЧКА
  // -------------------------

  if (mouse.x !== null) {

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      CURSOR_SIZE,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = LIME_COLOR;

    ctx.fill();
  }
}


// =========================
// АНИМАЦИЯ
// =========================

function animate() {

  updateParticles();

  drawParticles();

  requestAnimationFrame(animate);
}


// =========================
// ЗАПУСК
// =========================

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

animate();
