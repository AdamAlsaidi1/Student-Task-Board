# Student-Task-Board

Beginner-friendly mini project to learn Git & GitHub collaboration: cloning repositories, committing changes, working with branches, and using pull requests in a real team workflow.

## Features

- ✅ Add new tasks
- ✅ View all tasks
- ✅ Delete individual tasks
- ✅ Clear all tasks
- ✅ RESTful API backend
- ✅ Modern, responsive UI

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- A web browser

### Backend Setup

1. **Activate virtual environment** (if not already activated):
   ```bash
   source venv/bin/activate  # On macOS/Linux
   # or
   venv\Scripts\activate  # On Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**:
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5001`

### Frontend Setup

1. **Open the frontend**:
   - Simply open `index.html` in your web browser, or
   - Use a local web server (recommended):
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Then open: http://localhost:8000
     ```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `DELETE /api/tasks/<id>` - Delete a specific task
- `DELETE /api/tasks` - Delete all tasks
- `GET /api/health` - Health check

## Project Structure

```
Student-Task-Board/
├── app.py              # Flask backend server
├── index.html          # Frontend HTML
├── script.js           # Frontend JavaScript (API integration)
├── styles.css          # Frontend styling
├── requirements.txt    # Python dependencies
├── tasks.json          # Data storage (auto-created)
└── venv/               # Python virtual environment
```

## Usage

1. Start the backend server (`python app.py`)
2. Open the frontend in your browser
3. Add, view, and manage your tasks!

## Notes

- Tasks are stored in `tasks.json` file
- The backend runs on port 5001 by default (5000 is often used by macOS AirPlay)
- CORS is enabled to allow frontend-backend communication
