(() => {
  "use strict";
  const posts = Array.isArray(window.ARIQ_BLOG_POSTS) ? [...window.ARIQ_BLOG_POSTS] : [];
  const root = document.body?.dataset.root || ".";
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
  const assetPath = (path) => `${root}/${String(path).replace(/^\.\//, "")}`.replace(/^\.\//, "");
  const articleUrl = (slug) => `${root}/article.html?slug=${encodeURIComponent(slug)}`.replace(/^\.\//, "");
  const formatDate = (value) => {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-ZW", { day:"numeric", month:"long", year:"numeric" }).format(date);
  };
  const card = (post) => `<article class="blog-card">
    <a class="blog-card-image" href="${articleUrl(post.slug)}"><img src="${assetPath(post.image)}" alt="${escapeHtml(post.title)}" width="640" height="420" loading="lazy"></a>
    <div class="blog-card-body">
      <div class="article-meta"><span>${escapeHtml(post.category)}</span><time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time></div>
      <h3><a href="${articleUrl(post.slug)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.summary)}</p>
      <a class="text-link" href="${articleUrl(post.slug)}">Read article <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12h14m-6-6 6 6-6 6"/></svg></a>
    </div>
  </article>`;

  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const preview = document.querySelector("[data-blog-preview]");
  if (preview) preview.innerHTML = posts.slice(0, 3).map(card).join("");

  const list = document.querySelector("[data-blog-list]");
  const featuredHost = document.querySelector("[data-featured-post]");
  const categoriesHost = document.querySelector("[data-blog-categories]");
  const search = document.querySelector("[data-blog-search]");
  const count = document.querySelector("[data-blog-count]");
  const empty = document.querySelector("[data-blog-empty]");
  let activeCategory = "All";

  if (featuredHost && posts.length) {
    const featured = posts.find((post) => post.featured) || posts[0];
    featuredHost.innerHTML = `<article class="featured-post">
      <a class="featured-post-image" href="${articleUrl(featured.slug)}"><img src="${assetPath(featured.image)}" alt="${escapeHtml(featured.title)}" width="1200" height="760"></a>
      <div class="featured-post-copy">
        <div class="article-meta"><span>${escapeHtml(featured.category)}</span><time datetime="${escapeHtml(featured.date)}">${escapeHtml(formatDate(featured.date))}</time></div>
        <h3><a href="${articleUrl(featured.slug)}">${escapeHtml(featured.title)}</a></h3>
        <p>${escapeHtml(featured.summary)}</p>
        <a class="button button-primary" href="${articleUrl(featured.slug)}">Read featured article</a>
      </div>
    </article>`;
  }

  const renderList = () => {
    if (!list) return;
    const query = String(search?.value || "").toLowerCase().trim();
    const filtered = posts.filter((post) => {
      const categoryMatch = activeCategory === "All" || post.category === activeCategory;
      const haystack = [post.title, post.summary, post.category, ...(post.tags || [])].join(" ").toLowerCase();
      return categoryMatch && (!query || haystack.includes(query));
    });
    list.innerHTML = filtered.map(card).join("");
    if (count) count.textContent = `${filtered.length} article${filtered.length === 1 ? "" : "s"} found`;
    if (empty) empty.hidden = filtered.length !== 0;
  };

  if (categoriesHost) {
    const categories = ["All", ...new Set(posts.map((post) => post.category))];
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-button${category === "All" ? " active" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        categoriesHost.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
        renderList();
      });
      categoriesHost.appendChild(button);
    });
  }
  search?.addEventListener("input", renderList);
  renderList();

  const article = document.querySelector("[data-article]");
  const notFound = document.querySelector("[data-article-not-found]");
  if (article) {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const post = posts.find((item) => item.slug === slug);
    if (!post) {
      article.hidden = true;
      const relatedSection = document.querySelector(".related-posts");
      if (relatedSection) relatedSection.hidden = true;
      if (notFound) notFound.hidden = false;
      return;
    }
    const setText = (selector, value) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = value;
    };
    setText("[data-article-breadcrumb]", post.title);
    setText("[data-article-category]", post.category);
    setText("[data-article-title]", post.title);
    setText("[data-article-date]", formatDate(post.date));
    setText("[data-article-author]", `By ${post.author}`);
    setText("[data-article-summary]", post.summary);
    const image = document.querySelector("[data-article-image]");
    if (image) {
      image.src = assetPath(post.image);
      image.alt = post.title;
    }
    const content = document.querySelector("[data-article-content]");
    if (content) {
      content.replaceChildren();
      (post.content || []).forEach((block) => {
        const allowed = block.type === "h2" ? "h2" : block.type === "h3" ? "h3" : "p";
        const element = document.createElement(allowed);
        element.textContent = block.text;
        content.appendChild(element);
      });
    }
    const canonical = `${window.ARIQ_CONFIG?.website || "https://ariqdigital.co.zw"}/article.html?slug=${encodeURIComponent(post.slug)}`;
    document.title = `${post.title} | AriQ Digital Solutions`;
    const updateMeta = (selector, value) => {
      const node = document.querySelector(selector);
      if (node) node.setAttribute("content", value);
    };
    updateMeta('meta[name="description"]', post.summary);
    updateMeta('meta[property="og:title"]', post.title);
    updateMeta('meta[property="og:description"]', post.summary);
    updateMeta('meta[property="og:url"]', canonical);
    updateMeta('meta[property="og:image"]', `${window.ARIQ_CONFIG?.website || "https://ariqdigital.co.zw"}/${post.image}`);
    updateMeta('meta[name="twitter:title"]', post.title);
    updateMeta('meta[name="twitter:description"]', post.summary);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.href = canonical;

    const shareHost = document.querySelector("[data-share-links]");
    if (shareHost) {
      const shareText = encodeURIComponent(post.title);
      const shareUrl = encodeURIComponent(canonical);
      shareHost.innerHTML = `
        <a href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener" aria-label="Share on Facebook">Facebook</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">LinkedIn</a>`;
    }
    const relatedHost = document.querySelector("[data-related-posts]");
    if (relatedHost) {
      const related = posts.filter((item) => item.slug !== post.slug && item.category === post.category).concat(posts.filter((item) => item.slug !== post.slug && item.category !== post.category)).slice(0, 3);
      relatedHost.innerHTML = related.map(card).join("");
    }
    const schema = {
      "@context":"https://schema.org",
      "@type":"Article",
      headline:post.title,
      description:post.summary,
      image:`${window.ARIQ_CONFIG?.website || "https://ariqdigital.co.zw"}/${post.image}`,
      datePublished:post.date,
      dateModified:post.date,
      author:{"@type":"Organization","name":post.author},
      publisher:{"@type":"Organization","name":"AriQ Digital Solutions","logo":{"@type":"ImageObject","url":`${window.ARIQ_CONFIG?.website || "https://ariqdigital.co.zw"}/assets/images/brand/ariq-logo-transparent.png`}},
      mainEntityOfPage:canonical
    };
    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.textContent = JSON.stringify(schema);
    document.head.appendChild(schemaScript);
  }
})();
