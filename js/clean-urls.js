// GitHub Pages Clean URL Handler
// Removes .html extension from browser address bar

(function() {
    'use strict';
    
    // Check if URL has .html extension and remove it from address bar
    const path = window.location.pathname;
    
    if (path.includes('.html')) {
        const cleanPath = path.replace('.html', '');
        // Update URL without reloading the page
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, cleanPath);
        }
    }
})();
