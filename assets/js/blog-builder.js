(() => {
  "use strict";
  const form = document.querySelector("[data-post-builder]");
  const output = document.querySelector("[data-builder-output]");
  const status = document.querySelector("[data-builder-status]");
  const copyButton = document.querySelector("[data-copy-output]");
  if (!form || !output) return;

  const title = form.elements.namedItem("title");
  const slug = form.elements.namedItem("slug");
  const date = form.elements.namedItem("date");
  date.value = new Date().toISOString().slice(0, 10);

  const slugify = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  title.addEventListener("input", () => {
    if (!slug.dataset.edited) slug.value = slugify(title.value);
  });
  slug.addEventListener("input", () => { slug.dataset.edited = "true"; });

  const parseContent = (value) => String(value || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) return { type:"h2", text:block.slice(3).trim() };
      if (block.startsWith("### ")) return { type:"h3", text:block.slice(4).trim() };
      return { type:"p", text:block.replace(/\s*\n\s*/g, " ") };
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Complete all required fields before generating the post.";
      status.className = "form-status error";
      return;
    }
    const data = new FormData(form);
    const post = {
      slug:String(data.get("slug")).trim(),
      title:String(data.get("title")).trim(),
      date:String(data.get("date")).trim(),
      author:String(data.get("author")).trim(),
      category:String(data.get("category")).trim(),
      featured:data.get("featured") === "on",
      image:String(data.get("image")).trim().replace(/^\/+/, ""),
      summary:String(data.get("summary")).trim(),
      content:parseContent(data.get("content")),
      tags:String(data.get("tags") || "").split(",").map((item) => item.trim()).filter(Boolean)
    };
    output.value = JSON.stringify(post, null, 2);
    status.textContent = "Post object generated. Review it, then copy it into the blog data array.";
    status.className = "form-status success";
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      date.value = new Date().toISOString().slice(0, 10);
      slug.dataset.edited = "";
      output.value = "";
      status.textContent = "";
      status.className = "form-status";
    }, 0);
  });

  copyButton?.addEventListener("click", async () => {
    if (!output.value) {
      status.textContent = "Generate an article object before copying.";
      status.className = "form-status error";
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Copied. Paste the object into assets/js/blog-data.js.";
      status.className = "form-status success";
    } catch (_) {
      output.focus();
      output.select();
      document.execCommand("copy");
      status.textContent = "Output selected and copied where supported.";
      status.className = "form-status success";
    }
  });
})();
