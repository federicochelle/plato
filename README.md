# PLATO

PLATO is a static restaurant website for a daily menu and an evolving food proposal in Centro, Montevideo.

## Pages and features

- `index.html`: landing page with daily menu, weekly menu modal, responsive navigation, galleries with lightbox controls, press links, location details, and WhatsApp calls to action.
- `page.html`: proposal page with responsive navigation, editorial content, image galleries, and links back to the landing page.
- The daily and weekly menu are loaded from the configured Google Apps Script endpoint in `js/menu.js`.

## Technology

- Semantic HTML
- CSS with `@import`-based organization
- Vanilla JavaScript
- Local image, video, icon, and font assets
- Google Fonts and the configured Google Apps Script menu endpoint

No framework or build step is required.

## Structure

```text
.
├── index.html
├── page.html
├── css/          # Shared and page-specific stylesheets
├── js/           # Navigation, gallery, modal, and menu behavior
├── assets/       # Images and hero video
├── CNAME         # GitHub Pages custom domain
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## Run locally

Serve the repository directory with any static HTTP server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` and `http://localhost:8000/page.html`.

## Configuration

The menu endpoint is configured in `js/menu.js` as `MENU_API_URL`. Replace it only with the approved public endpoint for the menu data. No local environment variables are required by the current code.

## Deployment

The repository is prepared for GitHub Pages as a static site. The `CNAME` file configures the custom domain, and the repository currently uses the `main` branch without a build step. Keep the existing Pages source settings unchanged.
