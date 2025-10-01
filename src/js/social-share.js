class SocialShare {
    constructor() {
        this.init();
    }

    init() {
        this.bindShareButtons();
        this.bindFloatingShare();
        this.updateShareCounts();
    }

    bindShareButtons() {
        // Share button click handlers
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                const title = e.currentTarget.dataset.title || document.title;
                const url = e.currentTarget.dataset.url || window.location.href;
                
                this.shareContent(platform, title, url);
            });
        });

        // Floating share buttons
        document.querySelectorAll('.floating-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                const title = document.title;
                const url = window.location.href;
                
                this.shareContent(platform, title, url);
            });
        });
    }

    bindFloatingShare() {
        const floatingShare = document.querySelector('.floating-share-btn');
        if (floatingShare) {
            floatingShare.addEventListener('click', () => {
                const options = document.querySelector('.floating-share-options');
                options.style.display = options.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    }

    shareContent(platform, title, url) {
        const encodedTitle = encodeURIComponent(title);
        const encodedUrl = encodeURIComponent(url);
        const text = `${encodedTitle}%0A%0A${encodedUrl}`;

        let shareUrl;

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&via=TeluguNews`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${text}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'copy':
                this.copyToClipboard(url);
                this.showToast('లింక్ కాపీ అయ్యింది!');
                return;
            default:
                return;
        }

        this.openShareWindow(shareUrl, platform);
        this.trackShare(platform);
    }

    openShareWindow(url, platform) {
        const windowFeatures = 'width=600,height=400,menubar=no,toolbar=no,resizable=yes,scrollbars=yes';
        const windowName = `share_${platform}`;
        
        window.open(url, windowName, windowFeatures);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.share-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    trackShare(platform) {
        // Send analytics data
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                'event_category': 'social',
                'event_label': platform,
                'transport_type': 'beacon'
            });
        }

        // Update share count locally
        this.incrementShareCount();
    }

    incrementShareCount() {
        const shareCountElement = document.querySelector('.share-count strong');
        if (shareCountElement) {
            const currentCount = parseInt(shareCountElement.textContent) || 0;
            shareCountElement.textContent = currentCount + 1;
        }
    }

    async updateShareCounts() {
        // You can implement social share count API here
        // For example, using a service that provides share counts
        try {
            const url = window.location.href;
            // const shares = await this.fetchShareCounts(url);
            // this.displayShareCounts(shares);
        } catch (error) {
            console.log('Could not fetch share counts');
        }
    }

    async fetchShareCounts(url) {
        // Example implementation using a share count service
        // This is a placeholder - you might need to use a service like ShareThis
        return {
            facebook: 0,
            twitter: 0,
            linkedin: 0,
            total: 0
        };
    }

    displayShareCounts(counts) {
        const shareCountElement = document.querySelector('.share-count strong');
        if (shareCountElement && counts.total > 0) {
            shareCountElement.textContent = counts.total.toLocaleString();
        }
    }
}

// Initialize social share when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SocialShare();
});

// Service Worker for PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
