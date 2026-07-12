# Attendant scanner app

React + Vite. Talks directly to your Supabase project — no separate backend server.

## Run it locally
```
npm install
cp .env.example .env.local        # then fill in your project URL + anon key
npm run dev
```
Opens on your laptop at `http://localhost:5173`. Because `host: true` is set in
`vite.config.js`, it's also reachable from your phone at `http://<your-laptop-ip>:5173`
as long as both are on the same WiFi — that's the fastest way to test real camera
scanning before deploying anywhere.

## Deploying (for real event use)
Push this folder to a GitHub repo and import it into Vercel, or run `vercel` from
inside this folder. Add the two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
in the Vercel project settings — same values as your `.env.local`. Every attendant
device then just opens the deployed URL.

## What it does
- On load: fetches the active checkpoint list from Supabase and shows it as tap
  targets — not hardcoded, so renaming/adding/removing a checkpoint in the database
  is reflected here automatically, no redeploy needed.
- Checkpoint + optional device label are saved to `localStorage`, so a reload
  (or the phone's screen locking and unlocking) doesn't lose the session.
  "Switch counter" clears it — this is the whole mechanism that lets any backup
  device stand in for any checkpoint.
- Camera scanning via `html5-qrcode`, loaded on demand (see the build note below).
- Every decoded QR calls the same `record_scan` RPC your database already has,
  and shows a full-screen stamp-style result: green for confirmed, red for
  already-scanned (with the original scan time), amber for anything unexpected
  (unrecognized code, dropped connection). Auto-returns to scanning after ~1.6s.
- "Can't scan? Search by name" swaps the camera for a name/reg-no. search against
  the same `participants` table, and confirming a result calls the exact same
  `record_scan` function — just tagged `method: 'manual'` for the audit trail.

## What was actually verified here vs. what still needs a real device
Verified:
- `npm run build` compiles cleanly
- 8 unit tests on the scan-result-interpretation logic (`npm test`) — covers
  confirmed, duplicate, invalid token, invalid checkpoint, dropped connection,
  and a malformed response, all fail safe rather than crashing

Not verified here, because this sandbox has no camera and can't reach your live
Supabase project:
- Actual camera QR decoding on a real device
- A real round trip against your Supabase instance

Before the event, test both directly: open this on your phone (via the local-network
URL above, or your Vercel deploy), scan one of the 10 demo QR codes from the last
drop, and confirm you see the green stamp — then scan it again and confirm you see
red with the right timestamp.

## A note on the bundle
The QR-scanning library is the single heaviest dependency here, so it's imported
dynamically inside `ScannerScreen.jsx` rather than bundled into the initial load —
the checkpoint-picker screen paints before it's even downloaded. If you add more
screens later and see the same "chunk larger than 500kB" warning from Vite, the
fix is the same pattern: `import('big-thing').then(...)` instead of a top-level
import.
