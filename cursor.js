/* =========================
   CUSTOM CURSOR
========================= */

const cursorDot = document.querySelector(".cursor-dot");

if (cursorDot) {

    document.addEventListener("mousemove", (event) => {

        cursorDot.style.left = `${event.clientX}px`;
        cursorDot.style.top = `${event.clientY}px`;

    });

}
