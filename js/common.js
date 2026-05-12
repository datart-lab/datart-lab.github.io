document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const streamSpeed = 42;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const streams = [
    createStream(".projects__marquee", ".projects__list"),
    createStream(".logos__marquee", ".logos__list")
  ].filter((stream) => stream.rail && stream.track);

  streams.forEach(bindStreamControls);
  if (streams.length) requestAnimationFrame(animateStreams);

  bindPublicationFade();
  bindExternalLinks();
  bindScrollTop();

  function createStream(railSelector, trackSelector) {
    return {
      rail: document.querySelector(railSelector),
      track: document.querySelector(trackSelector),
      offset: 0,
      pauseUntil: 0,
      dragX: 0,
      didDrag: false,
      isDragging: false
    };
  }

  function bindStreamControls(stream) {
    renderStream(stream);

    stream.rail.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

      event.preventDefault();
      pauseStream(stream);
      moveStream(stream, event.deltaX);
    }, { passive: false });

    stream.rail.addEventListener("pointerdown", (event) => {
      pauseStream(stream);
      stream.isDragging = true;
      stream.didDrag = false;
      stream.dragX = event.clientX;
      stream.rail.classList.add("is-dragging");
      stream.rail.setPointerCapture(event.pointerId);
    });

    stream.rail.addEventListener("pointermove", (event) => {
      if (!stream.isDragging) return;

      const movement = stream.dragX - event.clientX;
      pauseStream(stream);
      stream.didDrag = stream.didDrag || Math.abs(movement) > 3;
      moveStream(stream, movement);
      stream.dragX = event.clientX;
    });

    stream.rail.addEventListener("pointerup", (event) => {
      stream.isDragging = false;
      stream.rail.classList.remove("is-dragging");
      stream.rail.releasePointerCapture(event.pointerId);
    });

    stream.rail.addEventListener("pointercancel", () => {
      stream.isDragging = false;
      stream.rail.classList.remove("is-dragging");
    });

    stream.rail.addEventListener("click", (event) => {
      if (!stream.didDrag) return;

      event.preventDefault();
      event.stopPropagation();
      stream.didDrag = false;
    }, true);

    stream.rail.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        pauseStream(stream);
        moveStream(stream, streamStep(stream.track, stream.track.firstElementChild));
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pauseStream(stream);
        moveStream(stream, -streamStep(stream.track, stream.track.lastElementChild));
      }
    });
  }

  function animateStreams(time) {
    animateStreams.lastTime = animateStreams.lastTime || time;
    const delta = (time - animateStreams.lastTime) / 1000;
    animateStreams.lastTime = time;

    streams.forEach((stream) => {
      if (reducedMotion.matches || stream.isDragging || time < stream.pauseUntil) return;
      moveStream(stream, streamSpeed * delta);
    });

    if (streams.length) requestAnimationFrame(animateStreams);
  }

  function pauseStream(stream) {
    stream.pauseUntil = performance.now() + 900;
  }

  function moveStream(stream, distance) {
    stream.offset += distance;

    while (stream.offset >= streamStep(stream.track, stream.track.firstElementChild)) {
      stream.offset -= streamStep(stream.track, stream.track.firstElementChild);
      stream.track.appendChild(stream.track.firstElementChild);
    }

    while (stream.offset < 0) {
      stream.track.insertBefore(stream.track.lastElementChild, stream.track.firstElementChild);
      stream.offset += streamStep(stream.track, stream.track.firstElementChild);
    }

    renderStream(stream);
  }

  function renderStream(stream) {
    stream.track.style.transform = `translate3d(${-stream.offset}px, 0, 0)`;
  }

  function streamStep(track, item) {
    return item.getBoundingClientRect().width + streamGap(track);
  }

  function streamGap(track) {
    const style = window.getComputedStyle(track);
    return parseFloat(style.columnGap || style.gap) || 0;
  }

  function bindPublicationFade() {
    const publicationsPanel = document.querySelector(".publication-groups");
    if (!publicationsPanel) return;

    function updatePublicationFade() {
      const atEnd = publicationsPanel.scrollTop + publicationsPanel.clientHeight >= publicationsPanel.scrollHeight - 1;
      publicationsPanel.classList.toggle("is-at-end", atEnd);
    }

    publicationsPanel.addEventListener("scroll", updatePublicationFade, { passive: true });
    window.addEventListener("resize", updatePublicationFade);
    updatePublicationFade();
  }

  function bindExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      if (link.hostname === window.location.hostname) return;

      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function bindScrollTop() {
    const topButton = document.querySelector(".top");

    function updateTopButton() {
      topButton.classList.toggle("is-active", window.scrollY > window.innerHeight);
    }

    window.addEventListener("scroll", updateTopButton, { passive: true });
    topButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    });

    updateTopButton();
  }
});
