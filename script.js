// Student Task Board - Frontend JavaScript

// Initialize tasks from localStorage on page load
let tasks = [];

// Load tasks from localStorage when page loads
function loadTasks() {
    const savedTasks = localStorage.getItem('studentTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        displayTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('studentTasks', JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const errorMessage = document.getElementById('errorMessage');
    const taskText = taskInput.value.trim();

    // Clear previous error message
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';

    // Validate input
    if (taskText === '') {
        errorMessage.textContent = 'Error: Task cannot be empty. Please enter a task.';
        errorMessage.classList.add('show');
        taskInput.focus();
        return;
    }

    if (taskText.length > 200) {
        errorMessage.textContent = 'Error: Task is too long. Maximum 200 characters allowed.';
        errorMessage.classList.add('show');
        taskInput.focus();
        return;
    }

    // Add task to array
    const newTask = {
        id: Date.now(), // Simple ID generation using timestamp
        text: taskText,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
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
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        displayTasks();
    }
}

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        alert('No tasks to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
        tasks = [];
        saveTasks();
        displayTasks();
    }
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
