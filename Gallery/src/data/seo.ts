/**
 * Search-engine data generated from projects.json at build time (see
 * vite.config.ts): JSON-LD structured data for the page and a sitemap of
 * every project hosted on the site. Pure functions, no DOM.
 */
import type { Project } from "./projects.ts"
import { getSection } from "./sections.ts"

export const SITE_URL = "https://modern-web-mountain.netlify.app"
export const REPO_URL = "https://github.com/AbdulDevHub/Web-Mountain"

const AUTHOR = {
  "@type": "Person",
  name: "Abdul Khan",
  alternateName: "Abdul Hadi Khan",
  url: "https://abdulhadikhan.vercel.app/",
  sameAs: ["https://github.com/AbdulDevHub", "https://www.linkedin.com/in/abdul-hadi-khan"],
}

/** Site-absolute paths ("/Awesome%20Websites/...") become full URLs; external links pass through */
export const absoluteUrl = (href: string) => (/^https?:/.test(href) ? href : SITE_URL + href)

export function structuredData(projects: readonly Project[]): object[] {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Web Mountain",
    url: `${SITE_URL}/`,
    description: `A frontend portfolio of ${projects.length} projects, explored as a low-poly 3D island.`,
    inLanguage: "en",
    author: AUTHOR,
  }

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Web Mountain: a 3D island of frontend projects",
    url: `${SITE_URL}/`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: AUTHOR,
    keywords: "frontend portfolio, Three.js, WebGL, TypeScript, web apps, UI experiments, Chrome extensions",
    codeRepository: REPO_URL,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.name,
          description: p.description,
          url: absoluteUrl(p.href),
          image: absoluteUrl(p.image),
          keywords: p.tags.join(", "),
          genre: getSection(p.section).label,
          author: { "@type": "Person", name: AUTHOR.name },
        },
      })),
    },
  }

  return [website, collection]
}

/** `<script type="application/ld+json">` tags, safe to inline in HTML */
export function structuredDataHtml(projects: readonly Project[]): string {
  return structuredData(projects)
    .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`)
    .join("\n    ")
}

const escapeXml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** The home page plus every project page hosted on this site (GitHub-hosted ones are skipped) */
export function sitemapXml(projects: readonly Project[], lastmod: string): string {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    ...projects.filter((p) => !/^https?:/.test(p.href)).map((p) => ({ loc: absoluteUrl(p.href), priority: "0.6" })),
  ]
  const entries = urls.map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`
}
