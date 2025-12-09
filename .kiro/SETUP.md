# Setup Guide

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure API key
cp .env.example .env
# Edit .env and add your CricAPI key

# 3. Start server
npm start

# 4. Open dashboard
http://localhost:3000
```

## Requirements

- Node.js 14+ and npm
- CricAPI key (free from https://www.cricapi.com/)

## Configuration

### .env File

```env
CRICAPI_KEY=your_key_here
PORT=3000
```

## Verification

Server should show:
```
✅ Cricket API: Configured
✅ Google Trends: No key needed!
```

Dashboard should load at: http://localhost:3000

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues.
