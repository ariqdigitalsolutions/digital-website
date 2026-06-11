const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const links = [...document.querySelectorAll(".site-nav a")];
const sections = links
  .map((link) => link.getAttribute("href"))
  .filter((href) => href?.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);

toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

links.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-28% 0px -55% 0px", threshold: [0.08, 0.18, 0.28] }
);

sections.forEach((section) => observer.observe(section));

const faqToggle = document.querySelector("[data-faq-toggle]");
const faqExtras = [...document.querySelectorAll(".faq-extra")];

faqToggle?.addEventListener("click", () => {
  const shouldExpand = faqToggle.getAttribute("aria-expanded") !== "true";
  faqExtras.forEach((item) => {
    item.hidden = !shouldExpand;
  });
  faqToggle.setAttribute("aria-expanded", String(shouldExpand));
  faqToggle.textContent = shouldExpand ? "Show Less" : "More Questions";
});

document.querySelectorAll(".service-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    window.location.hash = "contact";
  });
});

const contactForm = document.querySelector("[data-contact-form]");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const subject = encodeURIComponent(`Website enquiry from ${name || "AriQ website"}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  window.location.href = `mailto:support@ariq.co.zw?subject=${subject}&body=${body}`;
});

const packageNameEl = document.querySelector("[data-package-name]");
const orderForm = document.querySelector("[data-order-form]");
const selectedPackage = new URLSearchParams(window.location.search).get("package") || "Starlink Package";

if (packageNameEl) {
  packageNameEl.textContent = selectedPackage;
}

orderForm?.querySelector("[name='phone']")?.addEventListener("input", (event) => {
  event.currentTarget.setCustomValidity("");
});

orderForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  const formData = new FormData(orderForm);
  const phone = String(formData.get("phone") || "").trim();

  if (!/^\+263\d{9}$/.test(phone)) {
    orderForm.querySelector("[name='phone']").setCustomValidity("Phone number must start with +263 followed by 9 digits.");
    orderForm.reportValidity();
    return;
  }

  orderForm.querySelector("[name='phone']").setCustomValidity("");

  const details = [
    selectedPackage,
    "",
    "Client Details",
    `Name: ${String(formData.get("name") || "").trim()}`,
    `Surname: ${String(formData.get("surname") || "").trim()}`,
    `Address: ${String(formData.get("address") || "").trim()}`,
    `City: ${String(formData.get("city") || "").trim()}`,
    `Phone number: ${phone}`,
    `Email address: ${String(formData.get("email") || "").trim() || "Not provided"}`,
  ].join("\n");

  window.location.href = `https://wa.me/263781234567?text=${encodeURIComponent(details)}`;
});
