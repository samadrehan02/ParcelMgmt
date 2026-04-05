/**
 * Parcel Management System — main.js
 * Redesigned: clean, modular, modern
 */

// ─── Auth Helpers ──────────────────────────────────────────────────────────────
const Auth = {
  getToken:  () => localStorage.getItem('token'),
  getUser:   () => JSON.parse(localStorage.getItem('user') || 'null'),
  setToken:  (t) => localStorage.setItem('token', t),
  setUser:   (u) => localStorage.setItem('user', JSON.stringify(u)),
  clear:     () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  isAdmin:   () => { const u = Auth.getUser(); return u && u.role === 'admin'; },
  isLoggedIn:() => !!Auth.getToken(),
};

// ─── Navbar auth state ─────────────────────────────────────────────────────────
function updateNavbar() {
  const authNav = document.getElementById('auth-nav');
  if (!authNav) return;
  const user = Auth.getUser();
  if (user) {
    authNav.innerHTML = `
      <a href="${user.role === 'admin' ? '/admin' : '/dashboard'}" class="btn btn-secondary btn-sm">
        <i class="fas fa-user"></i> ${user.fullname?.split(' ')[0] || 'Dashboard'}
      </a>
      <button class="btn btn-primary btn-sm" id="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>`;
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // Add dashboard nav link
    const nav = document.getElementById('main-nav');
    if (nav && !nav.querySelector('[data-nav="dashboard"]')) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${user.role === 'admin' ? '/admin' : '/dashboard'}" class="nav-link" data-nav="dashboard"><i class="fas fa-th-large"></i> Dashboard</a>`;
      nav.appendChild(li);
    }
  }
  // Mark active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === window.location.pathname);
  });
}

// ─── Logout ────────────────────────────────────────────────────────────────────
async function logout() {
  const token = Auth.getToken();
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
  } catch {}
  Auth.clear();
  showToast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = '/', 600);
}

// ─── Toast Notifications ───────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('global-alert-container');
  if (!container) return;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.style.cssText = 'pointer-events:all;display:flex;align-items:center;gap:.6rem;animation:fadeSlideIn .3s ease';
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>
    <button onclick="this.closest('.alert').remove()" style="margin-left:auto;background:none;border:none;cursor:pointer;opacity:.6;font-size:1rem">&#215;</button>`;
  container.appendChild(toast);
  if (duration > 0) setTimeout(() => toast.remove(), duration);
}

// ─── Fetch wrapper with auth ───────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) { Auth.clear(); window.location.href = '/login'; return null; }
  return res;
}

// ─── Parcel status helpers ─────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending: 'Pending', pickedup: 'Picked Up', intransit: 'In Transit',
  outfordelivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
};
const STATUS_ICONS = {
  pending: 'fa-clock', pickedup: 'fa-hand-holding', intransit: 'fa-truck',
  outfordelivery: 'fa-shipping-fast', delivered: 'fa-check-circle', cancelled: 'fa-times-circle'
};
const getStatusLabel = (s) => STATUS_LABELS[s] || s;
const getStatusIcon  = (s) => STATUS_ICONS[s]  || 'fa-circle';

// ─── Date format ───────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtDateTime(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Number counter animation ──────────────────────────────────────────────────
function animateNumber(el, end, suffix = '', duration = 1200) {
  let start = 0, step = end / (duration / 16);
  const t = setInterval(() => {
    start = Math.min(start + step, end);
    el.textContent = Math.floor(start).toLocaleString() + suffix;
    if (start >= end) clearInterval(t);
  }, 16);
}

// ─── Scroll-reveal watcher ─────────────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.animationPlayState = 'running'; io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => { el.style.animationPlayState = 'paused'; io.observe(el); });
}

// ─── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  initScrollReveal();
});

// ─── Exports for inline scripts ────────────────────────────────────────────────
window.ParcelApp = { Auth, apiFetch, showToast, fmtDate, fmtDateTime, animateNumber, getStatusLabel, getStatusIcon };
