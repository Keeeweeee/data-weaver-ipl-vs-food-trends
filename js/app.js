// Main application logic

const dataFetcher = new DataFetcher();
const chartManager = new ChartManager();

// Initialize the dashboard
async function initDashboard() {
    try {
        // Fetch IPL matches
        const matches = await dataFetcher.fetchIPLMatches();
        
        if (matches.length === 0) {
            console.error('No match data available');
            return;
        }
        
        // Get date range from matches
        const dates = matches.map(m => new Date(m.date));
        const startDate = new Date(Math.min(...dates));
        const endDate = new Date(Math.max(...dates));
        
        // Extend range to include some non-match days
        startDate.setDate(startDate.getDate() - 5);
        endDate.setDate(endDate.getDate() + 5);
        
        // Fetch food interest data (real API or simulated)
        const foodData = await dataFetcher.fetchFoodInterestData(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );
        
        // Calculate statistics
        const stats = dataFetcher.calculateCorrelation();
        
        // Update stats cards
        document.getElementById('totalMatches').textContent = matches.length;
        document.getElementById('avgMatchDay').textContent = stats.avgMatchDay;
        document.getElementById('avgNonMatchDay').textContent = stats.avgNonMatchDay;
        document.getElementById('correlation').textContent = 
            `${stats.correlation} (+${stats.percentIncrease}%)`;
        
        // Create charts
        chartManager.createTimelineChart(foodData, matches);
        chartManager.createComparisonChart(stats);
        
        // Display insights
        displayInsights(dataFetcher.getInsights());
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Display insights
function displayInsights(insights) {
    const container = document.getElementById('insightsList');
    container.innerHTML = '';
    
    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.innerHTML = `
            <h3>${insight.title}</h3>
            <p>${insight.text}</p>
        `;
        container.appendChild(div);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
