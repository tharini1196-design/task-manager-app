const API_URL = '/api';
let token = localStorage.getItem('token');

// Show/hide forms
function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// Check if already logged in
window.onload = function() {
    if (token) {
        showDashboard();
    }
};

// Signup
async function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (res.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        showDashboard();
    } else {
        alert(data.message);
    }
}

// Login
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        showDashboard();
    } else {
        alert(data.message);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    token = null;
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'flex';
}

// Show dashboard and load tasks
function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    loadTasks();
}

// Load tasks
async function loadTasks() {
    const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasks = await res.json();

    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    tasks.forEach(task => {
        container.innerHTML += `
            <div class="task-card">
                <div class="task-info">
                    <h3>${task.title}</h3>
                    <p>${task.description || ''}</p>
                    <span class="task-status status-${task.status}">${task.status}</span>
                </div>
                <div class="task-actions">
                    <button class="update-btn" onclick="cycleStatus('${task._id}', '${task.status}')">Update</button>
                    <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
                </div>
            </div>
        `;
    });
}

// Add task
async function addTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const status = document.getElementById('task-status').value;

    if (!title) return alert('Please enter a task title');

    await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, status })
    });

    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    loadTasks();
}

// Cycle task status: pending -> in-progress -> completed -> pending
async function cycleStatus(id, currentStatus) {
    const statusOrder = ['pending', 'in-progress', 'completed'];
    const nextStatus = statusOrder[(statusOrder.indexOf(currentStatus) + 1) % statusOrder.length];

    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
    });

    loadTasks();
}

// Delete task
async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadTasks();
}