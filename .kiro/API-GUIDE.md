# API Integration Guide

## Overview

The Data Weaver integrates with two external APIs:
1. **CricAPI** - For IPL cricket match data
2. **Google Trends** - For food delivery search interest

## CricAPI Integration

### Setup

1. Get free API key: https://www.cricapi.com/
2. Add to `.env`: `CRICAPI_KEY=your_key_here`
3. Free tier: 100 requests/day

### Endpoints Used

```javascript
// Current matches
GET https://api.cricapi.com/v1/currentMatches?apikey={key}

// All matches
GET https://api.cricapi.com/v1/matches?apikey={key}
```

### Limitations

- **Free tier**: Only returns current/upcoming matches
- **No historical data**: Cannot fetch completed matches
- **Solution**: Automatic fallback to local JSON data

### Response Format

```json
{
  "data": [
    {
      "id": "match-id",
      "name": "Indian Premier League 2024",
      "matchType": "t20",
      "status": "completed",
      "teams": ["Team A", "Team B"],
      "venue": "Stadium Name",
      "dateTimeGMT": "2024-03-22T14:30:00Z"
    }
  ]
}
```

## Google Trends Integration

### Setup

- **No API key required!**
- Uses free `google-trends-api` npm package
- Installed automatically with `npm install`

### Implementation

```javascript
const googleTrends = require('google-trends-api');

const results = await googleTrends.interestOverTime({
    keyword: 'swiggy',
    geo: 'IN'
});
```

### Limitations

- **Rate limiting**: Google may block requests (Error 429)
- **Unofficial API**: Uses web scraping
- **Solution**: Automatic fallback to simulated data

### Response Format

```json
{
  "default": {
    "timelineData": [
      {
        "time": "1704067200",
        "value": [75],
        "formattedTime": "Jan 1, 2024"
      }
    ]
  }
}
```

## Fallback Strategy

### Architecture

```
Try Real API
    ↓
  Success? → Use real data ✅
    ↓ No
  Fallback → Use local/simulated data 📊
```

### Implementation

```javascript
// CricAPI Fallback
let matches = await fetchFromCricAPI();
if (matches.length === 0) {
    matches = loadLocalJSON('data/ipl-matches.json');
}

// Google Trends Fallback
try {
    const trends = await fetchGoogleTrends();
    return trends;
} catch (error) {
    return generateSimulatedData();
}
```

## Error Handling

### CricAPI Errors

- **0 matches**: Season ended → Use local data
- **API key invalid**: Check .env file
- **Rate limit**: Wait or upgrade plan

### Google Trends Errors

- **Error 429**: Rate limited → Use simulated data
- **HTML response**: Blocked → Use simulated data
- **Parse error**: Invalid response → Use simulated data

## Testing

### Test CricAPI

```bash
curl http://localhost:3000/api/cricket/matches
```

### Test Google Trends

```bash
curl http://localhost:3000/api/test-trends
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## API Costs

| API | Free Tier | Paid Tier |
|-----|-----------|-----------|
| CricAPI | 100 req/day | $10-50/month |
| Google Trends | Unlimited* | N/A |

*Subject to rate limiting

## Best Practices

1. **Cache responses** when possible
2. **Handle errors gracefully** with fallbacks
3. **Log API calls** for debugging
4. **Respect rate limits** to avoid blocks
5. **Use environment variables** for keys
