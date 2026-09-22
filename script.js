const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];

const mouse = {
  x: null,
  y: null
};

let activeParticle = null;


// =========================
// НАСТРОЙКИ
// =========================

const PARTICLE_SIZE = 2.7;
const PARTICLE_COLOR = "#333333";

const LIME_COLOR = "#F36D07";

// Курсор примерно в 1.5 раза больше точки
const CURSOR_SIZE = 4;

// Расстояние между точками
const SPACING = 14;

// Радиус разлёта
const REPULSION_RADIUS = 75;

// Радиус поиска ближайшей точки
const COLOR_RADIUS = 25;

// Сила возврата
const RETURN_FORCE = 0.015;

// Плавность
const FRICTION = 0.84;


// =========================
// СОЗДАНИЕ ТОЧЕК
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
        vy: 0,

        jiggle: Math.random() * Math.PI * 2
      });
    }
  }
}


// =========================
// РАЗМЕР CANVAS
// =========================

function resizeCanvas() {

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  createParticles();
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

  activeParticle = null;

});


// =========================
// ОБНОВЛЕНИЕ
// =========================

function updateParticles() {

  // Сбрасываем выбранную точку
  activeParticle = null;


  // --------------------------------
  // ИЩЕМ ОДНУ БЛИЖАЙШУЮ ТОЧКУ
  // --------------------------------

  if (mouse.x !== null) {

    let closestDistance = COLOR_RADIUS;

    for (const particle of particles) {

      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      if (distance < closestDistance) {

        closestDistance = distance;
        activeParticle = particle;
      }
    }
  }


  // --------------------------------
  // ДВИЖЕНИЕ ВСЕХ ТОЧЕК
  // --------------------------------

  particles.forEach((particle) => {

    // ==============================
    // ОТТАЛКИВАНИЕ ОТ КУРСОРА
    // ==============================

    if (mouse.x !== null) {

      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );


      if (
        distance < REPULSION_RADIUS &&
        distance > 0.01
      ) {

        const angle = Math.atan2(dy, dx);

        const force =
          (REPULSION_RADIUS - distance) /
          REPULSION_RADIUS;

        const strength = force * 4;


        particle.vx +=
          Math.cos(angle) * strength;

        particle.vy +=
          Math.sin(angle) * strength;
      }
    }


    // ==============================
    // ЛЁГКИЙ JIGGLE
    // ==============================

    if (particle === activeParticle) {

      particle.jiggle += 0.18;

      particle.vx +=
        Math.sin(particle.jiggle * 3) * 0.025;

      particle.vy +=
        Math.cos(particle.jiggle * 4) * 0.025;

    } else {

      // Постепенно возвращаем jiggle
      particle.jiggle *= 0.96;
    }


    // ==============================
    // ВОЗВРАЩЕНИЕ НА ИСХОДНУЮ
    // ПОЗИЦИЮ
    // ==============================

    const homeX =
      particle.originalX - particle.x;

    const homeY =
      particle.originalY - particle.y;


    particle.vx +=
      homeX * RETURN_FORCE;

    particle.vy +=
      homeY * RETURN_FORCE;


    // ==============================
    // FRICTION
    // ==============================

    particle.vx *= FRICTION;
    particle.vy *= FRICTION;


    // ==============================
    // ПЕРЕМЕЩЕНИЕ
    // ==============================

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


  // --------------------------------
  // ТОЧКИ
  // --------------------------------

  particles.forEach((particle) => {

    let size = PARTICLE_SIZE;
    let color = PARTICLE_COLOR;


    // Только одна точка
    // становится оранжевой

    if (particle === activeParticle) {

      color = LIME_COLOR;


      // Небольшой bounce
      const pulse =
        Math.sin(particle.jiggle * 4) * 0.35;

      size =
        PARTICLE_SIZE + pulse;
    }


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


  // --------------------------------
  // ТОЧКА ПОД КУРСОРОМ
  // --------------------------------

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
// ЗАПУСК
// =========================

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

requestAnimationFrame(function animate() {

  updateParticles();

  drawParticles();

  requestAnimationFrame(animate);

});
