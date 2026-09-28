# AI Music Studio

A one-page app that generates original songs from a text prompt, built on the
[Suno API](https://docs.sunoapi.org) and designed to deploy straight to Netlify.

## How it works

- `index.html` — the entire UI: a key-entry gate, then the generator (form, polling, player, credits badge, lyrics helper). No build step, no framework.
- `netlify/functions/` — small serverless functions that relay requests to `api.sunoapi.org`.
  - `generate.js` — starts a music generation task
  - `status.js` — polls a task's status (music or lyrics)
  - `credits.js` — reads the caller's remaining Suno credits
  - `lyrics.js` — generates standalone lyrics
  - `callback.js` — accepts Suno's completion webhook (the app itself polls `status.js` instead of relying on this, but the API requires a `callBackUrl` to be supplied)

**Bring-your-own-key model:** each visitor pastes their own Suno API key into
the app before they can generate anything. It's saved in that visitor's
browser (`localStorage`) and sent with each request via an `X-Suno-Key`
header. The Netlify Functions only relay that key straight through to Suno
for the current request — they never log it, persist it, or store it as
server-side config. This means:

- You don't pay for other people's usage — everyone spends their own Suno credits.
- There's no `SUNO_API_KEY` environment variable to set up in Netlify. Nothing to configure there at all.
- A backend relay is still needed (rather than calling Suno directly from the browser) so the app works regardless of whether Suno's API allows cross-origin browser requests — the browser only ever talks to your own site, same-origin.

## Deploy to Netlify

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Netlify: **Add new site > Import an existing project**, pick this repo.
   - Build command: leave blank
   - Publish directory: `.`
   - Netlify auto-detects the functions in `netlify/functions` — no extra config, no environment variables needed.
3. Deploy. That's it.

Each visitor (including you) will be asked to paste a Suno API key the first
time they open the site. Get one at the [Suno API key page](https://sunoapi.org/api-key).

## Local development

```bash
npm install -g netlify-cli   # once
netlify dev
```

`netlify dev` serves `index.html` and runs the functions locally on the same
port, so relative fetches to `/.netlify/functions/...` work without any CORS
setup. No `.env` file needed — just paste a key into the running app like any
other visitor would.

## Features

- **Key gate** — visitors paste their own Suno API key before the app unlocks; it's remembered in their browser for next time, with a "use a different key" link to swap it.
- **Simple mode** — describe the song you want, AI handles lyrics and structure.
- **Custom mode** — set title, style, your own lyrics (or let AI write them), things to avoid, and vocal gender preference.
- **Instrumental toggle** and **model picker** (V6 recommended; legacy V4/V5-series models available).
- **Live status polling** through the generation stages (queued → composing → done), no manual refresh.
- **Player + download** for each generated track, plus remaining-credits display.
- **Lyrics-only generator** as a bonus tool — write lyrics first, then send them into Custom mode.
- If a saved key stops working (revoked, out of credits, etc.), the app automatically drops back to the key-entry gate with an explanation.

## Notes

- Generated audio is hosted by Suno for about 15 days — download anything you want to keep.
- Anyone with access to a visitor's browser could read their key back out of `localStorage` via dev tools — the same tradeoff any "paste your API key" tool makes. Don't use this pattern for keys you can't afford to have exposed on a shared/public computer.
