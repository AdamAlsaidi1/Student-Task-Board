// Student Task Board - Frontend JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Initialize tasks array
let tasks = [];
let isConnected = false;
let reconnectAttempts = 0;
let healthCheckInterval = null;
let connectionStatusElement = null;

// Helper function for fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        fetch(url, {
            ...options,
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            resolve(response);
        })
        .catch(error => {
            clearTimeout(timeoutId);
            reject(error);
        });
    });
}

// Check server connection
async function checkConnection() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {
            method: 'GET'
        }, 3000);
        
        if (response.ok) {
            if (!isConnected) {
                isConnected = true;
                reconnectAttempts = 0;
                updateConnectionStatus(true);
                // If we just reconnected, reload tasks
                await loadTasks();
            }
            return true;
        }
    } catch (error) {
        if (isConnected || reconnectAttempts === 0) {
            isConnected = false;
            updateConnectionStatus(false);
        }
        return false;
    }
    return false;
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    if (!connectionStatusElement) return;
    
    if (connected) {
        connectionStatusElement.textContent = '🟢 Connected';
        connectionStatusElement.style.color = '#28a745';
        connectionStatusElement.classList.remove('disconnected');
        connectionStatusElement.classList.add('connected');
    } else {
        connectionStatusElement.textContent = '🔴 Disconnected - Retrying...';
        connectionStatusElement.style.color = '#dc3545';
        connectionStatusElement.classList.remove('connected');
        connectionStatusElement.classList.add('disconnected');
    }
}

// Auto-reconnect function
async function attemptReconnect() {
    reconnectAttempts++;
    console.log(`Reconnection attempt ${reconnectAttempts}...`);
    
    const connected = await checkConnection();
    
    if (!connected && reconnectAttempts < 10) {
        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        setTimeout(attemptReconnect, delay);
    } else if (!connected) {
        updateConnectionStatus(false);
        connectionStatusElement.textContent = '🔴 Disconnected - Please check backend server';
    }
}

// Start health check polling
function startHealthCheck() {
    // Check connection every 5 seconds
    healthCheckInterval = setInterval(async () => {
        const connected = await checkConnection();
        if (!connected && isConnected) {
            // Connection lost, start reconnecting
            isConnected = false;
            attemptReconnect();
        }
    }, 5000);
}

// Load tasks from API when page loads
async function loadTasks() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
            method: 'GET'
        }, 5000);
        
        if (response.ok) {
            const loadedTasks = await response.json();
            // Only update if we got valid data
            if (Array.isArray(loadedTasks)) {
                tasks = loadedTasks;
                displayTasks();
                isConnected = true;
                updateConnectionStatus(true);
            }
        } else {
            if (tasks.length > 0) {
                showError('Failed to load tasks from server');
            }
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        isConnected = false;
        updateConnectionStatus(false);
        
        // Don't show error on initial load if server is starting
        if (tasks.length > 0) {
            showError('Cannot connect to server. Retrying...');
            attemptReconnect();
        } else {
            // On initial load, try to reconnect
            attemptReconnect();
        }
    }
}

// Add a new task
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const errorMessage = document.getElementById('errorMessage');
    const taskText = taskInput.value.trim();

    // Clear previous error message
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';

    // Validate input
    if (taskText === '') {
        showError('Error: Task cannot be empty. Please enter a task.');
        taskInput.focus();
        return;
    }

    if (taskText.length > 200) {
        showError('Error: Task is too long. Maximum 200 characters allowed.');
        taskInput.focus();
        return;
    }

    try {
        // Check connection first
        if (!isConnected) {
            const connected = await checkConnection();
            if (!connected) {
                showError('Cannot connect to server. Please wait for reconnection...');
                attemptReconnect();
                return;
            }
        }
        
        // Send POST request to API
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: taskText })
        }, 10000);

        if (response.ok) {
            const newTask = await response.json();
            
            // Add task to local array immediately for instant feedback
            tasks.push(newTask);
            displayTasks();

            // Clear input and show success feedback
            taskInput.value = '';
            taskInput.focus();

            // Show success message briefly
            errorMessage.textContent = `✓ Task added successfully!`;
            errorMessage.style.color = '#28a745';
            errorMessage.classList.add('show');
            
            // Reload from server in background to ensure consistency
            setTimeout(async () => {
                await loadTasks();
            }, 100);
            
            setTimeout(() => {
                errorMessage.classList.remove('show');
                errorMessage.style.color = '#dc3545';
            }, 3000);
        } else {
            const errorData = await response.json();
            showError(`Error: ${errorData.error || 'Failed to add task'}`);
        }
    } catch (error) {
        console.error('Error adding task:', error);
        isConnected = false;
        updateConnectionStatus(false);
        showError('Connection lost. Retrying...');
        attemptReconnect();
    }
}

// Display all tasks
function displayTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    const emptyMessage = document.getElementById('emptyMessage');
    const taskCount = document.getElementById('taskCount');

    // Update task count
    taskCount.textContent = `(${tasks.length})`;

    // Clear container
    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        emptyMessage.classList.remove('hidden');
        tasksContainer.appendChild(emptyMessage);
        return;
    }

    emptyMessage.classList.add('hidden');

    // Sort tasks by creation date (newest first)
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    // Create task items
    sortedTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.setAttribute('data-id', task.id);

        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        const taskNumber = document.createElement('span');
        taskNumber.className = 'task-number';
        taskNumber.textContent = `#${sortedTasks.length - index}`;

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        const taskDate = document.createElement('span');
        taskDate.className = 'task-date';
        if (task.createdAt) {
            const date = new Date(task.createdAt);
            taskDate.textContent = date.toLocaleDateString('sv-SE', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        taskContent.appendChild(taskNumber);
        taskContent.appendChild(taskText);
        taskContent.appendChild(taskDate);

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️ Delete';
        deleteBtn.onclick = () => deleteTask(task.id);

        taskActions.appendChild(deleteBtn);
        taskItem.appendChild(taskContent);
        taskItem.appendChild(taskActions);
        tasksContainer.appendChild(taskItem);
    });
}

// Delete a task
async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            // Check connection first
            if (!isConnected) {
                const connected = await checkConnection();
                if (!connected) {
                    alert('Cannot connect to server. Please wait for reconnection...');
                    attemptReconnect();
                    return;
                }
            }
            
            const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE'
            }, 10000);

            if (response.ok) {
                // Reload all tasks from server to ensure consistency
                await loadTasks();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete task'}`);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            isConnected = false;
            updateConnectionStatus(false);
            alert('Connection lost. Retrying...');
            attemptReconnect();
        }
    }
}

// Clear all tasks
async function clearAllTasks() {
    if (tasks.length === 0) {
        alert('No tasks to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
        try {
            // Check connection first
            if (!isConnected) {
                const connected = await checkConnection();
                if (!connected) {
                    alert('Cannot connect to server. Please wait for reconnection...');
                    attemptReconnect();
                    return;
                }
            }
            
            const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/clear`, {
                method: 'DELETE'
            }, 10000);

            if (response.ok) {
                // Reload all tasks from server to ensure consistency
                await loadTasks();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to clear tasks'}`);
            }
        } catch (error) {
            console.error('Error clearing tasks:', error);
            isConnected = false;
            updateConnectionStatus(false);
            alert('Connection lost. Retrying...');
            attemptReconnect();
        }
    }
}

// Helper function to show error messages
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.color = '#dc3545';
    errorMessage.classList.add('show');
}

// Allow adding task with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    
    // Create connection status element
    connectionStatusElement = document.createElement('div');
    connectionStatusElement.id = 'connectionStatus';
    connectionStatusElement.className = 'connection-status';
    connectionStatusElement.textContent = '🟡 Connecting...';
    connectionStatusElement.style.color = '#ffc107';
    
    // Insert connection status in header
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(connectionStatusElement);
    }
    
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Initial connection check and load tasks
    checkConnection().then(() => {
        loadTasks();
    });
    
    // Start health check polling
    startHealthCheck();
    
    // Focus on input field
    taskInput.focus();
});
