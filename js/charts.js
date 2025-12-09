// Chart.js visualization logic

class ChartManager {
    constructor() {
        this.timelineChart = null;
        this.comparisonChart = null;
    }

    // Create timeline chart showing both IPL matches and food interest
    createTimelineChart(data, matches) {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.timelineChart) {
            this.timelineChart.destroy();
        }
        
        const labels = data.map(d => d.date);
        const interests = data.map(d => d.interest);
        
        // Create match day markers
        const matchDayMarkers = data.map(d => d.isMatchDay ? d.interest : null);
        
        this.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Food Delivery Interest',
                        data: interests,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'IPL Match Days',
                        data: matchDayMarkers,
                        borderColor: '#ff6384',
                        backgroundColor: '#ff6384',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        showLine: false,
                        pointStyle: 'star'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const date = context.label;
                                const match = matches.find(m => m.date === date);
                                if (match) {
                                    return `Match: ${match.match}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Interest Level'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Create comparison bar chart
    createComparisonChart(stats) {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }
        
        this.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Match Days', 'Non-Match Days'],
                datasets: [{
                    label: 'Average Food Delivery Interest',
                    data: [
                        parseFloat(stats.avgMatchDay),
                        parseFloat(stats.avgNonMatchDay)
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(102, 126, 234, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(102, 126, 234, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Interest Level'
                        }
                    }
                }
            }
        });
    }
}
