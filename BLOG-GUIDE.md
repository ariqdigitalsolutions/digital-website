# AriQ Blog Publishing Guide

The blog is designed for a static GitHub Pages website. Articles are stored in one JavaScript data file so a new post can be added without editing the blog listing or article template.

## Files used by the blog

```text
blog.html
article.html
assets/js/blog-data.js
assets/js/blog.js
tools/blog-post-builder.html
```

## Add an article

### 1. Prepare the featured image

- Remove confidential client information.
- Resize the image to a practical web size, normally 1200–1400 px wide.
- Convert it to WebP where possible.
- Place it in `assets/images/gallery/full/` or create a dedicated `assets/images/blog/` folder.
- Use a descriptive filename such as `starlink-installation-guide.webp`.

### 2. Create the article object

Open `tools/blog-post-builder.html` in a browser.

Complete:

- title
- slug
- date
- author
- category
- featured image path
- summary
- article content
- search tags

Use a line beginning with `## ` to create a section heading. Blank lines create separate paragraphs.

Select **Generate post object**, review the result and copy it.

### 3. Add it to the data file

Open:

```text
assets/js/blog-data.js
```

The file contains:

```js
window.ARIQ_BLOG_POSTS = [
  { ...existing article... },
  { ...existing article... }
];
```

Paste the new object inside the square brackets. Add a comma between the previous article and the new one.

Only one post should normally have:

```js
"featured": true
```

### 4. Test before publishing

Open:

- `blog.html`
- `article.html?slug=your-new-slug`

Confirm:

- the card displays
- the image loads
- category filtering works
- search finds the article
- headings and paragraphs are correct
- related posts display
- sharing links open correctly
- the WhatsApp call to action works

### 5. Update the sitemap

Add the article URL to `sitemap.xml`:

```xml
<url>
  <loc>https://ariqdigital.co.zw/article.html?slug=your-new-slug</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

## Online admin dashboard

A secure browser-based dashboard cannot be created safely using only public HTML and JavaScript. Authentication, image uploads and publishing permissions require a backend or a trusted CMS.

Good upgrade options include:

- Decap CMS connected to GitHub
- WordPress
- a custom Supabase administration portal with server-side security
- a headless CMS with a server-rendered website

Do not create a public page that stores a GitHub personal access token in code or browser storage.
