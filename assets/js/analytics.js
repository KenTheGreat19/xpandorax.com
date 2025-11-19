// analytics.js - Real-time analytics tracking for xPandorax
(function() {
    'use strict';

    // Analytics namespace
    window.xpandoraxAnalytics = {
        init: init,
        trackPageView: trackPageView,
        trackEvent: trackEvent,
        getStats: getStats,
        getMonthlyData: getMonthlyData,
        getCountryData: getCountryData
    };

    const STORAGE_KEY = 'xpandorax_analytics';
    const SESSION_KEY = 'xpandorax_session';

    function init() {
        // Initialize or load existing analytics data
        let data = loadData();
        
        // Track this page view
        trackPageView();
        
        // Initialize session if new
        initSession();
        
        console.log('Analytics initialized');
    }

    function loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load analytics data:', e);
        }
        
        // Return default empty data structure
        return {
            totalVisits: 0,
            totalPageViews: 0,
            uniqueVisitors: 0,
            sessions: [],
            pageViews: [],
            events: [],
            countries: {},
            continents: {
                'North America': 0,
                'South America': 0,
                'Europe': 0,
                'Africa': 0,
                'Asia': 0,
                'Australia': 0
            },
            bounces: 0,
            sales: {
                monthly: {},
                total: 0
            },
            newUsers: 0,
            newPurchases: 0
        };
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save analytics data:', e);
        }
    }

    // Export local analytics to a remote server endpoint if provided.
    // To use it, set localStorage.setItem('xpandorax_analytics_endpoint', 'https://yourserver.example.com/analytics');
    function exportToServer(endpoint) {
        try {
            const data = loadData();
            if (!endpoint) {
                endpoint = localStorage.getItem('xpandorax_analytics_endpoint');
            }
            if (!endpoint) return Promise.reject(new Error('No endpoint specified'));

            return fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analytics: data, source: 'xpandorax_local' })
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    function initSession() {
        let session = sessionStorage.getItem(SESSION_KEY);
        
        if (!session) {
            // New session
            session = {
                id: generateId(),
                startTime: Date.now(),
                pageViews: [],
                isNew: !localStorage.getItem('xpandorax_returning_visitor')
            };
            
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            
            // Mark as returning visitor for future sessions
            localStorage.setItem('xpandorax_returning_visitor', 'true');
            
            // Track new session
            const data = loadData();
            data.totalVisits++;
            
            if (session.isNew) {
                data.uniqueVisitors++;
                data.newUsers++;
            }
            
            // Try to get location data (simplified)
            detectLocation(data);
            
            data.sessions.push({
                id: session.id,
                startTime: session.startTime,
                isNew: session.isNew
            });
            
            saveData(data);
        }

        // Optionally sync to server if configured
        const endpoint = localStorage.getItem('xpandorax_analytics_endpoint');
        if (endpoint) {
            // Sync once at init (non-blocking)
            exportToServer(endpoint).catch(err => console.warn('Analytics sync failed:', err));
        }
    }

    function trackPageView(page) {
        const data = loadData();
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        
        page = page || window.location.pathname || '/';
        
        // Track page view
        data.totalPageViews++;
        
        const pageView = {
            page: page,
            timestamp: Date.now(),
            sessionId: session.id || 'unknown',
            referrer: document.referrer || 'direct'
        };
        
        data.pageViews.push(pageView);
        
        // Update session page views
        if (session.id) {
            session.pageViews = session.pageViews || [];
            session.pageViews.push(pageView);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            
            // Calculate bounce rate (1 page view = bounce)
            if (session.pageViews.length === 1) {
                // Wait a bit to see if they view another page
                setTimeout(() => {
                    const currentSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
                    if (currentSession.pageViews && currentSession.pageViews.length === 1) {
                        const currentData = loadData();
                        currentData.bounces++;
                        saveData(currentData);
                    }
                }, 5000); // 5 seconds
            }
        }
        
        saveData(data);
    }

    function trackEvent(category, action, label, value) {
        const data = loadData();
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        
        const event = {
            category: category || 'general',
            action: action || 'click',
            label: label || '',
            value: value || 0,
            timestamp: Date.now(),
            sessionId: session.id || 'unknown'
        };
        
        data.events.push(event);
        
        // Track specific events
        if (category === 'content' && action === 'view') {
            // Increment content views
        }
        
        if (category === 'purchase' && action === 'complete') {
            data.newPurchases++;
            data.sales.total += value || 0;
            
            // Add to monthly sales
            const monthKey = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();
            data.sales.monthly[monthKey] = (data.sales.monthly[monthKey] || 0) + (value || 0);
        }
        
        saveData(data);
    }

    function detectLocation(data) {
        // Try to detect location using timezone (simplified approach)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Simple continent mapping based on timezone
        const continentMap = {
            'America': 'North America',
            'Europe': 'Europe',
            'Asia': 'Asia',
            'Africa': 'Africa',
            'Australia': 'Australia',
            'Pacific': 'Australia'
        };
        
        let continent = 'Unknown';
        for (const key in continentMap) {
            if (timezone.includes(key)) {
                continent = continentMap[key];
                break;
            }
        }
        
        if (continent !== 'Unknown') {
            data.continents[continent] = (data.continents[continent] || 0) + 1;
        }
        
        // Simple country detection (very basic)
        const countryMap = {
            'America/New_York': 'United States',
            'America/Los_Angeles': 'United States',
            'America/Chicago': 'United States',
            'Europe/London': 'United Kingdom',
            'Europe/Paris': 'France',
            'Europe/Berlin': 'Germany',
            'Asia/Tokyo': 'Japan',
            'Asia/Shanghai': 'China',
            'Asia/Manila': 'Philippines',
            'Asia/Singapore': 'Singapore',
            'Asia/Seoul': 'South Korea',
            'Asia/Bangkok': 'Thailand',
            'Asia/Jakarta': 'Indonesia',
            'Asia/Kolkata': 'India',
            'Australia/Sydney': 'Australia',
            'America/Toronto': 'Canada',
            'America/Sao_Paulo': 'Brazil'
        };
        
        const country = countryMap[timezone] || 'Unknown';
        if (country !== 'Unknown') {
            if (!data.countries[country]) {
                data.countries[country] = { name: country, count: 0 };
            }
            data.countries[country].count++;
        }
    }

    function getStats() {
        const data = loadData();
        
        // Calculate bounce rate
        const bounceRate = data.totalVisits > 0 
            ? (data.bounces / data.totalVisits) * 100 
            : 0;
        
        return {
            totalVisits: data.totalVisits || 0,
            totalPageViews: data.totalPageViews || 0,
            uniqueVisitors: data.uniqueVisitors || 0,
            bounceRate: bounceRate || 0,
            continents: data.continents || {},
            countries: data.countries || {},
            sales: data.sales || { monthly: {}, total: 0 },
            newUsers: data.newUsers || 0,
            newPurchases: data.newPurchases || 0,
            sessions: data.sessions || [],
            pageViews: data.pageViews || [],
            events: data.events || []
        };
    }

    function getMonthlyData() {
        const data = loadData();
        const monthlyStats = {};
        
        // Process page views by month
        data.pageViews.forEach(pv => {
            const date = new Date(pv.timestamp);
            const monthKey = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
            
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    visits: 0,
                    pageViews: 0,
                    uniqueVisitors: new Set()
                };
            }
            
            monthlyStats[monthKey].pageViews++;
        });
        
        // Process sessions by month
        data.sessions.forEach(session => {
            const date = new Date(session.startTime);
            const monthKey = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
            
            if (monthlyStats[monthKey]) {
                monthlyStats[monthKey].visits++;
                if (session.isNew) {
                    monthlyStats[monthKey].uniqueVisitors.add(session.id);
                }
            }
        });
        
        // Convert to arrays for charting
        const labels = Object.keys(monthlyStats).sort((a, b) => {
            return new Date(a) - new Date(b);
        });
        
        const visits = labels.map(label => monthlyStats[label].visits);
        const pageViews = labels.map(label => monthlyStats[label].pageViews);
        const uniqueVisitors = labels.map(label => monthlyStats[label].uniqueVisitors.size);
        
        return {
            labels: labels,
            visits: visits,
            pageViews: pageViews,
            uniqueVisitors: uniqueVisitors
        };
    }

    function getCountryData() {
        const data = loadData();
        return data.countries || {};
    }

    function generateId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Auto-initialize on script load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
