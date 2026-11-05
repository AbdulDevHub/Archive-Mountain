import { existsSync, statSync } from "node:fs"
import { resolve } from "node:path"
import sirv from "sirv"
import { defineConfig, type Plugin } from "vite"
import { PROJECTS } from "./src/data/projects.ts"
import { renderDirectoryHtml } from "./src/ui/directory.ts"

const galleryDir = import.meta.dirname
const repoRoot = resolve(galleryDir, "..")

/**
 * In production Netlify serves the whole repo, so the gallery can link to
 * "/Awesome Websites/..." and load screenshots from there. This plugin gives
 * `vite dev` the same behaviour by serving any repo file that exists on disk.
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

export default defineConfig(({ command }) => ({
  root: resolve(galleryDir, "src"),
  // Netlify rewrites "/" to the built page, which lives in Gallery/dist/
  base: command === "build" ? "/Gallery/dist/" : "/",
  plugins: [serveRepoFiles(), prerenderDirectory()],
  build: {
    outDir: resolve(galleryDir, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // three.js + postprocessing are one ~930 kB (237 kB gzip) chunk
  },
  server: {
    fs: { allow: [repoRoot] },
  },
}))
