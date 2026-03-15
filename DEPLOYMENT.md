# Deployment Guide

This guide covers deploying Atlasia to Vercel — the recommended platform — as well as self-hosting options.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deploy to Vercel (Recommended)](#deploy-to-vercel-recommended)
  - [1. Fork / clone the repository](#1-fork--clone-the-repository)
  - [2. Import into Vercel](#2-import-into-vercel)
  - [3. Configure environment variables](#3-configure-environment-variables)
  - [4. Deploy](#4-deploy)
- [Vercel Plan Requirements](#vercel-plan-requirements)
- [Environment Variables Reference](#environment-variables-reference)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Self-Hosting (Docker / Node)](#self-hosting-docker--node)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying you need **at minimum**:

- A [Vercel account](https://vercel.com/signup) (free Hobby plan works with limitations — see [Plan Requirements](#vercel-plan-requirements))
- An **OpenAI API key** — required for all text generation and TTS audio

Optionally:
- A [MapTiler API key](https://www.maptiler.com) (free tier, no credit card) for the 3D globe map
- A [Lingo.dev API key](https://lingo.dev) for multilingual UI localization
- A Gemini or Groq key if you prefer those providers over OpenAI

---

## Deploy to Vercel (Recommended)

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AgarwalChetan/Atlasia)

This clones the repo to your GitHub account and opens the Vercel import wizard. Skip ahead to [Configure environment variables](#3-configure-environment-variables).

---

### 1. Fork / clone the repository

If you want to deploy your own fork:

```bash
git clone https://github.com/AgarwalChetan/Atlasia.git
cd Atlasia
```

Push to your own GitHub/GitLab/Bitbucket account.

---

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** and select your fork (or the original repo)
3. Vercel auto-detects **Next.js** — confirm the framework preset
4. The `vercel.json` in the repo configures `installCommand` (`bun install`) and `buildCommand` (`bun run build`) automatically — no manual override needed

---

### 3. Configure environment variables

In the Vercel project dashboard, go to **Settings → Environment Variables** and add the following.

#### Minimum required (all environments)

| Variable | Value |
|---|---|
| `USE_OPENAI` | `true` |
| `OPENAI_API_KEY` | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |

#### Full variable set (recommended)

```
# AI Provider — pick one
USE_OPENAI=true
USE_GEMINI=false
USE_GROQ=false

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=           # only if USE_GEMINI=true
GROQ_API_KEY=             # only if USE_GROQ=true or SPEECH_PROVIDER=groq

# Model overrides (optional — these are the defaults)
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-2.0-flash
GROQ_MODEL=llama-3.3-70b-versatile

# Speech
SPEECH_PROVIDER=openai    # or "groq" for free Whisper STT

# Map (optional — enables 3D globe. Falls back to Leaflet/OSM without this)
NEXT_PUBLIC_MAPTILER_KEY=

# Localization (optional — enables multilingual UI)
LINGO_DEV_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

> **Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-only and never sent to the client.

---

### 4. Deploy

Click **Deploy**. Vercel will:

1. Clone the repo
2. Run `bun install`
3. Run `bun run build` (Next.js static + serverless build)
4. Deploy static pages to the CDN edge, API routes as serverless functions

Your app will be live at `https://<project-name>.vercel.app` within ~1 minute.

---

## Vercel Plan Requirements

The `vercel.json` in this project sets custom `maxDuration` values for AI routes because AI generation can take longer than the default 10-second timeout.

| Route | `maxDuration` | Reason |
|---|---|---|
| `/api/travel-guide` | 60s | Long-form destination guide generation |
| `/api/itinerary` | 60s | Multi-day trip itinerary generation |
| `/api/translate` | 30s | Translation with context |
| `/api/translate-ui` | 30s | UI string localization |
| `/api/phrases` | 30s | Travel phrase generation |
| `/api/cultural-intelligence` | 30s | Cultural tips generation |
| `/api/nearby-places` | 30s | Overpass API with 20s internal timeout |
| `/api/speech/transcribe` | 30s | Audio upload + Whisper transcription |
| `/api/speech/tts` | 30s | Text-to-speech audio synthesis |

### Plan comparison

| Plan | Function timeout | Compatible |
|---|---|---|
| **Hobby** (free) | 10s max | Partial — short requests may work; AI routes will often time out |
| **Pro** ($20/mo) | 300s max | Full — all routes work reliably |
| **Enterprise** | 900s max | Full |

> **Recommendation:** Use the **Pro plan** for a production deployment. On the Hobby plan, `/api/travel-guide` and `/api/itinerary` will consistently time out, and other AI routes may time out on slower responses.

---

## Environment Variables Reference

Full reference for every supported variable:

| Variable | Required | Default | Description |
|---|---|---|---|
| `USE_OPENAI` | One of these must be `true` | — | Use OpenAI for text generation |
| `USE_GEMINI` | One of these must be `true` | — | Use Google Gemini for text generation |
| `USE_GROQ` | One of these must be `true` | — | Use Groq for text generation |
| `OPENAI_API_KEY` | **Always** | — | Required for TTS (`tts-1`) on every page, even if not using OpenAI for text |
| `GEMINI_API_KEY` | If `USE_GEMINI=true` | — | Google AI Studio API key |
| `GROQ_API_KEY` | If `USE_GROQ=true` or `SPEECH_PROVIDER=groq` | — | Groq Cloud API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Override the OpenAI text model |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Override the Gemini model |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Override the Groq model |
| `SPEECH_PROVIDER` | No | `openai` | STT provider: `openai` or `groq` |
| `NEXT_PUBLIC_MAPTILER_KEY` | No | — | MapTiler key for 3D globe map. Falls back to Leaflet + OSM without it |
| `LINGO_DEV_API_KEY` | No | — | Lingo.dev key for multilingual UI localization |
| `NEXT_PUBLIC_APP_URL` | Recommended | `http://localhost:3000` | Your production URL |
| `ELEVENLABS_API_KEY` | No | — | Reserved for future enhanced TTS, not used yet |

---

## Post-Deployment Checklist

After your first deploy, verify each feature:

- [ ] **Home page** loads with animated stats and feature cards
- [ ] **Map** renders (at minimum Leaflet/OSM fallback — no key required)
- [ ] **Map** 3D globe loads if `NEXT_PUBLIC_MAPTILER_KEY` is set
- [ ] **Travel Guide** — type a destination and generate a guide
- [ ] **Itinerary** — generate a multi-day itinerary
- [ ] **Cultural Intelligence** — generate cultural tips
- [ ] **Phrases** — generate travel phrases with audio playback (requires `OPENAI_API_KEY` for TTS)
- [ ] **Conversation** — test text translation; test microphone input if on HTTPS
- [ ] **Emergency** — verify emergency numbers display for a country
- [ ] **Language switcher** in the navbar works (requires `LINGO_DEV_API_KEY` for full localization)

> **Note:** Microphone access (`/conversation` page) requires **HTTPS**. Vercel deployments are HTTPS by default, but `localhost` is also allowed by browsers.

---

## Self-Hosting (Docker / Node)

If you prefer to host outside Vercel:

### Node.js (standard Next.js)

```bash
# Install dependencies
bun install

# Build
bun run build

# Start production server
bun start
```

The server starts on port 3000 by default. Use a reverse proxy (nginx, Caddy) in front of it.

### Docker

Create a `Dockerfile` in the project root:

```dockerfile
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

Enable standalone output in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  // ... rest of config
};
```

Build and run:

```bash
docker build -t atlasia .
docker run -p 3000:3000 --env-file .env.local atlasia
```

---

## Troubleshooting

### Build fails on Vercel

**Symptom:** Build error mentioning missing modules or TypeScript errors.

**Fix:** Ensure the `bun.lock` file is committed. Vercel uses `bun install --frozen-lockfile` when a lockfile is present.

---

### AI routes return 504 Gateway Timeout

**Symptom:** `/api/travel-guide`, `/api/itinerary`, or other AI routes return a 504 error.

**Cause:** You are on the Vercel Hobby plan (10s limit) and the AI response took longer than 10 seconds.

**Fix:** Upgrade to Vercel Pro, or switch to a faster model (e.g. `GROQ_MODEL=llama-3.1-8b-instant`).

---

### Map shows blank / broken tiles

**Symptom:** The map loads but shows no tiles or a gray background.

**Causes & fixes:**
- **No MapTiler key:** This is expected — the map falls back to Leaflet + OpenStreetMap automatically. If it's still blank, check browser console for errors.
- **Invalid MapTiler key:** Verify `NEXT_PUBLIC_MAPTILER_KEY` is set correctly in Vercel environment variables and that the key has the correct permissions on your MapTiler account.
- **CSP / CORS:** If self-hosting, ensure your reverse proxy does not block requests to `api.maptiler.com` or `tile.openstreetmap.org`.

---

### TTS / phrases audio does not play

**Symptom:** Phrases generate but the play button does nothing or throws an error.

**Cause:** `OPENAI_API_KEY` is missing or invalid. TTS always uses OpenAI regardless of the selected text provider.

**Fix:** Ensure `OPENAI_API_KEY` is set in your Vercel environment variables.

---

### Microphone not working on `/conversation`

**Symptom:** The microphone button does not respond or the browser denies permission.

**Cause:** Microphone access requires a secure context (HTTPS or localhost).

**Fix:** Vercel deployments are always HTTPS. If self-hosting, ensure your domain uses TLS.

---

### Language switcher doesn't translate UI

**Symptom:** Selecting a different language from the navbar dropdown has no effect on UI text.

**Cause:** `LINGO_DEV_API_KEY` is not set. Without it, UI strings stay in English.

**Fix:** Add `LINGO_DEV_API_KEY` in Vercel environment variables.
