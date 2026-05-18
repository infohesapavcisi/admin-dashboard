# Test API Admin Dashboard

Cloudflare Pages üzerinde çalışan, NestJS backend'ine bağlanan admin dashboard.

## Yerel Geliştirme

```bash
npm install
cp .env.example .env.local   # VITE_API_BASE_URL'i kendi backend URL'inle değiştir
npm run dev
```

## Deploy

İlk seferlik manuel kurulum:

```bash
npx wrangler login            # hesap.avcisi@gmail.com ile login
npx wrangler pages project create netshield-admin --production-branch main
npm run build
npx wrangler pages deploy dist --project-name netshield-admin
```

Sonrasında `main` branch'e push'lar GitHub Actions ile otomatik deploy olur. Aşağıdaki secret'lar `Settings → Secrets and variables → Actions` altında tanımlı olmalı:

- `CLOUDFLARE_API_TOKEN` — Cloudflare → My Profile → API Tokens → Create (Pages:Edit)
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard sağ panel
- `VITE_API_BASE_URL` — Render backend URL'i (örn. `https://your-api.onrender.com`)

## Backend tarafı

Render'da çalışan NestJS backend'inin env'ine:

```
ADMIN_EMAILS=hasanbudak1@gmail.com,muhammetozata1991@gmail.com
CORS_ORIGINS=https://netshield-admin.pages.dev,http://localhost:5173
```
