const adminForm = document.querySelector("[data-blog-admin]");
const statusBox = document.querySelector("[data-admin-status]");
const todayInput = adminForm?.querySelector('[name="date"]');
if (todayInput && !todayInput.value) todayInput.value = new Date().toISOString().slice(0, 10);

const setStatus = (message, type = "") => {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
};

const slugify = (value) => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const encodeBase64Utf8 = (text) => btoa(unescape(encodeURIComponent(text)));
const decodeBase64Utf8 = (text) => decodeURIComponent(escape(atob(text.replace(/\n/g, ""))));

async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub request failed (${response.status}).`);
  }
  return response.json();
}

async function fileToBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
  return dataUrl.split(",")[1];
}

adminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminForm.reportValidity()) return;
  const button = adminForm.querySelector('button[type="submit"]');
  const data = new FormData(adminForm);
  const owner = String(data.get("owner") || "").trim();
  const repo = String(data.get("repo") || "").trim();
  const branch = String(data.get("branch") || "main").trim();
  const token = String(data.get("token") || "").trim();
  const title = String(data.get("title") || "").trim();
  const slug = slugify(title);
  const imageFile = data.get("image");
  if (!slug) { setStatus("Please enter a title that can be used as a web address.", "error"); return; }
  button.disabled = true;
  setStatus("Connecting to GitHub and checking the current blog file…", "working");
  try {
    const apiBase = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`;
    const postsPath = "blog-posts.json";
    const current = await githubRequest(`${apiBase}/${postsPath}?ref=${encodeURIComponent(branch)}`, token);
    const posts = JSON.parse(decodeBase64Utf8(current.content));
    if (posts.some((post) => post.slug === slug)) throw new Error("An article with this title already exists. Change the title slightly and try again.");
    let imagePath = "";
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) throw new Error("The cover image must be smaller than 5 MB.");
      const extension = (imageFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      imagePath = `blog-images/${slug}.${extension}`;
      setStatus("Uploading the cover image…", "working");
      await githubRequest(`${apiBase}/${imagePath}`, token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Add blog image: ${title}`, content: await fileToBase64(imageFile), branch }) });
    }
    const post = { slug, title, excerpt: String(data.get("excerpt") || "").trim(), date: String(data.get("date") || "").trim(), category: String(data.get("category") || "").trim(), readTime: String(data.get("readTime") || "").trim(), image: imagePath, content: String(data.get("content") || "").trim() };
    posts.unshift(post);
    setStatus("Publishing the article…", "working");
    await githubRequest(`${apiBase}/${postsPath}`, token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Publish blog article: ${title}`, content: encodeBase64Utf8(JSON.stringify(posts, null, 2)), sha: current.sha, branch }) });
    setStatus("Article published successfully. GitHub Pages will show it after the new commit is deployed.", "success");
    adminForm.querySelector('[name="title"]').value = ""; adminForm.querySelector('[name="excerpt"]').value = ""; adminForm.querySelector('[name="content"]').value = ""; adminForm.querySelector('[name="image"]').value = "";
  } catch (error) {
    setStatus(error.message || "The article could not be published.", "error");
  } finally { button.disabled = false; }
});
