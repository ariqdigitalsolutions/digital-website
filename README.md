# AriQ Digital Solutions Website

A complete static business website for **AriQ Digital Solutions**, designed for GitHub Pages and the custom domain `ariqdigital.co.zw`.

**Tagline:** CONNECT • SECURE • GROW

## Open and publish the website

1. Extract the ZIP.
2. Open `index.html` to review the content locally.
3. Upload the complete contents of this folder to the root of the GitHub Pages repository.
4. Keep `CNAME` in the repository root.
5. In GitHub, open **Settings → Pages** and publish from the correct branch/root folder.
6. Test the live domain after deployment.

The project has no build step and does not require Node.js, PHP or a database.

## Project structure

```text
index.html
contact.html
gallery.html
blog.html
article.html
order.html
services/
policies/
tools/
assets/
  css/styles.css
  js/config.js
  js/packages.js
  js/blog-data.js
  images/brand/
  images/gallery/
robots.txt
sitemap.xml
manifest.webmanifest
CNAME
```

## Update contact and social media details

Open:

```text
assets/js/config.js
```

Update these values in one place:

- `phoneDisplay`
- `phoneHref`
- `whatsappNumber`
- `whatsappMessage`
- `email`
- `location`
- `operatingHours`
- social URLs under `social`

Example:

```js
social: {
  facebook: "https://www.facebook.com/your-page",
  instagram: "https://www.instagram.com/your-account",
  tiktok: "https://www.tiktok.com/@your-account",
  linkedin: "https://www.linkedin.com/company/your-company",
  youtube: "https://www.youtube.com/@your-channel"
}
```

Leave a social URL empty to hide that icon. Links automatically open in a new tab and include accessible labels.

## Update Starlink packages

Open:

```text
assets/js/packages.js
```

Each package contains:

- `id`
- `name`
- `badge`
- `price`
- `priceLabel`
- `monthly`
- `monthlyLabel`
- `suitable`
- `features`
- `cta`

Edit only the text values. Keep commas and quotation marks intact. Final prices, plan terms and availability should always be confirmed with customers before accepting an order.

## Update services

Service pages are located in:

```text
services/
```

The main files are:

- `starlink.html`
- `network-solutions.html`
- `cctv-security.html`
- `website-design.html`
- `it-support.html`
- `digital-marketing.html`
- `vehicle-licensing.html`
- `mobile-app-development.html`

The homepage service cards are in `index.html`. When adding a completely new service, create the service page, add its card and links, and add the canonical URL to `sitemap.xml`.

## Update gallery images

Optimised images are stored in:

```text
assets/images/gallery/full/
assets/images/gallery/thumbs/
```

For best performance:

1. Export the large image as WebP, ideally no wider than 1400 px.
2. Export a 640 × 480 WebP thumbnail.
3. Use the same filename in both folders.
4. Add the new gallery card in `gallery.html`.
5. Add a descriptive `alt` value and the correct `data-category`.

Do not stretch a small image to make it look larger. Remove personal or confidential information from client project photographs before publishing.

## Add blog articles

See `BLOG-GUIDE.md` for full instructions.

The article data file is:

```text
assets/js/blog-data.js
```

A local post preparation tool is included at:

```text
tools/blog-post-builder.html
```

It creates an article object for copying into the data file. It does **not** upload files or request GitHub credentials.

## Contact form behaviour

The contact and Starlink enquiry forms validate required fields in the browser. After validation, the website:

- opens WhatsApp with the completed enquiry; or
- opens the visitor's email application with the completed enquiry.

No enquiry is stored in a website database.

## SEO

Every main page includes:

- a unique title and meta description
- canonical URL
- Open Graph and Twitter metadata
- semantic headings
- descriptive image alternatives
- internal links
- structured data
- `robots.txt`
- `sitemap.xml`

When adding or removing public pages, also update `sitemap.xml`.

The dynamic blog article template updates the page title, metadata and Article schema in JavaScript. A server-rendered CMS is recommended later when maximum article SEO is required.

## Policies and cookie notice

Placeholder policy pages are in `policies/`. They should be reviewed by a qualified Zimbabwean legal or compliance professional and updated to match the business's actual data, payment, warranty and service practices before public use.

The current cookie notice stores only a local preference indicating whether the notice was accepted or dismissed. Update the privacy and cookie pages before adding analytics, advertising pixels or embedded marketing tools.

## Features that require a backend or CMS

The following are intentionally not implemented in the public static frontend:

- password-protected online blog administration
- remote image upload and media management
- storing form enquiries in a database
- sending email directly from the website
- staff accounts and permissions
- customer accounts or order tracking
- online payments
- automatic CRM integration
- server-side spam protection
- server-rendered blog pages
- secure analytics dashboards

Recommended future options:

1. **Decap CMS with GitHub authentication** for a light Git-based editor.
2. **WordPress** for a traditional content-management system.
3. **Supabase plus a secure server/API** for custom accounts, enquiries and administration.
4. **A server-rendered framework such as Next.js** for advanced SEO, CMS integration and structured content.

Never place database service keys, GitHub tokens, passwords or private API credentials in frontend JavaScript.

## Security checklist

- Keep secrets out of all public files.
- Use only HTTPS links on the live site.
- Review all external URLs before publishing.
- Keep third-party dependencies to a minimum.
- Confirm project-photo permission.
- Review policy wording.
- Test forms after changing configuration.
- Inspect the browser console after every major update.

## Browser and device support

The layout is designed for modern versions of Chrome, Edge, Firefox and Safari on phones, tablets, laptops and desktops. Reduced-motion preferences are respected.
