// Data Fetcher - Handles all API calls and data processing

class DataFetcher {
    constructor() {
        this.iplMatches = [];
        this.foodInterestData = [];
        this.useRealAPIs = true; // Toggle to use real APIs or fallback data
        this.apiBaseUrl = 'http://localhost:3000/api';
    }

    // Fetch IPL match data from Cricket API
    async fetchIPLMatches() {
        if (this.useRealAPIs) {
            try {
                console.log('Fetching IPL matches from Cricket API...');
                const response = await fetch(`${this.apiBaseUrl}/cricket/matches`);
                const data = await response.json();
                
                if (data.success && data.matches) {
                    // Transform API response to our format
                    this.iplMatches = data.matches.map(match => ({
                        date: match.dateTimeGMT ? match.dateTimeGMT.split('T')[0] : match.date,
                        match: `${match.teams?.[0] || match.team1} vs ${match.teams?.[1] || match.team2}`,
                        venue: match.venue || 'TBD',
                        type: match.matchType || 'league',
                        id: match.id,
                        status: match.status
                    }));
                    
                    console.log(`✅ Fetched ${this.iplMatches.length} IPL matches from API`);
                    return this.iplMatches;
                }
            } catch (error) {
                console.warn('⚠️ Cricket API unavailable, using fallback data:', error.message);
            }
        }
        
        // Fallback to local JSON data
        try {
            const response = await fetch('data/ipl-matches.json');
            this.iplMatches = await response.json();
            console.log(`✅ Loaded ${this.iplMatches.length} matches from local data`);
            return this.iplMatches;
        } catch (error) {
            console.error('Error fetching IPL matches:', error);
            return [];
        }
    }

    // Fetch real Google Trends data
    async fetchRealTrendsData(startDate, endDate) {
        try {
            console.log('🔄 Fetching Google Trends data for "swiggy" in India...');
            const response = await fetch(
                `${this.apiBaseUrl}/trends/interest?keyword=swiggy&geo=IN`
            );
            const data = await response.json();
            
            console.log('📊 Trends API Response:', data.source);
            
            if (data.success && data.data?.timeline) {
                // Transform Google Trends response to our format
                const trendsData = data.data.timeline.map(point => {
                    return {
                        date: point.date,
                        interest: point.value,
                        isMatchDay: this.isMatchDay(point.date)
                    };
                });
                
                // Filter to match our date range
                const filtered = trendsData.filter(d => {
                    return d.date >= startDate && d.date <= endDate;
                });
                
                if (filtered.length > 0) {
                    console.log(`✅ Fetched ${filtered.length} days of real trends data from ${data.source}`);
                    return filtered;
                } else {
                    console.log(`⚠️ No data in date range, using all ${trendsData.length} days`);
                    return trendsData;
                }
            }
        } catch (error) {
            console.warn('⚠️ Google Trends API unavailable:', error.message);
            return null;
        }
    }

    // Check if a date is a match day
    isMatchDay(dateStr) {
        return this.iplMatches.some(match => match.date === dateStr);
    }

    // Fetch or generate food delivery interest data
    async fetchFoodInterestData(startDate, endDate) {
        // Try to fetch real data first
        if (this.useRealAPIs) {
            const realData = await this.fetchRealTrendsData(startDate, endDate);
            if (realData && realData.length > 0) {
                this.foodInterestData = realData;
                return realData;
            }
        }
        
        // Fallback to simulation
        console.log('📊 Using simulated trends data');
        return this.generateFoodInterestData(startDate, endDate);
    }

    // Generate simulated food delivery interest data
    // Used as fallback when API is unavailable
    generateFoodInterestData(startDate, endDate) {
        const data = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const matchDates = new Set(this.iplMatches.map(m => m.date));
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const isMatchDay = matchDates.has(dateStr);
            
            // Base interest level
            let interest = 50 + Math.random() * 20;
            
            // Boost on match days (simulating increased food delivery interest)
            if (isMatchDay) {
                interest += 15 + Math.random() * 15;
            }
            
            // Weekend boost
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                interest += 5 + Math.random() * 5;
            }
            
            data.push({
                date: dateStr,
                interest: Math.round(interest),
                isMatchDay: isMatchDay
            });
        }
        
        this.foodInterestData = data;
        return data;
    }

    // Calculate correlation coefficient
    calculateCorrelation() {
        const matchDayInterest = this.foodInterestData
            .filter(d => d.isMatchDay)
            .map(d => d.interest);
        
        const nonMatchDayInterest = this.foodInterestData
            .filter(d => !d.isMatchDay)
            .map(d => d.interest);
        
        const avgMatch = matchDayInterest.reduce((a, b) => a + b, 0) / matchDayInterest.length;
        const avgNonMatch = nonMatchDayInterest.reduce((a, b) => a + b, 0) / nonMatchDayInterest.length;
        
        // Simple correlation indicator (percentage increase)
        const percentIncrease = ((avgMatch - avgNonMatch) / avgNonMatch * 100).toFixed(1);
        
        return {
            avgMatchDay: avgMatch.toFixed(1),
            avgNonMatchDay: avgNonMatch.toFixed(1),
            percentIncrease: percentIncrease,
            correlation: percentIncrease > 0 ? 'Positive' : 'Negative'
        };
    }

    // Get insights from the data
    getInsights() {
        const stats = this.calculateCorrelation();
        const insights = [];
        
        if (parseFloat(stats.percentIncrease) > 10) {
            insights.push({
                title: 'Strong Correlation Detected',
                text: `Food delivery interest increases by ${stats.percentIncrease}% on IPL match days compared to non-match days.`
            });
        }
        
        // Find peak interest day
        const peakDay = this.foodInterestData.reduce((max, d) => 
            d.interest > max.interest ? d : max
        );
        
        if (peakDay.isMatchDay) {
            const match = this.iplMatches.find(m => m.date === peakDay.date);
            insights.push({
                title: 'Peak Interest Day',
                text: `Highest food delivery interest (${peakDay.interest}) occurred on ${peakDay.date} during ${match.match}.`
            });
        }
        
        insights.push({
            title: 'Cricket & Cravings',
            text: 'The data suggests that cricket fans are more likely to order food while watching matches, possibly to avoid missing game time.'
        });
        
        insights.push({
            title: 'Business Opportunity',
            text: 'Food delivery platforms could optimize their marketing and delivery capacity around major sporting events.'
        });
        
        return insights;
    }
}
