/* ====================================================================
   script.js  — scroll reveals, progress bar, navbar, hero parallax,
   mobile menu, and typing animation
   ==================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile menu drawer & Backdrop ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navBackdrop = document.getElementById("navBackdrop");

  function closeMenu() {
    if (!toggle || !navLinks) return;
    toggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
    if (navBackdrop) navBackdrop.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    if (!toggle || !navLinks) return;
    toggle.setAttribute("aria-expanded", "true");
    navLinks.classList.add("open");
    if (navBackdrop) navBackdrop.classList.add("open");
    document.body.classList.add("menu-open");
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeMenu);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        closeMenu();
      }
    });

    // close menu when any internal nav link is clicked
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        closeMenu();
      })
    );
  }

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.querySelector(".progress-bar");

  function updateProgress() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }

  /* ---------- Hero parallax (fade + lift on scroll) ---------- */
  const hero = document.getElementById("hero");

  function updateHeroParallax() {
    if (!hero) return;
    const h = window.innerHeight;
    const p = Math.min(Math.max(window.scrollY / h, 0), 1);
    hero.style.setProperty("--hero-p", p.toFixed(3));
  }

  /* ---------- Active nav link based on scroll position ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll(".nav-link-item");

  function updateActiveLink() {
    let currentId = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 200) {
        currentId = sec.id;
      }
    });
    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }

  /* ---------- Header Glass on Scroll ---------- */
  const headerWrapper = document.querySelector(".navbar-wrapper");

  function updateHeaderGlass() {
    if (!headerWrapper) return;
    headerWrapper.classList.toggle("scrolled", window.scrollY > 20);
  }

  /* ---------- Scroll event (throttled via rAF) ---------- */
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          updateHeroParallax();
          updateActiveLink();
          updateHeaderGlass();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  // initial call
  updateProgress();
  updateHeroParallax();
  updateActiveLink();
  updateHeaderGlass();

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    // fallback: show everything immediately
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Copy Email Button Interaction ---------- */
  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    const defaultText = copyBtn.querySelector(".copy-btn__text")?.textContent || "Copy Contact Email";
    const emailToCopy = copyBtn.dataset.email || "behrooziseyedmatin@gmail.com";

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailToCopy);
        const textSpan = copyBtn.querySelector(".copy-btn__text");
        if (textSpan) textSpan.textContent = "✓ COPIED!";
        copyBtn.classList.add("copied");

        setTimeout(() => {
          if (textSpan) textSpan.textContent = defaultText;
          copyBtn.classList.remove("copied");
        }, 2200);
      } catch (err) {
        // Fallback prompt if clipboard API is blocked
        prompt("Copy email address:", emailToCopy);
      }
    });
  }

  /* ---------- Horizontal Capabilities Accordion (Concept 2) ---------- */
  const capabilityItems = document.querySelectorAll(".capability-item");

  capabilityItems.forEach((item) => {
    const trigger = item.querySelector(".capability-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isAlreadyActive = item.classList.contains("active");

      // Optional: keep one open or toggle
      capabilityItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("active");
          const otherTrigger = other.querySelector(".capability-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      const newState = !isAlreadyActive;
      item.classList.toggle("active", newState);
      trigger.setAttribute("aria-expanded", String(newState));
    });
  });

  /* ---------- Contact Section Copy Email Button ---------- */
  const contactCopy = document.getElementById("contactCopyBtn");
  if (contactCopy) {
    const labelSpan = contactCopy.querySelector(".contact-copy-label");
    const defaultLabel = labelSpan ? labelSpan.textContent : "CLICK TO COPY EMAIL";
    const emailStr = contactCopy.dataset.email || "behrooziseyedmatin@gmail.com";

    contactCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailStr);
        if (labelSpan) labelSpan.textContent = "COPIED TO CLIPBOARD ✓";
        contactCopy.classList.add("copied");

        setTimeout(() => {
          if (labelSpan) labelSpan.textContent = defaultLabel;
          contactCopy.classList.remove("copied");
        }, 2400);
      } catch (err) {
        prompt("Copy email address:", emailStr);
      }
    });
  }
})();
