/* 
   cursor.js
=========================================================
   CUSTOM CURSOR DOT
========================================================= */

(() => {

    const dot = document.querySelector(".cursor-dot");

    if (!dot) return;

    if (window.matchMedia("(hover: none)").matches) {
        return;
    }


    /* =========================
       HIDE SYSTEM CURSOR
    ========================== */

    const hideCursor = () => {
        document.documentElement.style.cursor = "none";
        document.body.style.cursor = "none";
    };

    hideCursor();


    /* =========================
       CUSTOM DOT
    ========================== */

    let visible = false;


    document.addEventListener("mousemove", (event) => {

        // На каждом движении снова запрещаем системный курсор
        hideCursor();

        dot.style.left = event.clientX + "px";
        dot.style.top = event.clientY + "px";

        if (!visible) {
            dot.classList.add("visible");
            visible = true;
        }

    }, true);


    /* =========================
       HOVER
    ========================== */

    const hoverables = document.querySelectorAll(
        "a, button, .project-card, .project, .arc-links a"
    );


    hoverables.forEach((element) => {

        element.addEventListener("mouseenter", () => {
            dot.classList.add("hover");
            hideCursor();
        });

        element.addEventListener("mouseleave", () => {
            dot.classList.remove("hover");
            hideCursor();
        });

    });


    /* =========================
       KEEP CURSOR HIDDEN
    ========================== */

    document.addEventListener("mouseover", hideCursor, true);
    document.addEventListener("mouseenter", hideCursor, true);
    document.addEventListener("pointermove", hideCursor, true);
    document.addEventListener("pointerover", hideCursor, true);


})();
