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
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function renderMarkdown(markdown = "") {
  const lines = String(markdown).replace(/\r/g, "").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  lines.forEach((line) => {
    const value = line.trim();
    if (!value) { flushParagraph(); flushList(); return; }
    if (value.startsWith("## ")) { flushParagraph(); flushList(); blocks.push(`<h2>${renderInlineMarkdown(value.slice(3))}</h2>`); return; }
    if (value.startsWith("### ")) { flushParagraph(); flushList(); blocks.push(`<h3>${renderInlineMarkdown(value.slice(4))}</h3>`); return; }
    if (value.startsWith("- ")) { flushParagraph(); list.push(value.slice(2)); return; }
    flushList(); paragraph.push(value);
  });
  flushParagraph(); flushList();
  return blocks.join("");
}

async function loadPosts() {
  const response = await fetch(`${BLOG_DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Blog posts could not be loaded.");
  const posts = await response.json();
  return [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function articleCard(post) {
  const image = post.image ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" />` : `<div class="blog-card-placeholder" aria-hidden="true"><span>${escapeHtml(post.category || "AriQ")}</span></div>`;
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
      const cover = post.image ? `<img class="article-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" />` : "";
      postContainer.innerHTML = `<a class="back-link" href="blog.html">← Back to Blog</a><header class="article-header"><p class="eyebrow">${escapeHtml(post.category || "Client Resource")}</p><h1>${escapeHtml(post.title)}</h1><p class="article-excerpt">${escapeHtml(post.excerpt)}</p><div class="article-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time><span>${escapeHtml(post.readTime || "Article")}</span></div></header>${cover}<div class="article-content">${renderMarkdown(post.content)}</div><aside class="article-cta"><h2>Need help with this service?</h2><p>Speak to AriQ Digital Solutions for practical advice, a site assessment, or a quotation.</p><a class="button primary" href="https://wa.me/263781385609?text=${encodeURIComponent(`Hello AriQ, I read your article: ${post.title}. I would like more information.`)}">Chat on WhatsApp</a></aside>`;
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
