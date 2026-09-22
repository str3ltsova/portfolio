const canvas = document.getElementById("particleCanvas");

if (!canvas) {
    console.error("Canvas #particleCanvas не найден");
} else {

    const ctx = canvas.getContext("2d");

    let particles = [];

    const mouse = {
        x: null,
        y: null
    };

    let activeParticle = null;


    // ==========================================
    // НАСТРОЙКИ
    // ==========================================

    // Размер обычной точки
    const PARTICLE_SIZE = 2.7;

    // Цвет обычных точек
    const PARTICLE_COLOR = "#333333";

    // Цвет точки под курсором
    const ACCENT_COLOR = "#F36D07";

    // Размер центральной точки курсора
    // примерно в 1.5 раза больше обычной
    const CURSOR_SIZE = 4;

    // Расстояние между точками
    const SPACING = 14;

    // Радиус, в котором точки разлетаются
    const REPULSION_RADIUS = 75;

    // Радиус поиска ближайшей точки
    const ACTIVE_RADIUS = 24;

    // Насколько быстро точки возвращаются
    const RETURN_FORCE = 0.018;

    // Плавность
    const FRICTION = 0.84;


    // ==========================================
    // РАЗМЕР CANVAS
    // ==========================================

    function resizeCanvas() {

        const rect = canvas.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        // Если canvas почему-то не имеет размера,
        // используем запасные значения
        canvas.width = width > 0 ? width : 1000;
        canvas.height = height > 0 ? height : 240;

        createParticles();
    }


    // ==========================================
    // СОЗДАНИЕ ТОЧЕК
    // ==========================================

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

                    // Для лёгкого jiggle
                    jiggle: Math.random() * Math.PI * 2
                });
            }
        }
    }


    // ==========================================
    // КУРСОР
    // ==========================================

    canvas.addEventListener("mousemove", function(event) {

        const rect = canvas.getBoundingClientRect();

        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;

    });


    canvas.addEventListener("mouseleave", function() {

        mouse.x = null;
        mouse.y = null;

        activeParticle = null;

    });


    // ==========================================
    // ПОИСК БЛИЖАЙШЕЙ ТОЧКИ
    // ==========================================

    function findActiveParticle() {

        activeParticle = null;

        if (
            mouse.x === null ||
            mouse.y === null
        ) {
            return;
        }

        let closestDistance = ACTIVE_RADIUS;

        for (const particle of particles) {

            const dx =
                particle.x - mouse.x;

            const dy =
                particle.y - mouse.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance < closestDistance) {

                closestDistance = distance;

                activeParticle = particle;
            }
        }
    }


    // ==========================================
    // ОБНОВЛЕНИЕ ТОЧЕК
    // ==========================================

    function updateParticles() {

        findActiveParticle();


        particles.forEach(function(particle) {

            // ----------------------------------
            // ОТТАЛКИВАНИЕ ОТ КУРСОРА
            // ----------------------------------

            if (
                mouse.x !== null &&
                mouse.y !== null
            ) {

                const dx =
                    particle.x - mouse.x;

                const dy =
                    particle.y - mouse.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance < REPULSION_RADIUS &&
                    distance > 0.01
                ) {

                    const angle =
                        Math.atan2(dy, dx);


                    const force =
                        (REPULSION_RADIUS - distance) /
                        REPULSION_RADIUS;


                    const strength =
                        force * 3.5;


                    particle.vx +=
                        Math.cos(angle) * strength;

                    particle.vy +=
                        Math.sin(angle) * strength;
                }
            }


            // ----------------------------------
            // JIGGLE АКТИВНОЙ ТОЧКИ
            // ----------------------------------

            if (particle === activeParticle) {

                particle.jiggle += 0.18;


                particle.vx +=
                    Math.sin(
                        particle.jiggle * 4
                    ) * 0.025;


                particle.vy +=
                    Math.cos(
                        particle.jiggle * 3
                    ) * 0.025;

            } else {

                particle.jiggle *= 0.96;
            }


            // ----------------------------------
            // ВОЗВРАТ К ИСХОДНОЙ ПОЗИЦИИ
            // ----------------------------------

            const homeX =
                particle.originalX - particle.x;

            const homeY =
                particle.originalY - particle.y;


            particle.vx +=
                homeX * RETURN_FORCE;

            particle.vy +=
                homeY * RETURN_FORCE;


            // ----------------------------------
            // FRICTION
            // ----------------------------------

            particle.vx *= FRICTION;
            particle.vy *= FRICTION;


            // ----------------------------------
            // ДВИЖЕНИЕ
            // ----------------------------------

            particle.x += particle.vx;
            particle.y += particle.vy;

        });
    }


    // ==========================================
    // ОТРИСОВКА
    // ==========================================

    function drawParticles() {

        // Очищаем canvas
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // --------------------------------------
        // ОБЫЧНЫЕ ТОЧКИ
        // --------------------------------------

        particles.forEach(function(particle) {

            let size = PARTICLE_SIZE;

            let color = PARTICLE_COLOR;


            // ----------------------------------
            // АКТИВНАЯ ТОЧКА
            // ----------------------------------

            if (particle === activeParticle) {

                color = ACCENT_COLOR;


                // Лёгкое изменение размера
                // создаёт ощущение bounce

                const pulse =
                    Math.sin(
                        particle.jiggle * 4
                    ) * 0.35;


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


        // --------------------------------------
        // ЦЕНТРАЛЬНАЯ ТОЧКА КУРСОРА
        // --------------------------------------

        if (
            mouse.x !== null &&
            mouse.y !== null
        ) {

            ctx.beginPath();

            ctx.arc(
                mouse.x,
                mouse.y,
                CURSOR_SIZE,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = ACCENT_COLOR;

            ctx.fill();
        }
    }


    // ==========================================
    // АНИМАЦИЯ
    // ==========================================

    function animate() {

        updateParticles();

        drawParticles();

        requestAnimationFrame(animate);
    }


    // ==========================================
    // ЗАПУСК
    // ==========================================

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    resizeCanvas();

    animate();

}
