# AriQ Blog Publishing Guide

## Public blog
- `blog.html` displays all articles.
- `blog-post.html?post=article-slug` displays an individual article.
- The homepage automatically displays the three newest articles.
- Articles are stored in `blog-posts.json`.
- Each service page displays its two matching resource articles.

## Included content
The website now includes two detailed articles for each service category:
- Starlink WiFi Solutions
- Web Development
- Mobile Development
- WhatsApp Chatbots & Business Automation
- CCTV & Security Systems
- IT Support

## Publish from the browser
1. Open `blog-admin.html` on the live website. This page is intentionally not linked in the public navigation.
2. In GitHub, create a fine-grained personal access token for only the website repository. Give it **Contents: Read and write** permission.
3. Enter the repository owner, repository name, branch, and token.
4. Write the title, summary, category, content, and optionally select a cover image.
5. Click **Publish Article**. The tool uploads the image, updates `blog-posts.json`, and creates a GitHub commit.
6. GitHub Pages will publish the updated site after the commit is deployed.

## Article formatting
- Use `## Heading` for a main section heading.
- Use `### Heading` for a smaller heading.
- Use `- Item` for bullet points.
- Use `1. Item` for numbered steps.
- Use `**text**` for bold text.
- Use `` `text` `` for inline code or technical labels.
- Use `[link name](https://example.com)` for a web link.
- Use `> Important note` for a callout.
- Use a Markdown table:

```
| Option | Benefit | Limitation |
| --- | --- | --- |
| Example | Useful detail | Trade-off |
```

## Cover images
- Existing article covers are stored in `blog-images/`.
- Recommended ratio: 16:9.
- Recommended size: 1200 × 675 pixels or larger.
- Use descriptive alternative text in the `imageAlt` field when editing JSON directly.

## Security
- The publisher never stores the GitHub token in the website files or browser storage.
- Use a fine-grained token restricted to this repository only.
- Revoke or rotate the token from GitHub whenever necessary.
