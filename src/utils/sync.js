// Sync local data to/from backend
const API_BASE = '/api';

let currentUser = null;
let syncIntervalId = null;
let syncCallback = null;

// ===== Token Management =====
function getToken() {
  return localStorage.getItem('learnyb_token') || sessionStorage.getItem('learnyb_token');
}

function setToken(token) {
  localStorage.setItem('learnyb_token', token);
}

function clearToken() {
  localStorage.removeItem('learnyb_token');
  sessionStorage.removeItem('learnyb_token');
  currentUser = null;
}

// ===== Data Gathering =====
function gatherLocalData() {
  return {
    mastered: JSON.parse(localStorage.getItem('learnyb_mastered') || '[]'),
    attempts: JSON.parse(localStorage.getItem('learnyb_attempts') || '{}'),
    gamification: JSON.parse(localStorage.getItem('learnyb_gamification') || 'null'),
    learning_stages: gatherStageData(),
    recording_history: JSON.parse(localStorage.getItem('learnyb_recording_history') || '[]'),
    search_history: JSON.parse(localStorage.getItem('learnyb_search_history') || '[]'),
  };
}

function gatherStageData() {
  const stages = {};
  for (let i = 1; i <= 7; i++) {
    const key = `learnyb_stage_${i}`;
    const val = localStorage.getItem(key);
    if (val) stages[i] = JSON.parse(val);
  }
  return stages;
}

function applyServerData(data) {
  if (data.mastered) localStorage.setItem('learnyb_mastered', JSON.stringify(data.mastered));
  if (data.attempts) localStorage.setItem('learnyb_attempts', JSON.stringify(data.attempts));
  if (data.gamification) localStorage.setItem('learnyb_gamification', JSON.stringify(data.gamification));
  if (data.learning_stages) {
    for (const [key, val] of Object.entries(data.learning_stages)) {
      localStorage.setItem(`learnyb_stage_${key}`, JSON.stringify(val));
    }
  }
  if (data.recording_history) localStorage.setItem('learnyb_recording_history', JSON.stringify(data.recording_history));
  if (data.search_history) localStorage.setItem('learnyb_search_history', JSON.stringify(data.search_history));
}

// ===== Server Communication =====
async function pushToServer() {
  const token = getToken();
  if (!token) return false;

  try {
    const resp = await fetch(`${API_BASE}/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(gatherLocalData()),
    });

    if (resp.ok) {
      const result = await resp.json();
      localStorage.setItem('learnyb_last_sync', result.synced_at);
      return true;
    } else if (resp.status === 401) {
      clearToken();
      return false;
    }
    return false;
  } catch {
    return false;
  }
}

async function pullFromServer() {
  const token = getToken();
  if (!token) return null;

  try {
    const resp = await fetch(`${API_BASE}/sync/pull`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (resp.ok) {
      const result = await resp.json();
      if (result.data) {
        applyServerData(result.data);
        localStorage.setItem('learnyb_last_sync', result.data.synced_at);
        return result.data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function syncNow() {
  const pushed = await pushToServer();
  if (pushed) {
    await pullFromServer();
    if (syncCallback) syncCallback();
  }
  return pushed;
}

export function startAutoSync(onSync) {
  syncCallback = onSync;
  if (syncIntervalId) clearInterval(syncIntervalId);
  syncIntervalId = setInterval(async () => {
    if (getToken()) await pushToServer();
  }, 30000);
}

export function stopAutoSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

export async function checkServer() {
  try {
    const resp = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return resp.ok;
  } catch {
    return false;
  }
}

// ===== Auth =====
export async function register(username, password, displayName) {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, display_name: displayName }),
  });
  const data = await resp.json();
  if (resp.ok) {
    setToken(data.token);
    currentUser = data.user;
    return { ok: true, user: data.user };
  }
  return { ok: false, error: data.error };
}

export async function login(username, password) {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await resp.json();
  if (resp.ok) {
    setToken(data.token);
    currentUser = data.user;
    return { ok: true, user: data.user };
  }
  return { ok: false, error: data.error };
}

export async function logout() {
  const token = getToken();
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
  clearToken();
}

export async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const resp = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (resp.ok) {
      const data = await resp.json();
      currentUser = data.user;
      return data.user;
    }
    clearToken();
    return null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function getUser() {
  return currentUser;
}

export function updateUserUI() {
  const userEl = document.getElementById('sync-user-info');
  const loginSection = document.getElementById('sync-login-section');
  const userSection = document.getElementById('sync-user-section');
  if (!loginSection || !userSection) return;

  if (currentUser && userEl) {
    userEl.textContent = currentUser.display_name || currentUser.username;
    loginSection.style.display = 'none';
    userSection.style.display = 'flex';
  } else {
    loginSection.style.display = 'flex';
    userSection.style.display = 'none';
  }
}
