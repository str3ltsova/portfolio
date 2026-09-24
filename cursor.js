/* =========================================================
   CUSTOM CURSOR
========================================================= */

(() => {

    const dot =
        document.querySelector(".cursor-dot");

    if (!dot) return;


    /* =========================
       TOUCH DEVICES
    ========================== */

    if (
        window.matchMedia("(hover: none)").matches
    ) {
        return;
    }


    /* =========================
       FORCE HIDE SYSTEM CURSOR
    ========================== */

    const cursorStyle =
        document.createElement("style");

    cursorStyle.id =
        "custom-cursor-force-style";

    cursorStyle.textContent = `
        html,
        html *,
        body,
        body * {
            cursor: none !important;
        }
    `;

    document.head.appendChild(
        cursorStyle
    );


    /* =========================
       MOUSE POSITION
    ========================== */

    let visible = false;


    document.addEventListener(
        "mousemove",
        (event) => {

            dot.style.left =
                event.clientX + "px";

            dot.style.top =
                event.clientY + "px";


            if (!visible) {

                dot.classList.add(
                    "visible"
                );

                visible = true;
            }

        },
        true
    );


    /* =========================
       HOVER ELEMENTS
    ========================== */

    const hoverables =
        document.querySelectorAll(
            "a, button, input, textarea, select, " +
            ".project-card, .project, " +
            ".arc-links a"
        );


    hoverables.forEach(
        (element) => {

            element.addEventListener(
                "mouseenter",
                () => {

                    dot.classList.add(
                        "hover"
                    );

                }
            );


            element.addEventListener(
                "mouseleave",
                () => {

                    dot.classList.remove(
                        "hover"
                    );

                }
            );

        }
    );


    /* =========================
       KEEP SYSTEM CURSOR HIDDEN
    ========================== */

    document.addEventListener(
        "mouseover",
        () => {
            document.documentElement.style.cursor =
                "none";
        },
        true
    );


    document.addEventListener(
        "pointerover",
        () => {
            document.documentElement.style.cursor =
                "none";
        },
        true
    );


})();
