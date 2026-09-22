/* =========================================================
   CUSTOM CURSOR DOT
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
        "a, button, .project, .number-card, .hobby-list span"
    );

    hoverables.forEach((el) => {
        el.addEventListener("mouseenter", () => dot.classList.add("hover"));
        el.addEventListener("mouseleave", () => dot.classList.remove("hover"));
    });

})();
