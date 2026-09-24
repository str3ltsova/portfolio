/* =========================================================
   PREDICTIVE ARC — TOP
========================================================= */

(() => {

    const canvas =
        document.getElementById("arcCanvas");

    if (!canvas) return;


    const gl =
        canvas.getContext("webgl", {
            alpha: false,
            antialias: false,
            depth: false
        });


    if (!gl) {

        console.error(
            "Predictive Arc: WebGL unavailable"
        );

        return;
    }


    /* =========================
       SHADERS
    ========================== */

    const vertexShaderSource = `

        attribute vec2 a_pos;

        void main() {

            gl_Position =
                vec4(
                    a_pos,
                    0.0,
                    1.0
                );
        }

    `;


    const fragmentShaderSource = `

        precision highp float;

        uniform vec2 uRes;

        uniform float uTime;
        uniform float uDpr;

        uniform float uCell;
        uniform float uDot;

        uniform float uPeak;
        uniform float uHeight;
        uniform float uThick;
        uniform float uFall;

        uniform vec3 uBg;
        uniform vec3 uBase;
        uniform vec3 uAccent;
        uniform vec3 uHigh;

        uniform vec2 uMouse;

        uniform float uMouseRadius;
        uniform float uMouseStrength;


        void main() {

            float cell =
                max(
                    uCell,
                    2.0
                );


            vec2 cellIndex =
                floor(
                    gl_FragCoord.xy /
                    cell
                );


            vec2 cellCenter =
                (
                    cellIndex +
                    0.5
                ) * cell;


            /*
             * CSS coordinates
             */

            float x =
                cellCenter.x /
                uDpr;


            float y =
                (
                    uRes.y -
                    cellCenter.y
                ) /
                uDpr;


            float width =
                uRes.x /
                uDpr;


            float height =
                uRes.y /
                uDpr;


            /*
             * Arc shape
             */

            float normX =
                (
                    x -
                    width * 0.5
                ) /
                (
                    width * 0.75
                );


            float curveY =
                height * uPeak +
                normX *
                normX *
                (
                    height *
                    uHeight
                );


            /*
             * Mouse interaction
             */

            float mouseDistance =
                x -
                uMouse.x;


            float influence =
                uMouseStrength *
                exp(
                    -(
                        mouseDistance *
                        mouseDistance
                    ) /
                    (
                        2.0 *
                        uMouseRadius *
                        uMouseRadius +
                        1.0
                    )
                );


            curveY =
                mix(
                    curveY,
                    uMouse.y,
                    influence
                );


            /*
             * Distance from arc
             */

            float distanceToCurve =
                abs(
                    y -
                    curveY
                );


            float thickness =
                (
                    140.0 +
                    (
                        1.0 -
                        abs(normX)
                    ) *
                    80.0
                ) *
                uThick;


            vec3 color =
                uBg;


            if (
                distanceToCurve <
                thickness
            ) {

                float intensity =
                    1.0 -
                    distanceToCurve /
                    thickness;


                /*
                 * Motion
                 */

                float waveX =
                    sin(
                        x *
                        0.015 +
                        uTime
                    );


                float waveY =
                    cos(
                        y *
                        0.02 +
                        uTime
                    );


                intensity =
                    intensity *
                    0.7 +
                    waveX *
                    waveY *
                    0.3 *
                    intensity;


                /*
                 * Fade edges
                 */

                intensity *=
                    max(
                        0.0,
                        1.0 -
                        pow(
                            abs(normX),
                            uFall
                        )
                    );


                if (
                    intensity >
                    0.02
                ) {

                    /*
                     * Dot size
                     */

                    float dotSide =
                        uDot *
                        intensity *
                        uDpr;


                    vec2 difference =
                        abs(
                            gl_FragCoord.xy -
                            cellCenter
                        );


                    float coverage =
                        1.0 -
                        smoothstep(
                            dotSide *
                            0.5 -
                            1.0,

                            dotSide *
                            0.5 +
                            1.0,

                            max(
                                difference.x,
                                difference.y
                            )
                        );


                    /*
                     * Orange gradient
                     */

                    vec3 ink =
                        mix(
                            uBase,
                            uAccent,

                            clamp(
                                pow(
                                    intensity,
                                    1.1
                                ),

                                0.0,
                                1.0
                            )
                        );


                    /*
                     * Highlights
                     */

                    ink =
                        mix(
                            ink,
                            uHigh,

                            smoothstep(
                                0.72,
                                1.0,
                                intensity
                            )
                        );


                    color =
                        mix(
                            uBg,
                            ink,

                            coverage *
                            clamp(
                                intensity *
                                1.6,

                                0.0,
                                1.0
                            )
                        );
                }
            }


            gl_FragColor =
                vec4(
                    color,
                    1.0
                );

        }

    `;


    /* =========================
       SHADER COMPILER
    ========================== */

    function compileShader(
        type,
        source
    ) {

        const shader =
            gl.createShader(type);


        if (!shader) {
            return null;
        }


        gl.shaderSource(
            shader,
            source
        );


        gl.compileShader(shader);


        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {

            console.error(
                "Predictive Arc shader:",
                gl.getShaderInfoLog(
                    shader
                )
            );


            gl.deleteShader(shader);

            return null;
        }


        return shader;
    }


    const vertexShader =
        compileShader(
            gl.VERTEX_SHADER,
            vertexShaderSource
        );


    const fragmentShader =
        compileShader(
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );


    if (
        !vertexShader ||
        !fragmentShader
    ) {
        return;
    }


    /* =========================
       PROGRAM
    ========================== */

    const program =
        gl.createProgram();


    if (!program) return;


    gl.attachShader(
        program,
        vertexShader
    );


    gl.attachShader(
        program,
        fragmentShader
    );


    gl.linkProgram(
        program
    );


    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        console.error(
            "Predictive Arc:",
            gl.getProgramInfoLog(
                program
            )
        );

        return;
    }


    gl.useProgram(
        program
    );


    /* =========================
       FULL SCREEN TRIANGLE
    ========================== */

    const buffer =
        gl.createBuffer();


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer
    );


    gl.bufferData(

        gl.ARRAY_BUFFER,

        new Float32Array([

            -1, -1,
             3, -1,
            -1,  3

        ]),

        gl.STATIC_DRAW
    );


    const position =
        gl.getAttribLocation(
            program,
            "a_pos"
        );


    gl.enableVertexAttribArray(
        position
    );


    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );


    /* =========================
       UNIFORMS
    ========================== */

    const uniforms = {};


    function uniform(name) {

        if (!(name in uniforms)) {

            uniforms[name] =
                gl.getUniformLocation(
                    program,
                    name
                );
        }


        return uniforms[name];
    }


    /* =========================
       SETTINGS
    ========================== */

    const settings = {

        background: "#000000",

        base: "#F36D07",

        accent: "#FF9A52",

        highlight: "#FFFFFF",

        density: 78,

        dotSize: 1.02,

        speed: 2,

        peak: 0.01,

        archHeight: 0.50,

        thickness: 1.11,

        falloff: 2.06,

        pointerRadius: 83,

        pointerStrength: 0.19
    };


    /* =========================
       COLOR
    ========================== */

    function parseColor(
        value,
        fallback
    ) {

        if (!value) {
            return fallback;
        }


        let hex =
            value
                .replace("#", "")
                .trim();


        if (hex.length === 3) {

            hex =
                hex[0] + hex[0] +
                hex[1] + hex[1] +
                hex[2] + hex[2];
        }


        if (hex.length >= 6) {

            const r =
                parseInt(
                    hex.slice(0, 2),
                    16
                ) / 255;


            const g =
                parseInt(
                    hex.slice(2, 4),
                    16
                ) / 255;


            const b =
                parseInt(
                    hex.slice(4, 6),
                    16
                ) / 255;


            return [
                r,
                g,
                b
            ];
        }


        return fallback;
    }


    const bgColor =
        parseColor(
            settings.background,
            [0, 0, 0]
        );


    const baseColor =
        parseColor(
            settings.base,
            [1, 0.25, 0]
        );


    const accentColor =
        parseColor(
            settings.accent,
            [1, 0.5, 0.2]
        );


    const highlightColor =
        parseColor(
            settings.highlight,
            [1, 1, 1]
        );


    /* =========================
       POINTER
    ========================== */

    const pointer = {

        x: 0,

        y: 0,

        targetX: 0,

        targetY: 0,

        active: 0,

        targetActive: 0
    };


    canvas.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                canvas.getBoundingClientRect();


            pointer.targetX =
                event.clientX -
                rect.left;


            pointer.targetY =
                rect.height -
                (
                    event.clientY -
                    rect.top
                );


            pointer.targetActive = 1;
        }
    );


    canvas.addEventListener(
        "pointerleave",
        () => {

            pointer.targetActive = 0;
        }
    );


    /* =========================
       RENDER
    ========================== */

    let lastTime =
        performance.now();


    let clock = 0;


    function render(now) {

        const delta =
            Math.min(
                0.05,
                (
                    now -
                    lastTime
                ) / 1000
            );


        lastTime = now;


        clock =
            (
                clock +
                delta *
                0.9 *
                settings.speed
            ) %
            6283;


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        const rect =
            canvas.getBoundingClientRect();


        const cssWidth =
            rect.width;


        const cssHeight =
            rect.height;


        const bufferWidth =
            Math.max(
                1,
                Math.round(
                    cssWidth *
                    dpr
                )
            );


        const bufferHeight =
            Math.max(
                1,
                Math.round(
                    cssHeight *
                    dpr
                )
            );


        if (
            canvas.width !==
            bufferWidth ||

            canvas.height !==
            bufferHeight
        ) {

            canvas.width =
                bufferWidth;

            canvas.height =
                bufferHeight;
        }


        gl.viewport(
            0,
            0,
            bufferWidth,
            bufferHeight
        );


        /*
         * Dot density
         */

        const pitch =
            Math.min(
                bufferWidth,
                bufferHeight
            ) /
            settings.density;


        /*
         * Smooth pointer
         */

        const positionLerp =
            Math.min(
                1,
                delta * 12
            );


        const activeLerp =
            Math.min(
                1,
                delta * 6
            );


        pointer.x +=
            (
                pointer.targetX -
                pointer.x
            ) *
            positionLerp;


        pointer.y +=
            (
                pointer.targetY -
                pointer.y
            ) *
            positionLerp;


        pointer.active +=
            (
                pointer.targetActive -
                pointer.active
            ) *
            activeLerp;


        /* =========================
           SEND DATA
        ========================== */

        gl.uniform2f(
            uniform("uRes"),
            bufferWidth,
            bufferHeight
        );


        gl.uniform1f(
            uniform("uTime"),
            clock
        );


        gl.uniform1f(
            uniform("uDpr"),
            dpr
        );


        gl.uniform1f(
            uniform("uCell"),
            Math.max(
                2,
                pitch * dpr
            )
        );


        gl.uniform1f(
            uniform("uDot"),
            pitch *
            1.2 *
            settings.dotSize
        );


        gl.uniform1f(
            uniform("uPeak"),
            settings.peak
        );


        gl.uniform1f(
            uniform("uHeight"),
            settings.archHeight
        );


        gl.uniform1f(
            uniform("uThick"),
            settings.thickness
        );


        gl.uniform1f(
            uniform("uFall"),
            settings.falloff
        );


        gl.uniform2f(
            uniform("uMouse"),
            pointer.x,
            pointer.y
        );


        gl.uniform1f(
            uniform("uMouseRadius"),
            settings.pointerRadius
        );


        gl.uniform1f(
            uniform("uMouseStrength"),
            settings.pointerStrength *
            pointer.active
        );


        gl.uniform3f(
            uniform("uBg"),
            bgColor[0],
            bgColor[1],
            bgColor[2]
        );


        gl.uniform3f(
            uniform("uBase"),
            baseColor[0],
            baseColor[1],
            baseColor[2]
        );


        gl.uniform3f(
            uniform("uAccent"),
            accentColor[0],
            accentColor[1],
            accentColor[2]
        );


        gl.uniform3f(
            uniform("uHigh"),
            highlightColor[0],
            highlightColor[1],
            highlightColor[2]
        );


        /* =========================
           DRAW
        ========================== */

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            3
        );


        requestAnimationFrame(
            render
        );
    }


    requestAnimationFrame(
        render
    );


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


    /* =========================
       SETTINGS
    ========================== */

    const PARTICLE_SIZE = 2.4;

    const PARTICLE_COLOR =
        "#363636";

    const ACTIVE_COLOR =
        "#F36D07";

    const CURSOR_COLOR =
        "#F36D07";

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
       MOUSE
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
                 * Return
                 */

                particle.vx +=
                    (
                        particle.originalX -
                        particle.x
                    ) *
                    SPRING;


                particle.vy +=
                    (
                        particle.originalY -
                        particle.y
                    ) *
                    SPRING;


                let active = false;


                /*
                 * Repulsion
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
                 * Movement
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
                 * Draw
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
