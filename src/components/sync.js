import {
  isLoggedIn, getUser, login, register, logout, fetchMe,
  syncNow, checkServer, startAutoSync, updateUserUI
} from '../utils/sync.js';

// ===== Sync Panel State =====
let serverOnline = false;

export function renderSyncPanel() {
  const container = document.getElementById('sync-content');
  if (!container) return;

  renderSyncContent();

  // Check server status periodically
  checkServerStatus();
  setInterval(checkServerStatus, 10000);
}

function checkServerStatus() {
  checkServer().then(online => {
    serverOnline = online;
    const indicator = document.getElementById('server-indicator');
    if (indicator) {
      indicator.className = `server-dot ${online ? 'online' : 'offline'}`;
      indicator.nextElementSibling.textContent = online ? '服务器在线' : '服务器离线';
    }
  });
}

function renderSyncContent() {
  const container = document.getElementById('sync-content');
  if (!container) return;

  if (isLoggedIn() && getUser()) {
    renderLoggedIn(container);
  } else {
    renderLoginForm(container);
  }
}

function renderLoginForm(container) {
  container.innerHTML = `
    <div class="sync-card">
      <div class="sync-header">
        <h3>☁️ 云端同步</h3>
        <p class="sync-hint">登录后学习数据将自动同步到云端，多设备间无缝切换</p>
      </div>

      <div id="server-status-bar">
        <span class="server-dot offline" id="server-indicator"></span>
        <span class="server-status-text">检测中...</span>
      </div>

      <div id="sync-auth-forms">
        <div class="sync-tabs">
          <button class="sync-tab active" id="tab-login">登录</button>
          <button class="sync-tab" id="tab-register">注册</button>
        </div>

        <!-- Login Form -->
        <form class="sync-form" id="login-form">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="login-username" placeholder="请输入用户名" autocomplete="username" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="login-password" placeholder="请输入密码" autocomplete="current-password" />
          </div>
          <div class="form-error" id="login-error"></div>
          <button type="submit" class="sync-submit-btn" id="login-btn">登录</button>
        </form>

        <!-- Register Form -->
        <form class="sync-form" id="register-form" style="display:none;">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="reg-username" placeholder="3个字符以上" autocomplete="username" />
          </div>
          <div class="form-group">
            <label>显示名称</label>
            <input type="text" id="reg-display" placeholder="可选" autocomplete="nickname" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="reg-password" placeholder="6个字符以上" autocomplete="new-password" />
          </div>
          <div class="form-error" id="reg-error"></div>
          <button type="submit" class="sync-submit-btn" id="register-btn">注册</button>
        </form>
      </div>
    </div>
  `;

  // Tab switching
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = '登录中...';

    const result = await login(
      document.getElementById('login-username').value.trim(),
      document.getElementById('login-password').value
    );

    if (result.ok) {
      // Push local data after login
      await syncNow();
      updateUserUI();
      renderSyncContent();
    } else {
      errorEl.textContent = result.error;
      btn.disabled = false;
      btn.textContent = '登录';
    }
  });

  // Register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('reg-error');
    const btn = document.getElementById('register-btn');
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = '注册中...';

    const result = await register(
      document.getElementById('reg-username').value.trim(),
      document.getElementById('reg-password').value,
      document.getElementById('reg-display').value.trim()
    );

    if (result.ok) {
      await syncNow();
      updateUserUI();
      renderSyncContent();
    } else {
      errorEl.textContent = result.error;
      btn.disabled = false;
      btn.textContent = '注册';
    }
  });
}

function renderLoggedIn(container) {
  const user = getUser();
  const lastSync = localStorage.getItem('learnyb_last_sync');
  const lastSyncText = lastSync
    ? `上次同步: ${new Date(lastSync).toLocaleString('zh-CN')}`
    : '尚未同步';

  container.innerHTML = `
    <div class="sync-card">
      <div class="sync-user-header">
        <div class="sync-avatar">${(user.display_name || user.username)[0].toUpperCase()}</div>
        <div class="sync-user-info">
          <div class="sync-username">${user.display_name || user.username}</div>
          <div class="sync-meta">@${user.username}</div>
        </div>
      </div>

      <div class="sync-actions">
        <button class="sync-action-btn primary" id="sync-now-btn">
          <span class="icon">🔄</span> 立即同步
        </button>
        <button class="sync-action-btn" id="sync-pull-btn">
          <span class="icon">⬇️</span> 从云端拉取
        </button>
        <button class="sync-action-btn danger" id="sync-logout-btn">
          <span class="icon">🚪</span> 退出登录
        </button>
      </div>

      <div class="sync-status">
        <span class="server-dot ${serverOnline ? 'online' : 'offline'}" id="server-indicator"></span>
        <span class="server-status-text">${serverOnline ? '服务器在线' : '服务器离线'}</span>
        <span class="sync-time">${lastSyncText}</span>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="sync-card leaderboard-card">
      <h3>🏆 排行榜</h3>
      <div id="leaderboard-content">
        <div class="loading-text">加载中...</div>
      </div>
    </div>
  `;

  // Wire buttons
  document.getElementById('sync-now-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('sync-now-btn');
    btn.innerHTML = '<span class="icon">⏳</span> 同步中...';
    btn.disabled = true;
    await syncNow();
    btn.innerHTML = '<span class="icon">✅</span> 已同步';
    setTimeout(() => {
      btn.innerHTML = '<span class="icon">🔄</span> 立即同步';
      btn.disabled = false;
    }, 2000);
    renderSyncContent();
  });

  document.getElementById('sync-pull-btn')?.addEventListener('click', async () => {
    await pullFromServer();
    // Refresh the page to reflect changes
    location.reload();
  });

  document.getElementById('sync-logout-btn')?.addEventListener('click', async () => {
    await logout();
    updateUserUI();
    renderSyncContent();
  });

  // Load leaderboard
  loadLeaderboard();
}

async function loadLeaderboard() {
  const el = document.getElementById('leaderboard-content');
  if (!el) return;

  try {
    const token = getToken();
    const resp = await fetch('/api/leaderboard/global', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await resp.json();

    if (!data.leaderboard || data.leaderboard.length === 0) {
      el.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">暂无排行数据，开始学习吧！</p>';
      return;
    }

    el.innerHTML = `
      <div class="leaderboard-list">
        ${data.leaderboard.slice(0, 10).map((u, i) => {
          const isMe = u.id === (getUser()?.id);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          return `
            <div class="lb-item ${isMe ? 'me' : ''}">
              <span class="lb-rank">${medal}</span>
              <span class="lb-name">${u.display_name || u.username}</span>
              <span class="lb-score">${u.score} 分</span>
            </div>
          `;
        }).join('')}
      </div>
      ${data.my_rank ? `<div class="my-rank">我的排名: 第 ${data.my_rank} 名</div>` : ''}
    `;
  } catch {
    el.innerHTML = '<p style="color: var(--text-secondary);">加载失败</p>';
  }
}
