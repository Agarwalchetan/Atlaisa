# Atlasia

> AI-powered global travel intelligence platform — built with Next.js 16, React 19, and a multi-provider AI system.

Atlasia gives travelers real-time AI translations, phrase generation with pronunciation audio, cultural intelligence, trip itineraries, an interactive world map, and emergency contact lookup — all in one app, deployable in minutes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AgarwalChetan/Atlasia)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [AI Provider System](#ai-provider-system)
- [Map System](#map-system)
- [API Routes](#api-routes)
- [Deploy on Vercel](#deploy-on-vercel)
- [Supported Languages](#supported-languages)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Page | Route | Description |
|---|---|---|
| **Home** | `/` | Landing page with animated stats, feature showcase, and quick-access CTAs |
| **Map** | `/map` | Full-bleed interactive world map — search locations, filter by category, explore nearby places |
| **Travel Guide** | `/travel-guide` | AI destination guide, day-by-day itinerary generator, and cultural intelligence |
| **Phrases** | `/phrases` | AI phrase generator with phonetic pronunciation and text-to-speech audio |
| **Conversation** | `/conversation` | Live bilingual translator with microphone input and TTS playback |
| **Emergency** | `/emergency` | Emergency phrase translator, country-specific emergency numbers, medical alert card |

### Highlights

- **Zero-config map** — works out of the box with Leaflet + OpenStreetMap. Add a free MapTiler key to unlock 3D globe projection.
- **Multi-provider AI** — switch between OpenAI, Google Gemini, and Groq with a single environment variable. No code changes.
- **15 languages** — translation, phrase generation, and UI localization across 15 languages.
- **No paid map APIs required** — geocoding via Nominatim, nearby places via OpenStreetMap Overpass API.
- **Privacy-first** — no analytics, no tracking. All API keys are server-side only.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, serverless) |
| Runtime | [React 19](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Animations | [Framer Motion v12](https://www.framer.com/motion) |
| Icons | [Lucide React](https://lucide.dev) |
| UI Primitives | [Radix UI](https://www.radix-ui.com) |
| Fonts | Sora (headings) · Inter (body) · DM Mono (pronunciation) |
| AI — Text | OpenAI / Google Gemini / Groq (switchable) |
| AI — TTS | OpenAI `tts-1` |
| AI — STT | OpenAI Whisper or Groq Whisper |
| Map | MapLibre GL (3D globe) + Leaflet/OSM fallback |
| Geocoding | [Nominatim](https://nominatim.org) (free, no key) |
| Nearby Places | [OpenStreetMap Overpass API](https://overpass-api.de) (free, no key) |
| Localization | [Lingo.dev](https://lingo.dev) SDK |
| Package Manager | [Bun](https://bun.sh) |

---

## Project Structure

```
atlasia/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── translate/              # Text translation endpoint
│   │   │   ├── translate-ui/           # UI string localization (Lingo.dev)
│   │   │   ├── phrases/                # Travel phrase generation
│   │   │   ├── travel-guide/           # Destination travel guide
│   │   │   ├── itinerary/              # Day-by-day trip itinerary
│   │   │   ├── cultural-intelligence/  # Cultural tips and etiquette
│   │   │   ├── nearby-places/          # OSM Overpass nearby POI lookup
│   │   │   └── speech/
│   │   │       ├── transcribe/         # Speech-to-text (STT)
│   │   │       └── tts/                # Text-to-speech (TTS)
│   │   ├── map/                        # /map page — full-bleed world map
│   │   ├── travel-guide/               # /travel-guide page
│   │   ├── phrases/                    # /phrases page
│   │   ├── conversation/               # /conversation page
│   │   ├── emergency/                  # /emergency page
│   │   ├── globals.css                 # Tailwind v4 theme, custom animations
│   │   ├── layout.tsx                  # Root layout — fonts, metadata, ClientLayout
│   │   └── page.tsx                    # Home page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx              # Top navigation bar
│   │   │   └── client-layout.tsx       # Conditionally hides navbar on /map
│   │   ├── map/
│   │   │   ├── map-component.tsx       # Orchestrator shell
│   │   │   ├── map-canvas.tsx          # MapLibre GL renderer
│   │   │   ├── map-leaflet-canvas.tsx  # Leaflet fallback renderer
│   │   │   ├── map-icon-rail.tsx       # Left navigation rail (Google Maps-style)
│   │   │   ├── map-search-bar.tsx      # Floating pill search bar
│   │   │   ├── map-category-pills.tsx  # Horizontal category filters
│   │   │   ├── map-place-panel.tsx     # Sliding place detail panel
│   │   │   ├── map-controls.tsx        # Zoom / location / street view controls
│   │   │   ├── map-types.ts            # Shared types and constants
│   │   │   └── map-geocoding.ts        # Nominatim geocoding utilities
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       └── loading.tsx
│   ├── lib/
│   │   ├── ai-provider.ts              # Unified AI provider abstraction
│   │   ├── lingo.ts                    # Lingo.dev localization helper
│   │   ├── language-context.tsx        # Global language state (React context)
│   │   ├── use-translations.ts         # useTranslations hook
│   │   └── utils.ts                    # cn(), SUPPORTED_LANGUAGES, PHRASE_CATEGORIES
│   └── types/
│       └── index.ts
├── .env.example                        # Environment variable template
├── vercel.json                         # Vercel deployment config (bun, timeouts)
├── next.config.ts                      # Next.js config
├── postcss.config.mjs                  # Tailwind v4 PostCSS plugin
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+) — or Node.js 18+
- At least one AI provider API key (see [Environment Variables](#environment-variables))

### 1. Clone and install

```bash
git clone https://github.com/AgarwalChetan/Atlasia.git
cd Atlasia
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your keys. The minimum required set:

```env
USE_OPENAI=true
OPENAI_API_KEY=sk-...
```

See the full [Environment Variables](#environment-variables) reference below.

### 3. Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
bun run build
bun start
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. All server-side variables are never exposed to the browser.

### AI Provider

Exactly one provider flag should be `true`. When multiple are `true`, priority is: **OpenAI → Gemini → Groq**.

| Variable | Default | Description |
|---|---|---|
| `USE_OPENAI` | `true` | Use OpenAI for text generation |
| `USE_GEMINI` | `false` | Use Google Gemini for text generation |
| `USE_GROQ` | `false` | Use Groq for text generation |

### API Keys

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | **Always required** | Used for TTS (`tts-1`) on every page. Also needed for text generation when `USE_OPENAI=true` and for STT when `SPEECH_PROVIDER=openai`. |
| `GEMINI_API_KEY` | If `USE_GEMINI=true` | Google AI Studio API key |
| `GROQ_API_KEY` | If `USE_GROQ=true` or `SPEECH_PROVIDER=groq` | Groq Cloud API key |

### Model Overrides (optional)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_MODEL` | `gpt-4o-mini` | Override the OpenAI text model |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Override the Gemini model |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Override the Groq model |

### Speech

| Variable | Default | Description |
|---|---|---|
| `SPEECH_PROVIDER` | `openai` | STT provider: `openai` (Whisper-1) or `groq` (Whisper-large-v3, free tier) |

### Map

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_MAPTILER_KEY` | Optional | Enables 3D globe via MapLibre GL. Get a free key at [maptiler.com](https://www.maptiler.com). Without this the map falls back to Leaflet + OpenStreetMap automatically. |

### Localization

| Variable | Required | Description |
|---|---|---|
| `LINGO_DEV_API_KEY` | Optional | [Lingo.dev](https://lingo.dev) key. Enables multilingual UI. Without it, UI stays in English. |

### App

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Set to your production URL in deployment |
| `ELEVENLABS_API_KEY` | — | Reserved for future enhanced TTS, not used yet |

---

## AI Provider System

All text generation is routed through a unified abstraction at `src/lib/ai-provider.ts`. It reads the `USE_*` flags at runtime — no code changes needed to switch providers.

```
USE_OPENAI=true  →  openai SDK       (gpt-4o-mini by default)
USE_GEMINI=true  →  @google/generative-ai  (gemini-2.0-flash by default)
USE_GROQ=true    →  groq-sdk         (llama-3.3-70b-versatile by default)
```

**TTS is always OpenAI.** The `/api/speech/tts` route uses `openai.audio.speech.create()` with `tts-1` regardless of the text provider selection. This means `OPENAI_API_KEY` must always be set.

**STT is configurable.** Set `SPEECH_PROVIDER=groq` to use Groq's free Whisper tier for speech-to-text transcription.

---

## Map System

The map auto-selects its rendering mode based on whether `NEXT_PUBLIC_MAPTILER_KEY` is set:

| Mode | Condition | Tiles | Projection |
|---|---|---|---|
| **MapLibre GL** | `NEXT_PUBLIC_MAPTILER_KEY` is set | MapTiler dark theme | 3D globe |
| **Leaflet fallback** | No MapTiler key | OpenStreetMap + CARTO dark | 2D flat |

Both modes support:
- Click-to-select any location
- Search via [Nominatim](https://nominatim.org) geocoding (free, no key)
- Nearby places (attractions, restaurants, museums, hotels, hospitals, pharmacies, ATMs, transit) via [Overpass API](https://overpass-api.de) (free, no key)
- Google Maps-style layout: icon rail, floating search bar, category filters, sliding place panel, map controls

---

## API Routes

All routes are Next.js App Router Route Handlers.

| Route | Method | Env Vars | Description |
|---|---|---|---|
| `/api/translate` | POST | AI provider vars | Translates text between two languages |
| `/api/translate-ui` | POST | `LINGO_DEV_API_KEY` | Translates UI strings via Lingo.dev |
| `/api/phrases` | POST | AI provider vars, `LINGO_DEV_API_KEY` | Generates categorized travel phrases with phonetics |
| `/api/travel-guide` | POST | AI provider vars, `LINGO_DEV_API_KEY` | Generates a rich travel guide for a destination |
| `/api/itinerary` | POST | AI provider vars, `LINGO_DEV_API_KEY` | Generates a day-by-day trip itinerary |
| `/api/cultural-intelligence` | POST | AI provider vars, `LINGO_DEV_API_KEY` | Returns cultural tips and etiquette |
| `/api/nearby-places` | GET | None | Fetches nearby POIs from OpenStreetMap Overpass API |
| `/api/speech/transcribe` | POST | `OPENAI_API_KEY` or `GROQ_API_KEY` | Transcribes audio to text (STT) |
| `/api/speech/tts` | POST | `OPENAI_API_KEY` | Converts text to MP3 audio (TTS) |

---

## Deploy on Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full deployment guide including:
- Step-by-step Vercel setup
- All environment variables
- Vercel plan requirements (Hobby vs Pro)
- Self-hosting with Docker
- Troubleshooting

**Quick deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AgarwalChetan/Atlasia)

---

## Supported Languages

| | | |
|---|---|---|
| English | Japanese | Chinese (Simplified) |
| Spanish | French | German |
| Italian | Portuguese | Arabic |
| Hindi | Korean | Russian |
| Turkish | Thai | Vietnamese |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT

---

<p align="center">
  Developed with love by <a href="https://github.com/AgarwalChetan">Chetan Agarwal</a> &nbsp;·&nbsp;
  <a href="https://github.com/AgarwalChetan/Atlasia">GitHub Repository</a>
</p>
