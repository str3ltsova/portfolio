/*=========================================================
   CUSTOM CURSOR DOT
========================================================= */

(() => {

    const dot = document.querySelector(".cursor-dot");
    if (!dot) return;

    // На тач-устройствах не запускаем
    if (window.matchMedia("(hover: none)").matches) return;


    /* =========================
       СКРЫВАЕМ СИСТЕМНЫЙ КУРСОР
    ========================== */

    document.documentElement.classList.add("cursor-hidden");


    /* =========================
       ЛОГИКА ТОЧКИ
    ========================== */

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let dotX = mouseX;
    let dotY = mouseY;

    let visible = false;


    document.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!visible) {

            dot.classList.add("visible");
            visible = true;

            // Сразу ставим точку под курсор,
            // чтобы при первом появлении она не догоняла его
            dotX = mouseX;
            dotY = mouseY;
        }
    });


    /* =========================
       ДВИЖЕНИЕ ТОЧКИ
    ========================== */

    function animate() {

        // Небольшая плавность, но без сильного лага
        dotX += (mouseX - dotX) * 0.55;
        dotY += (mouseY - dotY) * 0.55;

        dot.style.left = dotX + "px";
        dot.style.top = dotY + "px";

        requestAnimationFrame(animate);
    }

    animate();


    /* =========================
       ХОВЕР
    ========================== */

    const hoverables = document.querySelectorAll(
        "a, button, .project-card, .project, .arc-links a"
    );


    hoverables.forEach((el) => {

        el.addEventListener("mouseenter", () => {
            dot.classList.add("hover");
        });

        el.addEventListener("mouseleave", () => {
            dot.classList.remove("hover");
        });

    });

})();
