(() => {
  "use strict";

  const config = window.ARIQ_CONFIG || {};
  const root = document.body?.dataset.root || ".";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const encodedMessage = encodeURIComponent(config.whatsappMessage || "Hello AriQ Digital Solutions, I would like to enquire about your services.");
  const whatsappUrl = `https://wa.me/${config.whatsappNumber || ""}?text=${encodedMessage}`;
  const phoneUrl = `tel:${config.phoneHref || ""}`;
  const emailUrl = `mailto:${config.email || ""}`;

  const socialIcons = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a4.5 4.5 0 1 1-4-4.47"/><path d="M14 3c.7 3 2.3 4.7 5 5"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="9" width="4" height="11"/><path d="M6 4.5v.01M11 20v-6c0-3 4-4 6-2v8M11 9v11M17 20v-6"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12c0 3.5-.5 5.5-1.5 6-1 .5-4 .7-7.5.7S5.5 18.5 4.5 18 3 15.5 3 12s.5-5.5 1.5-6C5.5 5.5 8.5 5.3 12 5.3s6.5.2 7.5.7c1 .5 1.5 2.5 1.5 6Z"/><path d="m10 9 5 3-5 3Z"/></svg>'
  };

  function setText(selector, value) {
    if (!value) return;
    $$(selector).forEach((node) => { node.textContent = value; });
  }

  function setLink(selector, href, options = {}) {
    if (!href) return;
    $$(selector).forEach((node) => {
      node.setAttribute("href", href);
      if (options.external) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener");
      }
    });
  }

  setText("[data-current-year]", String(new Date().getFullYear()));
  setText("[data-phone-text], [data-contact-phone]", config.phoneDisplay);
  setText("[data-email-text], [data-contact-email]", config.email);
  setText("[data-location-text], [data-contact-location]", config.location);
  setText("[data-hours-text], [data-contact-hours]", config.operatingHours);
  setLink("[data-phone-link], [data-contact-phone]", phoneUrl);
  setLink("[data-email-link], [data-contact-email]", emailUrl);
  setLink("[data-whatsapp-link], [data-contact-whatsapp], [data-floating-whatsapp]", whatsappUrl, { external: true });
  $$("[data-whatsapp-service]").forEach((link) => {
    const service = link.dataset.whatsappService || "your services";
    const message = `Hello ${config.companyName || "AriQ Digital Solutions"}, I would like to enquire about ${service}.`;
    link.href = `https://wa.me/${config.whatsappNumber || ""}?text=${encodeURIComponent(message)}`;
    link.target = "_blank";
    link.rel = "noopener";
  });

  $$("[data-social-links]").forEach((container) => {
    container.replaceChildren();
    Object.entries(config.social || {}).forEach(([network, url]) => {
      if (!url || !socialIcons[network]) return;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", `AriQ Digital Solutions on ${network.charAt(0).toUpperCase() + network.slice(1)}`);
      link.innerHTML = socialIcons[network];
      container.appendChild(link);
    });
    if (!container.children.length) container.hidden = true;
  });

  const header = $("[data-header]");
  const nav = $("[data-nav]");
  const toggle = $("[data-nav-toggle]");
  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  };
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
    });
    $$("a", nav).forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 980) closeMenu(); });
  }
  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.add("animations-ready");
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((node) => node.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px" });
    reveals.forEach((node) => observer.observe(node));
  }

  $$("[data-accordion]").forEach((accordion) => {
    $$("article", accordion).forEach((item) => {
      const button = $("button", item);
      const panel = button?.nextElementSibling;
      if (!button || !panel) return;
      panel.hidden = true;
      button.addEventListener("click", () => {
        const willOpen = button.getAttribute("aria-expanded") !== "true";
        $$("article", accordion).forEach((other) => {
          const otherButton = $("button", other);
          const otherPanel = otherButton?.nextElementSibling;
          if (otherButton && otherPanel && other !== item) {
            otherButton.setAttribute("aria-expanded", "false");
            otherPanel.hidden = true;
            const mark = $("span", otherButton);
            if (mark) mark.textContent = "+";
          }
        });
        button.setAttribute("aria-expanded", String(willOpen));
        panel.hidden = !willOpen;
        const mark = $("span", button);
        if (mark) mark.textContent = willOpen ? "−" : "+";
      });
    });
  });

  function fieldValue(form, name) {
    const field = form.elements.namedItem(name);
    if (!field) return "";
    if (field instanceof RadioNodeList) return field.value.trim();
    if (field.type === "checkbox") return field.checked ? "Yes" : "No";
    return String(field.value || "").trim();
  }

  function markInvalid(form) {
    $$("input, select, textarea", form).forEach((field) => {
      field.classList.toggle("invalid", !field.checkValidity());
      field.addEventListener("input", () => field.classList.remove("invalid"), { once: true });
      field.addEventListener("change", () => field.classList.remove("invalid"), { once: true });
    });
  }

  function enquiryText(form) {
    const mode = form.dataset.formMode || "general";
    const values = {
      name: fieldValue(form, "fullName"),
      phone: fieldValue(form, "phone"),
      email: fieldValue(form, "email"),
      service: fieldValue(form, "service") || fieldValue(form, "pageService"),
      location: fieldValue(form, "location"),
      preferred: fieldValue(form, "preferred") || fieldValue(form, "preferredContact"),
      message: fieldValue(form, "message"),
      packageName: fieldValue(form, "package"),
      property: fieldValue(form, "propertyType")
    };
    const lines = [
      `Hello ${config.companyName || "AriQ Digital Solutions"},`,
      mode === "starlink" ? "I would like to request a Starlink installation quotation." : "I would like to enquire about your services.",
      "",
      `Name: ${values.name}`,
      `Phone: ${values.phone}`
    ];
    if (values.email) lines.push(`Email: ${values.email}`);
    if (values.service) lines.push(`Service: ${values.service}`);
    if (values.packageName) lines.push(`Package: ${values.packageName}`);
    if (values.property) lines.push(`Property type: ${values.property}`);
    if (values.location) lines.push(`Location: ${values.location}`);
    if (values.preferred) lines.push(`Preferred contact: ${values.preferred}`);
    if (values.message) lines.push("", `Details: ${values.message}`);
    return lines.join("\n");
  }

  $$("[data-enquiry-form]").forEach((form) => {
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = $("[data-form-status], .form-status", form);
      if (!form.checkValidity()) {
        markInvalid(form);
        form.reportValidity();
        if (status) {
          status.textContent = "Please complete all required fields correctly before sending.";
          status.className = "form-status error";
        }
        return;
      }
      const message = enquiryText(form);
      const submitter = event.submitter;
      const channel = submitter?.value || (form.dataset.formMode === "starlink" ? "whatsapp" : "whatsapp");
      if (status) {
        status.textContent = channel === "email" ? "Your email application is opening with the enquiry details." : "WhatsApp is opening with your completed enquiry.";
        status.className = "form-status success";
      }
      if (channel === "email") {
        const subject = encodeURIComponent(`Website enquiry from ${fieldValue(form, "fullName")}`);
        window.location.href = `mailto:${config.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
      } else {
        window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      }
    });
  });

  const lightbox = $("[data-lightbox]");
  const lightboxImage = lightbox ? $("[data-lightbox-image]", lightbox) : null;
  let lastLightboxTrigger = null;
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (lightboxImage) {
      lightboxImage.src = "";
      lightboxImage.alt = "";
    }
    lastLightboxTrigger?.focus();
  }
  $$("[data-lightbox-src]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lastLightboxTrigger = trigger;
      lightboxImage.src = trigger.dataset.lightboxSrc;
      lightboxImage.alt = trigger.dataset.lightboxAlt || "";
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      $("[data-lightbox-close]", lightbox)?.focus();
    });
  });
  $("[data-lightbox-close]", lightbox || document)?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox(); });

  const galleryFilters = $("[data-gallery-filters]");
  if (galleryFilters) {
    $$("[data-filter]", galleryFilters).forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        $$("[data-filter]", galleryFilters).forEach((item) => item.classList.toggle("active", item === button));
        $$("[data-gallery-item]").forEach((item) => {
          item.hidden = filter !== "All" && item.dataset.category !== filter;
        });
      });
    });
  }

  const backToTop = $("[data-back-to-top]");
  const updateBackToTop = () => backToTop?.classList.toggle("visible", window.scrollY > 500);
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  const cookieBanner = $("[data-cookie-banner]");
  let cookieChoice = null;
  try { cookieChoice = localStorage.getItem("ariqCookieChoice"); } catch (_) {}
  if (cookieBanner && !cookieChoice) cookieBanner.hidden = false;
  const saveCookieChoice = (choice) => {
    try { localStorage.setItem("ariqCookieChoice", choice); } catch (_) {}
    if (cookieBanner) cookieBanner.hidden = true;
  };
  $("[data-cookie-accept]")?.addEventListener("click", () => saveCookieChoice("accepted"));
  $("[data-cookie-dismiss]")?.addEventListener("click", () => saveCookieChoice("dismissed"));
})();
