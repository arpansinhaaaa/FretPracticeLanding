# FretPractice Landing Page

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & Deploy

```bash
npm run build   # output → dist/
vercel          # deploy to Vercel (free)
```

---

## Connecting the Live Twitter Feed

The Updates section works in **Demo mode** by default (shows sample tweets).
To make it show real tweets — 3 steps:

### Step 1 — Get a Twitter Bearer Token
1. Go to https://developer.twitter.com/en/apps
2. Create a project + app
3. Copy your **Bearer Token**

### Step 2 — Add the token to Vercel
In your Vercel dashboard → **Settings** → **Environment Variables**:
```
TWITTER_BEARER_TOKEN = your_bearer_token_here
```

For local testing, create `.env.local`:
```
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

### Step 3 — Enable live mode in App.tsx
Find `TWITTER_CONFIG` near the top of `src/App.tsx` and set:
```ts
const TWITTER_CONFIG = {
  LIVE_MODE: true,   // ← change this
  ...
}
```

That's it. The feed auto-refreshes every 5 minutes and shows:
- All tweets from @FretPractice
- All tweets by @rivuchakraborty mentioning @FretPractice

---

## Project Structure

```
fretpractice-app/
├── api/
│   └── tweets.ts         ← Vercel serverless function (Twitter API)
├── public/
│   ├── fretpractice-logo.png   ← your logo
│   ├── rivu.jpeg               ← founder photo
│   └── favicon.svg
├── src/
│   ├── App.tsx           ← entire app (single file)
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## Contact
fretpractice@mobrio.studio · Built by Team FretPractice · A Mobrio Studio product
# FretPracticeLanding
