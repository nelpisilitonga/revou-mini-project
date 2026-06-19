/* ============================================
   LIFE DASHBOARD — js/app.js
   ============================================ */

/* ===== UTILITY ===== */
function $(id) { return document.getElementById(id); }

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadLS(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

/* ===== THEME (Challenge 1: Light / Dark mode) ===== */
const themeToggle = $('themeToggle');
let currentTheme = loadLS('theme', 'dark');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  saveLS('theme', theme);
  currentTheme = theme;
}

applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

/* ===== CLOCK & GREETING ===== */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2, '0'); }

function updateClock() {
  const now  = new Date();
  const h    = now.getHours();
  const m    = now.getMinutes();
  const s    = now.getSeconds();

  $('clock').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

  $('dateDisplay').textContent =
    `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  let greet;
  if (h >= 5 && h < 12)       greet = 'Good Morning 🌅';
  else if (h >= 12 && h < 17) greet = 'Good Afternoon ☀️';
  else if (h >= 17 && h < 21) greet = 'Good Evening 🌆';
  else                         greet = 'Good Night 🌙';

  $('greeting').textContent = greet;
}

setInterval(updateClock, 1000);
updateClock();

/* ===== CUSTOM NAME (Challenge 2: Custom name in greeting) ===== */
const nameModal    = $('nameModal');
const editNameBtn  = $('editNameBtn');
const saveNameBtn  = $('saveNameBtn');
const cancelNameBtn= $('cancelNameBtn');
const nameInput    = $('nameInput');
const greetingName = $('greetingName');

function loadName() {
  const name = loadLS('userName', '');
  greetingName.textContent = name ? `, ${name}` : '';
}

editNameBtn.addEventListener('click', () => {
  nameInput.value = loadLS('userName', '');
  nameModal.classList.remove('hidden');
  nameInput.focus();
});

saveNameBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  saveLS('userName', name);
  greetingName.textContent = name ? `, ${name}` : '';
  nameModal.classList.add('hidden');
});

cancelNameBtn.addEventListener('click', () => {
  nameModal.classList.add('hidden');
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveNameBtn.click();
  if (e.key === 'Escape') cancelNameBtn.click();
});

// Click outside modal to close
nameModal.addEventListener('click', (e) => {
  if (e.target === nameModal) cancelNameBtn.click();
});

loadName();

/* ===== FOCUS TIMER (Challenge: Change Pomodoro time) ===== */
const timerDisplay  = $('timerDisplay');
const timerStatus   = $('timerStatus');
const timerDuration = $('timerDuration');
const startBtn      = $('startBtn');
const stopBtn       = $('stopBtn');
const resetBtn      = $('resetBtn');

let timerInterval  = null;
let timerSeconds   = 25 * 60;
let timerRunning   = false;

function getTimerMinutes() {
  const val = parseInt(timerDuration.value, 10);
  return (isNaN(val) || val < 1) ? 25 : Math.min(val, 90);
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  timerDisplay.textContent = `${pad(m)}:${pad(s)}`;
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerDisplay.classList.add('running');
  timerStatus.textContent = '⚡ Stay focused!';
  startBtn.disabled = true;
  timerDuration.disabled = true;

  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.classList.remove('running');
      timerStatus.textContent = '🎉 Session complete! Take a break.';
      startBtn.disabled = false;
      timerDuration.disabled = false;
      // Play notification if supported
      if (Notification.permission === 'granted') {
        new Notification('Focus Timer', { body: 'Session complete! Time for a break.' });
      }
      return;
    }
    timerSeconds--;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerDisplay.classList.remove('running');
  timerStatus.textContent = '⏸ Paused';
  startBtn.disabled = false;
  timerDuration.disabled = false;
}

function resetTimer() {
  stopTimer();
  timerSeconds = getTimerMinutes() * 60;
  updateTimerDisplay();
  timerStatus.textContent = 'Ready to focus!';
}

timerDuration.addEventListener('change', () => {
  if (!timerRunning) {
    timerSeconds = getTimerMinutes() * 60;
    updateTimerDisplay();
  }
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click',  stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

updateTimerDisplay();

/* ===== TO-DO LIST ===== */
const taskInput  = $('taskInput');
const addTaskBtn = $('addTaskBtn');
const taskList   = $('taskList');
const taskEmpty  = $('taskEmpty');
const dupWarning = $('dupWarning');

let tasks = loadLS('tasks', []);

let dupTimeout = null;

function showDupWarning() {
  dupWarning.classList.remove('hidden');
  clearTimeout(dupTimeout);
  dupTimeout = setTimeout(() => dupWarning.classList.add('hidden'), 2500);
}

function saveTasks() { saveLS('tasks', tasks); }

function renderTasks() {
  taskList.innerHTML = '';
  taskEmpty.style.display = tasks.length === 0 ? 'block' : 'none';

  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.index = i;

    li.innerHTML = `
      <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''} title="Mark done"/>
      <span class="task-text ${task.done ? 'done' : ''}">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="small-btn edit-btn">✏️</button>
        <button class="small-btn delete-btn">✕</button>
      </div>`;

    // Check toggle
    li.querySelector('.task-check').addEventListener('change', (e) => {
      tasks[i].done = e.target.checked;
      saveTasks();
      renderTasks();
    });

    // Edit
    li.querySelector('.edit-btn').addEventListener('click', () => {
      const span = li.querySelector('.task-text');
      const inp  = document.createElement('input');
      inp.type  = 'text';
      inp.className = 'task-text-input';
      inp.value = task.text;
      span.replaceWith(inp);
      inp.focus();

      const actions = li.querySelector('.task-actions');
      actions.innerHTML = `
        <button class="small-btn save-btn">💾</button>
        <button class="small-btn delete-btn">✕</button>`;

      const saveEdit = () => {
        const newText = inp.value.trim();
        if (newText) { tasks[i].text = newText; saveTasks(); }
        renderTasks();
      };

      actions.querySelector('.save-btn').addEventListener('click', saveEdit);
      actions.querySelector('.delete-btn').addEventListener('click', () => {
        tasks.splice(i, 1);
        saveTasks();
        renderTasks();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') renderTasks();
      });
    });

    // Delete
    li.querySelector('.delete-btn').addEventListener('click', () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  // Challenge 3: Prevent duplicate tasks (case-insensitive)
  const isDup = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (isDup) { showDupWarning(); taskInput.focus(); return; }

  tasks.push({ text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

renderTasks();

/* ===== QUICK LINKS ===== */
const linkName  = $('linkName');
const linkUrl   = $('linkUrl');
const addLinkBtn= $('addLinkBtn');
const linkGrid  = $('linkGrid');
const linkEmpty = $('linkEmpty');

let links = loadLS('quickLinks', [
  { name: 'Google',   url: 'https://google.com'   },
  { name: 'Gmail',    url: 'https://gmail.com'    },
  { name: 'YouTube',  url: 'https://youtube.com'  },
]);

function saveLinks() { saveLS('quickLinks', links); }

function renderLinks() {
  linkGrid.innerHTML = '';
  linkEmpty.style.display = links.length === 0 ? 'block' : 'none';

  links.forEach((link, i) => {
    const chip = document.createElement('div');
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.gap = '0.2rem';

    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.className = 'link-chip';
    a.innerHTML = `🔗 ${escapeHtml(link.name)}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'link-del small-btn';
    delBtn.title = 'Remove';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      links.splice(i, 1);
      saveLinks();
      renderLinks();
    });

    a.appendChild(delBtn);
    linkGrid.appendChild(a);
  });
}

function addLink() {
  const name = linkName.value.trim();
  let   url  = linkUrl.value.trim();
  if (!name || !url) return;

  // Auto-prepend https if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ name, url });
  saveLinks();
  renderLinks();
  linkName.value = '';
  linkUrl.value  = '';
  linkName.focus();
}

addLinkBtn.addEventListener('click', addLink);
linkUrl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });

renderLinks();

/* ===== HELPER ===== */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
