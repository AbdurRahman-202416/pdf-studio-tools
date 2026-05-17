# Deploying PDF Studio

This document covers three deployment paths. Pick the one that matches your infra.

> Quick reference — environment variables
>
> | Var | Where | Purpose |
> |---|---|---|
> | `NEXT_PUBLIC_SITE_URL` | Frontend (build + runtime) | Used for canonical URLs, sitemap, OG tags |
> | `NEXT_PUBLIC_API_BASE_URL` | Frontend (build + runtime) | Backend base, e.g. `https://api.pdfstudio.app/api` or `/api` behind a proxy |
> | `CORS_ORIGINS_RAW` | Backend | Comma-separated allowlist. **Required in production.** |
> | `ENVIRONMENT` | Backend | `development` (loose CORS) or `production` (strict) |
> | `MAX_UPLOAD_MB` | Backend | Default `100`. Increase for bigger PDFs. |

---

## Option 1 — Single VPS with docker-compose (simplest)

Best for: a single $5-$20/mo VPS (Hetzner, DigitalOcean, Linode, Vultr).

### Steps

1. SSH into the server and install Docker + the compose plugin:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

2. Clone the repo and create `.env`:
   ```bash
   git clone <your-fork> pdf-studio && cd pdf-studio
   cat > .env <<EOF
   NEXT_PUBLIC_SITE_URL=https://pdfstudio.app
   NEXT_PUBLIC_API_BASE_URL=https://pdfstudio.app/api
   CORS_ORIGINS_RAW=https://pdfstudio.app
   EOF
   ```

3. Bring everything up:
   ```bash
   docker compose up -d --build
   ```

4. Point your DNS A record to the server's IP. Add TLS via Caddy or nginx (see Option 2).

### Trade-offs
- ✅ Simple, one box, easy backups.
- ❌ Single point of failure. No autoscaling.

---

## Option 2 — VPS with nginx reverse proxy + Let's Encrypt

Best for: production traffic on a single domain. Backend and frontend share an origin → **no CORS** at all.

### nginx config

```nginx
# /etc/nginx/sites-available/pdfstudio.conf

server {
    listen 80;
    server_name pdfstudio.app www.pdfstudio.app;
    return 301 https://pdfstudio.app$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pdfstudio.app;

    ssl_certificate     /etc/letsencrypt/live/pdfstudio.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdfstudio.app/privkey.pem;

    client_max_body_size 110M;   # accommodate 100MB uploads + overhead

    # Backend
    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Frontend
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

### Env

```dotenv
NEXT_PUBLIC_SITE_URL=https://pdfstudio.app
NEXT_PUBLIC_API_BASE_URL=/api   # same-origin — no CORS
CORS_ORIGINS_RAW=https://pdfstudio.app
```

Get TLS with `certbot --nginx -d pdfstudio.app -d www.pdfstudio.app`.

### Trade-offs
- ✅ One origin, no CORS quirks, gzip/brotli + caching by nginx.
- ✅ TLS termination outside Docker.
- ❌ One extra moving part (nginx).

---

## Option 3 — Vercel (frontend) + Fly.io / Railway (backend)

Best for: scaling frontend independently with a CDN, while keeping a long-lived backend close to disk for storage.

### Frontend on Vercel

1. Push your repo to GitHub.
2. Import in Vercel → set **Root directory** to `frontend`.
3. Environment variables:
   ```
   NEXT_PUBLIC_SITE_URL=https://pdfstudio.app
   NEXT_PUBLIC_API_BASE_URL=https://pdfstudio-api.fly.dev/api
   ```
4. Add your custom domain.

### Backend on Fly.io (or Railway)

```bash
cd backend
fly launch --no-deploy
fly secrets set ENVIRONMENT=production CORS_ORIGINS_RAW=https://pdfstudio.app
fly deploy
```

Mount a persistent volume for `/app/storage` so uploads survive deploys:
```bash
fly volumes create pdfstudio_storage --size 5  # 5GB
```

Make sure `fly.toml` mounts it:
```toml
[mounts]
  source = "pdfstudio_storage"
  destination = "/app/storage"
```

### Trade-offs
- ✅ Vercel autoscaling + CDN for the marketing surface.
- ✅ Backend stays cheap and close to disk.
- ❌ Two providers to manage.
- ❌ Cross-origin → CORS_ORIGINS_RAW must be set correctly.

---

## Smoke test checklist (any deploy)

```bash
# Healthcheck
curl -s https://YOUR-DOMAIN/api/health
# → {"status":"ok","version":"1.0.0"}

# Sitemap & robots
curl -s https://YOUR-DOMAIN/sitemap.xml | head
curl -s https://YOUR-DOMAIN/robots.txt

# Upload + metadata round-trip
TOKEN=$(curl -s -F "file=@./README.md;filename=test.pdf;type=application/pdf" https://YOUR-DOMAIN/api/upload | jq -r .file.file_id)
curl -s https://YOUR-DOMAIN/api/files/$TOKEN/metadata | jq .filename
# → "test.pdf"  (not the UUID)
```

## Monitoring & cron

The backend runs a periodic `cleanup_expired()` every `CLEANUP_INTERVAL_SECONDS` (default 15 min) inside the FastAPI lifespan task — **no external cron needed**.

For uptime monitoring, point a service like UptimeRobot at `https://YOUR-DOMAIN/api/health`.

## Backups

The only persistent state is `backend-storage` (or your Fly volume). Snapshot it nightly. Anything else (sessions, recent-output history) is client-side in localStorage and not server-authoritative.

## Going viral — SEO checklist

- [ ] Submit `https://YOUR-DOMAIN/sitemap.xml` to [Google Search Console](https://search.google.com/search-console)
- [ ] Submit to [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [ ] Run [Google Rich Results test](https://search.google.com/test/rich-results) on the home page — confirm FAQ schema is detected
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) — target ≥90 on mobile
- [ ] Add a Plausible / GA snippet in `app/layout.tsx` if you want analytics
- [ ] Share each tool page individually on Reddit / Facebook BD groups (rank long-tail BD queries first)
