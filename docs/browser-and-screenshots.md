# Browser Tooling: Two Options

This project now supports **both** approaches discussed for screenshot automation.

## Option 1: Platform `browser_container` tool (recommended for Codex agent runs)

This is managed by the environment/orchestrator, not by application code.

### How to enable
1. In your Codex/agent runtime config, enable the `browser_container` capability.
2. Relaunch the environment/session so the tool appears in the tool list.
3. Use the tool from the agent flow to capture screenshots directly.

> Note: this cannot be turned on from inside this repo because tool availability is controlled externally.

## Option 2: Local Playwright fallback (implemented in this repo)

### Setup
```bash
npm install
npx playwright install chromium
```

### Capture screenshot
```bash
npm run screenshot
```

This command:
- starts a local server on port `4173`
- opens `http://127.0.0.1:4173/index.html`
- saves `artifacts/homepage.png`

### Optional environment variables
- `PORT` (default: `4173`)
- `SCREENSHOT_URL` (default: `http://127.0.0.1:$PORT/index.html`)
- `SCREENSHOT_OUT` (default: `artifacts/homepage.png`)
