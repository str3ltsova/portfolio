const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];

const mouse = {
    x: null,
    y: null,
    radius: 100
};


// ================================
// CANVAS SIZE
// ================================

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
}


// ================================
// CREATE PARTICLES
// ================================

function createParticles() {

    particles = [];

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const spacing = 18;

    for (let x = spacing; x < width; x += spacing) {

        for (let y = spacing; y < height; y += spacing) {

            particles.push({

                x: x,
                y: y,

                originalX: x,
                originalY: y,

                size: Math.random() * 1.5 + 1,

                vx: 0,
                vy: 0

            });

        }

    }
}


// ================================
// MOUSE
// ================================

canvas.addEventListener("mousemove", (event) => {

    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

});


canvas.addEventListener("mouseleave", () => {

    mouse.x = null;
    mouse.y = null;

});


// ================================
// PARTICLE PHYSICS
// ================================

function updateParticles() {

    particles.forEach(particle => {

        // --------------------------------
        // MOUSE REPULSION
        // --------------------------------

        if (mouse.x !== null) {

            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;

            const distance = Math.sqrt(
                dx * dx + dy * dy
            );

            if (distance < mouse.radius) {

                const angle = Math.atan2(dy, dx);

                const force =
                    (mouse.radius - distance)
                    / mouse.radius;

                const strength = force * 8;

                particle.vx += Math.cos(angle) * strength;
                particle.vy += Math.sin(angle) * strength;

            }

        }


        // --------------------------------
        // RETURN TO ORIGINAL POSITION
        // --------------------------------

        const homeX =
            particle.originalX - particle.x;

        const homeY =
            particle.originalY - particle.y;

        particle.vx += homeX * 0.015;
        particle.vy += homeY * 0.015;


        // --------------------------------
        // FRICTION
        // --------------------------------

        particle.vx *= 0.85;
        particle.vy *= 0.85;


        // --------------------------------
        // MOVE
        // --------------------------------

        particle.x += particle.vx;
        particle.y += particle.vy;

    });

}


// ================================
// DRAW
// ================================

function drawParticles() {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    particles.forEach(particle => {

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#bcbcbc";

        ctx.fill();

    });

}


// ================================
// ANIMATION LOOP
// ================================

function animate() {

    updateParticles();
    drawParticles();

    requestAnimationFrame(animate);

}


// ================================
// START
// ================================

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

animate();
