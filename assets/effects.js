(function () {
  function isDesktopPointer() {
    return window.matchMedia("(pointer: fine)").matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function createBackgroundScene() {
    if (document.querySelector(".bg-3d-scene")) {
      return;
    }

    if (!document.querySelector(".bg-stars")) {
      const starLayer = document.createElement("div");
      starLayer.className = "bg-stars";
      starLayer.setAttribute("aria-hidden", "true");

      const starCount = 34;
      for (let index = 0; index < starCount; index += 1) {
        const star = document.createElement("span");
        star.className = "bg-star";

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = 1 + Math.random() * 2.2;
        const delay = (Math.random() * -7).toFixed(2);
        const duration = (2.4 + Math.random() * 4.4).toFixed(2);

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty("--star-size", `${size}px`);
        star.style.setProperty("--star-delay", `${delay}s`);
        star.style.setProperty("--star-duration", `${duration}s`);

        starLayer.appendChild(star);
      }

      document.body.prepend(starLayer);
    }

    const scene = document.createElement("div");
    scene.className = "bg-3d-scene";
    scene.setAttribute("aria-hidden", "true");

    const shapes = [
      {
        type: "orb",
        size: 300,
        top: "7%",
        left: "6%",
        delay: "0s",
        duration: "17s",
        color: "#cfe9ff"
      },
      {
        type: "prism",
        size: 170,
        top: "65%",
        left: "12%",
        delay: "-4s",
        duration: "20s",
        color: "#e8fff3"
      },
      {
        type: "ring",
        size: 240,
        top: "16%",
        right: "9%",
        delay: "-6s",
        duration: "19s",
        color: "#ffe7d1"
      },
      {
        type: "diamond",
        size: 160,
        top: "72%",
        right: "19%",
        delay: "-9s",
        duration: "22s",
        color: "#d7eeff"
      },
      {
        type: "orb",
        size: 190,
        top: "38%",
        right: "28%",
        delay: "-2s",
        duration: "15s",
        color: "#e4dcff"
      },
      {
        type: "prism",
        size: 145,
        top: "22%",
        left: "42%",
        delay: "-11s",
        duration: "21s",
        color: "#f8f0d8"
      }
    ];

    shapes.forEach((shapeData) => {
      const shape = document.createElement("span");
      shape.className = `bg-shape bg-${shapeData.type}`;
      shape.style.setProperty("--shape-size", `${shapeData.size}px`);
      shape.style.setProperty("--shape-delay", shapeData.delay);
      shape.style.setProperty("--shape-duration", shapeData.duration);
      shape.style.setProperty("--shape-color", shapeData.color);

      if (shapeData.left) {
        shape.style.left = shapeData.left;
      }
      if (shapeData.right) {
        shape.style.right = shapeData.right;
      }
      if (shapeData.top) {
        shape.style.top = shapeData.top;
      }

      scene.appendChild(shape);
    });

    document.body.prepend(scene);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    if (!prefersReducedMotion()) {
      function animateScene() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        scene.style.transform = `rotateX(${currentY * -2.1}deg) rotateY(${currentX * 2.4}deg)`;
        requestAnimationFrame(animateScene);
      }

      requestAnimationFrame(animateScene);
    }
  }

  function createCustomCursor() {
    if (!isDesktopPointer() || document.querySelector(".cursor-dot")) {
      return;
    }

    document.body.classList.add("cursor-ready");

    const dot = document.createElement("div");
    dot.className = "cursor-dot";

    const ring = document.createElement("div");
    ring.className = "cursor-ring";

    document.body.append(dot, ring);

    const state = {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      ringX: window.innerWidth / 2,
      ringY: window.innerHeight / 2,
      isHoveringInteractive: false
    };

    let isVisible = false;

    function animate() {
      state.ringX += (state.mouseX - state.ringX) * 0.28;
      state.ringY += (state.mouseY - state.ringY) * 0.28;

      dot.style.transform = `translate3d(${state.mouseX}px, ${state.mouseY}px, 0)`;
      ring.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0)`;

      if (state.isHoveringInteractive) {
        ring.classList.add("is-hover");
      } else {
        ring.classList.remove("is-hover");
      }

      requestAnimationFrame(animate);
    }

    document.addEventListener(
      "pointermove",
      (event) => {
        state.mouseX = event.clientX;
        state.mouseY = event.clientY;
        state.isHoveringInteractive = Boolean(
          event.target.closest("a, button, input, textarea, select, [role='button']")
        );

        if (!isVisible) {
          dot.classList.add("is-visible");
          ring.classList.add("is-visible");
          isVisible = true;
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      dot.classList.remove("is-visible");
      ring.classList.remove("is-visible");
      isVisible = false;
    });

    requestAnimationFrame(animate);
  }

  document.addEventListener("DOMContentLoaded", () => {
    createBackgroundScene();
    createCustomCursor();
  });
})();
