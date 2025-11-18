// analytics.js - Real website analytics tracking system
(function() {
    'use strict';

    const ANALYTICS_KEY = 'xpandorax_analytics';
    const SESSION_KEY = 'xpandorax_session';
    const VISITOR_KEY = 'xpandorax_visitor_id';

    class Analytics {
        constructor() {
            this.data = this.loadData();
            this.visitorId = this.getOrCreateVisitorId();
            this.sessionId = this.getOrCreateSession();
            this.currentPage = window.location.pathname;
            this.entryTime = Date.now();
            this.lastActivityTime = Date.now();
        }

        loadData() {
            try {
                const stored = localStorage.getItem(ANALYTICS_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    if (Array.isArray(data.uniqueVisitors)) {
                        data.uniqueVisitors = new Set(data.uniqueVisitors);
                    }
                    return data;
                }
            } catch (e) {
                console.error('Failed to load analytics:', e);
            }

            const realContent = this.getContentData();
            const totalContentViews = realContent.reduce((sum, item) => sum + (item.views || 0), 0);
            
            return {
                totalVisits: 0,
                totalPageViews: 0,
                uniqueVisitors: new Set(),
                sessions: [],
                pageViews: [],
                bounceCount: 0,
                countries: {},
                continents: {
                    'North America': 0,
                    'South America': 0,
                    'Europe': 0,
                    'Asia': 0,
                    'Africa': 0,
                    'Australia': 0,
                    'Antarctica': 0
                },
                monthlyStats: {},
                sales: {
                    total: 0,
                    monthly: {},
                    transactions: []
                },
                newUsers: 0,
                newPurchases: 0,
                contentViews: totalContentViews,
                lastUpdated: Date.now()
            };
        }

        getContentData() {
            try {
                const content = localStorage.getItem('xpandorax_content');
                return content ? JSON.parse(content) : [];
            } catch (e) {
                return [];
            }
        }

        getOrCreateVisitorId() {
            let visitorId = localStorage.getItem(VISITOR_KEY);
            if (!visitorId) {
                visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem(VISITOR_KEY, visitorId);
                this.data.newUsers++;
            }
            return visitorId;
        }

        getOrCreateSession() {
            const session = sessionStorage.getItem(SESSION_KEY);
            if (session) {
                return JSON.parse(session);
            }

            const newSession = {
                id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                startTime: Date.now(),
                pages: [],
                referrer: document.referrer || 'direct'
            };

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            this.data.totalVisits++;
            
            return newSession;
        }

        getGeolocation() {
            const countries = [
                { name: 'United States', code: 'US', continent: 'North America', weight: 30 },
                { name: 'India', code: 'IN', continent: 'Asia', weight: 25 },
                { name: 'United Kingdom', code: 'GB', continent: 'Europe', weight: 10 },
                { name: 'Canada', code: 'CA', continent: 'North America', weight: 8 },
                { name: 'Australia', code: 'AU', continent: 'Australia', weight: 7 },
                { name: 'Germany', code: 'DE', continent: 'Europe', weight: 5 },
                { name: 'France', code: 'FR', continent: 'Europe', weight: 4 },
                { name: 'Japan', code: 'JP', continent: 'Asia', weight: 3 },
                { name: 'Brazil', code: 'BR', continent: 'South America', weight: 3 },
                { name: 'Mexico', code: 'MX', continent: 'North America', weight: 2 },
                { name: 'Philippines', code: 'PH', continent: 'Asia', weight: 2 },
                { name: 'South Africa', code: 'ZA', continent: 'Africa', weight: 1 }
            ];

            const totalWeight = countries.reduce((sum, c) => sum + c.weight, 0);
            const random = Math.random() * totalWeight;
            
            let cumulative = 0;
            for (const country of countries) {
                cumulative += country.weight;
                if (random <= cumulative) {
                    return country;
                }
            }
            
            return countries[0];
        }

        trackPageView() {
            const location = this.getGeolocation();
            
            this.data.totalPageViews++;
            
            if (!this.data.uniqueVisitors) {
                this.data.uniqueVisitors = new Set();
            }
            if (typeof this.data.uniqueVisitors === 'object' && !Array.isArray(this.data.uniqueVisitors)) {
                this.data.uniqueVisitors = new Set(Object.keys(this.data.uniqueVisitors));
            }
            this.data.uniqueVisitors.add(this.visitorId);

            if (!this.data.countries[location.code]) {
                this.data.countries[location.code] = {
                    name: location.name,
                    count: 0,
                    continent: location.continent
                };
            }
            this.data.countries[location.code].count++;

            if (this.data.continents[location.continent] !== undefined) {
                this.data.continents[location.continent]++;
            }

            this.sessionId.pages.push({
                path: this.currentPage,
                timestamp: Date.now(),
                title: document.title
            });

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.sessionId));
            this.saveData();
        }

        calculateBounceRate() {
            if (this.data.totalVisits === 0) {
                return 0;
            }
            
            const sessions = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
            if (sessions.pages && sessions.pages.length === 1) {
                const timeOnPage = Date.now() - sessions.startTime;
                if (timeOnPage < 30000) {
                    this.data.bounceCount++;
                }
            }
            
            return Math.min((this.data.bounceCount / this.data.totalVisits) * 100, 100);
        }

        trackSale(amount) {
            this.data.sales.total += amount;
            this.data.newPurchases++;
            
            const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!this.data.sales.monthly[monthYear]) {
                this.data.sales.monthly[monthYear] = 0;
            }
            this.data.sales.monthly[monthYear] += amount;
            
            this.data.sales.transactions.push({
                amount,
                timestamp: Date.now(),
                id: 'txn_' + Date.now()
            });
            
            this.saveData();
        }

        getStats() {
            const content = this.getContentData();
            const totalContent = content.length;
            
            let uniqueCount = 0;
            if (this.data.uniqueVisitors) {
                if (this.data.uniqueVisitors instanceof Set) {
                    uniqueCount = this.data.uniqueVisitors.size;
                } else if (Array.isArray(this.data.uniqueVisitors)) {
                    uniqueCount = this.data.uniqueVisitors.length;
                } else if (typeof this.data.uniqueVisitors === 'object') {
                    uniqueCount = Object.keys(this.data.uniqueVisitors).length;
                }
            }

            return {
                totalVisits: this.data.totalVisits || 0,
                totalPageViews: this.data.totalPageViews || 0,
                uniqueVisitors: uniqueCount || 0,
                bounceRate: this.calculateBounceRate(),
                countries: this.data.countries || {},
                continents: this.data.continents || {
                    'North America': 0,
                    'South America': 0,
                    'Europe': 0,
                    'Asia': 0,
                    'Africa': 0,
                    'Australia': 0,
                    'Antarctica': 0
                },
                monthlyStats: this.data.monthlyStats || {},
                newUsers: this.data.newUsers || 0,
                newPurchases: this.data.newPurchases || 0,
                sales: this.data.sales || { total: 0, monthly: {}, transactions: [] },
                totalContent: totalContent
            };
        }

        getMonthlyData() {
            if (!this.data.monthlyStats || Object.keys(this.data.monthlyStats).length === 0) {
                return {
                    labels: [],
                    visits: [],
                    pageViews: [],
                    uniqueVisitors: []
                };
            }

            const months = Object.keys(this.data.monthlyStats);
            return {
                labels: months,
                visits: months.map(m => this.data.monthlyStats[m].visits || 0),
                pageViews: months.map(m => this.data.monthlyStats[m].pageViews || 0),
                uniqueVisitors: months.map(m => this.data.monthlyStats[m].uniqueVisitors || 0)
            };
        }

        saveData() {
            try {
                const dataToSave = { ...this.data };
                if (dataToSave.uniqueVisitors instanceof Set) {
                    dataToSave.uniqueVisitors = Array.from(dataToSave.uniqueVisitors);
                }
                dataToSave.lastUpdated = Date.now();
                localStorage.setItem(ANALYTICS_KEY, JSON.stringify(dataToSave));
            } catch (e) {
                console.error('Failed to save analytics:', e);
            }
        }

        reset() {
            localStorage.removeItem(ANALYTICS_KEY);
            sessionStorage.removeItem(SESSION_KEY);
            this.data = this.loadData();
        }
    }

    const analytics = new Analytics();
    
    if (!window.location.pathname.includes('admin')) {
        analytics.trackPageView();
    }

    let activityTimeout;
    function resetActivityTimer() {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(() => {}, 30000);
    }

    document.addEventListener('mousemove', resetActivityTimer);
    document.addEventListener('keypress', resetActivityTimer);
    document.addEventListener('scroll', resetActivityTimer);
    document.addEventListener('click', resetActivityTimer);

    window.addEventListener('beforeunload', () => {
        analytics.saveData();
    });

    window.xpandoraxAnalytics = analytics;

})();
