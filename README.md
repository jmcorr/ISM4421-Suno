# AI Music Studio

A one-page app that generates original songs from a text prompt, built on the
[Suno API](https://docs.sunoapi.org) and designed to deploy straight to Netlify.

## How it works

- `index.html` — the entire UI (form, polling, player, credits badge, lyrics helper). No build step, no framework.
- `netlify/functions/` — small serverless functions that hold your Suno API key server-side and forward requests to `api.sunoapi.org`. The key never reaches the browser.
  - `generate.js` — starts a music generation task
  - `status.js` — polls a task's status (music or lyrics)
  - `credits.js` — reads your remaining Suno credits
  - `lyrics.js` — generates standalone lyrics
  - `callback.js` — accepts Suno's completion webhook (the app itself polls `status.js` instead of relying on this, but the API requires a `callBackUrl` to be supplied)

The frontend never talks to Suno directly. It only calls its own `/.netlify/functions/*`
endpoints, which attach the API key. This is the standard way to keep a paid API
key out of client-side JavaScript — without it, anyone could open dev tools, copy
your key, and spend your credits.

## Deploy to Netlify

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Netlify: **Add new site > Import an existing project**, pick this repo.
   - Build command: leave blank
   - Publish directory: `.`
   - Netlify auto-detects the functions in `netlify/functions` — no extra config needed.
3. After the first deploy, go to **Site configuration > Environment variables** and add:
   - `SUNO_API_KEY` = your key from the [Suno API key page](https://sunoapi.org/api-key)
4. Redeploy (or trigger a new deploy) so the function picks up the environment variable.

That's it — no proxy server, no Docker, no extra hosting. Netlify Functions run
alongside the static site automatically.

## Local development

```bash
npm install -g netlify-cli   # once
netlify dev
```

`netlify dev` serves `index.html` and runs the functions locally on the same
port, so relative fetches to `/.netlify/functions/...` work without any CORS
setup. Create a `.env` file (already git-ignored) with:

```
SUNO_API_KEY=your_key_here
```

## Features

- **Simple mode** — describe the song you want, AI handles lyrics and structure.
- **Custom mode** — set title, style, your own lyrics (or let AI write them), things to avoid, and vocal gender preference.
- **Instrumental toggle** and **model picker** (V6 recommended; legacy V4/V5-series models available).
- **Live status polling** through the generation stages (queued → composing → done), no manual refresh.
- **Player + download** for each generated track, plus remaining-credits display.
- **Lyrics-only generator** as a bonus tool — write lyrics first, then send them into Custom mode.

## Notes

- Generated audio is hosted by Suno for about 15 days — download anything you want to keep.
- If credits show `—` or generation fails immediately, double check `SUNO_API_KEY` is set in Netlify's environment variables and redeploy.
