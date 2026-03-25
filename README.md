# Defend the Faith

A lightweight progressive web application (PWA) that helps believers defend the Christian faith with concise response frameworks and trusted Protestant resources.

## Platform support

This app runs on:
- iPhone / iPad (Safari)
- Android (Chrome/Edge/Firefox)
- Mac and PC (all modern browsers)

You can install it from the browser menu as an app-like experience.

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Screenshot support (both options)

### Option 1: `browser_container` tool
Use the environment-provided `browser_container` tool (recommended for agent-driven screenshots). This must be enabled in your runtime/orchestrator.

### Option 2: Local Playwright fallback
```bash
npm install
npx playwright install chromium
npm run screenshot
```

This saves a screenshot to `artifacts/homepage.png`.

More details: `docs/browser-and-screenshots.md`.

## Option 4 implemented: permanent preview URL (GitHub Pages)

This repository now includes `.github/workflows/deploy-pages.yml` to automatically deploy the app as a static website on GitHub Pages.

### One-time GitHub setup
1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Ensure your default branch is `main` (the workflow deploys on pushes to `main`).

### Deploy flow
- Push to `main`.
- GitHub Action `Deploy static app to GitHub Pages` runs.
- Your permanent preview URL will be available at:
  - `https://<your-username>.github.io/<your-repo>/`

### Notes
- Because this app is fully static (HTML/CSS/JS/JSON), no server-side build is required.
- If your repository uses a branch name other than `main`, update the workflow trigger accordingly.

## Content approach

- Uses sources from widely trusted Protestant theologians and ministries.
- Organizes apologetics help by common questions (resurrection, Trinity, evil, authority of Scripture, etc.).
- Keeps Scripture references central in every topic.


## GitHub Pages Actions error troubleshooting

If Actions fails with:

`Get Pages site failed ... Not Found`

then GitHub Pages is not yet enabled for the repository.

Fix:
1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source = GitHub Actions**.
3. Re-run the workflow.

This repository's workflow also sets `enablement: true` for `actions/configure-pages`, which helps bootstrap Pages enablement in supported repositories.
