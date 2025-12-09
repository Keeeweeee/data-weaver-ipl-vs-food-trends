---
inclusion: fileMatch
fileMatchPattern: "server.js|dataFetcher.js"
---

# API Integration Guidelines

## When Working with External APIs

### Always Implement These Patterns

1. **Safe Property Access**
```javascript
// ❌ Bad - will crash if undefined
const name = match.name.includes('IPL');

// ✅ Good - safe with optional chaining
const name = match.name && match.name.includes('IPL');
const value = data?.property?.nested || 'default';
```

2. **Comprehensive Error Handling**
```javascript
// ✅ Always wrap API calls
try {
    const response = await axios.get(url);
    return processResponse(response);
} catch (error) {
    console.error('❌ API Error:', error.message);
    return fallbackData();
}
```

3. **Fallback Strategy**
```javascript
// ✅ Multiple fallback layers
async function fetchData() {
    // Try primary API
    try {
        return await fetchFromPrimaryAPI();
    } catch (error) {
        console.log('⚠️ Primary API failed, trying secondary...');
    }
    
    // Try secondary API
    try {
        return await fetchFromSecondaryAPI();
    } catch (error) {
        console.log('⚠️ Secondary API failed, using local data...');
    }
    
    // Use local fallback
    return loadLocalData();
}
```

4. **Rate Limit Detection**
```javascript
// ✅ Detect HTML error pages
if (response.includes('<html') || response.includes('Error 429')) {
    console.error('❌ Rate limited');
    throw new Error('Rate limited by API');
}
```

5. **Detailed Logging**
```javascript
// ✅ Log all steps for debugging
console.log('🔄 Fetching data from API...');
console.log('   Endpoint:', url);
console.log('   Parameters:', params);

// On success
console.log('✅ Success:', data.length, 'items received');

// On error
console.error('❌ Error:', error.message);
console.log('📊 Using fallback data');
```

## CricAPI Specific

### Known Limitations
- Free tier: Only current/upcoming matches
- No historical data access
- 100 requests/day limit

### Implementation Pattern
```javascript
// Check for empty results
if (matches.length === 0) {
    console.log('⚠️ No matches from API (season ended)');
    return loadLocalJSON('data/ipl-matches.json');
}
```

## Google Trends Specific

### Known Limitations
- Unofficial API (web scraping)
- Rate limiting (Error 429)
- Unpredictable availability

### Implementation Pattern
```javascript
// Detect rate limiting
const results = await googleTrends.interestOverTime({...});

if (results.includes('<html') || results.includes('Error 429')) {
    console.log('⚠️ Google rate limited');
    return generateSimulatedData();
}
```

## Testing APIs

### Before Integration
1. Test endpoint manually with curl
2. Check response structure
3. Identify required vs optional fields
4. Test error scenarios
5. Check rate limits

### During Development
1. Log all API calls
2. Test with missing data
3. Test with malformed responses
4. Test rate limiting
5. Verify fallbacks work

## Error Messages

### User-Facing
- Clear and helpful
- Explain what happened
- Suggest solutions
- Don't expose technical details

### Developer-Facing (Console)
- Detailed error information
- Stack traces when needed
- API response samples
- Debugging hints

## Remember

- APIs fail - plan for it
- Free tiers have limits - work around them
- Users don't care about API issues - hide them gracefully
- Fallbacks are not failures - they're good engineering
