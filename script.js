const canvas = document.getElementById("arcCanvas");
const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false
});


// =========================================
// WEBGL
// =========================================

if (!gl) {

    console.error("WebGL is not supported");

} else {

    const vertexShaderSource = `

        attribute vec2 a_position;

        void main() {

            gl_Position =
                vec4(a_position, 0.0, 1.0);

        }

    `;


    const fragmentShaderSource = `

        precision highp float;

        uniform vec2 u_resolution;

        uniform float u_time;

        uniform vec2 u_mouse;

        uniform float u_mouseActive;


        void main() {

            vec2 pixel = gl_FragCoord.xy;


            // ---------------------------------
            // GRID
            // ---------------------------------

            float spacing = 14.0;

            vec2 grid =
                floor(pixel / spacing) *
                spacing +
                spacing * 0.5;


            float x = grid.x;

            float y =
                u_resolution.y -
                grid.y;


            float width =
                u_resolution.x;

            float height =
                u_resolution.y;


            // ---------------------------------
            // NORMALIZED X
            // ---------------------------------

            float normX =
                (x - width * 0.5) /
                (width * 0.75);


            // ---------------------------------
            // ARCH
            // ---------------------------------

            float centerY =
                height * 0.58;


            float curve =
                normX *
                normX *
                height *
                0.30;


            float wave =
                sin(
                    x * 0.012 +
                    u_time * 0.7
                ) * 7.0;


            float curveY =
                centerY +
                curve +
                wave;


            // ---------------------------------
            // MOUSE
            // ---------------------------------

            float dx =
                x - u_mouse.x;


            float influence =
                exp(
                    -(dx * dx) /
                    (2.0 * 120.0 * 120.0)
                );


            curveY =
                mix(
                    curveY,
                    u_mouse.y,
                    influence *
                    u_mouseActive *
                    0.25
                );


            // ---------------------------------
            // DISTANCE FROM ARC
            // ---------------------------------

            float distanceFromArc =
                abs(
                    y - curveY
                );


            float thickness =
                80.0 +
                (1.0 - abs(normX))
                * 60.0;


            float intensity =
                1.0 -
                smoothstep(
                    0.0,
                    thickness,
                    distanceFromArc
                );


            // ---------------------------------
            // FADE EDGES
            // ---------------------------------

            intensity *=
                max(
                    0.0,
                    1.0 -
                    pow(
                        abs(normX),
                        2.4
                    )
                );


            // ---------------------------------
            // DOT
            // ---------------------------------

            float dotSize = 3.0;

            vec2 distanceToCell =
                abs(
                    pixel - grid
                );


            float dot =
                1.0 -
                smoothstep(
                    dotSize - 1.0,
                    dotSize + 1.0,
                    max(
                        distanceToCell.x,
                        distanceToCell.y
                    )
                );


            float visibility =
                dot *
                intensity;


            // ---------------------------------
            // COLOR
            // ---------------------------------

            vec3 background =
                vec3(
                    0.0,
                    0.0,
                    0.0
                );


            vec3 baseColor =
                vec3(
                    0.35,
                    0.35,
                    0.35
                );


            vec3 accentColor =
                vec3(
                    1.0,
                    0.42,
                    0.02
                );


            vec3 color =
                mix(
                    baseColor,
                    accentColor,
                    pow(
                        intensity,
                        1.3
                    )
                );


            color =
                mix(
                    background,
                    color,
                    visibility
                );


            gl_FragColor =
                vec4(
                    color,
                    1.0
                );

        }

    `;


    // =========================================
    // SHADER
    // =========================================

    function createShader(type, source) {

        const shader =
            gl.createShader(type);

        gl.shaderSource(
            shader,
            source
        );

        gl.compileShader(
            shader
        );


        if (
            !gl.getShaderParameter(
                shader,
                gl.COMPILE_STATUS
            )
        ) {

            console.error(
                gl.getShaderInfoLog(shader)
            );

            gl.deleteShader(shader);

            return null;
        }


        return shader;
    }


    const vertexShader =
        createShader(
            gl.VERTEX_SHADER,
            vertexShaderSource
        );


    const fragmentShader =
        createShader(
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );


    if (
        !vertexShader ||
        !fragmentShader
    ) {

        throw new Error(
            "Shader compilation failed"
        );

    }


    const program =
        gl.createProgram();


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
            gl.getProgramInfoLog(program)
        );

    }


    gl.useProgram(program);


    // =========================================
    // FULL SCREEN TRIANGLE
    // =========================================

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
            "a_position"
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


    // =========================================
    // UNIFORMS
    // =========================================

    const resolution =
        gl.getUniformLocation(
            program,
            "u_resolution"
        );


    const time =
        gl.getUniformLocation(
            program,
            "u_time"
        );


    const mouse =
        gl.getUniformLocation(
            program,
            "u_mouse"
        );


    const mouseActive =
        gl.getUniformLocation(
            program,
            "u_mouseActive"
        );


    // =========================================
    // MOUSE
    // =========================================

    let mouseX = 0;
    let mouseY = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;

    let mouseActiveValue = 0;


    canvas.addEventListener(
        "mousemove",
        function(event) {

            const rect =
                canvas.getBoundingClientRect();


            targetMouseX =
                event.clientX -
                rect.left;


            targetMouseY =
                rect.height -
                (
                    event.clientY -
                    rect.top
                );


            mouseActiveValue = 1;

        }
    );


    canvas.addEventListener(
        "mouseleave",
        function() {

            mouseActiveValue = 0;

        }
    );


    // =========================================
    // RESIZE
    // =========================================

    function resizeCanvas() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        const width =
            canvas.clientWidth;


        const height =
            canvas.clientHeight;


        canvas.width =
            width * dpr;


        canvas.height =
            height * dpr;


        gl.viewport(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    resizeCanvas();


    // =========================================
    // ANIMATION
    // =========================================

    let startTime =
        performance.now();


    function animate() {

        const now =
            performance.now();


        const elapsed =
            (now - startTime) /
            1000;


        // плавное движение курсора

        mouseX +=
            (targetMouseX - mouseX)
            * 0.08;


        mouseY +=
            (targetMouseY - mouseY)
            * 0.08;


        gl.uniform2f(
            resolution,
            canvas.width,
            canvas.height
        );


        gl.uniform1f(
            time,
            elapsed
        );


        gl.uniform2f(
            mouse,
            mouseX *
                (
                    canvas.width /
                    canvas.clientWidth
                ),

            mouseY *
                (
                    canvas.height /
                    canvas.clientHeight
                )
        );


        gl.uniform1f(
            mouseActive,
            mouseActiveValue
        );


        gl.drawArrays(
            gl.TRIANGLES,
            0,
            3
        );


        requestAnimationFrame(
            animate
        );

    }


    animate();

}
