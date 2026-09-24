/* =========================================================
   CUSTOM CURSOR DOT
========================================================= */

(() => {

    const dot = document.querySelector(".cursor-dot");
    if (!dot) return;

    // на тач-устройствах не запускаем
    if (window.matchMedia("(hover: none)").matches) return;

    // Принудительно скрываем системный курсор через JS
    document.documentElement.classList.add("cursor-hidden");

    // На всякий случай вешаем inline-стиль
    document.documentElement.style.setProperty("cursor", "none", "important");
    document.body.style.setProperty("cursor", "none", "important");

    // И на каждый элемент тоже, чтобы нигде не просвечивал
    const killCursor = () => {
        document.querySelectorAll("*").forEach((el) => {
            el.style.setProperty("cursor", "none", "important");
        });
    };
    killCursor();

    // Если DOM поменяется (например, откроются новые элементы) — повторим
    const observer = new MutationObserver(killCursor);
    observer.observe(document.body, { childList: true, subtree: true });


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
        }
    });

    // Точку НЕ скрываем при mouseleave — из-за этого мигало
    // document.addEventListener("mouseleave", () => {
    //     dot.classList.remove("visible");
    //     visible = false;
    // });

    function animate() {
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;

        dot.style.left = dotX + "px";
        dot.style.top  = dotY + "px";

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
        el.addEventListener("mouseenter", () => dot.classList.add("hover"));
        el.addEventListener("mouseleave", () => dot.classList.remove("hover"));
    });

})();
