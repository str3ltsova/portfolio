/* =========================================================
   КУРСОР (оранжево-красная точка)
========================================================= */

(() => {

    const dot = document.querySelector(".cursor-dot");
    if (!dot) return;

    if (window.matchMedia("(hover: none)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.classList.add("visible");
    });

    document.addEventListener("mouseleave", () => {
        dot.classList.remove("visible");
    });

    function animate() {
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;

        dot.style.left = dotX + "px";
        dot.style.top  = dotY + "px";

        requestAnimationFrame(animate);
    }

    animate();

    const hoverables = document.querySelectorAll(
        "a, button, .project-card, .contact-links a, .hero-links a"
    );

    hoverables.forEach((el) => {
        el.addEventListener("mouseenter", () => dot.classList.add("hover"));
        el.addEventListener("mouseleave", () => dot.classList.remove("hover"));
    });

})();


/* =========================================================
   ПРЕДИКТИВНАЯ ДУГА (WebGL)
========================================================= */

(() => {

    const canvas = document.getElementById("arcCanvas");
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false
    });

    if (!gl) {
        console.error("Predictive Arc: WebGL недоступен");
        return;
    }

    const vertexShaderSource = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif

        uniform vec2 uRes;
        uniform float uTime, uDpr, uCell, uDot;
        uniform float uPeak, uHeight, uThick, uFall;
        uniform vec3 uBg, uBase, uAccent, uHigh;
        uniform vec2 uMouse;
        uniform float uMouseRadius, uMouseStrength;

        void main() {
            float cs = max(uCell, 2.0);
            vec2 ci = floor(gl_FragCoord.xy / cs);
            vec2 cc = (ci + 0.5) * cs;

            float x = cc.x / uDpr;
            float y = (uRes.y - cc.y) / uDpr;
            float w = uRes.x / uDpr;
            float h = uRes.y / uDpr;

            float normX = (x - w * 0.5) / (w * 0.75);
            float curveY = h * uPeak + normX * normX * (h * uHeight);

            float mdx = x - uMouse.x;
            float influence = uMouseStrength * exp(-(mdx * mdx) / (2.0 * uMouseRadius * uMouseRadius + 1.0));
            curveY = mix(curveY, uMouse.y, influence);

            float dist = abs(y - curveY);
            float th = (140.0 + (1.0 - abs(normX)) * 80.0) * uThick;

            vec3 col = uBg;
            if (dist < th) {
                float i = 1.0 - dist / th;
                float waveX = sin(x * 0.015 + uTime);
                float waveY = cos(y * 0.02 + uTime);
                i = i * 0.7 + waveX * waveY * 0.3 * i;
                i *= max(0.0, 1.0 - pow(abs(normX), uFall));

                if (i > 0.02) {
                    float side = uDot * i * uDpr;
                    vec2 d = abs(gl_FragCoord.xy - cc);
                    float cov = 1.0 - smoothstep(side * 0.5 - 1.0, side * 0.5 + 1.0, max(d.x, d.y));

                    vec3 ink = mix(uBase, uAccent, clamp(pow(i, 1.1), 0.0, 1.0));
                    ink = mix(ink, uHigh, smoothstep(0.72, 1.0, i));
                    col = mix(uBg, ink, cov * clamp(i * 1.6, 0.0, 1.0));
                }
            }
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function compileShader(type, source) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Ошибка шейдера:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Ошибка линковки:", gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         3, -1,
        -1,  3
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {};
    function uniform(name) {
        if (!(name in uniforms)) {
            uniforms[name] = gl.getUniformLocation(program, name);
        }
        return uniforms[name];
    }

    function parseColor(value, fallback) {
        if (!value) return fallback;
        let hex = String(value).replace("#", "").trim();
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length >= 6) {
            const r = parseInt(hex.slice(0, 2), 16) / 255;
            const g = parseInt(hex.slice(2, 4), 16) / 255;
            const b = parseInt(hex.slice(4, 6), 16) / 255;
            return [r, g, b];
        }
        return fallback;
    }

    const settings = {
        background: "#000000",
        baseColor: "#DC0000",
        accentColor: "#DC0000",
        highlight: "#F39A29",
        density: 133,
        dotSize: 0.77,
        speed: 1.06,
        arch: {
            peak: 0,
            falloff: 2.23,
            thickness: 1.71,
            archHeight: 0.78
        },
        pointer: {
            enabled: true,
            radius: 155,
            strength: 0.24
        }
    };

    const bgColor = parseColor(settings.background, [0, 0, 0]);
    const baseColor = parseColor(settings.baseColor, [0.86, 0, 0]);
    const accentColor = parseColor(settings.accentColor, [0.86, 0, 0]);
    const highlightColor = parseColor(settings.highlight, [0.95, 0.6, 0.16]);

    const pointer = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        active: 0,
        targetActive: 0
    };

    canvas.addEventListener("pointermove", (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.targetX = event.clientX - rect.left;
        pointer.targetY = rect.height - (event.clientY - rect.top);
        pointer.targetActive = 1;
    });

    canvas.addEventListener("pointerleave", () => {
        pointer.targetActive = 0;
    });

    let lastTime = performance.now();
    let clock = 0;

    function render(now) {
        const delta = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        clock = (clock + delta * 0.9 * settings.speed) % 6283;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const bufferWidth = Math.max(1, Math.round(rect.width * dpr));
        const bufferHeight = Math.max(1, Math.round(rect.height * dpr));

        if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
            canvas.width = bufferWidth;
            canvas.height = bufferHeight;
        }

        gl.viewport(0, 0, bufferWidth, bufferHeight);

        const pitch = Math.min(bufferWidth, bufferHeight) / settings.density;

        const positionLerp = Math.min(1, delta * 12);
        const activeLerp = Math.min(1, delta * 6);

        pointer.x += (pointer.targetX - pointer.x) * positionLerp;
        pointer.y += (pointer.targetY - pointer.y) * positionLerp;
        pointer.active += (pointer.targetActive - pointer.active) * activeLerp;

        gl.uniform2f(uniform("uRes"), bufferWidth, bufferHeight);
        gl.uniform1f(uniform("uTime"), clock);
        gl.uniform1f(uniform("uDpr"), dpr);
        gl.uniform1f(uniform("uCell"), Math.max(2, pitch * dpr));
        gl.uniform1f(uniform("uDot"), pitch * 1.2 * settings.dotSize);
        gl.uniform1f(uniform("uPeak"), settings.arch.peak);
        gl.uniform1f(uniform("uHeight"), settings.arch.archHeight);
        gl.uniform1f(uniform("uThick"), settings.arch.thickness);
        gl.uniform1f(uniform("uFall"), settings.arch.falloff);
        gl.uniform2f(uniform("uMouse"), pointer.x, pointer.y);
        gl.uniform1f(uniform("uMouseRadius"), settings.pointer.radius);
        gl.uniform1f(uniform("uMouseStrength"), settings.pointer.enabled ? settings.pointer.strength * pointer.active : 0);

        gl.uniform3f(uniform("uBg"), bgColor[0], bgColor[1], bgColor[2]);
        gl.uniform3f(uniform("uBase"), baseColor[0], baseColor[1], baseColor[2]);
        gl.uniform3f(uniform("uAccent"), accentColor[0], accentColor[1], accentColor[2]);
        gl.uniform3f(uniform("uHigh"), highlightColor[0], highlightColor[1], highlightColor[2]);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

})();


/* =========================================================
   ТОЧКИ ВНИЗУ
========================================================= */

(() => {

    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const PARTICLE_SIZE = 2.4;
    const PARTICLE_COLOR = "#363636";
    const ACTIVE_COLOR = "#DC0000";
    const SPACING = 17;
    const MOUSE_RADIUS = 55;
    const REPULSION = 6.5;
    const SPRING = 0.075;
    const FRICTION = 0.82;

    let width = 0;
    let height = 0;
    let particles = [];

    const mouse = {
        x: -1000,
        y: -1000,
        active: false
    };

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
        particles = [];
        for (let y = SPACING / 2; y < height; y += SPACING) {
            for (let x = SPACING / 2; x < width; x += SPACING) {
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

    canvas.addEventListener("pointermove", (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
        mouse.active = true;
    });

    canvas.addEventListener("pointerleave", () => {
        mouse.active = false;
        mouse.x = -1000;
        mouse.y = -1000;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
            particle.vx += (particle.originalX - particle.x) * SPRING;
            particle.vy += (particle.originalY - particle.y) * SPRING;

            let active = false;

            if (mouse.active) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MOUSE_RADIUS && distance > 0) {
                    active = true;

                    const force = 1 - distance / MOUSE_RADIUS;
                    const strength = force * force * REPULSION;

                    particle.vx += (dx / distance) * strength;
                    particle.vy += (dy / distance) * strength;
                }
            }

            particle.vx *= FRICTION;
            particle.vy *= FRICTION;

            particle.x += particle.vx;
            particle.y += particle.vy;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, PARTICLE_SIZE, 0, Math.PI * 2);
            ctx.fillStyle = active ? ACTIVE_COLOR : PARTICLE_COLOR;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);

    resize();
    animate();

})();


/* =========================================================
   ИСЧЕЗАЮЩИЙ ХЕДЕР
========================================================= */

(() => {

    const header = document.getElementById("siteHeader");
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add("hidden");
        } else {
            header.classList.remove("hidden");
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

})();
