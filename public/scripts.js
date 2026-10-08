/* ============================================================
   FAMILIA DENTAL — SCRIPTS PRINCIPALES
   Animaciones GSAP, interacciones, i18n, y lógica global
   ============================================================ */

(function () {
  "use strict";

  /* ── STATE ──────────────────────────────────────────────── */
  let currentLang = "es";
  let testimonialIndex = 0;
  let testimonialInterval = null;

  /* ── DOM READY ──────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initCustomCursor();
    initNavbar();
    initMobileMenu();
    initLanguageToggle();
    initHeroAnimations();
    initHeroSlider();
    initScrollAnimations();
    initCounters();
    initBeforeAfterSliders();
    initTestimonialsCarousel();
    initFAQ();
    initContactForm();
    initScrollToTop();
    applyTranslations(currentLang);
  });

  /* ── PRELOADER ──────────────────────────────────────────── */
  function initPreloader() {
    const preloader = document.querySelector(".preloader");
    const fill = document.querySelector(".preloader__fill");
    if (!preloader) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add("hidden");
          document.body.style.overflow = "";
        }, 400);
      }
      if (fill) fill.style.width = progress + "%";
    }, 120);

    document.body.style.overflow = "hidden";
  }

  /* ── CUSTOM CURSOR ──────────────────────────────────────── */
  function initCustomCursor() {
    const cursor = document.querySelector(".custom-cursor");
    if (!cursor || window.innerWidth <= 768) return;

    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;
    let isMoving = false;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateCursor);
      }
    }, { passive: true });

    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(mouseX - cursorX) > 0.1 || Math.abs(mouseY - cursorY) > 0.1) {
        requestAnimationFrame(updateCursor);
      } else {
        isMoving = false;
      }
    }

    const hoverElements = document.querySelectorAll(
      "a, button, .service-card, .team-card, .blog-card, .faq-item__question, .ba-slider"
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });
  }

  /* ── NAVBAR ─────────────────────────────────────────────── */
  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 120 && !navbar.classList.contains("scrolled")) {
        navbar.classList.add("scrolled");
      } else if (scrollY < 40 && navbar.classList.contains("scrolled")) {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          const offset = navbar.offsetHeight + 20;
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: "smooth" });

          // Close mobile menu if open
          const mobileMenu = document.querySelector(".mobile-menu");
          const hamburger = document.querySelector(".navbar__hamburger");
          if (mobileMenu && mobileMenu.classList.contains("open")) {
            mobileMenu.classList.remove("open");
            hamburger.classList.remove("open");
            document.body.style.overflow = "";
          }
        }
      });
    });
  }

  /* ── MOBILE MENU ────────────────────────────────────────── */
  function initMobileMenu() {
    const hamburger = document.querySelector(".navbar__hamburger");
    const mobileMenu = document.querySelector(".mobile-menu");
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  /* ── LANGUAGE TOGGLE ────────────────────────────────────── */
  function initLanguageToggle() {
    const langBtns = document.querySelectorAll(".lang-toggle button");
    const mobileLangBtns = document.querySelectorAll(".mobile-lang-toggle button");

    function setLang(lang) {
      currentLang = lang;
      applyTranslations(lang);

      document.querySelectorAll(".lang-toggle button, .mobile-lang-toggle button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
      });
    }

    langBtns.forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    mobileLangBtns.forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  }

  function applyTranslations(lang) {
    if (typeof translations === "undefined") return;
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (t[key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = t[key];
        } else if (el.tagName === "OPTION") {
          el.textContent = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    document.documentElement.lang = lang;
  }

  /* ── HERO ANIMATIONS (GSAP) ─────────────────────────────── */
  function initHeroAnimations() {
    if (typeof gsap === "undefined") return;

    const tl = gsap.timeline({ delay: 1.5 });

    tl.to(".hero__logo", {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
    })
      .to(
        ".hero__title",
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3"
      )
      .to(
        ".hero__subtitle",
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.4"
      )
      .to(
        ".hero__tagline",
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.3"
      )
      .to(
        ".hero__actions",
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.2"
      );

    // Set initial states
    gsap.set(".hero__logo", { opacity: 0, scale: 0.8 });
    gsap.set(".hero__title", { opacity: 0, y: 30 });
    gsap.set(".hero__subtitle", { opacity: 0, y: 20 });
    gsap.set(".hero__tagline", { opacity: 0, y: 20 });
    gsap.set(".hero__actions", { opacity: 0, y: 20 });
  }

  /* ── SUPER FLOW HERO SLIDER ─────────────────────────────── */
  function initHeroSlider() {
    if (typeof Swiper === "undefined") return;

    new Swiper(".hero__slider", {
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      speed: 1400,
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
      },
      loop: true,
      pagination: {
        el: ".hero__pagination",
        clickable: true,
      },
    });
  }

  /* ── SCROLL ANIMATIONS (GSAP ScrollTrigger) ─────────────── */
  function initScrollAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
    });

    // Generic reveal animations
    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Section labels animation
    document.querySelectorAll(".section-label").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    });

    // Service cards stagger
    const serviceCards = document.querySelectorAll(".service-card");
    if (serviceCards.length) {
      gsap.fromTo(
        serviceCards,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".services__grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // Team cards stagger
    const teamCards = document.querySelectorAll(".team-card");
    if (teamCards.length) {
      gsap.fromTo(
        teamCards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".team__grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // Blog cards stagger
    const blogCards = document.querySelectorAll(".blog-card");
    if (blogCards.length) {
      gsap.fromTo(
        blogCards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".blog__grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // About grid entrance (Single unified timeline to eliminate jitter)
    const aboutGrid = document.querySelector(".about__grid");
    if (aboutGrid) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutGrid,
          start: "top 80%",
          once: true,
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        ".about__image-wrapper",
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", clearProps: "transform" }
      )
        .fromTo(
          ".about__text",
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", clearProps: "transform" },
          "-=0.4"
        )
        .fromTo(
          ".about__stat",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "transform" },
          "-=0.3"
        )
        .fromTo(
          ".about__value",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "transform" },
          "-=0.3"
        );
    }

    // FAQ items stagger
    const faqItems = document.querySelectorAll(".faq-item");
    if (faqItems.length) {
      gsap.fromTo(
        faqItems,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".faq__list",
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // Contact form entrance
    const contactForm = document.querySelector(".contact__form-wrapper");
    if (contactForm) {
      gsap.fromTo(
        contactForm,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: contactForm,
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // Gallery items
    const galleryItems = document.querySelectorAll(".gallery__item");
    if (galleryItems.length) {
      gsap.fromTo(
        galleryItems,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gallery__carousel",
            start: "top 80%",
          },
        }
      );
    }
  }

  /* ── ANIMATED COUNTERS ──────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll(".about__stat-number");
    if (!counters.length) return;

    const observerOptions = { threshold: 0.5 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.dataset.target;
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    counters.forEach((counter) => observer.observe(counter));
  }

  function animateCounter(el, target) {
    const isPlus = target.includes("+");
    const isComma = target.includes(",");
    const numStr = target.replace(/[^0-9]/g, "");
    const end = parseInt(numStr, 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const current = Math.floor(eased * end);

      let display = current.toString();
      if (isComma) {
        display = current.toLocaleString();
      }
      if (isPlus) {
        display += "+";
      }

      el.textContent = display;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ── BEFORE/AFTER SLIDER ────────────────────────────────── */
  function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll(".ba-slider");

    sliders.forEach((slider) => {
      const handle = slider.querySelector(".ba-slider__handle");
      const before = slider.querySelector(".ba-slider__before");
      let isDragging = false;

      function updatePosition(x) {
        const rect = slider.getBoundingClientRect();
        let pos = ((x - rect.left) / rect.width) * 100;
        pos = Math.max(5, Math.min(95, pos));
        handle.style.left = pos + "%";
        before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      }

      // Mouse events
      handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.preventDefault();
      });

      slider.addEventListener("mousedown", (e) => {
        isDragging = true;
        updatePosition(e.clientX);
      });

      document.addEventListener("mousemove", (e) => {
        if (isDragging) updatePosition(e.clientX);
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      // Touch events
      handle.addEventListener("touchstart", (e) => {
        isDragging = true;
        e.preventDefault();
      });

      slider.addEventListener("touchstart", (e) => {
        isDragging = true;
        updatePosition(e.touches[0].clientX);
      });

      document.addEventListener("touchmove", (e) => {
        if (isDragging) updatePosition(e.touches[0].clientX);
      });

      document.addEventListener("touchend", () => {
        isDragging = false;
      });
    });
  }

  /* ── TESTIMONIALS CAROUSEL ──────────────────────────────── */
  function initTestimonialsCarousel() {
    const track = document.querySelector(".testimonials__track");
    const dots = document.querySelectorAll(".testimonials__dot");
    const cards = document.querySelectorAll(".testimonial-card");
    if (!track || !cards.length) return;

    const total = cards.length;

    function goTo(index) {
      testimonialIndex = ((index % total) + total) % total;
      track.style.transform = `translateX(-${testimonialIndex * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === testimonialIndex);
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goTo(i);
        resetAutoplay();
      });
    });

    function autoplay() {
      testimonialInterval = setInterval(() => {
        goTo(testimonialIndex + 1);
      }, 5000);
    }

    function resetAutoplay() {
      clearInterval(testimonialInterval);
      autoplay();
    }

    goTo(0);
    autoplay();
  }

  /* ── FAQ ACCORDION ──────────────────────────────────────── */
  function initFAQ() {
    const questions = document.querySelectorAll(".faq-item__question");

    questions.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item.classList.contains("open");

        // Close all
        document.querySelectorAll(".faq-item.open").forEach((openItem) => {
          openItem.classList.remove("open");
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add("open");
        }
      });
    });
  }

  /* ── CONTACT FORM VALIDATION ────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      // Name
      const name = form.querySelector("#formName");
      const nameError = form.querySelector("#nameError");
      if (name && name.value.trim().length < 2) {
        name.classList.add("error");
        name.classList.remove("success");
        if (nameError) nameError.classList.add("show");
        valid = false;
      } else if (name) {
        name.classList.remove("error");
        name.classList.add("success");
        if (nameError) nameError.classList.remove("show");
      }

      // Phone
      const phone = form.querySelector("#formPhone");
      const phoneError = form.querySelector("#phoneError");
      const phoneRegex = /^[0-9+\-() ]{7,20}$/;
      if (phone && !phoneRegex.test(phone.value.trim())) {
        phone.classList.add("error");
        phone.classList.remove("success");
        if (phoneError) phoneError.classList.add("show");
        valid = false;
      } else if (phone) {
        phone.classList.remove("error");
        phone.classList.add("success");
        if (phoneError) phoneError.classList.remove("show");
      }

      // Email
      const email = form.querySelector("#formEmail");
      const emailError = form.querySelector("#emailError");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email.value.trim())) {
        email.classList.add("error");
        email.classList.remove("success");
        if (emailError) emailError.classList.add("show");
        valid = false;
      } else if (email) {
        email.classList.remove("error");
        email.classList.add("success");
        if (emailError) emailError.classList.remove("show");
      }

      if (valid) {
        const btn = form.querySelector(".btn-submit");
        if (btn) {
          btn.classList.add("sending");
          btn.textContent = "Enviando...";
        }

        // Simulate submission
        setTimeout(() => {
          const successMsg = document.querySelector(".form-success");
          if (successMsg) {
            successMsg.style.display = "block";
            successMsg.style.animation = "fadeInUp 0.5s ease";
          }
          form.reset();
          form.querySelectorAll("input, textarea").forEach((f) => {
            f.classList.remove("success", "error");
          });
          if (btn) {
            btn.classList.remove("sending");
            const t = translations[currentLang];
            btn.textContent = t ? t.form_submit : "Enviar Solicitud";
          }
        }, 1500);
      }
    });

    // Real-time validation feedback
    form.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.classList.contains("error")) {
          field.classList.remove("error");
          const errorEl = field.parentElement.querySelector(".error-msg");
          if (errorEl) errorEl.classList.remove("show");
        }
      });
    });
  }

  /* ── SCROLL TO TOP ──────────────────────────────────────── */
  function initScrollToTop() {
    const btn = document.querySelector(".scroll-top");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 600) {
          btn.classList.add("visible");
        } else {
          btn.classList.remove("visible");
        }
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
