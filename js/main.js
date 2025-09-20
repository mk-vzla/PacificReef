// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pacific Reef Hotel Management System - Starting...');
    
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Check browser compatibility
    if (!checkBrowserSupport()) {
        showBrowserWarning();
        return;
    }

    // Initialize global event listeners
    setupGlobalEventListeners();
    
    // Initialize keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize responsive behavior
    initializeResponsiveBehavior();
    
    // Setup error handling
    setupGlobalErrorHandling();
    
    console.log('Application initialized successfully');
}

function checkBrowserSupport() {
    // Check for required features
    const requiredFeatures = [
        'fetch',
        'localStorage',
        'JSON',
        'addEventListener'
    ];
    
    return requiredFeatures.every(feature => {
        return typeof window[feature] !== 'undefined';
    });
}

function showBrowserWarning() {
    const warning = document.createElement('div');
    warning.className = 'browser-warning';
    warning.innerHTML = `
        <div style="background: #fef2f2; color: #dc2626; padding: 20px; text-align: center; border: 1px solid #fecaca;">
            <h3>Browser Not Supported</h3>
            <p>This application requires a modern browser. Please update your browser or use Chrome, Firefox, Safari, or Edge.</p>
        </div>
    `;
    document.body.insertBefore(warning, document.body.firstChild);
}

function setupGlobalEventListeners() {
    // Handle form submissions globally
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.classList.contains('prevent-default')) {
            e.preventDefault();
        }
    });

    // Handle clicks on disabled elements
    document.addEventListener('click', function(e) {
        if (e.target.disabled || e.target.classList.contains('disabled')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // Handle escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeActiveModal();
        }
    });

    // Handle clicks outside dropdowns to close them
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown.active');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    // Handle online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            focusSearchInput();
        }
        
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            showHelpModal();
        }
        
        // Ctrl/Cmd + L for logout
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            if (authManager && authManager.isLoggedIn()) {
                authManager.logout();
            }
        }
    });
}

function initializeTooltips() {
    // Simple tooltip implementation
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    if (!tooltipText) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-popup';
    tooltip.textContent = tooltipText;
    tooltip.style.cssText = `
        position: absolute;
        background: #1e293b;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    element._tooltip = tooltip;
}

function hideTooltip(e) {
    const element = e.target;
    if (element._tooltip) {
        element._tooltip.remove();
        delete element._tooltip;
    }
}

function initializeResponsiveBehavior() {
    // Handle mobile menu toggles
    const mobileMenuToggles = document.querySelectorAll('.mobile-menu-toggle');
    
    mobileMenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const target = document.getElementById(targetId);
            
            if (target) {
                target.classList.toggle('mobile-open');
            }
        });
    });

    // Handle responsive table scrolling
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

function setupGlobalErrorHandling() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', function(e) {
        console.error('Uncaught error:', e.error);
        showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        showNotification('A network error occurred. Please check your connection.', 'error');
    });
}

// Utility functions
function closeActiveModal() {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach(modal => {
        modal.classList.remove('active');
    });
}

function focusSearchInput() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i]');
    if (searchInputs.length > 0) {
        searchInputs[0].focus();
    }
}

function showHelpModal() {
    // Create and show help modal
    const helpContent = `
        <h3>Keyboard Shortcuts</h3>
        <ul>
            <li><kbd>Ctrl/Cmd + K</kbd> - Focus search</li>
            <li><kbd>Ctrl/Cmd + L</kbd> - Logout</li>
            <li><kbd>Ctrl/Cmd + /</kbd> - Show this help</li>
            <li><kbd>Esc</kbd> - Close modals</li>
        </ul>
        
        <h3>Quick Actions</h3>
        <ul>
            <li>Click on table rows to select them</li>
            <li>Use filters to narrow down results</li>
            <li>Double-click on items to edit them</li>
        </ul>
    `;
    
    showModal('Help', helpContent);
}

function showModal(title, content) {
    // Remove existing help modal
    const existingModal = document.getElementById('helpModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'helpModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div style="padding: 0 24px 24px;">
                ${content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup close handlers
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function handleWindowResize() {
    // Adjust layout for different screen sizes
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-view', isMobile);
    
    // Close mobile menus on resize to desktop
    if (!isMobile) {
        document.querySelectorAll('.mobile-open').forEach(element => {
            element.classList.remove('mobile-open');
        });
    }
}

function handleOnlineStatus() {
    showNotification('Connection restored', 'success');
    document.body.classList.remove('offline');
}

function handleOfflineStatus() {
    showNotification('No internet connection', 'warning');
    document.body.classList.add('offline');
}

// Debounce utility function
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle utility function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format utilities
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date, options = {}) {
    const defaultOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Data validation utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

// Local storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// Export utilities globally
window.utils = {
    debounce,
    throttle,
    formatCurrency,
    formatDate,
    formatDateTime,
    validateEmail,
    validatePhone,
    validateRequired,
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    showModal,
    closeActiveModal
};

// Initialize theme handling
function initializeTheme() {
    const savedTheme = getFromLocalStorage('theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Initialize on load
initializeTheme();

console.log('Main application script loaded successfully');