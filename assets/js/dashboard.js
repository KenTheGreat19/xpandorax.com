// dashboard.js - Dashboard analytics and chart initialization
(function() {
    'use strict';

    // Wait for DOM and analytics to be ready
    document.addEventListener('DOMContentLoaded', initDashboard);

    function initDashboard() {
        // Wait a bit for analytics to initialize
        setTimeout(() => {
            loadAnalyticsData();
            initializeCharts();
            initializeWorldMap();
            initializeTodoList();
            initializeWeather();
        }, 100);
    }

    function loadAnalyticsData() {
        if (!window.xpandoraxAnalytics) {
            console.warn('Analytics not loaded yet');
            // Show zeros instead of loading fake data
            document.getElementById('totalVisits').textContent = '0';
            document.getElementById('totalPageViews').textContent = '0';
            document.getElementById('uniqueVisitors').textContent = '0';
            document.getElementById('bounceRate').textContent = '0.00%';
            return;
        }

        const stats = window.xpandoraxAnalytics.getStats();
        
        // Update top metrics with real data or zero
        document.getElementById('totalVisits').textContent = formatNumber(stats.totalVisits);
        document.getElementById('totalPageViews').textContent = formatNumber(stats.totalPageViews);
        document.getElementById('uniqueVisitors').textContent = formatNumber(stats.uniqueVisitors);
        document.getElementById('bounceRate').textContent = stats.bounceRate.toFixed(2) + '%';

        // Update circular metrics
        const newOrdersPercent = stats.totalVisits > 0 ? Math.floor((stats.newUsers / stats.totalVisits) * 100) : 0;
        const newPurchasesPercent = stats.uniqueVisitors > 0 ? Math.floor((stats.newPurchases / stats.uniqueVisitors) * 100) : 0;
        
        document.getElementById('newOrdersPercent').textContent = newOrdersPercent + '%';
        document.getElementById('newPurchasesPercent').textContent = newPurchasesPercent + '%';
        document.getElementById('bounceRateCircular').textContent = stats.bounceRate.toFixed(0) + '%';

        // Update circular chart strokes
        const circularMetrics = document.querySelectorAll('.circular-metric');
        if (circularMetrics[0]) {
            const circle = circularMetrics[0].querySelector('.circle');
            if (circle) circle.setAttribute('stroke-dasharray', newOrdersPercent + ', 100');
        }
        if (circularMetrics[1]) {
            const circle = circularMetrics[1].querySelector('.circle');
            if (circle) circle.setAttribute('stroke-dasharray', newPurchasesPercent + ', 100');
        }
        if (circularMetrics[2]) {
            const circle = circularMetrics[2].querySelector('.circle');
            if (circle) circle.setAttribute('stroke-dasharray', stats.bounceRate.toFixed(0) + ', 100');
        }

        // Update sales - show 0 if no data
        const currentMonth = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();
        const salesAmount = stats.sales.monthly[currentMonth] || 0;
        document.getElementById('salesAmount').textContent = salesAmount > 0 ? '$' + formatNumber(salesAmount) : '$0';
        
        // Update sales month header
        const salesMonthEl = document.getElementById('salesMonth');
        if (salesMonthEl) {
            salesMonthEl.textContent = currentMonth;
        }

        // Update continent stats
        updateContinentStats(stats);
    }

    function updateContinentStats(stats) {
        const total = Object.values(stats.continents).reduce((sum, val) => sum + val, 0);
        
        // If no data, show 0%
        if (total === 0) {
            const continentStats = document.querySelectorAll('.continent-stat');
            continentStats.forEach(stat => {
                const valueEl = stat.querySelector('.continent-value');
                const fillEl = stat.querySelector('.progress-fill');
                if (valueEl) valueEl.textContent = '0%';
                if (fillEl) fillEl.style.width = '0%';
            });
            return;
        }

        const continentStats = document.querySelectorAll('.continent-stat');
        const continentData = [
            { name: 'Visitors from USA', key: 'North America', id: 'continent-na' },
            { name: 'Visitors from Europe', key: 'Europe', id: 'continent-eu' },
            { name: 'Visitors from Australia', key: 'Australia', id: 'continent-au' },
            { name: 'Visitors from India', key: 'Asia', id: 'continent-as' }
        ];

        continentStats.forEach((stat, index) => {
            if (index < continentData.length) {
                const data = continentData[index];
                const count = stats.continents[data.key] || 0;
                const percentage = Math.round((count / total) * 100);
                
                const valueEl = stat.querySelector('.continent-value');
                const fillEl = stat.querySelector('.progress-fill');
                
                if (valueEl) valueEl.textContent = percentage + '%';
                if (fillEl) fillEl.style.width = percentage + '%';
            }
        });
    }

    function formatNumber(num) {
        if (!num || num === 0) return '0';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    function initializeCharts() {
        createSparklineCharts();
        createMonthlyChart();
    }

    function createSparklineCharts() {
        const sparklineConfig = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 },
                    line: { borderWidth: 2, tension: 0.4 }
                }
            }
        };

        // Visits sparkline
        const visitsCtx = document.getElementById('visitsSparkline');
        if (visitsCtx) {
            new Chart(visitsCtx.getContext('2d'), {
                ...sparklineConfig,
                data: {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        data: [65, 59, 80, 81, 76, 85, 90],
                        borderColor: '#667EEA',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true
                    }]
                }
            });
        }

        // Page views sparkline
        const pageviewsCtx = document.getElementById('pageviewsSparkline');
        if (pageviewsCtx) {
            new Chart(pageviewsCtx.getContext('2d'), {
                ...sparklineConfig,
                data: {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        data: [85, 79, 70, 71, 76, 65, 60],
                        borderColor: '#F093FB',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        fill: true
                    }]
                }
            });
        }

        // Unique visitors sparkline
        const uniqueCtx = document.getElementById('uniqueSparkline');
        if (uniqueCtx) {
            new Chart(uniqueCtx.getContext('2d'), {
                ...sparklineConfig,
                data: {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        data: [45, 49, 60, 71, 66, 75, 80],
                        borderColor: '#4FACFE',
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        fill: true
                    }]
                }
            });
        }

        // Bounce rate sparkline
        const bounceCtx = document.getElementById('bounceSparkline');
        if (bounceCtx) {
            new Chart(bounceCtx.getContext('2d'), {
                ...sparklineConfig,
                data: {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        data: [40, 42, 38, 41, 39, 43, 40],
                        borderColor: '#FA709A',
                        backgroundColor: 'rgba(250, 112, 154, 0.1)',
                        fill: true
                    }]
                }
            });
        }
    }

    function createMonthlyChart() {
        const monthlyCtx = document.getElementById('monthlyChart');
        if (!monthlyCtx) return;

        const monthlyData = window.xpandoraxAnalytics ? 
            window.xpandoraxAnalytics.getMonthlyData() : 
            { labels: [], visits: [], pageViews: [], uniqueVisitors: [] };

        // If no data, show empty chart with message
        if (monthlyData.labels.length === 0) {
            const parent = monthlyCtx.parentElement;
            const emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = 'text-align: center; padding: 100px 20px; color: #999; font-size: 16px;';
            emptyMsg.textContent = 'No monthly data available yet. Visit your website pages to start tracking.';
            parent.appendChild(emptyMsg);
            monthlyCtx.style.display = 'none';
            return;
        }

        new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Visits',
                        data: monthlyData.visits,
                        borderColor: '#667EEA',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Page Views',
                        data: monthlyData.pageViews,
                        borderColor: '#764BA2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Unique Visitors',
                        data: monthlyData.uniqueVisitors,
                        borderColor: '#F093FB',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatNumber(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            },
                            maxTicksLimit: 6
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    function initializeWorldMap() {
        // Simplified world map with country paths
        const worldMap = document.getElementById('worldMap');
        if (!worldMap) return;

        // Create simplified world map visualization
        const countries = [
            { name: 'United States', x: 200, y: 180, size: 30 },
            { name: 'Canada', x: 180, y: 120, size: 20 },
            { name: 'United Kingdom', x: 480, y: 150, size: 15 },
            { name: 'India', x: 700, y: 220, size: 25 },
            { name: 'Australia', x: 850, y: 380, size: 20 },
            { name: 'Brazil', x: 320, y: 340, size: 18 },
            { name: 'Germany', x: 510, y: 160, size: 12 },
            { name: 'Japan', x: 860, y: 200, size: 15 },
            { name: 'France', x: 490, y: 170, size: 10 }
        ];

        // Create country markers
        countries.forEach(country => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', country.x);
            circle.setAttribute('cy', country.y);
            circle.setAttribute('r', country.size);
            circle.setAttribute('fill', '#4FACFE');
            circle.setAttribute('opacity', '0.6');
            circle.setAttribute('class', 'country-marker');
            circle.setAttribute('data-country', country.name);
            
            circle.addEventListener('mouseenter', (e) => showMapTooltip(e, country.name));
            circle.addEventListener('mouseleave', hideMapTooltip);
            
            worldMap.appendChild(circle);
        });

        // Add continents as background shapes
        addContinentShapes(worldMap);
    }

    function addContinentShapes(svg) {
        // Simplified continent shapes
        const continents = [
            { name: 'North America', d: 'M 150,100 L 280,100 L 300,200 L 250,280 L 150,250 Z', color: '#667EEA' },
            { name: 'South America', d: 'M 250,300 L 320,300 L 340,420 L 280,450 L 240,400 Z', color: '#764BA2' },
            { name: 'Europe', d: 'M 470,120 L 560,120 L 570,200 L 480,220 Z', color: '#F093FB' },
            { name: 'Africa', d: 'M 480,230 L 580,230 L 600,380 L 520,420 L 480,350 Z', color: '#4FACFE' },
            { name: 'Asia', d: 'M 590,100 L 900,100 L 920,300 L 750,280 L 600,250 Z', color: '#FA709A' },
            { name: 'Australia', d: 'M 800,350 L 900,350 L 920,420 L 840,450 Z', color: '#FEE140' }
        ];

        continents.forEach(continent => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', continent.d);
            path.setAttribute('fill', continent.color);
            path.setAttribute('opacity', '0.15');
            path.setAttribute('class', 'continent-shape');
            svg.insertBefore(path, svg.firstChild);
        });
    }

    function showMapTooltip(event, countryName) {
        const tooltip = document.getElementById('mapTooltip');
        if (!tooltip) return;

        const stats = window.xpandoraxAnalytics ? window.xpandoraxAnalytics.getStats() : {};
        const countryData = Object.values(stats.countries || {}).find(c => c.name === countryName);
        const visitors = countryData ? countryData.count : 0;

        if (visitors === 0) {
            tooltip.textContent = `${countryName}: No visitors yet`;
        } else {
            tooltip.textContent = `${countryName}: ${formatNumber(visitors)} visitors`;
        }
        
        tooltip.style.display = 'block';
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY + 10 + 'px';
    }

    function hideMapTooltip() {
        const tooltip = document.getElementById('mapTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    function initializeTodoList() {
        const addTodoBtn = document.getElementById('addTodoBtn');
        if (!addTodoBtn) return;

        // Load todos from localStorage
        loadTodos();

        addTodoBtn.addEventListener('click', () => {
            const task = prompt('Enter new task:');
            if (task) {
                addTodo(task);
            }
        });

        // Add checkbox listeners
        document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoItem = e.target.closest('.todo-item');
                if (e.target.checked) {
                    todoItem.style.opacity = '0.5';
                    todoItem.style.textDecoration = 'line-through';
                } else {
                    todoItem.style.opacity = '1';
                    todoItem.style.textDecoration = 'none';
                }
                saveTodos();
            });
        });
    }

    function loadTodos() {
        try {
            const todos = JSON.parse(localStorage.getItem('xpandorax_todos') || '[]');
            // Restore todo states
        } catch (e) {
            console.error('Failed to load todos:', e);
        }
    }

    function saveTodos() {
        const todos = [];
        document.querySelectorAll('.todo-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const label = item.querySelector('label');
            if (checkbox && label) {
                todos.push({
                    text: label.textContent,
                    completed: checkbox.checked
                });
            }
        });
        localStorage.setItem('xpandorax_todos', JSON.stringify(todos));
    }

    function addTodo(task) {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;

        const todoId = 'todo_' + Date.now();
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <input type="checkbox" id="${todoId}">
            <label for="${todoId}">${task}</label>
            <span class="todo-badge badge-days">New</span>
        `;

        todoList.appendChild(todoItem);
        saveTodos();
    }

    function initializeWeather() {
        // Update weather with current data
        const now = new Date();
        const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        
        document.getElementById('weatherDate').textContent = dateStr;
        document.querySelector('.weather-day').textContent = weekday;
        
        // Default temperature - show as 0 or get from weather API
        const temp = 75; // Default placeholder
        document.getElementById('weatherTemp').textContent = temp + '°F';
        
        const conditions = ['Sunny', 'Partly Clouds', 'Cloudy', 'Rainy'];
        const icons = ['☀️', '⛅', '☁️', '🌧️'];
        const index = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % conditions.length;
        
        document.getElementById('weatherCondition').textContent = conditions[index];
        document.getElementById('weatherIcon').textContent = icons[index];
        
        // Try to get real weather from API (optional)
        fetchRealWeather();
    }

    function fetchRealWeather() {
        // Using a free weather API - requires API key
        // For now, using simulated data based on current date
        // To enable real weather, uncomment and add your API key:
        /*
        const apiKey = 'YOUR_API_KEY';
        const city = 'Manila'; // or user's location
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('weatherTemp').textContent = Math.round(data.main.temp) + '°F';
                document.getElementById('weatherCondition').textContent = data.weather[0].description;
                const iconMap = {
                    'clear': '☀️',
                    'clouds': '☁️',
                    'rain': '🌧️',
                    'snow': '❄️'
                };
                const iconKey = data.weather[0].main.toLowerCase();
                document.getElementById('weatherIcon').textContent = iconMap[iconKey] || '⛅';
            })
            .catch(err => console.error('Weather API error:', err));
        */
    }

    // Refresh data periodically
    setInterval(() => {
        loadAnalyticsData();
    }, 60000); // Every minute

})();
