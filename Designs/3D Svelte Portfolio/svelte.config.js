import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// build.sh sets BASE_PATH (e.g. "/projects/3d-svelte-portfolio/") for the gallery's static deploy
const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Every page is prerendered from Prismic at build time into build/.
		// strict: false skips the Prismic preview endpoints, which only work on a server.
		adapter: adapter({ strict: false }),
		paths: { base, relative: false }
	}
};

export default config;
