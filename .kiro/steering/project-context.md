---
inclusion: always
---

# Project Context - The Data Weaver

## Project Overview

This is a data correlation dashboard that combines IPL cricket match data with food delivery search interest to demonstrate meaningful business insights.

## Architecture

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js + Express proxy server
- **Visualization**: Chart.js 4.4.0
- **APIs**: CricAPI, Google Trends (with fallbacks)

## Key Principles

1. **Production-Ready**: Comprehensive error handling with automatic fallbacks
2. **User Experience First**: Dashboard must always work, even if APIs fail
3. **Defensive Programming**: Safe property access throughout
4. **Clear Communication**: Detailed logging and error messages

## Code Standards

### JavaScript
- Use ES6+ features (classes, async/await, arrow functions)
- Modular architecture with separation of concerns
- Comprehensive error handling with try-catch
- Descriptive variable and function names

### Error Handling Pattern
```javascript
try {
    const data = await fetchFromAPI();
    return processData(data);
} catch (error) {
    console.error('❌ Error:', error.message);
    return fallbackData();
}
```

### API Integration Pattern
```javascript
// Always check for data existence
const value = data?.property?.nested || 'fallback';

// Always have fallbacks
if (apiData.length === 0) {
    return loadLocalData();
}
```

## File Structure

- `index.html` - Dashboard UI (keep clean, semantic HTML)
- `server.js` - API proxy (handle CORS, errors, fallbacks)
- `js/dataFetcher.js` - Data layer (API calls, processing)
- `js/charts.js` - Presentation layer (Chart.js logic)
- `js/app.js` - Application layer (initialization, coordination)

## Important Notes

### API Limitations
- **CricAPI free tier**: Only current/upcoming matches (no historical)
- **Google Trends**: Rate limiting (Error 429) is expected
- **Both have fallbacks**: Local JSON and simulated data

### Expected "Errors"
- 0 IPL matches from API = Season ended (use local data)
- Error 429 from Google = Rate limited (use simulated data)
- These are NOT bugs - they're handled gracefully

## Development Workflow

1. Always test API endpoints before integrating
2. Implement fallbacks immediately
3. Log comprehensively for debugging
4. Document limitations clearly
5. Test edge cases thoroughly

## When Making Changes

- Maintain modular architecture
- Keep error handling comprehensive
- Update documentation if needed
- Test fallback scenarios
- Ensure dashboard always works
