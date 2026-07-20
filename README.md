<div align="center">

<img src="public/logo_text.svg" alt="Hyreli" width="200" />

# Hyreli

A beautiful, open-source careers platform. Self-hostable, Discord-powered, and developer-friendly.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

</div>

---

## Features

- Discord OAuth authentication
- Job listings with custom application questions (Google Forms-style)
- Dashboard for managing jobs and applications
- Role-based access (Owner, Manager, User)
- Dark mode support
- Fully self-hostable

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Discord Application (for OAuth)
- PM2 (for production)

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Hyreli/hyreli.git
cd hyreli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js (run `openssl rand -base64 32`) |
| `DISCORD_CLIENT_ID` | From Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | From Discord Developer Portal |
| `OWNER_DISCORD_ID` | Your Discord user ID (for admin access) |

### 4. Set up Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **OAuth2** > Copy Client ID and Client Secret
4. Add redirect: `http://localhost:3000/api/auth/callback/discord`

### 5. Set up database

```bash
npx prisma migrate dev
```

### 6. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Production (PM2)

### 1. Build the app

```bash
npm run build
```

### 2. Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Useful PM2 commands

```bash
pm2 status          # Check app status
pm2 logs hyreli     # View logs
pm2 restart hyreli  # Restart app
pm2 stop hyreli     # Stop app
pm2 delete hyreli   # Remove app
```

---

## Getting your Discord User ID

1. Open Discord
2. Go to **Settings** > **Advanced**
3. Enable **Developer Mode**
4. Right-click your profile > **Copy User ID**
5. Set this as `OWNER_DISCORD_ID` in `.env`

## License

[GNU GPL v3](LICENSE)
