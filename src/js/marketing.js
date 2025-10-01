class MarketingManager {
    constructor() {
        this.dataLayer = window.dataLayer || [];
        this.init();
    }

    init() {
        this.setupGTMEvents();
        this.setupNewsletter();
        this.setupPushNotifications();
        this.setupExitIntent();
        this.setupReadingProgress();
        this.trackUserBehavior();
        this.setupAdManager();
    }

    // GTM Event Tracking
    setupGTMEvents() {
        // Track page views
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });

        // Track social shares
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                const platform = e.target.closest('.share-btn').dataset.platform;
                this.trackEvent('share', {
                    content_type: 'article',
                    item_id: window.location.pathname,
                    method: platform
                });
            }
        });

        // Track newsletter signups
        document.addEventListener('submit', (e) => {
            if (e.target.closest('.newsletter-form')) {
                this.trackEvent('newsletter_signup', {
                    method: 'website_form'
                });
            }
        });

        // Track outbound links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.includes(window.location.hostname)) {
                this.trackEvent('outbound_click', {
                    outbound_url: link.href,
                    link_text: link.textContent
                });
            }
        });
    }

    trackEvent(eventName, eventParams) {
        this.dataLayer.push({
            'event': eventName,
            ...eventParams
        });
    }

    // Newsletter Management
    setupNewsletter() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('.newsletter-input').value;
                
                if (this.validateEmail(email)) {
                    await this.subscribeNewsletter(email);
                } else {
                    this.showMessage('దయచేసి సరైన ఈమెయిల్ చిరునామా నమోదు చేయండి', 'error');
                }
            });
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async subscribeNewsletter(email) {
        try {
            // Replace with your newsletter service endpoint
            const response = await fetch('/.netlify/functions/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                this.showMessage('వార్తాలేఖకు చందా పూర్తి అయ్యింది! ధన్యవాదాలు.', 'success');
                this.trackEvent('newsletter_subscription', { email });

                    // Use a third-party service like Mailchimp's embedded form
                // Or Google Forms, etc.
                // this.trackEvent('newsletter_attempt', { email });
                // this.showMessage('చందా వివరాలు త్వరలో నవీకరించబడతాయి', 'info');

                // Reset form
                document.querySelector('.newsletter-input').value = '';
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            this.showMessage('దయచేసి మళ్లీ ప్రయత్నించండి', 'error');
        }
    }

    // Push Notifications
    setupPushNotifications() {
        if ('Notification' in window && localStorage.getItem('pushPrompted') !== 'true') {
            setTimeout(() => {
                this.showPushPrompt();
            }, 10000); // Show after 10 seconds
        }
    }

    showPushPrompt() {
        const pushPrompt = document.querySelector('.push-notification');
        if (pushPrompt) {
            pushPrompt.classList.add('show');
            localStorage.setItem('pushPrompted', 'true');
        }
    }

    requestPushPermission() {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                this.trackEvent('push_notification_enabled');
                this.showMessage('పుష్ నోటిఫికేషన్లు సక్రియం చేయబడ్డాయి', 'success');
                this.setupPushSubscription();
            }
        });
    }

    setupPushSubscription() {
        // Implement push subscription logic here
        // This would typically involve registering with a push service
        console.log('Push notifications enabled');
    }

    // Exit Intent Popup
    setupExitIntent() {
        let mouseY = 0;
        
        document.addEventListener('mouseout', (e) => {
            if (!e.relatedTarget && e.clientY < 50) {
                this.showExitPopup();
            }
        });

        document.addEventListener('mousemove', (e) => {
            mouseY = e.clientY;
        });
    }

    showExitPopup() {
        if (localStorage.getItem('exitPopupShown') !== 'true') {
            const exitPopup = document.querySelector('.exit-popup');
            if (exitPopup) {
                exitPopup.classList.add('show');
                localStorage.setItem('exitPopupShown', 'true');
                this.trackEvent('exit_intent_popup_shown');
            }
        }
    }

    // Reading Progress
    setupReadingProgress() {
        const progressBar = document.querySelector('.reading-progress-bar');
        if (progressBar) {
            window.addEventListener('scroll', () => {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset;
                
                const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
                progressBar.style.width = `${progress}%`;
                
                // Track reading progress
                if (progress > 25) this.trackEvent('article_25_percent_read');
                if (progress > 50) this.trackEvent('article_50_percent_read');
                if (progress > 75) this.trackEvent('article_75_percent_read');
                if (progress > 90) this.trackEvent('article_90_percent_read');
            });
        }
    }

    // User Behavior Tracking
    trackUserBehavior() {
        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.trackEvent('time_on_page', {
                time_spent: Math.round(timeSpent / 1000),
                page_url: window.location.href
            });
        });

        // Track scroll depth
        let scrollDepth = 0;
        window.addEventListener('scroll', () => {
            const newDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (newDepth > scrollDepth) {
                scrollDepth = newDepth;
                this.trackEvent('scroll_depth', {
                    depth_percentage: scrollDepth,
                    page_url: window.location.href
                });
            }
        });

        // Track video engagement (if any)
        this.trackVideoEngagement();
    }

    trackVideoEngagement() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', () => {
                this.trackEvent('video_play', {
                    video_src: video.src,
                    video_title: video.getAttribute('title') || 'Untitled'
                });
            });

            video.addEventListener('ended', () => {
                this.trackEvent('video_complete', {
                    video_src: video.src,
                    video_title: video.getAttribute('title') || 'Untitled'
                });
            });
        });
    }

    // Ad Management
    setupAdManager() {
        this.loadGoogleAdSense();
        this.setupAdRefresh();
        this.trackAdClicks();
    }

    loadGoogleAdSense() {
        // Load Google AdSense
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }

    setupAdRefresh() {
        // Refresh ads every 30 seconds if they're in viewport
        setInterval(() => {
            this.refreshVisibleAds();
        }, 30000);
    }

    refreshVisibleAds() {
        const ads = document.querySelectorAll('.ad-unit');
        ads.forEach(ad => {
            if (this.isElementInViewport(ad)) {
                // Refresh ad (implementation depends on your ad network)
                this.trackEvent('ad_refresh', {
                    ad_position: ad.dataset.position
                });
            }
        });
    }

    trackAdClicks() {
        document.addEventListener('click', (e) => {
            const ad = e.target.closest('.ad-unit');
            if (ad) {
                this.trackEvent('ad_click', {
                    ad_position: ad.dataset.position,
                    ad_type: ad.dataset.type
                });
            }
        });
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Utility Methods
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            z-index: 1004;
            animation: slideInRight 0.3s ease;
        `;

        const backgroundColor = type === 'success' ? '#28a745' : 
                              type === 'error' ? '#dc3545' : 
                              '#17a2b8';
        
        messageDiv.style.background = backgroundColor;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize marketing manager
document.addEventListener('DOMContentLoaded', () => {
    window.marketingManager = new MarketingManager();
});

// Service Worker for Push Notifications
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}
