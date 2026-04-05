/**
 * Parcel Management System - Modern JavaScript
 * Handles authentication, animations, smooth scrolling, and interactivity
 */

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initScrollAnimations();
    initSmoothScroll();
    initCardAnimations();
    initAlertSystem();
    initMobileMenu();
    initRippleEffect();
    initParallaxEffect();
});

// ========================================
// Preloader
// ========================================
function initPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="preloader-spinner"></div>
            <p style="margin-top: 1rem; color: var(--primary-color); font-weight: 600;">Loading...</p>
        </div>
    `;
    document.body.appendChild(preloader);

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 500);
    });

    document.body.style.overflow = 'hidden';
}

// ========================================
// Navigation Management
// ========================================
function initNavigation() {
    updateNavigation();
    initNavbarScroll();
    highlightActiveNavLink();
}

function updateNavigation() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authNav = document.getElementById('auth-nav');
    const mainNav = document.getElementById('main-nav');

    if (!authNav) return;

    if (token && user) {
        // User is logged in - Create elegant user menu
        authNav.innerHTML = `
            <div class="user-menu" style="position: relative;">
                <button class="user-menu-toggle" style="
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(99, 102, 241, 0.08);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(99, 102, 241, 0.15)'" onmouseout="this.style.background='rgba(99, 102, 241, 0.08)'">
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 600;
                        font-size: 0.875rem;
                    ">${getInitials(user.full_name)}</div>
                    <span style="font-weight: 600; color: var(--dark-color); font-size: 0.9rem;">${user.full_name}</span>
                    <i class="fas fa-chevron-down" style="color: var(--secondary-color); font-size: 0.75rem; transition: transform 0.3s ease;"></i>
                </button>
                <div class="user-dropdown" style="
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    right: 0;
                    min-width: 200px;
                    background: white;
                    border-radius: 1rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    z-index: 1000;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 0.5rem;
                ">
                    <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(0, 0, 0, 0.05); margin-bottom: 0.5rem;">
                        <p style="font-weight: 700; color: var(--dark-color); margin: 0; font-size: 0.95rem;">${user.full_name}</p>
                        <p style="font-size: 0.8rem; color: var(--secondary-color); margin: 0.25rem 0 0 0;">${user.email || user.username}</p>
                    </div>
                    <a href="${user.role === 'admin' ? '/admin' : '/dashboard'}" style="
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        color: var(--dark-color);
                        text-decoration: none;
                        border-radius: 0.5rem;
                        transition: all 0.2s ease;
                        font-size: 0.9rem;
                    " onmouseover="this.style.background='rgba(99, 102, 241, 0.08)'" onmouseout="this.style.background='transparent'">
                        <i class="fas fa-tachometer-alt" style="color: var(--primary-color);"></i>
                        Dashboard
                    </a>
                    <a href="/my-parcels" style="
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        color: var(--dark-color);
                        text-decoration: none;
                        border-radius: 0.5rem;
                        transition: all 0.2s ease;
                        font-size: 0.9rem;
                    " onmouseover="this.style.background='rgba(99, 102, 241, 0.08)'" onmouseout="this.style.background='transparent'">
                        <i class="fas fa-box" style="color: var(--primary-color);"></i>
                        My Parcels
                    </a>
                    <button onclick="logout()" style="
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        width: 100%;
                        padding: 0.75rem 1rem;
                        color: var(--danger-color);
                        background: transparent;
                        border: none;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 0.9rem;
                        font-weight: 600;
                        margin-top: 0.5rem;
                    " onmouseover="this.style.background='rgba(239, 68, 68, 0.08)'" onmouseout="this.style.background='transparent'">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;

        // Add dropdown toggle functionality
        const toggle = authNav.querySelector('.user-menu-toggle');
        const dropdown = authNav.querySelector('.user-dropdown');

        if (toggle && dropdown) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = dropdown.style.opacity === '1';
                dropdown.style.opacity = isVisible ? '0' : '1';
                dropdown.style.visibility = isVisible ? 'hidden' : 'visible';
                dropdown.style.transform = isVisible ? 'translateY(-10px)' : 'translateY(0)';
                toggle.querySelector('.fa-chevron-down').style.transform = isVisible ? 'rotate(0)' : 'rotate(180deg)';
            });

            document.addEventListener('click', (e) => {
                if (!authNav.contains(e.target)) {
                    dropdown.style.opacity = '0';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.transform = 'translateY(-10px)';
                    toggle.querySelector('.fa-chevron-down').style.transform = 'rotate(0)';
                }
            });
        }

        // Update main navigation
        if (mainNav) {
            const dashboardLink = user.role === 'admin'
                ? '<li><a href="/admin" class="nav-link" data-nav="admin"><i class="fas fa-shield-alt"></i> Admin</a></li>'
                : '<li><a href="/dashboard" class="nav-link" data-nav="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>';

            const myParcelsLink = '<li><a href="/my-parcels" class="nav-link" data-nav="parcels"><i class="fas fa-box"></i> My Parcels</a></li>';

            const trackLink = mainNav.querySelector('a[href="/track"]');
            if (trackLink) {
                trackLink.innerHTML = '<i class="fas fa-search-location"></i> Track Parcel';
            }

            if (!mainNav.innerHTML.includes('dashboard') && !mainNav.innerHTML.includes('admin')) {
                mainNav.insertAdjacentHTML('beforeend', dashboardLink);
                mainNav.insertAdjacentHTML('beforeend', myParcelsLink);
            }
        }
    } else {
        // User is not logged in
        authNav.innerHTML = `
            <a href="/login" class="btn btn-secondary">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
            <a href="/register" class="btn btn-primary">
                <i class="fas fa-user-plus"></i> Register
            </a>
        `;

        // Reset main navigation
        if (mainNav) {
            mainNav.innerHTML = `
                <li><a href="/" class="nav-link" data-nav="home"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="/track" class="nav-link" data-nav="track"><i class="fas fa-search-location"></i> Track Parcel</a></li>
            `;
        }
    }
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath.includes('/track') && href === '/track')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '<span></span><span></span><span></span>';
    toggle.setAttribute('aria-label', 'Toggle menu');

    const nav = document.querySelector('.navbar-nav');
    if (nav) {
        navbar.insertBefore(toggle, nav);

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
}

// ========================================
// Logout Function
// ========================================
function logout() {
    // Animate logout
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.style.transform = 'scale(0.95)';
        userMenu.style.opacity = '0';
    }

    setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }, 300);
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Stagger children if container has stagger-children class
                if (entry.target.classList.contains('stagger-children')) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        child.style.animationDelay = `${index * 0.1}s`;
                    });
                }

                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with reveal class
    document.querySelectorAll('.reveal, .card, .stat-card, .service-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Observe table rows
    document.querySelectorAll('.table tbody tr').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Card Animations
// ========================================
function initCardAnimations() {
    const cards = document.querySelectorAll('.card, .stat-card, .service-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// ========================================
// Alert System - Toast Notifications
// ========================================
function initAlertSystem() {
    // Create global alert container
    if (!document.getElementById('global-alert-container')) {
        const container = document.createElement('div');
        container.id = 'global-alert-container';
        container.className = 'alert-container';
        document.body.appendChild(container);
    }
}

function showAlert(message, type = 'info', duration = 5000) {
    const container = document.getElementById('global-alert-container') || document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.7;
            transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(alert);

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.4s ease-out forwards';
            setTimeout(() => alert.remove(), 400);
        }, duration);
    }

    return alert;
}

// ========================================
// Ripple Effect for Buttons
// ========================================
function initRippleEffect() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                width: 10px;
                height: 10px;
                margin-left: -5px;
                margin-top: -5px;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation keyframes
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// Parallax Effect
// ========================================
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (scrolled < hero.offsetHeight) {
            hero.style.backgroundPositionY = `${rate}px`;
        }
    }, { passive: true });
}

// ========================================
// API Request Helper
// ========================================
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return null;
        }

        return response;
    } catch (error) {
        console.error('API Error:', error);
        showAlert('Network error. Please check your connection.', 'error');
        throw error;
    }
}

// ========================================
// Utility Functions
// ========================================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'picked_up': 'Picked Up',
        'in_transit': 'In Transit',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getStatusBadge(status) {
    return `<span class="badge badge-${status}">${formatStatus(status)}</span>`;
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function confirmAction(message, callback) {
    // Create custom confirm modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-question-circle" style="color: var(--primary-color);"></i> Confirm Action</h3>
            </div>
            <p style="margin-bottom: 1.5rem; color: var(--secondary-color);">${message}</p>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary" style="flex: 1;" id="confirm-no">Cancel</button>
                <button class="btn btn-danger" style="flex: 1;" id="confirm-yes">Confirm</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    return new Promise((resolve) => {
        modal.querySelector('#confirm-yes').addEventListener('click', () => {
            modal.remove();
            callback();
            resolve(true);
        });

        modal.querySelector('#confirm-no').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

// ========================================
// Modal Functions
// ========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
});

// ========================================
// Loading States
// ========================================
function showLoading(container, message = 'Loading...') {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    el.innerHTML = `
        <div class="loading-pulse" style="padding: 3rem;">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <p style="text-align: center; color: var(--secondary-color);">${message}</p>
    `;
}

function hideLoading(container, content) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;
    el.innerHTML = content;
}

// ========================================
// Number Counter Animation
// ========================================
function animateCounter(element, target, duration = 2000, prefix = '', suffix = '') {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    }, 16);
}

// Initialize counters when they come into view
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.counter);
                const prefix = el.dataset.prefix || '';
                const suffix = el.dataset.suffix || '';
                animateCounter(el, target, 2000, prefix, suffix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Initialize counters on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
} else {
    initCounters();
}

// ========================================
// Export Functions
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateNavigation,
        logout,
        apiRequest,
        showAlert,
        formatDate,
        formatDateTime,
        formatStatus,
        getStatusBadge,
        capitalizeFirst,
        debounce,
        confirmAction,
        openModal,
        closeModal,
        showLoading,
        hideLoading,
        animateCounter
    };
}
