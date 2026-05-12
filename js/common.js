document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  var html = document.querySelector('html'),
    menuToggle = document.querySelector(".hamburger"),
    menuList = document.querySelector(".main-nav"),
    toggleTheme = document.querySelector(".toggle-theme-js"),
    btnScrollToTop = document.querySelector(".top");


  /* =======================================================
  // Menu + Theme Switcher
  ======================================================= */
  if (menuToggle && menuList) {
    menuToggle.addEventListener("click", () => {
      menu();
    });
  }

  function menuOpen() {
    menuList.classList.add("is-open");
  }


  // Menu
  function menu() {
    menuToggle.classList.toggle("is-open");
    menuList.classList.toggle("is-visible");
  }

  if (menuToggle && menuList) {
    document.querySelectorAll(".main-nav .nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("is-open");
        menuList.classList.remove("is-visible");
      });
    });
  }

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      darkMode();
    });
  };


  // Theme Switcher
  function darkMode() {
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
      localStorage.setItem("theme", "light");
      document.documentElement.removeAttribute("dark");
    } else {
      html.classList.add('dark-mode');
      localStorage.setItem("theme", "dark");
      document.documentElement.setAttribute("dark", "");
    }
  }


  /* ================================================================
  // Stop Animations During Window Resizing and Switching Theme Modes
  ================================================================ */
  let disableTransition;

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      stopAnimation();
    });

    window.addEventListener("resize", () => {
      stopAnimation();
    });

    function stopAnimation() {
      document.body.classList.add("disable-animation");
      clearTimeout(disableTransition);
      disableTransition = setTimeout(() => {
        document.body.classList.remove("disable-animation");
      }, 100);
    }
  }


  /* =======================
  // Responsive Videos
  ======================= */
  reframe(".post iframe:not(.reframe-off), .page iframe:not(.reframe-off)");


  /* =======================
  // LazyLoad Images
  ======================= */
  var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
  })

  /* =======================
  // Data Streams
  ======================= */
  const streamSpeed = 42;
  const streamReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const streamRails = [
    {
      rail: document.querySelector(".projects__marquee"),
      track: document.querySelector(".projects__list")
    },
    {
      rail: document.querySelector(".logos__marquee"),
      track: document.querySelector(".logos__list")
    }
  ].filter((stream) => stream.rail && stream.track);

  function streamGap(track) {
    const style = window.getComputedStyle(track);
    return parseFloat(style.columnGap || style.gap) || 0;
  }

  function streamStep(track, item) {
    return item.getBoundingClientRect().width + streamGap(track);
  }

  function streamRender(stream) {
    stream.track.style.transform = "translate3d(" + (-stream.offset) + "px, 0, 0)";
  }

  function streamMove(stream, distance) {
    stream.offset += distance;

    while (stream.offset >= streamStep(stream.track, stream.track.firstElementChild)) {
      stream.offset -= streamStep(stream.track, stream.track.firstElementChild);
      stream.track.appendChild(stream.track.firstElementChild);
    }

    while (stream.offset < 0) {
      stream.track.insertBefore(stream.track.lastElementChild, stream.track.firstElementChild);
      stream.offset += streamStep(stream.track, stream.track.firstElementChild);
    }

    streamRender(stream);
  }

  function pauseStream(stream) {
    stream.pauseUntil = performance.now() + 900;
  }

  streamRails.forEach((stream) => {
    stream.offset = 0;
    stream.pauseUntil = 0;
    stream.dragX = 0;
    stream.didDrag = false;
    stream.isDragging = false;
    streamRender(stream);

    stream.rail.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      pauseStream(stream);
      streamMove(stream, event.deltaX);
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
      streamMove(stream, movement);
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
        streamMove(stream, streamStep(stream.track, stream.track.firstElementChild));
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pauseStream(stream);
        streamMove(stream, -streamStep(stream.track, stream.track.lastElementChild));
      }
    });
  });

  function animateStreams(time) {
    animateStreams.lastTime = animateStreams.lastTime || time;
    const delta = (time - animateStreams.lastTime) / 1000;
    animateStreams.lastTime = time;

    streamRails.forEach((stream) => {
      if (streamReducedMotion.matches || stream.isDragging || time < stream.pauseUntil) return;
      streamMove(stream, streamSpeed * delta);
    });

    if (streamRails.length) {
      requestAnimationFrame(animateStreams);
    }
  }

  if (streamRails.length) {
    requestAnimationFrame(animateStreams);
  }

  /* =======================
  // Publications Fade
  ======================= */
  const publicationsPanel = document.querySelector(".publication-groups");

  function updatePublicationsFade() {
    const atEnd = publicationsPanel.scrollTop + publicationsPanel.clientHeight >= publicationsPanel.scrollHeight - 1;
    publicationsPanel.classList.toggle("is-at-end", atEnd);
  }

  publicationsPanel.addEventListener("scroll", updatePublicationsFade, { passive: true });
  window.addEventListener("resize", updatePublicationsFade);
  updatePublicationsFade();

  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page img, .post img, .gallery__image img"),
  imageLink = document.querySelectorAll(".page a img, .post a img, .gallery__image a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense) {
    Lightense(".page img:not(.no-lightense), .post img:not(.no-lightense), .gallery__image img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  }


  // =====================
  // Load More Posts
  // =====================
  var load_posts_button = document.querySelector('.load-more-posts');

  load_posts_button&&load_posts_button.addEventListener("click",function(e){e.preventDefault();var o=document.querySelector(".pagination"),e=pagination_next_url.split("/page")[0]+"/page/"+pagination_next_page_number+"/";fetch(e).then(function(e){if(e.ok)return e.text()}).then(function(e){var n=document.createElement("div");n.innerHTML=e;for(var t=document.querySelector(".grid"),a=n.querySelectorAll(".grid__post"),i=0;i<a.length;i++)t.appendChild(a.item(i));new LazyLoad({elements_selector:".lazy"});pagination_next_page_number++,pagination_next_page_number>pagination_available_pages_number&&(o.style.display="none")})});


  /* =======================
  // Scroll Top Button
  ======================= */
  window.addEventListener("scroll", function () {
    window.scrollY > window.innerHeight ? btnScrollToTop.classList.add("is-active") : btnScrollToTop.classList.remove("is-active");
  });

  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });

});
