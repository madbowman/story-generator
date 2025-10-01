# Story Builder App - Phase 1 MVP

A desktop application for creating serialized episodic stories through human-AI collaboration.

## Features (Phase 1)

✅ **Project Management**
- Create and manage multiple story projects
- Auto-save functionality
- Project metadata (title, genre, description)

✅ **World Building**
- Collaborative world development with AI
- World overview editor
- Locations management
- Character templates
- Structured JSON storage

✅ **AI Integration**
- Local Ollama integration
- Real-time AI status monitoring
- Available models listing
- Adjustable creativity (temperature)
- Chat interface for collaboration

✅ **Modern UI**
- Three-panel layout (Navigation | Editor | AI Chat)
- Dark theme optimized for long writing sessions
- Responsive components
- Save status indicators

## Tech Stack

**Backend:**
- Python 3.10+
- Flask (REST API)
- Ollama (Local AI)

**Frontend:**
- React 18
- Vite (Build tool)
- Axios (API calls)

**Storage:**
- JSON files (local filesystem)

## Prerequisites

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
   - Install and run: `ollama serve`
   - Pull a model: `ollama pull llama3.2`

## Installation

### 1. Clone/Download the Project

```bash
# If using git
git clone <repository-url>
cd story-builder

# Or extract the downloaded files
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

## Running the Application

### Terminal 1 - Backend Server

```bash
cd backend
# Activate venv if not already activated
python app.py
```

Backend will start on: `http://localhost:5000`

### Terminal 2 - Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend will start on: `http://localhost:3000`

### Terminal 3 - Ollama (if not running)

```bash
ollama serve
```

## Usage

1. **Open your browser** to `http://localhost:3000`

2. **Check AI Status** in the top-right corner:
   - Green "● Running" means Ollama is connected
   - Red "● Offline" means Ollama is not available

3. **Create a New Project:**
   - Click the "+" button next to the project selector
   - Fill in title, genre, and description
   - Click "Create Project"

4. **Build Your World:**
   - Navigate to "World Builder" in the left sidebar
   - Fill in world overview details
   - Add locations, characters, etc.
   - Use the AI Chat on the right to collaborate

5. **Collaborate with AI:**
   - Type messages in the AI Chat panel
   - AI will help you develop ideas
   - Adjust creativity with the temperature slider
   - Select different models from the dropdown

## Project Structure

```
story-builder/
├── backend/
│   ├── app.py                          # Flask application
│   ├── requirements.txt                # Python dependencies
│   └── modules/
│       ├── project_manager.py          # Project CRUD operations
│       └── ai_integration/
│           └── ollama_client.py        # Ollama API client
│
├── frontend/
│   ├── package.json                    # Node dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── index.html                      # HTML entry point
│   └── src/
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # Main application
│       ├── index.css                   # Global styles
│       ├── services/
│       │   └── api.js                  # Backend API calls
│       ├── context/
│       │   └── ProjectContext.jsx      # Project state management
│       └── components/
│           ├── AIStatus.jsx            # Ollama status indicator
│           ├── ProjectSelector.jsx     # Project switcher
│           ├── AIChat.jsx              # AI collaboration chat
│           └── WorldBuilder/
│               └── WorldBuilder.jsx    # World building interface
│
└── projects/                           # User projects (auto-created)
    └── [project_name]/
        ├── project_metadata.json
        ├── world/
        ├── story/
        ├── state/
        └── exports/
```

## API Endpoints

### AI Endpoints
- `GET /api/ai/status` - Check Ollama status
- `GET /api/ai/models` - List available models
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/chat` - Chat with conversation history

### Project Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/<name>` - Load project data
- `POST /api/projects/<name>/save` - Save project file

## Troubleshooting

### Ollama Not Connecting

**Problem:** Red "● Offline" in AI Status

**Solutions:**
1. Make sure Ollama is running: `ollama serve`
2. Check if models are installed: `ollama list`
3. Pull a model if needed: `ollama pull llama3.2`

### Backend Won't Start

**Problem:** Python errors when running `app.py`

**Solutions:**
1. Verify Python version: `python --version` (needs 3.10+)
2. Activate virtual environment
3. Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Won't Start

**Problem:** npm errors when running `npm run dev`

**Solutions:**
1. Verify Node version: `node --version` (needs 18+)
2. Delete `node_modules` and reinstall: 
   ```bash
   rm -rf node_modules
   npm install
   ```

### CORS Errors

**Problem:** Browser console shows CORS errors

**Solution:** Make sure both backend (5000) and frontend (3000) are running

### Projects Not Saving

**Problem:** Changes aren't persisted

**Solutions:**
1. Check `projects/` directory exists
2. Check file permissions
3. Look for errors in backend terminal

## Development Notes

### Auto-Save
- Projects auto-save 30 seconds after changes
- Manual save triggered by clicking save buttons
- Save status shown in header (✓ Saved | ⏳ Saving... | ⚠ Error)

### JSON Storage
- All project data stored in `projects/` directory
- Each project has its own folder
- World, story, and state data in separate JSON files
- Human-readable and easily backed up

### Adding New Models
1. Pull model with Ollama: `ollama pull <model-name>`
2. Model will appear in AI Chat dropdown
3. Select it to use for generation

## Next Steps (Phase 2+)

- 🔲 Episode editor with draft/refinement workflow
- 🔲 Season and arc management
- 🔲 Context window management (3-episode + summaries)
- 🔲 Consistency engine (travel time, character tracking)
- 🔲 TTS script export
- 🔲 Timeline visualization
- 🔲 Batch operations

## Support

For issues or questions:
1. Check this README troubleshooting section
2. Review backend terminal for error messages
3. Check browser console for frontend errors
4. Verify Ollama is running properly

## License

[Your License Here]

---

**Version:** 1.0 (Phase 1 MVP)  
**Last Updated:** 2025