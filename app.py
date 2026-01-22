from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all API routes

# File to store tasks
TASKS_FILE = 'tasks.json'

def load_tasks():
    """Load tasks from JSON file"""
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_tasks(tasks):
    """Save tasks to JSON file"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    tasks = load_tasks()
    return jsonify(tasks), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.get_json()
    
    # Validate input
    if not data or 'text' not in data:
        return jsonify({'error': 'Task text is required'}), 400
    
    task_text = data['text'].strip()
    
    if not task_text:
        return jsonify({'error': 'Task cannot be empty'}), 400
    
    if len(task_text) > 200:
        return jsonify({'error': 'Task is too long. Maximum 200 characters allowed'}), 400
    
    # Load existing tasks
    tasks = load_tasks()
    
    # Create new task
    new_task = {
        'id': int(datetime.now().timestamp() * 1000),  # Use timestamp as ID
        'text': task_text,
        'createdAt': datetime.now().isoformat()
    }
    
    tasks.append(new_task)
    save_tasks(tasks)
    
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task by ID"""
    tasks = load_tasks()
    
    # Find and remove task
    original_length = len(tasks)
    tasks = [task for task in tasks if task['id'] != task_id]
    
    if len(tasks) == original_length:
        return jsonify({'error': 'Task not found'}), 404
    
    save_tasks(tasks)
    return jsonify({'message': 'Task deleted successfully'}), 200

@app.route('/api/tasks', methods=['DELETE'])
def delete_all_tasks():
    """Delete all tasks"""
    save_tasks([])
    return jsonify({'message': 'All tasks deleted successfully'}), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'API is running'}), 200

if __name__ == '__main__':
    # Create tasks.json if it doesn't exist
    if not os.path.exists(TASKS_FILE):
        save_tasks([])
    
    print("Starting Student Task Board API server...")
    print("API will be available at: http://localhost:5001")
    print("Frontend should be served separately or use Flask to serve static files")
    app.run(debug=True, port=5001, host='127.0.0.1')
