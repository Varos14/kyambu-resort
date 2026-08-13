/* ==========================================================================
   Kyambu Resort — Admin Dashboard Logic
   ========================================================================== */

import { supabase } from './supabase.js';

/* ── State ───────────────────────────────────────────────────────────────── */
let allBookings   = [];
let filterStatus  = 'all';
let searchQuery   = '';
let realtimeSub   = null;

/* ── Boot ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initLogout();
  initSearch();
  initFilter();
  initRefresh();
  checkExistingSession();
});

/* ── Auth ────────────────────────────────────────────────────────────────── */
async function checkExistingSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) showApp(session.user);
}

function initLogin() {
  const form    = document.getElementById('loginForm');
  const errEl   = document.getElementById('loginErr');
  const loginBtn = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in…';

    const email    = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPass').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errEl.textContent = error.message;
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In to Dashboard';
    } else {
      showApp(data.user);
    }
  });
}

function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (realtimeSub) supabase.removeChannel(realtimeSub);
    await supabase.auth.signOut();
    document.getElementById('appShell').classList.remove('visible');
    document.getElementById('loginScreen').style.display = 'flex';
    allBookings = [];
  });
}

function showApp(user) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').classList.add('visible');
  document.getElementById('adminUserLabel').textContent = user.email;
  fetchBookings();
  subscribeRealtime();
}

/* ── Fetch & Render ─────────────────────────────────────────────────────── */
async function fetchBookings() {
  showLoading(true);
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error);
    showLoading(false);
    return;
  }

  allBookings = data || [];
  renderStats();
  renderTable();
  showLoading(false);
}

function renderStats() {
  const total     = allBookings.length;
  const pending   = allBookings.filter(b => b.status === 'pending').length;
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
  const revenue   = allBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_cost || 0), 0);

  setEl('statTotal',     total);
  setEl('statPending',   pending);
  setEl('statConfirmed', confirmed);
  setEl('statRevenue',   `$${revenue.toLocaleString()}`);
}

function renderTable() {
  const tbody  = document.getElementById('bookingsBody');
  const emptyEl = document.getElementById('tableEmpty');

  let filtered = allBookings;

  if (filterStatus !== 'all') {
    filtered = filtered.filter(b => b.status === filterStatus);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(b =>
      b.full_name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  tbody.innerHTML = filtered.map(b => `
    <tr data-id="${b.id}">
      <td>${formatDate(b.created_at)}</td>
      <td><strong>${esc(b.full_name)}</strong></td>
      <td class="muted">${esc(b.email)}</td>
      <td class="muted">${esc(b.phone)}</td>
      <td>${suiteBadge(b.suite)}</td>
      <td class="muted">${b.check_in} → ${b.check_out}</td>
      <td class="muted">${b.guests}</td>
      <td class="muted">${excursionLabel(b.excursion)}</td>
      <td><strong style="color:var(--gold)">$${b.total_cost ?? '—'}</strong></td>
      <td>
        <select class="status-select status-${b.status}" data-id="${b.id}" onchange="updateStatus('${b.id}', this)">
          <option value="pending"   ${b.status === 'pending'   ? 'selected' : ''}>⏳ Pending</option>
          <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>✅ Confirmed</option>
          <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

/* ── Status update ──────────────────────────────────────────────────────── */
window.updateStatus = async (id, selectEl) => {
  const newStatus = selectEl.value;
  selectEl.className = `status-select status-${newStatus}`;

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', id);

  if (error) {
    console.error('Status update failed:', error);
    showToast('❌ Update failed — ' + error.message);
  } else {
    // Reflect in local state
    const booking = allBookings.find(b => b.id === id);
    if (booking) booking.status = newStatus;
    renderStats();
    showToast('✅ Status updated');
  }
};

/* ── Realtime ────────────────────────────────────────────────────────────── */
function subscribeRealtime() {
  realtimeSub = supabase
    .channel('bookings-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
      allBookings.unshift(payload.new);
      renderStats();
      renderTable();
      showToast('🌿 New booking inquiry received!');
    })
    .subscribe();
}

/* ── Controls ────────────────────────────────────────────────────────────── */
function initSearch() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderTable();
  });
}

function initFilter() {
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderTable();
  });
}

function initRefresh() {
  document.getElementById('refreshBtn').addEventListener('click', fetchBookings);
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function showLoading(on) {
  document.getElementById('tableEmpty').style.display = on ? 'block' : 'none';
  if (on) document.getElementById('tableEmpty').innerHTML =
    '<span class="empty-icon">⏳</span>Loading bookings…';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function suiteBadge(suite) {
  const labels = { cottage: 'Canopy Cottage', suite: 'Safari Suite', villa: 'Eco-Villa' };
  return `<span class="suite-badge suite-${suite}">${labels[suite] || suite}</span>`;
}

function excursionLabel(exp) {
  const map = { none: '—', sempaya: 'Sempaya Walk', semuliki: 'Semuliki Safari', full: 'Combo Package' };
  return map[exp] || exp;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* Toast */
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:#1c2334;border:1px solid rgba(255,255,255,0.1);color:#f0f2f7;padding:12px 20px;border-radius:10px;font-size:13px;z-index:9999;transition:opacity 0.3s;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}
