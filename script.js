/* =========================================================
   PREDICTIVE ARC — TOP
========================================================= */

(() => {

    const canvas =
        document.getElementById("arcCanvas");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    let width = 0;
    let height = 0;

    let dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    const mouse = {
        x: 0,
        y: 0,
        active: false
    };


    function resize() {

        const rect =
            canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    resize();


    window.addEventListener(
        "resize",
        resize
    );


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
        }
    );


    function draw(time) {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        const centerX =
            width * 0.5;

        const points = 110;


        for (
            let i = 0;
            i < points;
            i++
        ) {

            const t =
                i / (points - 1);

            const x =
                width * t;

            const distanceFromCenter =
                Math.abs(t - 0.5) * 2;

            const arch =
                Math.pow(
                    1 - distanceFromCenter,
                    1.65
                );

            const baseY =
                height * 0.72 -
                arch * height * 0.46;

            const wave =
                Math.sin(
                    t * 18 -
                    time * 0.0015
                ) * 2;

            let y =
                baseY + wave;


            /* Cursor influence */

            if (mouse.active) {

                const dx =
                    x - mouse.x;

                const dy =
                    y - mouse.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                const radius = 180;

                if (distance < radius) {

                    const influence =
                        1 -
                        distance / radius;

                    y -=
                        influence *
                        influence *
                        55;
                }
            }


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


        /* Center light */

        const centerY =
            height * 0.72 -
            height * 0.46;

        const pulse =
            5 +
            Math.sin(
                time * 0.004
            ) * 1.5;


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


        ctx.fillStyle =
            gradient;

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

        ctx.fillStyle =
            "#fff";

        ctx.fill();


        requestAnimationFrame(draw);
    }


    requestAnimationFrame(draw);

})();



/* =========================================================
   BOTTOM INTERACTIVE DOTS
========================================================= */

(() => {

    const canvas =
        document.getElementById(
            "particleCanvas"
        );

    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    /*
     * Настройки точек
     */

    const PARTICLE_SIZE = 2.4;

    const PARTICLE_COLOR =
        "#363636";

    const ACTIVE_COLOR =
        "#F36D07";

    const CURSOR_COLOR =
        "#F36D07";

    const SPACING = 17;

    /*
     * Радиус, в котором курсор
     * начинает двигать точки
     */

    const MOUSE_RADIUS = 95;

    /*
     * Сила разлёта
     */

    const REPULSION = 6.5;

    /*
     * Возврат на исходную позицию
     */

    const SPRING = 0.075;

    /*
     * Плавность движения
     */

    const FRICTION = 0.82;


    let width = 0;
    let height = 0;

    let particles = [];


    const mouse = {

        x: -1000,

        y: -1000,

        active: false

    };


    /* =========================
       RESIZE
    ========================== */

    function resize() {

        const rect =
            canvas.getBoundingClientRect();


        width =
            rect.width;

        height =
            rect.height;


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;


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


    /* =========================
       CREATE GRID
    ========================== */

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

                    originalX: x,

                    originalY: y,

                    vx: 0,

                    vy: 0

                });

            }
        }
    }


    /* =========================
       MOUSE MOVE
    ========================== */

    canvas.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                canvas.getBoundingClientRect();


            mouse.x =
                event.clientX -
                rect.left;


            mouse.y =
                event.clientY -
                rect.top;


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


    /* =========================
       ANIMATION
    ========================== */

    function animate() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        particles.forEach(
            (particle) => {


                /*
                 * Возвращение
                 * к исходному месту
                 */

                particle.vx +=
                    (
                        particle.originalX -
                        particle.x
                    ) * SPRING;


                particle.vy +=
                    (
                        particle.originalY -
                        particle.y
                    ) * SPRING;


                let active = false;


                /*
                 * Отталкивание
                 */

                if (mouse.active) {

                    const dx =
                        particle.x -
                        mouse.x;

                    const dy =
                        particle.y -
                        mouse.y;


                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance <
                        MOUSE_RADIUS &&
                        distance > 0
                    ) {

                        active = true;


                        const force =
                            1 -
                            distance /
                            MOUSE_RADIUS;


                        /*
                         * Квадратичная сила:
                         * возле курсора
                         * точки разлетаются
                         * намного сильнее
                         */

                        const strength =
                            force *
                            force *
                            REPULSION;


                        particle.vx +=
                            (
                                dx /
                                distance
                            ) *
                            strength;


                        particle.vy +=
                            (
                                dy /
                                distance
                            ) *
                            strength;
                    }
                }


                /*
                 * Движение
                 */

                particle.vx *=
                    FRICTION;

                particle.vy *=
                    FRICTION;


                particle.x +=
                    particle.vx;

                particle.y +=
                    particle.vy;


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


                ctx.fillStyle =
                    active
                        ? ACTIVE_COLOR
                        : PARTICLE_COLOR;


                ctx.fill();

            }
        );


        /*
         * Центральная точка
         * прямо под курсором
         */

        if (mouse.active) {

            ctx.beginPath();

            ctx.arc(
                mouse.x,
                mouse.y,
                4.5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                CURSOR_COLOR;

            ctx.fill();
        }


        requestAnimationFrame(
            animate
        );
    }


    window.addEventListener(
        "resize",
        resize
    );


    resize();

    animate();

})();
