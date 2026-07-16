(() => {
  "use strict";
  const packages = Array.isArray(window.ARIQ_PACKAGES) ? window.ARIQ_PACKAGES : [];
  const config = window.ARIQ_CONFIG || {};
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));

  const packageContainer = document.querySelector("[data-starlink-packages]");
  if (packageContainer) {
    packageContainer.innerHTML = packages.map((item, index) => {
      const message = encodeURIComponent(`Hello AriQ Digital Solutions, I would like to enquire about the ${item.name}. My installation location is: `);
      return `<article class="pricing-card reveal ${index === 0 ? "featured" : ""}">
        <div class="pricing-top">
          <span class="pricing-badge">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.name)}</h3>
          <p class="package-suitable">${escapeHtml(item.suitable)}</p>
        </div>
        <div class="price-block">
          <strong>${escapeHtml(item.price)}</strong>
          <span>${escapeHtml(item.priceLabel)}</span>
        </div>
        <div class="monthly-block"><strong>${escapeHtml(item.monthly)}</strong><span>${escapeHtml(item.monthlyLabel)}</span></div>
        <ul class="check-list">${item.features.map((feature) => `<li><svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg><span>${escapeHtml(feature)}</span></li>`).join("")}</ul>
        <div class="pricing-actions">
          <a class="button button-primary button-block" href="../order.html?package=${encodeURIComponent(item.id)}">${escapeHtml(item.cta)}</a>
          <a class="button button-secondary button-block" href="https://wa.me/${escapeHtml(config.whatsappNumber || "")}?text=${message}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </article>`;
    }).join("");
    requestAnimationFrame(() => packageContainer.querySelectorAll(".reveal").forEach((node) => node.classList.add("visible")));
  }

  const packageSelect = document.querySelector('select[name="package"]');
  if (packageSelect) {
    packages.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = `${item.name} — ${item.price}`;
      option.dataset.packageId = item.id;
      packageSelect.appendChild(option);
    });
    const requested = new URLSearchParams(window.location.search).get("package");
    if (requested) {
      const match = packages.find((item) => item.id === requested || item.name === requested);
      if (match) packageSelect.value = match.name;
    }
  }
})();
