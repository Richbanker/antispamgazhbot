# 🚀 Quick Start Guide

## ⚡ Fastest way to get your bot running

### 1. Setup (2 minutes)

```bash
# Clone and install
git clone <your-repo>
cd telegram-moderator-bot
npm install
cd frontend && npm install && cd ..

# Configure bot
cp .env.example .env
# Edit .env and set BOT_TOKEN=your_real_token
```

### 2. Local Development

```bash
# Terminal 1: Start bot
npm run dev:bot

# Terminal 2: Start dashboard
cd frontend && npm run dev
```

**Access:** Bot works in Telegram, Dashboard at http://localhost:5173

### 3. Production Deployment

#### Option A: Docker (Easiest)
```bash
docker-compose up -d
```

#### Option B: VPS with PM2
```bash
# Build
npm run build
cd frontend && npm run build && cd ..

# Check readiness
npm run check:production

# Deploy
npm run start:pm2
```

#### Option C: Webhook Mode
```bash
# Set WEBHOOK_URL in .env
WEBHOOK_URL=https://yourdomain.com/bot

# Set webhook
npm run webhook:set

# Start bot
npm start
```

## 🔧 Essential Commands

```bash
# Development
npm run dev:bot              # Start bot locally
npm run check:production     # Check if ready for production

# Production
npm run start:pm2           # Start with PM2
npm run logs:pm2            # View logs
npm run webhook:set         # Setup webhook

# Docker
docker-compose up -d        # Start all services
docker-compose logs -f      # View logs
```

## 🆘 Quick Fixes

**Bot not starting?**
```bash
echo $BOT_TOKEN  # Check token exists
npm run check:production  # Run diagnostics
```

**Webhook issues?**
```bash
npm run webhook:set  # Reset webhook
curl https://yourdomain.com/health  # Test endpoint
```

**Frontend not loading?**
```bash
cd frontend && npm run build  # Rebuild
```

## 📞 Need Help?

- 📖 Full docs: [README.md](README.md)
- 🐛 Issues: GitHub Issues
- 💬 Support: @YourBotSupport

---

**Ready in 5 minutes! 🎉** 