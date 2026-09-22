/* =========================================================
   PREDICTIVE ARC
========================================================= */

(() => {

    const canvas = document.getElementById("arcCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = {
        x: 0,
        y: 0,
        active: false
    };

    function resize() {

        const rect = canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    window.addEventListener("resize", resize);

    canvas.addEventListener("pointermove", (event) => {

        const rect = canvas.getBoundingClientRect();

        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;

        mouse.active = true;
    });

    canvas.addEventListener("pointerleave", () => {
        mouse.active = false;
    });


    function draw(time) {

        ctx.clearRect(0, 0, width, height);

        const centerX = width * 0.5;

        /*
         * Основная дуга
         */

        const points = 110;

        for (let i = 0; i < points; i++) {

            const t = i / (points - 1);

            const x = width * t;

            const distanceFromCenter = Math.abs(t - 0.5) * 2;

            const arch =
                Math.pow(1 - distanceFromCenter, 1.65);

            const baseY =
                height * 0.72 -
                arch * height * 0.46;

            const wave =
                Math.sin(
                    t * 18 -
                    time * 0.0015
                ) * 2;

            let y = baseY + wave;

            /*
             * Влияние мыши
             */

            if (mouse.active) {

                const dx = x - mouse.x;
                const dy = y - mouse.y;

                const distance = Math.sqrt(
                    dx * dx + dy * dy
                );

                const radius = 180;

                if (distance < radius) {

                    const influence =
                        1 - distance / radius;

                    y -=
                        influence *
                        influence *
                        55;
                }
            }


            /*
             * Точки
             */

            const size =
                1.5 +
                arch * 1.5;

            const alpha =
                0.18 +
                arch * 0.72;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(255,255,255,${alpha})`;

            ctx.fill();
        }


        /*
         * Центральная светящаяся точка
         */

        const centerY =
            height * 0.72 -
            height * 0.46;

        const pulse =
            5 +
            Math.sin(time * 0.004) * 1.5;

        const gradient =
            ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                35
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );

        gradient.addColorStop(
            0.15,
            "rgba(255,255,255,.8)"
        );

        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            35,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            pulse,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#fff";

        ctx.fill();


        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

})();



/* =========================================================
   BOTTOM PARTICLES
   Старый блок с точками
========================================================= */

(() => {

    const canvas =
        document.getElementById("particleCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const PARTICLE_SIZE = 2.4;
    const PARTICLE_COLOR = "#333333";
    const LIME_COLOR = "#F36D07";

    const CURSOR_SIZE = 5;
    const COLOR_RADIUS = 38;
    const SPACING = 18;

    let width;
    let height;

    let particles = [];

    const mouse = {
        x: -1000,
        y: -1000,
        active: false
    };


    function resize() {

        const rect =
            canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        createParticles();
    }


    function createParticles() {

        particles = [];

        for (
            let y = SPACING / 2;
            y < height;
            y += SPACING
        ) {

            for (
                let x = SPACING / 2;
                x < width;
                x += SPACING
            ) {

                particles.push({
                    x: x,
                    y: y,
                    ox: x,
                    oy: y,
                    vx: 0,
                    vy: 0
                });
            }
        }
    }


    canvas.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                canvas.getBoundingClientRect();

            mouse.x =
                event.clientX - rect.left;

            mouse.y =
                event.clientY - rect.top;

            mouse.active = true;
        }
    );


    canvas.addEventListener(
        "pointerleave",
        () => {

            mouse.active = false;

            mouse.x = -1000;
            mouse.y = -1000;
        }
    );


    function animate() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        for (const particle of particles) {

            /*
             * Возврат точки
             */

            const springX =
                (particle.ox - particle.x) * 0.08;

            const springY =
                (particle.oy - particle.y) * 0.08;

            particle.vx += springX;
            particle.vy += springY;


            /*
             * Взаимодействие с курсором
             */

            if (mouse.active) {

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
                    distance < COLOR_RADIUS &&
                    distance > 0
                ) {

                    const force =
                        (1 - distance / COLOR_RADIUS);

                    particle.vx +=
                        (dx / distance) *
                        force *
                        0.8;

                    particle.vy +=
                        (dy / distance) *
                        force *
                        0.8;
                }
            }


            particle.vx *= 0.86;
            particle.vy *= 0.86;

            particle.x += particle.vx;
            particle.y += particle.vy;


            /*
             * Цвет
             */

            let color =
                PARTICLE_COLOR;

            if (mouse.active) {

                const dx =
                    particle.x - mouse.x;

                const dy =
                    particle.y - mouse.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                if (distance < COLOR_RADIUS) {
                    color = LIME_COLOR;
                }
            }


            /*
             * Рисуем точку
             */

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                PARTICLE_SIZE,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = color;

            ctx.fill();
        }


        /*
         * Точка под курсором
         */

        if (mouse.active) {

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


        requestAnimationFrame(animate);
    }


    window.addEventListener(
        "resize",
        resize
    );

    resize();
    animate();

})();
