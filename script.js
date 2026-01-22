// Student Task Board - Frontend JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Initialize tasks array
let tasks = [];

// Load tasks from API when page loads
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (response.ok) {
            tasks = await response.json();
            displayTasks();
        } else {
            showError('Failed to load tasks from server');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Cannot connect to server. Make sure the backend is running on http://localhost:5000');
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
        // Send POST request to API
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: taskText })
        });

        if (response.ok) {
            const newTask = await response.json();
            tasks.push(newTask);
            displayTasks();

            // Clear input and show success feedback
            taskInput.value = '';
            taskInput.focus();

            // Show success message briefly
            errorMessage.textContent = `✓ Task added successfully: ${taskText}`;
            errorMessage.style.color = '#28a745';
            errorMessage.classList.add('show');
            
            setTimeout(() => {
                errorMessage.classList.remove('show');
                errorMessage.style.color = '#dc3545';
            }, 2000);
        } else {
            const errorData = await response.json();
            showError(`Error: ${errorData.error || 'Failed to add task'}`);
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showError('Cannot connect to server. Make sure the backend is running.');
    }
}

// Display all tasks
function displayTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    const emptyMessage = document.getElementById('emptyMessage');

    // Clear container
    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');

    // Create task items
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.setAttribute('data-id', task.id);

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = `${index + 1}. ${task.text}`;

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTask(task.id);

        taskActions.appendChild(deleteBtn);
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskActions);
        tasksContainer.appendChild(taskItem);
    });
}

// Delete a task
async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                tasks = tasks.filter(task => task.id !== taskId);
                displayTasks();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete task'}`);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Cannot connect to server. Make sure the backend is running.');
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
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'DELETE'
            });

            if (response.ok) {
                tasks = [];
                displayTasks();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to clear tasks'}`);
            }
        } catch (error) {
            console.error('Error clearing tasks:', error);
            alert('Cannot connect to server. Make sure the backend is running.');
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
    
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Load tasks when page loads
    loadTasks();
    
    // Focus on input field
    taskInput.focus();
});
