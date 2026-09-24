/* 
   cursor.js
=========================================================
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
       ЛОГИКА
    ========================== */

    let mouseX = 0;
    let mouseY = 0;

    let visible = false;


    document.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        // Кастомная точка всегда точно под реальным курсором
        dot.style.left = mouseX + "px";
        dot.style.top = mouseY + "px";

        if (!visible) {
            dot.classList.add("visible");
            visible = true;
        }

    });


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
