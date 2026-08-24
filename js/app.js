import { siteData } from "./content.js";

const routes = [
  { id: "home", label: "Početna", href: "/" },
  { id: "services", label: "Usluge", href: "/usluge/" },
  { id: "projects", label: "Projekti", href: "/projekti/" },
  { id: "about", label: "O nama", href: "/o-nama/" },
  { id: "contact", label: "Kontakt", href: "/kontakt/" },
];

const icon = (name) => {
  const icons = {
    arrow: '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
    menu: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    check: '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="m4 10 4 4 8-8"/></svg>',
  };

  return icons[name] ?? "";
};

function logoMarkup() {
  return `
    <span class="brand-mark" aria-hidden="true">
      <img src="/images/osiris-logo.png" alt="" width="1254" height="1254" decoding="async" fetchpriority="high">
    </span>
    <span class="brand-name">OSIRIS</span>
  `;
}

function renderHeader() {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;

  const currentPage = document.body.dataset.page ?? "home";
  const mobileNavLinks = routes
    .map(
      (route, index) => `
        <a class="nav-link mobile-nav-link${route.id === currentPage ? " is-active" : ""}"
           href="${route.href}"
           ${route.id === currentPage ? 'aria-current="page"' : ""}>
          <span class="mobile-nav-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <strong>${route.label}</strong>
          <span class="mobile-nav-arrow" aria-hidden="true">↗</span>
        </a>`,
    )
    .join("");

  const desktopNavLinks = routes
    .filter((route) => route.id !== "contact")
    .map(
      (route) => `
        <a class="nav-link${route.id === currentPage ? " is-active" : ""}"
           href="${route.href}"
           ${route.id === currentPage ? 'aria-current="page"' : ""}>
          ${route.label}
        </a>`,
    )
    .join("");

  target.innerHTML = `
    <header class="site-header" data-header>
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="OSIRIS — početna stranica">
          ${logoMarkup()}
        </a>

        <nav class="desktop-nav" aria-label="Glavna navigacija">
          ${desktopNavLinks}
        </nav>

        <a class="button button-small button-dark header-cta" href="/kontakt/">
          Pokrenimo projekt ${icon("arrow")}
        </a>

        <button class="menu-toggle" type="button" aria-label="Otvori izbornik" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
          <span data-menu-icon>${icon("menu")}</span>
        </button>
      </div>

      <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
        <nav class="container mobile-nav" aria-label="Mobilna navigacija">
          <div class="mobile-nav-eyebrow">
            <span>Navigacija / OSIRIS</span>
            <strong>Menu 01</strong>
          </div>
          <div class="mobile-nav-list">
            ${mobileNavLinks}
          </div>
          <div class="mobile-nav-footer">
            <a class="button button-primary mobile-nav-cta" href="/kontakt/">
              <span>Pokrenimo projekt</span>${icon("arrow")}
            </a>
            <div class="mobile-nav-location" aria-label="Lokacija studija">
              <span>Zagreb, Hrvatska</span>
              <span>45.8° N / 16.0° E</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  `;

  const header = target.querySelector("[data-header]");
  const toggle = target.querySelector("[data-menu-toggle]");
  const menu = target.querySelector("[data-mobile-menu]");
  const menuIcon = target.querySelector("[data-menu-icon]");
  const pageRegions = [
    document.querySelector("main"),
    document.querySelector("[data-site-footer]"),
  ].filter(Boolean);

  const setPageInert = (isInert) => {
    pageRegions.forEach((region) => {
      if (isInert) {
        region.setAttribute("inert", "");
      } else {
        region.removeAttribute("inert");
      }
    });
  };

  const menuFocusables = () => [
    toggle,
    ...menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ];

  const closeMenu = ({ returnFocus = false } = {}) => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Otvori izbornik");
    menu.hidden = true;
    menuIcon.innerHTML = icon("menu");
    document.body.classList.remove("menu-open");
    setPageInert(false);
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", (event) => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu({ returnFocus: true });
      return;
    }

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Zatvori izbornik");
    menu.hidden = false;
    menuIcon.innerHTML = icon("close");
    document.body.classList.add("menu-open");
    setPageInert(true);
    if (event.detail === 0) {
      menu.querySelector("a")?.focus();
    } else {
      toggle.blur();
    }
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu({ returnFocus: true });
      return;
    }

    if (event.key !== "Tab" || menu.hidden) return;

    const focusables = menuFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) closeMenu();
  });

  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

function renderFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;

  const footerLinks = routes
    .filter((route) => route.id !== "home")
    .map((route) => `<a href="${route.href}">${route.label}</a>`)
    .join("");

  target.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand-block">
          <a class="brand brand-on-dark" href="/" aria-label="OSIRIS — početna stranica">
            ${logoMarkup()}
          </a>
          <p>${siteData.brand.description}</p>
          <span class="location-pill">${siteData.brand.location}</span>
        </div>

        <div class="footer-links">
          <p class="footer-label">Navigacija</p>
          ${footerLinks}
        </div>

        <div class="footer-contact">
          <p class="footer-label">Razgovarajmo</p>
          <p>Imate ideju za web stranicu ili aplikaciju? Pretvorimo je u jasno i korisno digitalno rješenje.</p>
          <a class="text-link text-link-light" href="/kontakt/">Javite nam se ${icon("arrow")}</a>
        </div>
      </div>

      <div class="container footer-bottom">
        <span>© <span data-current-year></span> OSIRIS. Sva prava pridržana.</span>
        <span>Tin i Mate · Zagreb</span>
      </div>
    </footer>
  `;

  target.querySelector("[data-current-year]").textContent = String(
    new Date().getFullYear(),
  );
}

function projectCard(project, index) {
  const hasLiveUrl = Boolean(project.liveUrl);
  const projectNumber = String(index + 1).padStart(2, "0");

  return `
    <article class="project-card${index === 0 ? " project-card-featured" : ""} reveal" data-project-category="${project.category}">
      <div class="project-preview preview-${(index % 4) + 1}">
        ${
          project.preview
            ? `<img src="${project.preview}" alt="Pregled projekta ${project.title}" loading="lazy">`
            : `<div class="project-window" aria-hidden="true">
                <div class="window-bar"><span></span><span></span><span></span></div>
                <div class="window-layout">
                  <span class="window-kicker"></span>
                  <span class="window-title"></span>
                  <span class="window-title window-title-short"></span>
                  <span class="window-button"></span>
                </div>
              </div>`
        }
        <span class="project-index">${projectNumber}</span>
        <span class="project-status">${project.status}</span>
      </div>
      <div class="project-content">
        <div class="project-meta">
          <span>${project.category}</span>
          <span>${project.industry}</span>
        </div>
        <h3>${project.title}</h3>
        <div class="project-services" aria-label="Usluge na projektu">
          ${project.services.map((service) => `<span>${service}</span>`).join("")}
        </div>
        <p>${project.summary}</p>
        ${
          hasLiveUrl
            ? `<a class="text-link" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">Pogledaj projekt ${icon("arrow")}</a>`
            : `<span class="text-link text-link-disabled" aria-label="Poveznica na projekt još nije dostupna">Link uskoro ${icon("arrow")}</span>`
        }
      </div>
    </article>
  `;
}

function packageCard(item) {
  return `
    <article class="package-card package-${item.tone} reveal">
      <div class="package-topline">
        <span class="package-code">OSIRIS ${item.code}</span>
        <span class="package-plus" aria-hidden="true">+</span>
      </div>
      <div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
      <ul>
        ${item.includes.map((entry) => `<li>${entry}</li>`).join("")}
      </ul>
      <a class="text-link" href="/kontakt/">Složimo pravi opseg ${icon("arrow")}</a>
    </article>
  `;
}

function renderPackages() {
  document.querySelectorAll("[data-package-grid]").forEach((grid) => {
    grid.innerHTML = siteData.packages.map(packageCard).join("");
  });
}

function renderProjects() {
  document.querySelectorAll("[data-project-grid]").forEach((grid) => {
    const limit = Number(grid.dataset.limit || siteData.projects.length);
    grid.innerHTML = siteData.projects
      .slice(0, limit)
      .map(projectCard)
      .join("");
  });

  const filterGroup = document.querySelector("[data-project-filters]");
  if (!filterGroup) return;

  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;

    const filter = button.dataset.filter;
    filterGroup.querySelectorAll("button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll("[data-project-category]").forEach((card) => {
      card.hidden = filter !== "Sve" && card.dataset.projectCategory !== filter;
    });
  });
}

function renderBrandData() {
  document.querySelectorAll("[data-brand-location]").forEach((element) => {
    element.textContent = siteData.brand.location;
  });

  document.querySelectorAll("[data-contact-email]").forEach((element) => {
    if (siteData.contact.email) {
      element.textContent = siteData.contact.email;
      if (element instanceof HTMLAnchorElement) {
        element.href = `mailto:${siteData.contact.email}`;
      }
      return;
    }
    element.textContent = "Poslovni email bit će objavljen ovdje";
    element.removeAttribute("href");
    element.setAttribute("aria-disabled", "true");
  });

  document.querySelectorAll("[data-contact-phone]").forEach((element) => {
    if (siteData.contact.phone) {
      element.textContent = siteData.contact.phone;
      if (element instanceof HTMLAnchorElement) {
        element.href = `tel:${siteData.contact.phone.replace(/\s/g, "")}`;
      }
      return;
    }
    element.textContent = "Telefon još nije objavljen";
    element.removeAttribute("href");
    element.setAttribute("aria-disabled", "true");
  });
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = siteData.contact.statusMessage;
    status.hidden = false;
    status.focus();
  });
}

function setupHeroVideo() {
  const video = document.querySelector("[data-hero-video]");
  if (!(video instanceof HTMLVideoElement)) return;

  video.defaultMuted = true;
  video.muted = true;
  video.loop = true;
  video.play().catch(() => {
    // The poster remains visible if a browser blocks muted autoplay.
  });
}

function setupReveals() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px" },
  );

  elements.forEach((element) => observer.observe(element));
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (event) {
      const href = this.getAttribute("href");
      if (href === "#" || !href) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    });
  });
}

function setupParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const heroVideo = document.querySelector(".cinematic-hero-video");
  if (!heroVideo) return;

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const parallaxSpeed = 0.5;
        heroVideo.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(1.1)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function setupLoadingState() {
  window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");
  });

  document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll("img[loading='lazy']");

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add("loaded");
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  });
}

function setupCardInteractions() {
  const cards = document.querySelectorAll(".project-card, .service-card, .package-card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function() {
      this.style.zIndex = "10";
    });

    card.addEventListener("mouseleave", function() {
      this.style.zIndex = "";
    });
  });
}

function setupAccessibilityEnhancements() {
  let lastFocusedElement = null;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      document.body.classList.add("keyboard-nav");
    }
  });

  document.addEventListener("mousedown", () => {
    document.body.classList.remove("keyboard-nav");
  });

  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element) => {
    element.addEventListener("focus", function() {
      if (lastFocusedElement) {
        lastFocusedElement.classList.remove("was-focused");
      }
      this.classList.add("was-focused");
      lastFocusedElement = this;
    });
  });
}

renderHeader();
renderFooter();
renderProjects();
renderPackages();
renderBrandData();
setupContactForm();
setupHeroVideo();
setupReveals();
setupSmoothScroll();
setupParallax();
setupLoadingState();
setupCardInteractions();
setupAccessibilityEnhancements();
