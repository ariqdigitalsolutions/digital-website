# AriQ Blog Publishing Guide

## Public blog
- `blog.html` displays all articles.
- `blog-post.html?post=article-slug` displays an individual article.
- The homepage automatically displays the three newest articles.
- Articles are stored in `blog-posts.json`.

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
- Use `**text**` for bold text.
- Use `[link name](https://example.com)` for a web link.

## Security
- The publisher never stores the GitHub token in the website files or browser storage.
- Use a fine-grained token restricted to this repository only.
- Revoke or rotate the token from GitHub whenever necessary.
