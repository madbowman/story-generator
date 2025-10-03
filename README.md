# Story Builder App - Phase 1 MVP

A desktop application for creating serialized episodic stories through human-AI collaboration.

## ✅ Features (Phase 1)

**Project Management**
- Create and manage multiple story projects
- Auto-save functionality
- Project metadata (title, genre, description)

**World Building**
- Collaborative world development with AI
- World overview editor
- Locations management
- Character templates
- Factions, religions, NPCs, glossary
- Structured JSON storage

**AI Integration**
- Local Ollama integration
- Real-time AI status monitoring
- Available models listing
- Adjustable creativity (temperature)
- Chat interface for collaboration

**Consistency Validation**
- Check world building completeness
- Validate location IDs and routes
- Verify character relationships
- Detect duplicate IDs
- Provide suggestions for improvements

**Modern UI**
- Three-panel layout (Navigation | Editor | AI Chat)
- Dark theme optimized for long writing sessions
- Responsive components
- Save status indicators
## 🛠 Tech Stack

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

### Windows Users with Docker Desktop

If you get "This site can't be reached" on `http://localhost:3000`, ensure `vite.config.js` has:
```javascript
server: {
  host: '0.0.0.0',
  port: 3000,
  // ...
}

## 📖 Usage

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
   - Add locations, characters, factions, etc.
   - Use the AI Chat on the right to collaborate

5. **Collaborate with AI:**
   - Type messages in the AI Chat panel
   - AI will help you develop ideas
   - Adjust creativity with the temperature slider
   - Select different models from the dropdown

6. **Validate Consistency:**
   - Click "Check Consistency" button
   - Review warnings and suggestions
   - Fix any issues found

## 📁 Project Structure

```
story-generator/
├── backend/
│   ├── app.py                          # Flask application
│   ├── requirements.txt                # Python dependencies
│   └── modules/
│       ├── __init__.py
│       ├── ai_integration/
│       │   ├── __init__.py
│       │   └── ollama_client.py        # Ollama API client
│       ├── world_builder/
│       │   ├── __init__.py
│       │   ├── project_manager.py      # Project CRUD
│       │   └── world_builder.py        # World data management
│       └── consistency/
│           ├── __init__.py
│           └── validator.py            # Consistency checking
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
│           ├── AIStatus.jsx            # AI status indicator
│           ├── ProjectSelector.jsx     # Project switcher
│           └── WorldBuilder/
│               └── WorldBuilder.jsx    # World building UI
│
└── projects/                           # User projects (auto-created)
    └── [project_id]/
        ├── project_metadata.json
        ├── world/
        │   ├── world_overview.json
        │   ├── locations.json
        │   ├── characters.json
        │   ├── npcs.json
        │   ├── factions.json
        │   ├── religions.json
        │   ├── glossary.json
        │   └── content.json
        ├── story/
        │   └── seasons/
        ├── state/
        │   ├── current_state.json
        │   └── timeline.json
        └── exports/
            └── tts_scripts/
```

## 🔌 API Endpoints

### AI Endpoints
- `GET /api/ai/status` - Check Ollama status
- `GET /api/ai/models` - List available models
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/chat` - Chat with conversation history

### Project Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/<id>` - Load project data
- `DELETE /api/projects/<id>` - Delete project

### World Building Endpoints
- `GET /api/projects/<id>/world/<section>` - Get world section
- `PUT /api/projects/<id>/world/<section>` - Update world section

### Consistency Endpoints
- `POST /api/projects/<id>/consistency/check` - Validate consistency

### Health Check
- `GET /api/health` - Backend health check

## 🐛 Troubleshooting

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
3. Check if all `__init__.py` files exist in modules
4. Reinstall dependencies: `pip install -r requirements.txt`

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
4. Verify save status indicator in header

### Import Errors

**Problem:** `ModuleNotFoundError` when running backend

**Solutions:**
1. Make sure you're in the `backend/` directory
2. Virtual environment is activated
3. All `__init__.py` files exist in:
   - `modules/`
   - `modules/ai_integration/`
   - `modules/world_builder/`
   - `modules/consistency/`

## 💾 Data Storage

### Auto-Save
- Projects auto-save 30 seconds after changes
- Manual save triggered by editing fields
- Save status shown in header:
  - ✓ Saved (green)
  - ⏳ Saving... (yellow)
  - ⚠ Error (red)

### JSON Files
- All project data stored in `projects/` directory
- Each project has its own folder with unique ID
- World, story, and state data in separate JSON files
- Human-readable format - easy to backup or edit manually
- No database required

### File Structure
Each project contains:
- **project_metadata.json** - Title, genre, timestamps
- **world/** - All world building data (8 files)
- **story/** - Episodes and seasons (Phase 2)
- **state/** - Current timeline and character positions
- **exports/** - TTS scripts (Phase 2)

## 🤖 Using Different AI Models

1. List available models:
   ```bash
   ollama list
   ```

2. Pull a new model:
   ```bash
   ollama pull mistral
   ollama pull codellama
   ollama pull llama2
   ```

3. Model will appear in AI Chat dropdown
4. Select it to use for generation
5. Experiment with different models for different tasks

## 🗺 Roadmap

### Phase 2 - Episode Production (Next)
- 🔲 Episode editor with draft/refinement workflow
- 🔲 Season and arc management
- 🔲 Context window management (3-episode + summaries)
- 🔲 Advanced consistency engine (travel time, character tracking)
- 🔲 TTS script export for audio production
- 🔲 Timeline visualization

### Phase 3 - Polish & Features
- 🔲 Batch operations
- 🔲 Project templates
- 🔲 Import/export capabilities
- 🔲 Version history
- 🔲 Advanced search and filtering

## 📚 Additional Documentation

- **QUICKSTART.md** - 5-minute getting started guide
- **DEVELOPMENT_CHECKLIST.md** - Development progress tracker
- **setup.sh** - Automated setup script (Mac/Linux)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend terminal for error messages
3. Check browser console (F12) for frontend errors
4. Verify all prerequisites are installed
5. Make sure Ollama is running and has models

## 🤝 Contributing

Phase 1 is complete! If you'd like to contribute to Phase 2:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

[Your License Here]

---

**Version:** 1.0 (Phase 1 MVP Complete ✅)  
**Last Updated:** October 2025  
**Status:** Production Ready
