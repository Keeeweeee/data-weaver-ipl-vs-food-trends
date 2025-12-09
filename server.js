// Proxy server for external API calls
// This handles CORS and API key management

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// API Keys from environment
const CRICAPI_KEY = process.env.CRICAPI_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ============================================================================
// CRICKET API ENDPOINTS
// ============================================================================

// Get current IPL matches
app.get('/api/cricket/current-matches', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
        );
        
        // Filter for IPL matches only
        const iplMatches = response.data.data.filter(match => 
            match.matchType === 't20' && 
            (match.name.includes('Indian Premier League') || match.series.includes('IPL'))
        );
        
        res.json({
            success: true,
            data: iplMatches,
            source: 'CricAPI'
        });
    } catch (error) {
        console.error('Cricket API Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: true
        });
    }
});

// Get match schedule - IPL 2024 specific
app.get('/api/cricket/matches', async (req, res) => {
    try {
        if (!CRICAPI_KEY) {
            throw new Error('CricAPI key not configured');
        }

        console.log('🔄 Fetching IPL matches from CricAPI...');
        console.log('   Note: Free tier only returns current/upcoming matches');

        let iplMatches = [];
        let totalMatchesChecked = 0;
        
        // Method 1: Try current matches endpoint
        try {
            console.log('   Trying currentMatches endpoint...');
            const currentResponse = await axios.get(
                `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
            );
            
            const currentMatches = currentResponse.data?.data || [];
            totalMatchesChecked += currentMatches.length;
            console.log(`   Found ${currentMatches.length} current matches`);
            
            const currentIPL = currentMatches.filter(match => {
                const isT20 = match.matchType === 't20';
                const hasIPL = (match.name && (match.name.includes('Indian Premier League') || match.name.includes('IPL'))) || 
                              (match.series && match.series.includes('IPL')) ||
                              (match.seriesId && match.seriesId.includes('ipl'));
                return isT20 && hasIPL;
            });
            
            console.log(`   ${currentIPL.length} are IPL matches`);
            
            iplMatches = currentIPL.map(match => ({
                date: match.dateTimeGMT ? match.dateTimeGMT.split('T')[0] : new Date().toISOString().split('T')[0],
                match: `${match.teams?.[0] || 'Team 1'} vs ${match.teams?.[1] || 'Team 2'}`,
                venue: match.venue || 'TBD',
                type: 'league',
                status: match.status || 'scheduled',
                matchId: match.id,
                seriesId: match.seriesId
            }));
        } catch (error) {
            console.log('   ⚠️  currentMatches endpoint failed:', error.message);
        }
        
        // Method 2: Try all matches endpoint
        if (iplMatches.length === 0) {
            try {
                console.log('   Trying matches endpoint...');
                const allResponse = await axios.get(
                    `https://api.cricapi.com/v1/matches?apikey=${CRICAPI_KEY}&offset=0`
                );
                
                const allMatches = allResponse.data?.data || [];
                totalMatchesChecked += allMatches.length;
                console.log(`   Found ${allMatches.length} matches`);
                
                const allIPL = allMatches.filter(match => {
                    const isT20 = match.matchType === 't20';
                    const hasIPL = (match.name && (match.name.includes('Indian Premier League') || match.name.includes('IPL'))) || 
                                  (match.series && match.series.includes('IPL'));
                    return isT20 && hasIPL;
                });
                
                console.log(`   ${allIPL.length} are IPL matches`);
                
                iplMatches = allIPL.map(match => ({
                    date: match.dateTimeGMT ? match.dateTimeGMT.split('T')[0] : new Date().toISOString().split('T')[0],
                    match: `${match.teams?.[0] || 'Team 1'} vs ${match.teams?.[1] || 'Team 2'}`,
                    venue: match.venue || 'TBD',
                    type: 'league',
                    status: match.status || 'scheduled',
                    matchId: match.id
                }));
            } catch (error) {
                console.log('   ⚠️  matches endpoint failed:', error.message);
            }
        }
        
        console.log(`   Total matches checked: ${totalMatchesChecked}`);
        
        // Sort by date (most recent first)
        iplMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (iplMatches.length === 0) {
            console.log('');
            console.log('⚠️  NO IPL MATCHES FOUND FROM API');
            console.log('   Reason: CricAPI free tier limitations');
            console.log('   - Only returns current/upcoming matches');
            console.log('   - Does NOT return historical/completed matches');
            console.log('   - IPL 2024 season ended in May 2024');
            console.log('   - No upcoming IPL matches scheduled yet');
            console.log('');
            console.log('   Solution: Using local historical data');
            console.log('   Loading IPL 2024 matches from local JSON...');
            
            try {
                const fs = require('fs');
                const path = require('path');
                const localData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ipl-matches.json'), 'utf8'));
                console.log(`   ✅ Loaded ${localData.length} historical IPL 2024 matches`);
                console.log('');
                
                return res.json({
                    success: true,
                    data: localData,
                    source: 'Local JSON (Historical Data)',
                    note: 'CricAPI free tier does not return historical matches. Using IPL 2024 data.',
                    apiLimitation: 'Free tier only shows current/upcoming matches'
                });
            } catch (fileError) {
                console.error('❌ Could not load local data:', fileError.message);
                return res.status(500).json({
                    success: false,
                    error: 'No matches available',
                    details: fileError.message
                });
            }
        }
        
        console.log(`✅ Fetched ${iplMatches.length} IPL matches from CricAPI`);
        
        res.json({
            success: true,
            data: iplMatches,
            source: 'CricAPI'
        });
    } catch (error) {
        console.error('Cricket API Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: true
        });
    }
});

// ============================================================================
// GOOGLE TRENDS ALTERNATIVE - Using RapidAPI's Google Trends API
// ============================================================================

app.get('/api/trends/interest', async (req, res) => {
    const { keyword, startDate, endDate, geo } = req.query;
    
    // Try free google-trends-api (no key needed!)
    try {
        console.log('🔄 Fetching Google Trends data (free API)...');
        console.log('   Keyword:', keyword || 'swiggy');
        console.log('   Geo:', geo || 'IN');
        
        const googleTrends = require('google-trends-api');
        
        // Use simpler format to avoid rate limiting
        const results = await googleTrends.interestOverTime({
            keyword: keyword || 'swiggy',
            geo: geo || 'IN'
        });
        
        console.log('📊 Raw Google Trends response received');
        console.log('   Response type:', typeof results);
        console.log('   Response length:', results.length);
        
        // Check if response is HTML (rate limited)
        if (results.includes('<html') || results.includes('Error 429')) {
            console.error('❌ Google Trends rate limited (Error 429)');
            console.log('   Google is blocking requests temporarily');
            console.log('   This is normal for the free API');
            throw new Error('Rate limited by Google (429)');
        }
        
        // Parse the JSON string response
        let parsedData;
        try {
            parsedData = JSON.parse(results);
            console.log('   ✅ Parsed successfully');
            console.log('   Has default?', !!parsedData.default);
            console.log('   Has timelineData?', !!parsedData.default?.timelineData);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError.message);
            console.log('   First 200 chars:', results.substring(0, 200));
            throw new Error('Invalid JSON response from Google Trends');
        }
        
        if (parsedData.default?.timelineData && Array.isArray(parsedData.default.timelineData)) {
            const timelineData = parsedData.default.timelineData;
            console.log(`✅ Trends API working. Received ${timelineData.length} data points`);
            
            // Log first data point for debugging
            if (timelineData.length > 0) {
                console.log('   Sample data point:', {
                    time: timelineData[0].time,
                    value: timelineData[0].value,
                    formattedTime: timelineData[0].formattedTime
                });
            }
            
            // Transform to our format
            const transformedData = timelineData.map(point => ({
                date: new Date(parseInt(point.time) * 1000).toISOString().split('T')[0],
                value: point.value[0] || 0
            }));
            
            console.log(`   Transformed ${transformedData.length} points`);
            console.log(`   Date range: ${transformedData[0]?.date} to ${transformedData[transformedData.length - 1]?.date}`);
            
            return res.json({
                success: true,
                data: { timeline: transformedData },
                source: 'Google Trends (Free API)',
                count: transformedData.length
            });
        } else {
            console.error('❌ Invalid data structure from Google Trends');
            throw new Error('No timeline data in response');
        }
    } catch (error) {
        console.error('❌ Google Trends Error:', error.message);
        
        if (error.message.includes('429') || error.message.includes('Rate limited')) {
            console.log('');
            console.log('⚠️  GOOGLE TRENDS RATE LIMITED');
            console.log('   This is expected with the free API');
            console.log('   Solutions:');
            console.log('   1. Wait 10-15 minutes before trying again');
            console.log('   2. Use simulated data (automatic fallback)');
            console.log('   3. Dashboard will work perfectly with simulated data');
            console.log('');
        }
        
        console.log('📊 Using simulated trends data as fallback');
    }
    
    // Fallback to enhanced simulation with realistic patterns
    const simulatedData = generateEnhancedTrendsData(startDate, endDate);
    
    res.json({
        success: true,
        data: simulatedData,
        source: 'Simulated (Google Trends unavailable)',
        fallback: true
    });
});

// ============================================================================
// ALTERNATIVE: Free Google Trends (using google-trends-api npm package)
// ============================================================================

app.get('/api/trends/interest-free', async (req, res) => {
    const { keyword, startDate, endDate, geo } = req.query;
    
    try {
        // Using unofficial google-trends-api (no key needed)
        const googleTrends = require('google-trends-api');
        
        const results = await googleTrends.interestOverTime({
            keyword: keyword || 'food delivery',
            startTime: new Date(startDate),
            endTime: new Date(endDate),
            geo: geo || 'IN'
        });
        
        const parsedData = JSON.parse(results);
        
        res.json({
            success: true,
            data: parsedData,
            source: 'Google Trends (Unofficial API)'
        });
    } catch (error) {
        console.error('Google Trends Error:', error.message);
        
        // Fallback to simulation
        const simulatedData = generateEnhancedTrendsData(startDate, endDate);
        
        res.json({
            success: true,
            data: simulatedData,
            source: 'Simulated (API unavailable)',
            fallback: true
        });
    }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateEnhancedTrendsData(startDate, endDate) {
    // Enhanced simulation with realistic patterns
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        
        // Base interest with weekly pattern
        let interest = 50 + Math.sin(d.getTime() / (1000 * 60 * 60 * 24)) * 10;
        
        // Weekend boost
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            interest += 8;
        }
        
        // Evening hours simulation (higher interest)
        interest += Math.random() * 15;
        
        data.push({
            date: dateStr,
            value: Math.round(interest)
        });
    }
    
    return { timeline: data };
}

// ============================================================================
// TEST TRENDS API
// ============================================================================

app.get('/api/test-trends', async (req, res) => {
    try {
        console.log('\n🧪 Testing Google Trends (Free API)...');
        console.log('   Keyword: swiggy');
        console.log('   Geo: IN');
        console.log('   Timeframe: today 12-m\n');
        
        const googleTrends = require('google-trends-api');
        
        // Use correct format with geo and granularTimeResolution
        const results = await googleTrends.interestOverTime({
            keyword: 'swiggy',
            geo: 'IN',
            granularTimeResolution: true
        });
        
        console.log('📊 Raw response type:', typeof results);
        console.log('   Response length:', results.length);
        
        const parsedData = JSON.parse(results);
        const timelineData = parsedData.default?.timelineData || [];
        
        console.log('✅ Trends API working.');
        console.log(`   Received ${timelineData.length} data points`);
        
        if (timelineData.length > 0) {
            console.log('   First point:', {
                time: timelineData[0].time,
                value: timelineData[0].value,
                formatted: timelineData[0].formattedTime
            });
            console.log('   Last point:', {
                time: timelineData[timelineData.length - 1].time,
                value: timelineData[timelineData.length - 1].value,
                formatted: timelineData[timelineData.length - 1].formattedTime
            });
        }
        
        res.json({
            success: true,
            message: 'Trends API working.',
            dataPoints: timelineData.length,
            sample: timelineData.slice(0, 5).map(point => ({
                date: new Date(parseInt(point.time) * 1000).toISOString().split('T')[0],
                value: point.value[0],
                formattedTime: point.formattedTime
            })),
            source: 'Google Trends (Free - No API Key Needed)'
        });
    } catch (error) {
        console.error('❌ Trends API test failed:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            note: 'Google Trends may be rate-limited. Using simulated data as fallback.'
        });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        apis: {
            cricket: CRICAPI_KEY ? 'configured' : 'missing',
            trends: RAPIDAPI_KEY ? 'configured' : 'missing'
        },
        message: CRICAPI_KEY && RAPIDAPI_KEY 
            ? 'All APIs configured' 
            : 'Some API keys missing - using fallback data',
        endpoints: {
            testTrends: '/api/test-trends',
            health: '/api/health',
            cricketMatches: '/api/cricket/matches',
            trendsInterest: '/api/trends/interest'
        }
    });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Data Weaver Server running on http://localhost:' + PORT);
    console.log('='.repeat(60));
    console.log('\n📊 API Configuration Status:\n');
    console.log(`   Cricket API (CricAPI):     ${CRICAPI_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Google Trends (Free API):  ✅ No key needed!`);
    
    if (!CRICAPI_KEY) {
        console.log('\n⚠️  CricAPI key missing:');
        console.log('   Get free key: https://www.cricapi.com/');
        console.log('   Add to .env: CRICAPI_KEY=your_key');
    }
    
    console.log('\n💡 About Google Trends:');
    console.log('   - Using free google-trends-api (no key required)');
    console.log('   - Fetches real search interest data');
    console.log('   - May be rate-limited by Google');
    console.log('   - Auto-falls back to simulated data if unavailable');
    
    console.log('\n🌐 Available Endpoints:\n');
    console.log(`   Dashboard:      http://localhost:${PORT}`);
    console.log(`   Health Check:   http://localhost:${PORT}/api/health`);
    console.log(`   Test Trends:    http://localhost:${PORT}/api/test-trends`);
    console.log(`   Cricket Data:   http://localhost:${PORT}/api/cricket/matches`);
    console.log(`   Trends Data:    http://localhost:${PORT}/api/trends/interest`);
    console.log('\n' + '='.repeat(60) + '\n');
});
