import { siteData } from "./content.js";

const routes = [
  { id: "services", label: "Usluge", href: "/usluge/" },
  { id: "projects", label: "Projekti", href: "/projekti/" },
  { id: "about", label: "O nama", href: "/o-nama/" },
  { id: "contact", label: "Kontakt", href: "/kontakt/" },
];

const privacyRoute = { id: "privacy", label: "Privatnost", href: "/privatnost/" };
const analysisHref = "/web-stranice-za-poduzeca/#analiza";

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
      <picture>
        <source srcset="/images/osiris-mark-128.webp" type="image/webp">
        <img src="/images/osiris-mark-128.png" alt="" width="128" height="128" decoding="async">
      </picture>
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

        <a class="button button-small button-primary header-cta" href="${analysisHref}">
          Besplatna analiza ${icon("arrow")}
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
            <a class="button button-primary mobile-nav-cta" href="${analysisHref}">
              <span>Besplatna analiza</span>${icon("arrow")}
            </a>
            <div class="mobile-nav-location" aria-label="Lokacija studija">
              <span>Zagreb, Hrvatska</span>
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

  const desktopNavigation = window.matchMedia("(min-width: 60rem)");
  const closeMenuAtDesktop = (event) => {
    if (event.matches) closeMenu();
  };

  if (desktopNavigation.addEventListener) {
    desktopNavigation.addEventListener("change", closeMenuAtDesktop);
  } else {
    desktopNavigation.addListener(closeMenuAtDesktop);
  }

  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

function renderFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;

  const footerLinks = [...routes, privacyRoute]
    .map((route) => `<a href="${route.href}">${route.label}</a>`)
    .join("");

  const contactChannels = [];
  const email = siteData.contact.email?.trim();
  const phone = siteData.contact.phone?.trim();

  if (email) {
    contactChannels.push(
      `<a class="text-link text-link-light" href="mailto:${email}">${email}</a>`,
    );
  }

  if (phone) {
    contactChannels.push(
      `<a class="text-link text-link-light" href="tel:${phone.replace(/\s/g, "")}">${phone}</a>`,
    );
  }

  const socialLabels = {
    linkedin: "LinkedIn",
    instagram: "Instagram",
    github: "GitHub",
  };

  Object.entries(siteData.contact.socials ?? {}).forEach(([network, href]) => {
    if (!href?.trim()) return;
    contactChannels.push(
      `<a class="text-link text-link-light" href="${href}" target="_blank" rel="noopener noreferrer">${socialLabels[network] ?? network}</a>`,
    );
  });

  const contactChannelsMarkup = contactChannels.length
    ? `<div class="footer-contact-channels" aria-label="Kontaktni kanali">${contactChannels.join("")}</div>`
    : "";

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
          <p>Želite jasnije predstaviti svoje poslovanje? Poslat ćemo vam 3–5 konkretnih preporuka za vaš web.</p>
          <a class="text-link text-link-light" href="${analysisHref}">Besplatna analiza ${icon("arrow")}</a>
          ${contactChannelsMarkup}
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
  const roles = Array.isArray(project.role)
    ? project.role
    : project.role
      ? [project.role]
      : project.services ?? [];
  const media = project.media ?? {
    type: "image",
    src: project.preview,
    alt: `Prikaz projekta ${project.title}`,
  };
  const mediaDimensions = [
    media.width ? `width="${media.width}"` : "",
    media.height ? `height="${media.height}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const mediaPosition = media.objectPosition
    ? ` style="object-position: ${media.objectPosition}"`
    : "";
  const mediaSizes = media.sizes ? ` sizes="${media.sizes}"` : "";
  const responsiveSources = [
    media.sources?.avif
      ? `<source type="image/avif" srcset="${media.sources.avif}"${mediaSizes}>`
      : "",
    media.sources?.webp
      ? `<source type="image/webp" srcset="${media.sources.webp}"${mediaSizes}>`
      : "",
  ].join("");
  const projectImage =
    media.type === "image" && media.src
      ? `<picture>${responsiveSources}<img src="${media.src}" alt="${media.alt ?? `Prikaz projekta ${project.title}`}" ${mediaDimensions}${mediaSizes} loading="lazy" decoding="async"${mediaPosition}></picture>`
      : "";

  return `
    <article class="project-card${index === 0 ? " project-card-featured" : ""} reveal" data-project-category="${project.category}">
      <div class="project-preview preview-${(index % 4) + 1}">
        ${
          projectImage
            ? projectImage
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
        <div class="project-services" aria-label="Uloga OSIRIS tima na projektu">
          ${roles.map((role) => `<span>${role}</span>`).join("")}
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
      <a class="text-link" href="${analysisHref}">Besplatna analiza ${icon("arrow")}</a>
    </article>
  `;
}

function renderPackages() {
  document.querySelectorAll("[data-package-grid]").forEach((grid) => {
    if (grid.children.length) return;
    const serviceTracks = siteData.serviceTracks ?? siteData.packages ?? [];
    grid.innerHTML = serviceTracks.map(packageCard).join("");
  });
}

function renderProjects() {
  document.querySelectorAll("[data-project-grid]").forEach((grid) => {
    if (grid.children.length) return;
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
    const email = siteData.contact.email?.trim();
    const channel = element.closest("[data-contact-channel]") ?? element;
    if (email) {
      channel.hidden = false;
      channel.removeAttribute("aria-hidden");
      element.textContent = email;
      element.removeAttribute("aria-disabled");
      if (element instanceof HTMLAnchorElement) {
        element.href = `mailto:${email}`;
      }
      return;
    }
    channel.hidden = true;
    channel.setAttribute("aria-hidden", "true");
  });

  document.querySelectorAll("[data-contact-phone]").forEach((element) => {
    const phone = siteData.contact.phone?.trim();
    const channel = element.closest("[data-contact-channel]") ?? element;
    if (phone) {
      channel.hidden = false;
      channel.removeAttribute("aria-hidden");
      element.textContent = phone;
      element.removeAttribute("aria-disabled");
      if (element instanceof HTMLAnchorElement) {
        element.href = `tel:${phone.replace(/\s/g, "")}`;
      }
      return;
    }
    channel.hidden = true;
    channel.setAttribute("aria-hidden", "true");
  });

  document.querySelectorAll("[data-contact-social]").forEach((element) => {
    const network = element.dataset.contactSocial;
    const href = siteData.contact.socials?.[network]?.trim();
    const channel = element.closest("[data-contact-channel]") ?? element;
    if (!href) {
      channel.hidden = true;
      channel.setAttribute("aria-hidden", "true");
      return;
    }

    channel.hidden = false;
    channel.removeAttribute("aria-hidden");
    if (element instanceof HTMLAnchorElement) {
      element.href = href;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }
  });
}

const formFieldContract = {
  name: {
    required: true,
    empty: "Unesite ime i prezime.",
  },
  email: {
    required: true,
    empty: "Unesite email adresu.",
    invalid: "Unesite ispravnu email adresu, primjerice ime@tvrtka.hr.",
  },
  websiteStatus: {
    required: true,
    empty: "Odaberite trenutačno stanje web stranice.",
  },
  primaryGoal: {
    required: true,
    empty: "Opišite glavni poslovni cilj web stranice.",
  },
};

function setupContactForms() {
  document.querySelectorAll("[data-contact-form]").forEach((form, formIndex) => {
    if (!(form instanceof HTMLFormElement)) return;

    let status = form.querySelector("[data-form-status]");
    const submit = form.querySelector('button[type="submit"]');
    if (!(submit instanceof HTMLButtonElement)) return;

    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.dataset.formStatus = "";
      status.tabIndex = -1;
      status.hidden = true;
      form.append(status);
    }

    const controls = [...form.elements].filter(
      (control) =>
        (control instanceof HTMLInputElement ||
          control instanceof HTMLSelectElement ||
          control instanceof HTMLTextAreaElement) &&
        control.type !== "hidden" &&
        control.name !== "_gotcha",
    );
    const fieldErrors = new Map();
    const formspreeId = siteData.contact.formspreeId?.trim();
    const isConfigured = formspreeId && formspreeId !== "YOUR_FORM_ID";
    const endpoint = isConfigured ? `https://formspree.io/f/${formspreeId}` : "";
    const originalSubmitMarkup = submit.innerHTML;

    form.noValidate = true;
    form.dataset.state = "idle";

    controls.forEach((control) => {
      const isRequired = Boolean(formFieldContract[control.name]?.required);
      control.required = isRequired;
      if (isRequired) {
        control.setAttribute("aria-required", "true");
      } else {
        control.removeAttribute("aria-required");
      }
    });

    if (endpoint) {
      form.action = endpoint;
      form.method = "POST";
    }

    const setFormState = (state, message = "", { focus = false } = {}) => {
      form.dataset.state = state;
      status.dataset.state = state;
      status.hidden = !message;
      status.textContent = message;
      status.setAttribute("role", state === "error" ? "alert" : "status");
      status.setAttribute("aria-live", state === "error" ? "assertive" : "polite");

      if (focus && message) status.focus();
    };

    const getFieldError = (control) => {
      if (fieldErrors.has(control)) return fieldErrors.get(control);

      const controlKey = (control.id || control.name || "field").replace(/[^a-z0-9_-]/gi, "-");
      const existingError = [...form.querySelectorAll("[data-error-for]")].find(
        (element) => element.dataset.errorFor === control.name,
      );
      const error = existingError ?? document.createElement("small");
      if (!error.id) error.id = `form-${formIndex}-${controlKey}-error`;
      error.classList.add("field-error");
      error.dataset.fieldError = control.name;
      error.hidden = true;
      if (!existingError) control.insertAdjacentElement("afterend", error);

      const describedBy = new Set(
        (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean),
      );
      describedBy.add(error.id);
      control.setAttribute("aria-describedby", [...describedBy].join(" "));
      control.setAttribute("aria-errormessage", error.id);
      fieldErrors.set(control, error);
      return error;
    };

    const validationMessage = (control) => {
      const rule = formFieldContract[control.name];
      const value = control.value.trim();

      if (rule?.required && !value) return rule.empty;
      if (!value) return "";
      if (control.validity.typeMismatch && control.type === "email") {
        return rule?.invalid ?? "Unesite ispravnu email adresu.";
      }
      if (control.validity.typeMismatch && control.type === "url") {
        return "Unesite potpunu web adresu, primjerice https://primjer.hr.";
      }
      if (!control.validity.valid) return "Provjerite unesenu vrijednost.";
      return "";
    };

    const showFieldError = (control, message) => {
      const error = getFieldError(control);
      error.textContent = message;
      error.hidden = false;
      control.setAttribute("aria-invalid", "true");
    };

    const clearFieldError = (control) => {
      const error = fieldErrors.get(control);
      if (error) {
        error.textContent = "";
        error.hidden = true;
      }
      control.removeAttribute("aria-invalid");
    };

    const clearAllFieldErrors = () => {
      controls.forEach(clearFieldError);
    };

    controls.forEach((control) => {
      const clearOnEdit = () => {
        clearFieldError(control);
        if (form.dataset.state === "error") setFormState("idle");
      };
      control.addEventListener("input", clearOnEdit);
      control.addEventListener("change", clearOnEdit);
      control.addEventListener("blur", () => {
        if (control.getAttribute("aria-invalid") !== "true") return;
        const message = validationMessage(control);
        if (message) showFieldError(control, message);
        else clearFieldError(control);
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearAllFieldErrors();

      let firstInvalid = null;
      controls.forEach((control) => {
        const message = validationMessage(control);
        if (!message) return;
        showFieldError(control, message);
        firstInvalid ??= control;
      });

      if (firstInvalid) {
        setFormState(
          "error",
          "Provjerite označena polja. Uz svako polje nalazi se opis potrebnog ispravka.",
        );
        firstInvalid.focus();
        return;
      }

      if (!endpoint) {
        setFormState(
          "error",
          "Obrazac trenutačno nije povezan sa servisom za slanje. Pokušajte ponovno kasnije.",
          { focus: true },
        );
        return;
      }

      const formData = new FormData(form);
      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
        formData.set(key, params.get(key) || form.elements.namedItem(key)?.value || "");
      });
      formData.set("pageUrl", window.location.href);

      setFormState("pending", "Šaljemo vaš zahtjev…");
      form.setAttribute("aria-busy", "true");
      submit.disabled = true;
      submit.setAttribute("aria-disabled", "true");
      submit.textContent = "Slanje u tijeku…";

      let responseErrorMessage = "";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });

        if (!response.ok) {
          responseErrorMessage =
            response.status === 429
              ? "Poslano je previše zahtjeva u kratkom vremenu. Pričekajte nekoliko minuta pa pokušajte ponovno."
              : "Zahtjev nije poslan zbog pogreške servisa. Provjerite podatke i pokušajte ponovno.";
          throw new Error("submission_failed");
        }

        form.reset();
        clearAllFieldErrors();
        setFormState("success", siteData.contact.statusMessage, { focus: true });
      } catch {
        const message =
          responseErrorMessage ||
          "Zahtjev trenutačno nije poslan. Provjerite internetsku vezu i pokušajte ponovno.";
        setFormState("error", message, { focus: true });
      } finally {
        form.removeAttribute("aria-busy");
        submit.disabled = false;
        submit.removeAttribute("aria-disabled");
        submit.innerHTML = originalSubmitMarkup;
      }
    });
  });
}

function setupHeroVideo() {
  const video = document.querySelector("[data-hero-video]");
  if (!(video instanceof HTMLVideoElement)) return;

  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.removeAttribute("autoplay");
  video.removeAttribute("src");
  video.querySelectorAll("source").forEach((source) => source.removeAttribute("src"));
  video.preload = "none";
  video.pause();
  video.load();

  const configuredSources = [
    { src: video.dataset.videoSrcWebm?.trim(), type: "video/webm" },
    { src: video.dataset.videoSrcMp4?.trim(), type: "video/mp4" },
  ].filter(({ src }) => Boolean(src));
  const hero = video.closest(".home-hero, .cinematic-hero") ?? video.parentElement;
  let toggle = hero?.querySelector("[data-video-toggle]") ?? document.querySelector("[data-video-toggle]");

  if (!configuredSources.length) {
    if (toggle) {
      toggle.hidden = true;
      toggle.disabled = true;
      toggle.setAttribute("aria-pressed", "false");
    }
    return;
  }

  video.querySelectorAll("source").forEach((source) => source.remove());
  const sourceRecords = configuredSources.map(({ src, type }) => {
    const source = document.createElement("source");
    source.type = type;
    source.dataset.src = src;
    video.append(source);
    return { element: source, src };
  });

  const desktopViewport = window.matchMedia("(min-width: 60rem)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "video-toggle cinematic-video-toggle";
    toggle.dataset.videoToggle = "";
    const toggleContainer = hero?.querySelector(
      ".home-hero__inner, .cinematic-hero-inner, .home-hero__actions, .cinematic-actions",
    );
    (toggleContainer ?? hero)?.append(toggle);
  }

  if (!video.id) video.id = "hero-background-video";
  toggle?.setAttribute("aria-controls", video.id);
  const toggleLabel = toggle?.querySelector("[data-video-toggle-label]") ?? toggle;

  let sourceLoaded = false;
  const canObserveIntersection = "IntersectionObserver" in window;
  let isIntersecting = !canObserveIntersection;
  let userPaused = false;

  const canUseVideo = () =>
    desktopViewport.matches && !reducedMotion.matches && !connection?.saveData;

  const updateToggle = () => {
    if (!toggle) return;
    const allowed = canUseVideo();
    const isPlaying = allowed && sourceLoaded && !video.paused;
    toggle.hidden = !allowed;
    toggle.disabled = !allowed;
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute(
      "aria-label",
      isPlaying ? "Pauziraj pozadinski video" : "Pokreni pozadinski video",
    );
    toggleLabel.textContent = isPlaying ? "Pauziraj video" : "Pokreni video";
  };

  const loadSource = () => {
    if (sourceLoaded) return;
    sourceRecords.forEach(({ element, src }) => element.setAttribute("src", src));
    sourceLoaded = true;
    video.preload = "metadata";
    video.load();
  };

  const unloadSource = () => {
    video.pause();
    if (!sourceLoaded) return;
    sourceRecords.forEach(({ element }) => element.removeAttribute("src"));
    sourceLoaded = false;
    video.preload = "none";
    video.load();
  };

  const attemptPlay = () => {
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(updateToggle);
  };

  const syncPlayback = () => {
    if (!canUseVideo()) {
      unloadSource();
      updateToggle();
      return;
    }

    loadSource();
    const shouldPlay =
      document.visibilityState === "visible" && isIntersecting && !userPaused;

    if (shouldPlay) attemptPlay();
    else video.pause();
    updateToggle();
  };

  toggle?.addEventListener("click", () => {
    if (!canUseVideo()) return;
    userPaused = !video.paused;
    syncPlayback();
  });

  video.addEventListener("play", updateToggle);
  video.addEventListener("pause", updateToggle);
  video.addEventListener("ended", updateToggle);

  if (canObserveIntersection) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
  }

  const listenForMediaChange = (query) => {
    if (query.addEventListener) query.addEventListener("change", syncPlayback);
    else query.addListener(syncPlayback);
  };

  listenForMediaChange(desktopViewport);
  listenForMediaChange(reducedMotion);
  connection?.addEventListener?.("change", syncPlayback);
  window.addEventListener("pageshow", syncPlayback);
  document.addEventListener("visibilitychange", syncPlayback);
  syncPlayback();
}

function setupParallax() {
  // Parallax transform on <video> causes dropped frames during playback.
  // Visual depth is handled via CSS overlays instead.
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    });
  });
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
setupContactForms();
setupHeroVideo();
setupReveals();
setupSmoothScroll();
setupParallax();
setupLoadingState();
setupCardInteractions();
setupAccessibilityEnhancements();
