// === GLOBAL VARIABLES ===
let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;
let currentTimeSetting = 25;

// Theme
function toggleTheme() {
    document.body.classList.toggle('dark');
    const btn = document.getElementById('theme-toggle');
    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Load theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-toggle').textContent = '☀️';
    }
}

// === TIME & GREETING ===
function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('id-ID', options);
    
    updateGreeting(now.getHours());
}

function updateGreeting(hour) {
    const greetingEl = document.getElementById('greeting-text');
    let greeting = '';
    
    if (hour < 12) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 18) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';
    
    const name = localStorage.getItem('userName') || '';
    greetingEl.textContent = name ? `${greeting}, ${name}!` : greeting;
}

function saveName() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    if (name) {
        localStorage.setItem('userName', name);
        updateGreeting(new Date().getHours());
    }
}

// === FOCUS TIMER ===
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            alert("Waktu fokus selesai! Istirahat sejenak.");
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = currentTimeSetting * 60;
    updateTimerDisplay();
}

function setTime(minutes) {
    currentTimeSetting = minutes;
    resetTimer();
}

// === TO-DO LIST ===
let tasks = [];

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Prevent duplicate
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
        alert("Tugas ini sudah ada!");
        return;
    }
    
    tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    
    input.value = '';
    renderTasks();
    saveTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) task.completed = !task.completed;
        return task;
    });
    renderTasks();
    saveTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newText = prompt("Edit tugas:", task.text);
    if (newText && newText.trim() !== '') {
        task.text = newText.trim();
        renderTasks();
        saveTasks();
    }
}

function deleteTask(id) {
    if (confirm("Hapus tugas ini?")) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
        saveTasks();
    }
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="edit-btn" onclick="editTask(${task.id})">✏️</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
        `;
        
        list.appendChild(li);
    });
}

// === QUICK LINKS ===
let links = [];

function loadLinks() {
    const savedLinks = localStorage.getItem('quickLinks');
    if (savedLinks) {
        links = JSON.parse(savedLinks);
        renderLinks();
    } else {
        // Default links
        links = [
            {id: 1, name: "Google", url: "https://google.com"},
            {id: 2, name: "Gmail", url: "https://gmail.com"},
            {id: 3, name: "YouTube", url: "https://youtube.com"}
        ];
        saveLinks();
        renderLinks();
    }
}

function saveLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(links));
}

function addLink() {
    const nameInput = document.getElementById('link-name');
    const urlInput = document.getElementById('link-url');
    
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    
    if (!name || !url) return;
    
    if (!url.startsWith('http')) url = 'https://' + url;
    
    links.push({
        id: Date.now(),
        name: name,
        url: url
    });
    
    nameInput.value = '';
    urlInput.value = '';
    renderLinks();
    saveLinks();
}

function renderLinks() {
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    
    links.forEach(link => {
        const btn = document.createElement('button');
        btn.textContent = link.name;
        btn.onclick = () => window.open(link.url, '_blank');
        container.appendChild(btn);
    });
}

// === INITIALIZE ===
function init() {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Theme
    loadTheme();
    
    // Name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        document.getElementById('user-name').value = savedName;
    }
    
    // Timer
    updateTimerDisplay();
    
    // Tasks
    loadTasks();
    
    // Links
    loadLinks();
    
    // Keyboard support
    document.getElementById('task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
}

window.onload = init;