// dashboard.js - Dashboard analytics and chart initialization with real data
(function() {
    'use strict';

    // Wait for DOM and analytics to be ready
    document.addEventListener('DOMContentLoaded', initDashboard);

    function initDashboard() {
        // Wait a bit for analytics to initialize
        setTimeout(() => {
            loadRealContent();
            loadAnalyticsData();
            initializeCharts();
            initializeWorldMap();
            initializeTodoList();
            initializeWeather();
        }, 100);
    }

    function loadRealContent() {
        // Load real content count from content.json or localStorage
        const contentEl = document.getElementById('totalContent');
        const modelsEl = document.getElementById('totalModels');
        const studiosEl = document.getElementById('totalStudios');
        
        if (contentEl) {
            try {
                const content = JSON.parse(localStorage.getItem('xpandorax_content') || '[]');
                contentEl.textContent = formatNumber(content.length);
            } catch (e) {
                contentEl.textContent = '0';
            }
        }
        
        if (modelsEl) {
            try {
                const models = JSON.parse(localStorage.getItem('xpandorax_models') || '[]');
                modelsEl.textContent = formatNumber(models.length);
            } catch (e) {
                modelsEl.textContent = '0';
            }
        }
        
        if (studiosEl) {
            try {
                const studios = JSON.parse(localStorage.getItem('xpandorax_studios') || '[]');
                studiosEl.textContent = formatNumber(studios.length);
            } catch (e) {
                studiosEl.textContent = '0';
            }
        }
    }

    function loadAnalyticsData() {
        if (!window.xpandoraxAnalytics) {
            console.warn('Analytics not loaded yet, showing zeros');
            setDefaultZeroValues();
            return;
        }

        try {
            const stats = window.xpandoraxAnalytics.getStats();
            
            // Update top metrics with real data or zero
            const totalVisitsEl = document.getElementById('totalVisits');
            const totalPageViewsEl = document.getElementById('totalPageViews');
            const uniqueVisitorsEl = document.getElementById('uniqueVisitors');
            const bounceRateEl = document.getElementById('bounceRate');
            
            if (totalVisitsEl) totalVisitsEl.textContent = formatNumber(stats.totalVisits);
            if (totalPageViewsEl) totalPageViewsEl.textContent = formatNumber(stats.totalPageViews);
            if (uniqueVisitorsEl) uniqueVisitorsEl.textContent = formatNumber(stats.uniqueVisitors);
            if (bounceRateEl) bounceRateEl.textContent = (stats.bounceRate || 0).toFixed(2) + '%';

            // Update trend indicators based on real data
            updateTrendIndicators(stats);

            // Update circular metrics
            updateCircularMetrics(stats);

            // Update sales
            updateSalesData(stats);

            // Update continent stats
            updateContinentStats(stats);
        } catch (e) {
            console.error('Error loading analytics data:', e);
            setDefaultZeroValues();
        }
    }

    function setDefaultZeroValues() {
        const elements = {
            'totalVisits': '0',
            'totalPageViews': '0',
            'uniqueVisitors': '0',
            'bounceRate': '0.00%',
            'newOrdersPercent': '0%',
            'newPurchasesPercent': '0%',
            'bounceRateCircular': '0%',
            'salesAmount': '$0'
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    }

    function updateTrendIndicators(stats) {
        // Calculate trends based on recent vs older data
        // For now, show neutral or calculate from historical data
        const trendElements = document.querySelectorAll('.metric-trend');
        
        // This could be enhanced to compare current vs previous period
        // For now, we'll keep existing placeholders or calculate simple trends
        if (stats.totalVisits === 0) {
            trendElements.forEach(el => {
                el.textContent = '0%';
                el.className = 'metric-trend neutral';
            });
        }
    }

    function updateCircularMetrics(stats) {
        const newOrdersPercent = stats.totalVisits > 0 
            ? Math.floor((stats.newUsers / stats.totalVisits) * 100) 
            : 0;
        const newPurchasesPercent = stats.uniqueVisitors > 0 
            ? Math.floor((stats.newPurchases / stats.uniqueVisitors) * 100) 
            : 0;
        
        const newOrdersEl = document.getElementById('newOrdersPercent');
        const newPurchasesEl = document.getElementById('newPurchasesPercent');
        const bounceRateCircularEl = document.getElementById('bounceRateCircular');
        
        if (newOrdersEl) newOrdersEl.textContent = newOrdersPercent + '%';
        if (newPurchasesEl) newPurchasesEl.textContent = newPurchasesPercent + '%';
        if (bounceRateCircularEl) bounceRateCircularEl.textContent = (stats.bounceRate || 0).toFixed(0) + '%';

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
            if (circle) circle.setAttribute('stroke-dasharray', (stats.bounceRate || 0).toFixed(0) + ', 100');
        }
    }

    function updateSalesData(stats) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();
        const salesAmount = (stats.sales && stats.sales.monthly && stats.sales.monthly[currentMonth]) || 0;
        
        const salesAmountEl = document.getElementById('salesAmount');
        if (salesAmountEl) {
            salesAmountEl.textContent = salesAmount > 0 ? '$' + formatNumber(salesAmount) : '$0';
        }
        
        // Update sales month header
        const salesMonthEl = document.getElementById('salesMonth');
        if (salesMonthEl) {
            salesMonthEl.textContent = currentMonth;
        }
    }

    function updateContinentStats(stats) {
        const continents = stats.continents || {};
        const total = Object.values(continents).reduce((sum, val) => sum + val, 0);
        
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
                const count = continents[data.key] || 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
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
        if (!window.xpandoraxAnalytics) {
            console.warn('Cannot create sparklines without analytics data');
            return;
        }

        const stats = window.xpandoraxAnalytics.getStats();
        const monthlyData = window.xpandoraxAnalytics.getMonthlyData();
        
        // Get last 7 data points for sparklines
        const last7Visits = monthlyData.visits.slice(-7);
        const last7PageViews = monthlyData.pageViews.slice(-7);
        const last7Unique = monthlyData.uniqueVisitors.slice(-7);
        
        // Calculate bounce rate trend (simplified)
        const bounceRates = Array(7).fill(0).map((_, i) => {
            return stats.bounceRate || 0;
        });

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
                    labels: Array(last7Visits.length || 7).fill(''),
                    datasets: [{
                        data: last7Visits.length > 0 ? last7Visits : [0, 0, 0, 0, 0, 0, 0],
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
                    labels: Array(last7PageViews.length || 7).fill(''),
                    datasets: [{
                        data: last7PageViews.length > 0 ? last7PageViews : [0, 0, 0, 0, 0, 0, 0],
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
                    labels: Array(last7Unique.length || 7).fill(''),
                    datasets: [{
                        data: last7Unique.length > 0 ? last7Unique : [0, 0, 0, 0, 0, 0, 0],
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
                    labels: Array(7).fill(''),
                    datasets: [{
                        data: bounceRates,
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

        // If no data, show empty message
        if (!monthlyData.labels || monthlyData.labels.length === 0) {
            const parent = monthlyCtx.parentElement;
            if (parent) {
                const emptyMsg = document.createElement('div');
                emptyMsg.style.cssText = 'text-align: center; padding: 100px 20px; color: #999; font-size: 16px;';
                emptyMsg.textContent = 'No monthly data available yet. Visit your website pages to start tracking analytics.';
                parent.appendChild(emptyMsg);
            }
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

        const stats = window.xpandoraxAnalytics ? window.xpandoraxAnalytics.getStats() : {};
        const countries = Object.values(stats.countries || {});

        // Create simplified world map visualization
        const countryPositions = [
            { name: 'United States', x: 200, y: 180, size: 30 },
            { name: 'Canada', x: 180, y: 120, size: 20 },
            { name: 'United Kingdom', x: 480, y: 150, size: 15 },
            { name: 'India', x: 700, y: 220, size: 25 },
            { name: 'Australia', x: 850, y: 380, size: 20 },
            { name: 'Brazil', x: 320, y: 340, size: 18 },
            { name: 'Germany', x: 510, y: 160, size: 12 },
            { name: 'Japan', x: 860, y: 200, size: 15 },
            { name: 'France', x: 490, y: 170, size: 10 },
            { name: 'Philippines', x: 820, y: 260, size: 12 },
            { name: 'Singapore', x: 800, y: 280, size: 8 },
            { name: 'Thailand', x: 780, y: 250, size: 10 },
            { name: 'Indonesia', x: 810, y: 290, size: 12 },
            { name: 'South Korea', x: 870, y: 190, size: 10 },
            { name: 'China', x: 800, y: 200, size: 25 }
        ];

        // Create country markers
        countryPositions.forEach(position => {
            const countryData = countries.find(c => c.name === position.name);
            const count = countryData ? countryData.count : 0;
            
            if (count > 0) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', position.x);
                circle.setAttribute('cy', position.y);
                circle.setAttribute('r', position.size);
                circle.setAttribute('fill', '#4FACFE');
                circle.setAttribute('opacity', Math.min(0.3 + (count * 0.1), 0.9));
                circle.setAttribute('class', 'country-marker');
                circle.setAttribute('data-country', position.name);
                
                circle.addEventListener('mouseenter', (e) => showMapTooltip(e, position.name, count));
                circle.addEventListener('mouseleave', hideMapTooltip);
                
                worldMap.appendChild(circle);
            }
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

    function showMapTooltip(event, countryName, visitors) {
        const tooltip = document.getElementById('mapTooltip');
        if (!tooltip) return;

        if (!visitors || visitors === 0) {
            tooltip.textContent = `${countryName}: No visitors yet`;
        } else {
            tooltip.textContent = `${countryName}: ${formatNumber(visitors)} visitor${visitors !== 1 ? 's' : ''}`;
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
            if (task && task.trim()) {
                addTodo(task.trim());
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
            if (todos.length > 0) {
                const todoList = document.getElementById('todoList');
                if (todoList) {
                    todoList.innerHTML = '';
                    todos.forEach(todo => {
                        addTodoToDOM(todo.text, todo.completed);
                    });
                }
            }
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
        addTodoToDOM(task, false);
        saveTodos();
    }

    function addTodoToDOM(task, completed) {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;

        const todoId = 'todo_' + Date.now() + '_' + Math.random();
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        if (completed) {
            todoItem.style.opacity = '0.5';
            todoItem.style.textDecoration = 'line-through';
        }
        
        todoItem.innerHTML = `
            <input type="checkbox" id="${todoId}" ${completed ? 'checked' : ''}>
            <label for="${todoId}">${task}</label>
            <span class="todo-badge badge-days">Task</span>
        `;

        const checkbox = todoItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                todoItem.style.opacity = '0.5';
                todoItem.style.textDecoration = 'line-through';
            } else {
                todoItem.style.opacity = '1';
                todoItem.style.textDecoration = 'none';
            }
            saveTodos();
        });

        todoList.appendChild(todoItem);
    }

    function initializeWeather() {
        // Update weather with current data
        const now = new Date();
        const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        
        const weatherDateEl = document.getElementById('weatherDate');
        const weatherDayEl = document.querySelector('.weather-day');
        
        if (weatherDateEl) weatherDateEl.textContent = dateStr;
        if (weatherDayEl) weatherDayEl.textContent = weekday;
        
        // Show default temperature
        const weatherTempEl = document.getElementById('weatherTemp');
        if (weatherTempEl) {
            weatherTempEl.textContent = '--°F';
        }
        
        // Set weather condition based on date
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
        const icons = ['☀️', '⛅', '☁️', '🌧️'];
        const index = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % conditions.length;
        
        const weatherConditionEl = document.getElementById('weatherCondition');
        const weatherIconEl = document.getElementById('weatherIcon');
        
        if (weatherConditionEl) weatherConditionEl.textContent = conditions[index];
        if (weatherIconEl) weatherIconEl.textContent = icons[index];
        
        // Try to get real weather from API (optional)
        fetchRealWeather();
    }

    function fetchRealWeather() {
        // Using a free weather API - requires API key
        // For now, using simulated data based on current date
        // To enable real weather, get a free API key from openweathermap.org
        // and uncomment the code below:
        
        /*
        const apiKey = 'YOUR_API_KEY_HERE';
        const city = 'Manila'; // or use geolocation
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`)
            .then(res => res.json())
            .then(data => {
                const temp = Math.round(data.main.temp);
                document.getElementById('weatherTemp').textContent = temp + '°F';
                document.getElementById('weatherCondition').textContent = data.weather[0].description;
                
                const iconMap = {
                    'Clear': '☀️',
                    'Clouds': '☁️',
                    'Rain': '🌧️',
                    'Snow': '❄️',
                    'Thunderstorm': '⛈️'
                };
                const iconKey = data.weather[0].main;
                document.getElementById('weatherIcon').textContent = iconMap[iconKey] || '⛅';
            })
            .catch(err => {
                console.error('Weather API error:', err);
                document.getElementById('weatherTemp').textContent = '--°F';
            });
        */
    }

    // Refresh data periodically (every minute)
    setInterval(() => {
        loadRealContent();
        loadAnalyticsData();
    }, 60000);

})();
