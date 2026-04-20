# Story Builder App

A desktop application for creating serialized episodic stories through human-AI collaboration with **AI-powered world building**.

## Phase 1: AI-Based Summary Extraction

1. **Discuss Naturally** - Talk with AI about your world (characters, locations, factions, etc.)
2. **Generate Summary** - AI creates a structured summary with key-value pairs
3. **Build World** - System extracts data from summary into JSON files


## 🛠 Tech Stack

**Backend:**
- Python 3.10+
- Flask (REST API)
- Ollama (Local AI)

**Frontend:**
- React 18
- Vite (Build tool)


## 📋 Prerequisites

1. **Python 3.10 or higher**
   ```bash
   python --version
   ```

2. **Node.js 18 or higher**
   ```bash
   node --version
   ```

3. **Ollama** (for AI features)
   - Download from: https://ollama.ai
   - Install and run:
     ```bash
     ollama serve
     ```
   - Pull a model:
     ```bash
     ollama pull llama3.2
     ```

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/madbowman/story-generator.git
git checkout context-managment-prototype
cd story-generator
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## 🏃 Running the Application

You need **3 terminals**:

### Terminal 1 - Backend Server

```bash
cd backend
# Activate venv if not already activated
python app.py
```

✓ Backend will start on: `http://localhost:5000`

### Terminal 2 - Frontend Dev Server

```bash
cd frontend
npm run dev
```

✓ Frontend will start on: `http://localhost:3000`

### Terminal 3 - Ollama

```bash
ollama serve
```


## 📖 Usage

### Getting Started

1. **Open your browser** to `http://localhost:3000`

2. **Check AI Status** in the top-right corner:
   - Green "● Running" means Ollama is connected
   - Red "● Offline" means Ollama is not available

3. **Create a New Project:**
   - Click the "+" button next to the project selector
   - Fill in title, genre, and description
   - Click "Create Project"


## Trouble Shooting
lsof -i :3000 (Look for the number under the PID column)
kill -9 [THE_PID_NUMBER]