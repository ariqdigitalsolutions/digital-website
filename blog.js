const BLOG_DATA_URL = "blog-posts.json";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-ZW", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function renderTable(lines) {
  const rows = lines.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  if (rows.length < 2) return "";
  const headers = rows[0];
  const body = rows.slice(2);
  return `<div class="article-table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${headers.map((_, index) => `<td>${renderInlineMarkdown(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderMarkdown(markdown = "") {
  const lines = String(markdown).replace(/\r/g, "").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let orderedList = [];
  let table = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushOrderedList = () => {
    if (orderedList.length) blocks.push(`<ol>${orderedList.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`);
    orderedList = [];
  };
  const flushTable = () => {
    if (table.length) blocks.push(renderTable(table));
    table = [];
  };
  const flushAll = () => { flushParagraph(); flushList(); flushOrderedList(); flushTable(); };

  lines.forEach((line, index) => {
    const value = line.trim();
    if (!value) { flushAll(); return; }
    const next = String(lines[index + 1] || "").trim();
    if (value.startsWith("|") && value.endsWith("|")) {
      flushParagraph(); flushList(); flushOrderedList(); table.push(value);
      if (!(next.startsWith("|") && next.endsWith("|"))) flushTable();
      return;
    }
    flushTable();
    if (value.startsWith("## ")) { flushAll(); blocks.push(`<h2>${renderInlineMarkdown(value.slice(3))}</h2>`); return; }
    if (value.startsWith("### ")) { flushAll(); blocks.push(`<h3>${renderInlineMarkdown(value.slice(4))}</h3>`); return; }
    if (value === "---") { flushAll(); blocks.push("<hr />"); return; }
    if (value.startsWith("> ")) { flushAll(); blocks.push(`<blockquote>${renderInlineMarkdown(value.slice(2))}</blockquote>`); return; }
    if (value.startsWith("- ")) { flushParagraph(); flushOrderedList(); list.push(value.slice(2)); return; }
    if (/^\d+\.\s/.test(value)) { flushParagraph(); flushList(); orderedList.push(value.replace(/^\d+\.\s/, "")); return; }
    flushList(); flushOrderedList(); paragraph.push(value);
  });
  flushAll();
  return blocks.join("");
}

async function loadPosts() {
  const response = await fetch(`${BLOG_DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Blog posts could not be loaded.");
  const posts = await response.json();
  return [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function articleCard(post) {
  const imageAlt = post.imageAlt || post.title;
  const image = post.image ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(imageAlt)}" loading="lazy" />` : `<div class="blog-card-placeholder" aria-hidden="true"><span>${escapeHtml(post.category || "AriQ")}</span></div>`;
  return `<article class="blog-card"><a class="blog-card-media" href="blog-post.html?post=${encodeURIComponent(post.slug)}">${image}</a><div class="blog-card-body"><div class="blog-meta"><span>${escapeHtml(post.category || "General")}</span><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></div><h2><a href="blog-post.html?post=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p><div class="blog-card-footer"><small>${escapeHtml(post.readTime || "Article")}</small><a href="blog-post.html?post=${encodeURIComponent(post.slug)}">Read article →</a></div></div></article>`;
}

async function initialiseBlog() {
  const grid = document.querySelector("[data-blog-grid]");
  const preview = document.querySelector("[data-blog-preview]");
  const postContainer = document.querySelector("[data-blog-post]");
  if (!grid && !preview && !postContainer) return;
  try {
    const posts = await loadPosts();
    if (preview) preview.innerHTML = posts.slice(0, 3).map(articleCard).join("");
    if (grid) {
      const search = document.querySelector("[data-blog-search]");
      const category = document.querySelector("[data-blog-category]");
      const empty = document.querySelector("[data-blog-empty]");
      [...new Set(posts.map((post) => post.category).filter(Boolean))].sort().forEach((item) => category?.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`));
      const render = () => {
        const term = String(search?.value || "").trim().toLowerCase();
        const selected = String(category?.value || "");
        const filtered = posts.filter((post) => (!selected || post.category === selected) && (!term || `${post.title} ${post.excerpt} ${post.category} ${post.content}`.toLowerCase().includes(term)));
        grid.innerHTML = filtered.map(articleCard).join("");
        if (empty) empty.hidden = filtered.length > 0;
      };
      search?.addEventListener("input", render); category?.addEventListener("change", render); render();
    }
    if (postContainer) {
      const slug = new URLSearchParams(window.location.search).get("post");
      const post = posts.find((item) => item.slug === slug);
      if (!post) { postContainer.innerHTML = '<a class="back-link" href="blog.html">← Back to Blog</a><div class="article-error"><h1>Article not found</h1><p>The article may have been moved or removed.</p></div>'; return; }
      document.title = `${post.title} | AriQ Digital Solutions`;
      document.querySelector("[data-post-description]")?.setAttribute("content", post.excerpt);
      const cover = post.image ? `<img class="article-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />` : "";
      const serviceButton = post.serviceUrl ? `<a class="button secondary" href="${escapeHtml(post.serviceUrl)}">View ${escapeHtml(post.serviceName || "service")}</a>` : "";
      const related = posts.filter((item) => item.category === post.category && item.slug !== post.slug).slice(0, 2);
      const relatedSection = related.length ? `<section class="related-articles"><div class="section-heading"><div><p class="eyebrow">Related Resources</p><h2>More about ${escapeHtml(post.category)}</h2></div></div><div class="blog-grid related-grid">${related.map(articleCard).join("")}</div></section>` : "";
      postContainer.innerHTML = `<a class="back-link" href="blog.html">← Back to Blog</a><header class="article-header"><p class="eyebrow">${escapeHtml(post.category || "Client Resource")}</p><h1>${escapeHtml(post.title)}</h1><p class="article-excerpt">${escapeHtml(post.excerpt)}</p><div class="article-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time><span>${escapeHtml(post.readTime || "Article")}</span></div></header>${cover}<div class="article-content">${renderMarkdown(post.content)}</div><aside class="article-cta"><div><h2>Need help with this service?</h2><p>Speak to AriQ Digital Solutions for practical advice, a site assessment or a quotation.</p></div><div class="article-cta-actions"><a class="button primary" href="https://wa.me/263781385609?text=${encodeURIComponent(`Hello AriQ, I read your article: ${post.title}. I would like more information.`)}">Chat on WhatsApp</a>${serviceButton}</div></aside>${relatedSection}`;
    }
  } catch (error) {
    const message = '<div class="article-error"><h2>Unable to load articles</h2><p>Please refresh the page or try again later.</p></div>';
    if (grid) grid.innerHTML = message;
    if (preview) preview.innerHTML = message;
    if (postContainer) postContainer.innerHTML = message;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", initialiseBlog);
