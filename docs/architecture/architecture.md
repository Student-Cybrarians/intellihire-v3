# Architecture: IntelliHire v3

## Overview
Next.js 15 App Router architecture deployed on Cloudflare Pages.

- **Frontend**: SSR/SSG with react-query for data fetching.
- **Backend**: Next.js API routes delegating to D1 (SQLite at Edge).
- **AI**: Claude API for interview simulation and career analysis.
- **Storage**: R2 for resumes; D1 metadata.
- **Caching**: KV for sessions and edge caching.

[... detailed architecture flows to be filled in ...]
