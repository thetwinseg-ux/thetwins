// ============================================================
//  THE TWINS COFFEE® — Shared App Logic v4 (Luxury Edition)
// ============================================================

// ── Clean URL Handler (Instantly strips index.html and .html for clean luxury brand URLs) ──
(function() {
  try {
    const p = window.location.pathname;
    if (p.endsWith('/index.html') || p === '/index.html' || p === 'index.html') {
      const cleanPath = p.replace(/\/index\.html$/, '/').replace(/^\/?index\.html$/, '/') || '/';
      window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    } else if (p.endsWith('.html')) {
      const cleanPath = p.replace(/\.html$/, '');
      window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    }
  } catch(e) {}
})();

/* ─────────────── Default Data ─────────────── */
const DEFAULT_PRODUCTS = [];

const DEFAULT_SHIPPING = [];

// (Removed localStorage data methods: getProducts, getCategories, getShipping, getOrders)


/* ─────────────── Cart ─────────────── */
function getCart() {
  try {
    const s = localStorage.getItem('tc_cart');
    return s ? JSON.parse(s) : [];
  } catch(e) {
    console.error('Cart data corrupted, resetting:', e);
    localStorage.removeItem('tc_cart');
    return [];
  }
}
function _saveCart(cart) {
  localStorage.setItem('tc_cart', JSON.stringify(cart));
  _refreshBadge();
  _renderDrawerItems();
}
function _refreshBadge() {
  const n = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = n;
    b.classList.toggle('visible', n > 0);
  });
}
function cartAdd(item) {
  const cart = getCart();
  const key = [item.productId, item.size, item.type||'', item.roast||''].join('|');
  const ex  = cart.find(c => c.key === key);
  if (ex) ex.qty += (item.qty || 1);
  else     cart.push({ ...item, key, qty: item.qty || 1 });
  _saveCart(cart);
}
function cartRemove(key) { _saveCart(getCart().filter(c => c.key !== key)); }
function cartSetQty(key, qty) {
  if (qty <= 0) return cartRemove(key);
  const cart = getCart(); const item = cart.find(c => c.key === key);
  if (item) item.qty = qty;
  _saveCart(cart);
}
function cartClear()  { _saveCart([]); }
function cartTotal()  { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }

/* ─────────────── Cart Drawer ─────────────── */
function openCartDrawer() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  _renderDrawerItems();
}
function closeCartDrawer() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function _renderDrawerItems() {
  const body = document.getElementById('drawer-body');
  if (!body) return;
  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="drawer-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <p>Your cart is empty.</p>
        <a href="/products" class="btn btn-gold btn-sm" onclick="closeCartDrawer()">Shop Now</a>
      </div>`;
    _updateDrawerSubtotal(0);
    return;
  }

  body.innerHTML = '';
  cart.forEach(item => {
    const opts = [item.size, item.type, item.roast, item.color].filter(Boolean).join(' · ');
    const div = document.createElement('div');
    div.className = 'drawer-item';
    const safeName = typeof escapeHtml === 'function' ? escapeHtml(item.name) : item.name;
    const safeOpts = typeof escapeHtml === 'function' ? escapeHtml(opts) : opts;
    const safeKey = typeof escapeHtml === 'function' ? escapeHtml(item.key) : item.key;
    div.innerHTML = `
      <div class="drawer-item-img"><img src="${item.image}" alt="${safeName}" loading="lazy"/></div>
      <div class="drawer-item-info">
        <div class="drawer-item-name">${safeName}</div>
        ${opts ? `<div class="drawer-item-opts">${safeOpts}</div>` : ''}
        <div class="drawer-item-qty">
          <button class="di-qty-btn" data-key="${safeKey}" data-delta="-1" aria-label="Decrease quantity of ${safeName}">−</button>
          <span class="di-qty-v">${item.qty}</span>
          <button class="di-qty-btn" data-key="${safeKey}" data-delta="1" aria-label="Increase quantity of ${safeName}">+</button>
        </div>
      </div>
      <div class="drawer-item-right">
        <div class="drawer-item-price">${(item.price * item.qty).toLocaleString()} جنيه</div>
        <button class="drawer-item-remove btn-ghost" data-key="${safeKey}" aria-label="Remove ${safeName} from cart">Remove</button>
      </div>`;
    body.appendChild(div);
  });

  // Events
  body.querySelectorAll('.di-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = getCart().find(x => x.key === btn.dataset.key);
      if (c) cartSetQty(btn.dataset.key, c.qty + parseInt(btn.dataset.delta));
    });
  });
  body.querySelectorAll('.drawer-item-remove').forEach(btn => {
    btn.addEventListener('click', () => cartRemove(btn.dataset.key));
  });

  _updateDrawerSubtotal(cartTotal());
}

function _updateDrawerSubtotal(total) {
  const el = document.getElementById('drawer-subtotal');
  if (el) el.textContent = total.toLocaleString() + ' جنيه';
}

// Strict Monochrome - Theme logic removed

/* ─────────────── Toast ─────────────── */
function toast(msg, type = 'success') {
  let wrap = document.getElementById('tc-toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.id = 'tc-toasts'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className = `tc-toast tc-toast--${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 350); }, 3000);
}

/* ─────────────── Helpers ─────────────── */
function genId() { return 'ORD-' + Date.now().toString(36).toUpperCase(); }
function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' });
}

/* ─────────────── Scroll Reveal ─────────────── */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

function initScrollAnim() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.anim-up').forEach(el => obs.observe(el));
}

/* ─────────────── Star Rating HTML ─────────────── */
function starRating(n = 5) {
  return Array.from({ length: 5 }, (_, i) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${i < n ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><path stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>`
  ).join('');
}

/* ─────────────── Night Mode (DRY — called from boot) ─── */
function initNightMode() {
  const saved = localStorage.getItem('tc-theme');
  if (saved === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  }
  // Wire up theme toggle button if present on the page
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('tc-theme', 'light');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('tc-theme', 'dark');
      }
    });
  }
}

/* ─────────────── Cookie / LocalStorage Consent ─────────── */
function initCookieConsent() {
  if (localStorage.getItem('tc-consent-given')) return;
  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--surf1,#1a1714);border-top:1px solid var(--gold,#c9a84c);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:.82rem;color:var(--txt1,#f0ead8);box-shadow:0 -4px 20px rgba(0,0,0,.4);';
  banner.innerHTML = `
    <p style="margin:0;line-height:1.5">نستخدم التخزين المحلي لعربة التسوق وتفضيلاتك. <a href="privacy-policy.html" style="color:var(--gold,#c9a84c);text-decoration:underline">سياسة الخصوصية</a></p>
    <button id="accept-consent-btn" style="background:var(--gold,#c9a84c);color:#0e0c0a;border:none;padding:.5rem 1.2rem;border-radius:8px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit">موافق / Accept</button>
  `;
  document.body.appendChild(banner);
  document.getElementById('accept-consent-btn').addEventListener('click', () => {
    localStorage.setItem('tc-consent-given', '1');
    banner.remove();
  });
}

/* ─────────────── Boot ─────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Night mode (must run early)
  initNightMode();

  // Version guard
  const DATA_VERSION = 'v5';
  if (localStorage.getItem('tc_data_version') !== DATA_VERSION) {
    localStorage.removeItem('tc_products');
    localStorage.removeItem('tc_shipping');
    localStorage.setItem('tc_data_version', DATA_VERSION);
  }

  _refreshBadge();

  // Navbar scroll
  const nb = document.getElementById('navbar');
  if (nb) window.addEventListener('scroll', () => nb.classList.toggle('scrolled', window.scrollY > 50));

  // Hamburger
  const hb = document.getElementById('hamburger');
  const nl = document.getElementById('nav-links');
  if (hb && nl) {
    hb.addEventListener('click', () => { hb.classList.toggle('open'); nl.classList.toggle('open'); });
    nl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        const parentLi = a.closest('.has-dropdown');
        // Only intercept the top-level toggle link, not the sub-links in the mega menu
        if (parentLi && window.innerWidth <= 768 && a.classList.contains('dropdown-toggle')) {
          e.preventDefault(); 
          parentLi.classList.toggle('open');
        } else {
          hb.classList.remove('open'); nl.classList.remove('open');
          document.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('open'));
        }
      });
    });
  }

  // Cart drawer triggers
  document.querySelectorAll('[data-cart-open]').forEach(btn => {
    btn.addEventListener('click', openCartDrawer);
  });
  document.getElementById('drawer-overlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('drawer-close')?.addEventListener('click', closeCartDrawer);

  // Escape key closes drawer
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartDrawer(); });

  // Scroll reveals
  initScrollReveal();
  initScrollAnim();

  // Lucide icons
  if (window.lucide) lucide.createIcons();

  // Cookie consent banner (after page renders)
  initCookieConsent();
});
