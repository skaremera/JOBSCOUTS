 # JobScout — Real Remote Job Search

**Live site:** `https://jobscouts.vercel.app/`
**Demo video:** `https://drive.google.com/file/d/15RVepvicpPosrsGAdRkkPUfviF9ZvFwS/view?usp=vids_web # 
**GitHub repo:** `https://github.com/skaremera/JOBSCOUTS`

## What it does and why it's useful

JobScout lets anyone search real, live remote job listings — by keyword
and category — and apply directly through the original posting. It's
built for people (in Rwanda and anywhere else) looking for remote work
without having to check multiple job boards by hand. Real, practical
value, not a novelty API.

## External API used

**[Remotive API](https://remotive.com/api-documentation)** by Remotive —
full credit to Remotive for the job listings data.

- Endpoint used: `GET https://remotive.com/api/remote-jobs`
- No API key required — a genuinely free, public, keyless API, which
  also means there's no secret to protect or leak.

## Features

- **Search** by keyword (title, company, description)
- **Filter** by job category
- **Sort** by newest, oldest, title (A–Z), or company (A–Z)
- **Error handling** — friendly messages for upstream downtime, rate
  limiting (429), timeouts, and empty results; the app never crashes

## Project structure

```
jobscout/
├── app.js          # Express app (local dev): static hosting + job search
├── server.js       # local runner: require(app.js) + listen()
├── api/
│   └── jobs.js      # Vercel serverless function: GET /api/jobs (zero-config)
├── vercel.json       # minimal config, Vercel auto-serves public/ + api/
├── package.json
└── public/
    ├── index.html
    ├── style.css
    └── app.js        # search, sort, filter, rendering (frontend)
```

## Run it locally

```bash
git clone https://github.com/skaremera/JOBSCOUTS.git
cd JOBSCOUTS/jobscout
npm install
npm start
```

Open http://localhost:3000, search a keyword (e.g. "developer" or
"marketing"), filter by category, and sort the results.

## Deployment

**Live now:** deployed on [Vercel](https://vercel.com), same codebase as
local — `api/jobs.js` handles `GET /api/jobs` as a serverless function,
and `public/` is served automatically as static assets. No environment
variables needed since Remotive requires no API key.

**Required deployment (Web01 + Web02 + HAProxy on Lb01):** the intended
architecture is Nginx + a systemd-managed Node process on each web
server, with HAProxy round-robin balancing between them and health
checks against a `/health` endpoint — the same pattern used in this
project's sibling app, NextStop. This step was blocked by an SSH key
access issue on the provided servers (see the demo video for details)
and was not completed before the deadline; Vercel was used instead to
guarantee a working, live submission.

## Credits

- Job data: [Remotive](https://remotive.com/) — [API docs](https://remotive.com/api-documentation)
- Backend: [Express](https://expressjs.com/) (local dev only)
- Frontend: vanilla HTML/CSS/JavaScript, no framework
- Hosting: [Vercel](https://vercel.com/)

## License

MIT

