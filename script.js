/* =========================================================
   TOP ARC
========================================================= */

(() => {

    const canvas = document.getElementById("arcCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    const particles = [];

    const SPACING = 18;
    const PARTICLE_SIZE = 2.4;

    const PARTICLE_COLOR = "#333333";
    const LIME_COLOR = "#F36D07";

    const CURSOR_SIZE = 5;
    const COLOR_RADIUS = 38;

    let animationFrame;


    function resize() {

        const rect = canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createParticles();
    }


    function createParticles() {

        particles.length = 0;

        const rows = Math.ceil(height / SPACING);
        const cols = Math.ceil(width / SPACING);

        for (let y = 0; y <= rows; y++) {

            for (let x = 0; x <= cols; x++) {

                const px = x * SPACING;
                const py = y * SPACING;

                particles.push({
                    x: px,
                    y: py,
                    baseX: px,
                    baseY: py,
                    offsetX: 0,
                    offsetY: 0,
                    phase: Math.random() * Math.PI * 2
                });

            }
        }
    }


    canvas.addEventListener("pointermove", (event) => {

        const rect = canvas.getBoundingClientRect();

        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;

    });


    canvas.addEventListener("pointerleave", () => {

        mouseX = -1000;
        mouseY = -1000;

    });


    function draw() {

        ctx.clearRect(0, 0, width, height);

        for (const particle of particles) {

            const dx = particle.baseX - mouseX;
            const dy = particle.baseY - mouseY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            let color = PARTICLE_COLOR;

            if (distance < COLOR_RADIUS) {
                color = LIME_COLOR;
            }

            if (distance < 100) {

                const force =
                    Math.max(0, 1 - distance / 100);

                const angle =
                    Math.atan2(dy, dx);

                particle.offsetX +=
                    Math.cos(angle) * force * 0.8;

                particle.offsetY +=
                    Math.sin(angle) * force * 0.8;

            }

            particle.offsetX *= 0.9;
            particle.offsetY *= 0.9;

            const x =
                particle.baseX + particle.offsetX;

            const y =
                particle.baseY + particle.offsetY;

            ctx.beginPath();

            const size =
                distance < CURSOR_SIZE * 4
                    ? PARTICLE_SIZE * 1.2
                    : PARTICLE_SIZE;

            ctx.arc(
                x,
                y,
                size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = color;

            ctx.fill();
        }

        animationFrame =
            requestAnimationFrame(draw);
    }


    window.addEventListener("resize", resize);

    resize();
    draw();

})();


/* =========================================================
   BOTTOM PARTICLES
========================================================= */

(() => {

    const canvas =
        document.getElementById("particleCanvas");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    let width = 0;
    let height = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    const particles = [];

    const SPACING = 18;
    const PARTICLE_SIZE = 2.4;

    const PARTICLE_COLOR = "#333333";
    const LIME_COLOR = "#F36D07";

    const COLOR_RADIUS = 38;


    function resize() {

        const rect =
            canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        const dpr =
            Math.min(window.devicePixelRatio || 1, 2);

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


    function createParticles() {

        particles.length = 0;

        const cols =
            Math.ceil(width / SPACING);

        const rows =
            Math.ceil(height / SPACING);

        for (let y = 0; y <= rows; y++) {

            for (let x = 0; x <= cols; x++) {

                particles.push({
                    x: x * SPACING,
                    y: y * SPACING,
                    baseX: x * SPACING,
                    baseY: y * SPACING,
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

            mouseX =
                event.clientX - rect.left;

            mouseY =
                event.clientY - rect.top;

        }
    );


    canvas.addEventListener(
        "pointerleave",
        () => {

            mouseX = -1000;
            mouseY = -1000;

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

            const dx =
                particle.baseX - mouseX;

            const dy =
                particle.baseY - mouseY;

            const distance =
                Math.sqrt(dx * dx + dy * dy);

            if (distance < 90) {

                const force =
                    (90 - distance) / 90;

                const angle =
                    Math.atan2(dy, dx);

                particle.vx +=
                    Math.cos(angle) * force * 0.7;

                particle.vy +=
                    Math.sin(angle) * force * 0.7;

            }

            particle.vx *= 0.9;
            particle.vy *= 0.9;

            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.x +=
                (particle.baseX - particle.x) * 0.04;

            particle.y +=
                (particle.baseY - particle.y) * 0.04;


            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                PARTICLE_SIZE,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                distance < COLOR_RADIUS
                    ? LIME_COLOR
                    : PARTICLE_COLOR;

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
