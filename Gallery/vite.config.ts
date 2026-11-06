import { existsSync, statSync } from "node:fs"
import { resolve } from "node:path"
import sirv from "sirv"
import { defineConfig, type Plugin } from "vite"
import { PROJECTS } from "./src/data/projects.ts"
import { SITE_URL, sitemapXml, structuredDataHtml } from "./src/data/seo.ts"
import { renderDirectoryHtml } from "./src/ui/directory.ts"

const galleryDir = import.meta.dirname
const repoRoot = resolve(galleryDir, "..")

/**
 * In production build.sh copies each gallery project into _site/ at its repo
 * path, so the gallery can link to "/Websites/..." and load screenshots from
 * there. This plugin gives `vite dev` the same behaviour by serving any repo
 * file that exists on disk.
 */
function serveRepoFiles(): Plugin {
  const serve = sirv(repoRoot, { dev: true, etag: true })
  return {
    name: "serve-repo-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? "/").split("?")[0])
        if (path === "/" || path.startsWith("/@")) return next()
        const file = resolve(repoRoot, "." + path)
        if (!file.startsWith(repoRoot) || !existsSync(file) || !statSync(file).isFile()) return next()
        serve(req, res, next)
      })
    },
  }
}

/**
 * Writes the full project directory into the HTML at build time, so crawlers,
 * no-JS visitors and devices without WebGL still get every project.
 */
function prerenderDirectory(): Plugin {
  return {
    name: "prerender-directory",
    transformIndexHtml: (html) => html.replace("<!--project-directory-->", renderDirectoryHtml(PROJECTS)),
  }
}

/**
 * SEO from the same project data: fills %PROJECT_COUNT% / %SITE_URL% in the
 * meta tags, inlines JSON-LD structured data, and emits sitemap.xml at the site root.
 */
function seo(): Plugin {
  return {
    name: "seo",
    transformIndexHtml: (html) =>
      html
        .replaceAll("%PROJECT_COUNT%", String(PROJECTS.length))
        .replaceAll("%SITE_URL%", SITE_URL)
        .replace("<!--structured-data-->", structuredDataHtml(PROJECTS)),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml(PROJECTS, today) })
    },
  }
}

export default defineConfig(() => ({
  root: resolve(galleryDir, "src"),
  // build.sh copies dist/ to the root of _site/, so the gallery is the front page
  base: "/",
  // Icons, the manifest and robots.txt are copied as-is to the site root
  publicDir: resolve(galleryDir, "public"),
  plugins: [serveRepoFiles(), prerenderDirectory(), seo()],
  build: {
    outDir: resolve(galleryDir, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // three.js + postprocessing are one ~930 kB (237 kB gzip) chunk
  },
  server: {
    fs: { allow: [repoRoot] },
  },
}))
