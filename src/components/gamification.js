import { speak } from '../utils/audio.js';

// ===== Gamification Data =====
const STORAGE_KEY = 'learnyb_gamification';

function getGamData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"xp":0,"level":1,"streak":0,"lastPracticeDate":null,"achievements":[],"totalCorrect":0,"totalQuestions":0,"practiceDates":[]}');
}

function setGamData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addXP(amount) {
  const data = getGamData();
  data.xp += amount;
  const newLevel = Math.floor(data.xp / 100) + 1;
  if (newLevel > data.level) {
    data.level = newLevel;
    // Check level-up achievements
    checkAchievement(data, `level_${newLevel}`, `🎉 升到 Lv.${newLevel}！`);
  }
  setGamData(data);
  return data;
}

function updateStreak() {
  const data = getGamData();
  const today = new Date().toISOString().split('T')[0];

  if (data.lastPracticeDate === today) {
    return data; // Already practiced today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (data.lastPracticeDate === yesterday) {
    data.streak++;
  } else if (data.lastPracticeDate !== today) {
    data.streak = 1;
  }

  data.lastPracticeDate = today;
  if (!data.practiceDates.includes(today)) {
    data.practiceDates.push(today);
  }

  // Streak achievements
  if (data.streak === 3) checkAchievement(data, 'streak_3', '🔥 连续学习 3 天！');
  if (data.streak === 7) checkAchievement(data, 'streak_7', '🔥🔥 连续学习 7 天！');
  if (data.streak === 30) checkAchievement(data, 'streak_30', '🔥🔥🔥 连续学习 30 天！');

  setGamData(data);
  return data;
}

function recordPractice(correct, total) {
  const data = getGamData();
  data.totalCorrect += correct;
  data.totalQuestions += total;
  setGamData(data);
}

function checkAchievement(data, id, message) {
  if (!data.achievements.includes(id)) {
    data.achievements.push(id);
    setGamData(data);
    showAchievementToast(message);
  }
}

function checkAllAchievements() {
  const data = getGamData();
  const mastered = JSON.parse(localStorage.getItem('learnyb_mastered') || '[]');

  if (mastered.length >= 10) checkAchievement(data, 'master_10', '🏆 掌握 10 个音标！');
  if (mastered.length >= 24) checkAchievement(data, 'master_24', '🏆 掌握所有元音！');
  if (mastered.length >= 48) checkAchievement(data, 'master_48', '👑 全部 48 个音标已掌握！');

  if (data.totalQuestions >= 50) checkAchievement(data, 'practice_50', '📝 完成 50 道练习题！');
  if (data.totalQuestions >= 200) checkAchievement(data, 'practice_200', '📝 完成 200 道练习题！');

  return data;
}

function showAchievementToast(message) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== Achievement Definitions =====
const ALL_ACHIEVEMENTS = [
  { id: 'streak_3', icon: '🔥', label: '三日连续', desc: '连续学习 3 天' },
  { id: 'streak_7', icon: '🔥🔥', label: '一周连续', desc: '连续学习 7 天' },
  { id: 'streak_30', icon: '🔥🔥🔥', label: '月度达人', desc: '连续学习 30 天' },
  { id: 'master_10', icon: '🏆', label: '初出茅庐', desc: '掌握 10 个音标' },
  { id: 'master_24', icon: '🏆', label: '元音大师', desc: '掌握所有元音' },
  { id: 'master_48', icon: '👑', label: '音标王者', desc: '掌握全部 48 个音标' },
  { id: 'practice_50', icon: '📝', label: '练习达人', desc: '完成 50 道练习题' },
  { id: 'practice_200', icon: '📝', label: '练习狂人', desc: '完成 200 道练习题' },
  { id: 'level_5', icon: '⭐', label: '小有成就', desc: '达到等级 5' },
  { id: 'level_10', icon: '⭐⭐', label: '学有所成', desc: '达到等级 10' },
  { id: 'record_1', icon: '🎤', label: '开口说', desc: '完成第一次录音练习' },
  { id: 'first_quiz', icon: '🎯', label: '初试牛刀', desc: '完成第一次听力练习' },
];

// ===== Render Gamification Panel =====
export function renderGamification() {
  const container = document.getElementById('gamification-content');
  if (!container) return;

  checkAllAchievements();
  const data = getGamData();
  const mastered = JSON.parse(localStorage.getItem('learnyb_mastered') || '[]');
  const totalSounds = 48;
  const levelProgress = (data.xp % 100);
  const nextLevelXP = 100 - levelProgress;

  // Calculate practice days in last 7 days
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const recentDays = (data.practiceDates || []).filter(d => new Date(d).getTime() > oneWeekAgo).length;

  container.innerHTML = `
    <!-- XP & Level -->
    <div class="gam-card xp-card">
      <div class="xp-header">
        <div class="level-badge">Lv.${data.level}</div>
        <div class="xp-info">
          <div class="xp-bar-outer">
            <div class="xp-bar-inner" style="width: ${levelProgress}%"></div>
          </div>
          <div class="xp-text">${levelProgress} / 100 XP（距下一级还需 ${nextLevelXP}）</div>
        </div>
      </div>
    </div>

    <!-- Streak -->
    <div class="gam-card streak-card">
      <div class="streak-icon">${data.streak >= 7 ? '🔥🔥🔥' : data.streak >= 3 ? '🔥🔥' : data.streak > 0 ? '🔥' : '💤'}</div>
      <div class="streak-count">${data.streak}</div>
      <div class="streak-label">连续学习天数</div>
      ${data.lastPracticeDate ? `<div class="streak-last">上次学习: ${data.lastPracticeDate}</div>` : ''}
    </div>

    <!-- Stats -->
    <div class="gam-stats-grid">
      <div class="gam-stat-card">
        <div class="gam-stat-value">${mastered.length}</div>
        <div class="gam-stat-label">已掌握音标</div>
      </div>
      <div class="gam-stat-card">
        <div class="gam-stat-value">${data.totalQuestions}</div>
        <div class="gam-stat-label">练习题数</div>
      </div>
      <div class="gam-stat-card">
        <div class="gam-stat-value">${data.totalQuestions > 0 ? Math.round((data.totalCorrect / data.totalQuestions) * 100) : 0}%</div>
        <div class="gam-stat-label">正确率</div>
      </div>
      <div class="gam-stat-card">
        <div class="gam-stat-value">${recentDays}/7</div>
        <div class="gam-stat-label">近7天练习</div>
      </div>
    </div>

    <!-- Weekly Calendar -->
    <div class="gam-card calendar-card">
      <h3>📅 本周打卡</h3>
      <div class="calendar-week">
        ${getWeekDays().map(day => {
          const dateStr = day.toISOString().split('T')[0];
          const isPracticed = (data.practiceDates || []).includes(dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          return `
            <div class="calendar-day ${isPracticed ? 'practiced' : ''} ${isToday ? 'today' : ''}">
              <div class="calendar-dow">${['日','一','二','三','四','五','六'][day.getDay()]}</div>
              <div class="calendar-date">${day.getDate()}</div>
              <div class="calendar-dot">${isPracticed ? '●' : '○'}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Achievements -->
    <div class="gam-card achievements-card">
      <h3>🏅 成就徽章</h3>
      <div class="achievements-grid">
        ${ALL_ACHIEVEMENTS.map(a => {
          const unlocked = data.achievements.includes(a.id);
          return `
            <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
              <div class="achievement-icon">${a.icon}</div>
              <div class="achievement-label">${a.label}</div>
              <div class="achievement-desc">${a.desc}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function getWeekDays() {
  const days = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

// ===== Hook for practice modules =====
export function onPracticeComplete(correctCount, totalCount) {
  const data = updateStreak();
  recordPractice(correctCount, totalCount);
  addXP(correctCount * 10);
  checkAllAchievements();
  return data;
}
