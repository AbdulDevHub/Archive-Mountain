# AI Toolkit

Seven AI tools in one site inside Archive Mountain, served at https://archive-mountain.netlify.app/projects/ai-toolkit/.

Verify: npm run build

## Layout
- `src/index.html` + `hub.ts` + `hub.css`: the hub page listing every tool.
- `src/<tool>/index.html` + `main.ts` + `style.css`: one page per tool. Vite picks up every `src/*/index.html` automatically.
- Tools: `translator` (Lingua), `agent` (ReAct Agent), `movies` (ReelRecs), `vision` (Vision Lab), `stocks` (Market Pulse), `images` (Image Studio), `faces` (Face Emotions, face-api.js loaded from `src/public/`).
- `src/shared/`: `nav.ts` (the tool list `TOOLS` and the shared top nav; every page imports it), `theme.css` (dark base; each tool sets `--accent`), `chat.css` (agent + movies), `ai-client.ts` (LLM calls, OpenRouter OAuth PKCE), `access.ts` (sign-in notice + account chip), `dom.ts`, `chrome-ai.d.ts`.
- `src/public/`: `face-api.min.js` and `face-models/`, copied as-is to the build root.
- `../../netlify/functions/*.mts`: `ai-chat` (OpenRouter proxy), `stock-prices` (Polygon), `image-gen` (Pollinations), served at `/api/<name>`. `vite.config.ts` serves them in dev too.
- Netlify env vars: `OPENROUTER_API_KEY` (set), `POLYGON_API_KEY` (Market Pulse), `POLLINATIONS_TOKEN` (optional).
- `apps/`: build output (gitignored). The root `build.sh` copies it to `/projects/ai-toolkit/`; links are relative (`base: "./"`). Card images are `src/<tool>/Screenshot.png`.

## Rules
- Adding a tool: create `src/<slug>/`, add it to `TOOLS` in `src/shared/nav.ts`, and put `<nav class="toolkit-nav" data-current="<slug>">` in its header.
- Never put API keys in client code. LLM calls go through `chat()` in `src/shared/ai-client.ts`, which uses the proxy or the visitor's own OpenRouter key.
- Free models only (`FREE_MODELS` in `ai-client.ts` and `DEFAULT_MODELS` in `ai-chat.mts`; keep the two in sync).
- Prefer on-device/in-browser AI when it fits. Always handle `SignInRequired` by calling `showSignInNotice`.
- Wrap browser storage in try/catch. Pages must work at 390px with no horizontal scroll.

## Status (2026-11-05)
Renamed from AI Valley and combined into one site with a hub and shared nav; Face Detection rebuilt as Face Emotions inside the Vite build.
