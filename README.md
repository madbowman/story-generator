# Story Builder App - Phase 2 Complete

A desktop application for creating serialized episodic stories through human-AI collaboration with structured world building.

## ✅ Features

### Project Management
- Create and manage multiple story projects
- Auto-save functionality with status indicators
- Project metadata (title, genre, description)
- Project switching with context preservation

### World Building (Phase 2 - Enhanced)
- **Structured Command System** - 100% accurate entity creation
- **Conversation Persistence** - Save/load world building chats per project
- **AI-Assisted Development** - Discuss ideas naturally with AI
- **Command-Based Extraction** - Lock in entities with structured commands
- World overview, locations, characters, NPCs, factions, religions
- DND-style schemas and formatting
- Automatic ID generation and name fixing
- JSON file storage with validation

**Structured Commands:**
```
ADD CHARACTER: name, role, description, age, race, class
ADD LOCATION: name, type, description, region
ADD FACTION: name, type, description
ADD RELIGION: name, type, description
ADD NPC: name, role, location, description
ADD ITEM: name, type, description
SET WORLD: name=..., description=..., timePeriod=...
```

### AI Integration
- Local Ollama integration
- Real-time AI status monitoring
- Available models listing
- Adjustable creativity (temperature)
- Dual chat interfaces:
  - **World Builder Chat** - For structured world building
  - **General AI Chat** - For episode development and general assistance

### Consistency Validation
- World building completeness checks
- Location ID and route validation
- Character relationship verification
- Duplicate ID detection
- Improvement suggestions

### Modern UI
- Three-panel layout (Navigation | Editor | AI Chat)
- Dark theme optimized for long writing sessions
- Responsive components
- Save status indicators
- Collapsible sidebar

## 🛠 Tech Stack

**Backend:**
- Python 3.10+
- Flask (REST API)
- Ollama (Local AI)

**Frontend:**
- React 18
- Vite (Build tool)
- localStorage (Conversation persistence)

**Storage:**
- JSON files (local filesystem)
- Structured command extraction (regex-based)

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

### Building Your World (Phase 2 Workflow)

1. **Start World Builder Chat:**
   - Click "💬 Build World Chat" in the sidebar
   - Read the AI's instructions and command examples

2. **Discuss Naturally with AI:**
   ```
   You: "I'm thinking of a medieval fantasy world with gnomes and goblins"
   AI: "Interesting! Tell me more about the gnomes..."
   You: "The gnomes live underground in a city called Buzzlebury"
   AI: "What kind of government do they have?"
   ```

3. **Lock In Entities with Commands:**
   ```
   You: ADD CHARACTER: King Gnomus Sparkspanner, ruler, wise gnome king, 150, gnome, noble
   AI: ✓ Command received!
   
   You: ADD LOCATION: Buzzlebury, city, underground gnome capital, Gnome Kingdom
   AI: ✓ Command received!
   
   You: ADD FACTION: Gnome Kingdom, kingdom, underground realm of gnomes
   AI: ✓ Command received!
   ```

4. **Build World from Conversation:**
   - Click "🌍 Build World from Conversation" button
   - System extracts all commands and creates JSON files
   - Review success message with file list

5. **Review and Edit:**
   - Click "World Builder" in sidebar
   - Navigate to each section (Characters, Locations, etc.)
   - Manually edit any details
   - Use AI Chat for refinement suggestions

### Command Reference

**Character:**
```
ADD CHARACTER: name, role, description, age, race, class
Example: ADD CHARACTER: Gorvoth Ironbeard, engineer, skilled inventor, 45, gnome, artificer
```

**Location:**
```
ADD LOCATION: name, type, description, region
Example: ADD LOCATION: Blighted Hollow, city, dark goblin capital, Northern Kingdom
```

**Faction:**
```
ADD FACTION: name, type, description
Example: ADD FACTION: Shadow Circle, cult, underground forbidden magic practitioners
```

**Religion:**
```
ADD RELIGION: name, type, description
Example: ADD RELIGION: Church of Gears, monotheistic, worships clockwork deity
```

**NPC:**
```
ADD NPC: name, role, location, description
Example: ADD NPC: Trader Bob, merchant, buzzlebury, sells rare components
```

**World Info:**
```
SET WORLD: name=World Name, description=..., timePeriod=..., technologyLevel=...
Example: SET WORLD: name=The Divided Isle, timePeriod=Medieval, technologyLevel=Clockwork Magic
```

## 📁 Project Structure

```
story-generator/
├── backend/
│   ├── app.py                          # Flask application
│   ├── requirements.txt                # Python dependencies
│   ├── world_schemas.json              # DND-style world schemas
│   └── modules/
│       ├── ai_integration/
│       │   └── ollama_client.py        # Ollama API client
│       ├── world_builder/
│       │   ├── project_manager.py      # Project CRUD
│       │   ├── world_builder.py        # World data management
│       │   └── world_extractor.py      # Command-based extraction
│       └── consistency/
│           └── validator.py            # Consistency checking
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                     # Main app with Phase 2 navigation
│       ├── services/
│       │   └── api.js
│       ├── context/
│       │   └── ProjectContext.jsx
│       └── components/
│           ├── AIStatus.jsx
│           ├── ProjectSelector.jsx
│           └── WorldBuilder/
│               ├── WorldBuilder.jsx
│               ├── WorldBuilderChat.jsx    # Phase 2: Structured chat
│               ├── WorldOverview.jsx
│               ├── Characters.jsx
│               ├── Locations.jsx
│               ├── Factions.jsx
│               ├── Religions.jsx
│               ├── NPCs.jsx
│               ├── Glossary.jsx
│               └── Content.jsx
│
└── projects/                           # User projects (auto-created)
    └── [project_id]/
        ├── project_metadata.json
        └── world/
            ├── world_overview.json
            ├── locations.json
            ├── characters.json
            ├── npcs.json
            ├── factions.json
            ├── religions.json
            ├── glossary.json
            └── content.json
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

### World Building Endpoints (Phase 2)
- `GET /api/world/schemas` - Get world building schemas
- `POST /api/projects/<id>/world/build` - Build world from conversation
- `GET /api/projects/<id>/world/<section>` - Get world section
- `PUT /api/projects/<id>/world/<section>` - Update world section

### Consistency Endpoints
- `POST /api/projects/<id>/consistency/check` - Validate consistency

### Health Check
- `GET /api/health` - Backend health check

## 🐛 Troubleshooting

### World Building Issues

**Problem:** AI creates entities not in conversation

**Solution:** Phase 2 uses structured commands. Make sure you're using:
- `ADD CHARACTER:` for characters
- `ADD LOCATION:` for locations
- Only entities with commands get created

**Problem:** Conversation not saving

**Solution:** 
- Check localStorage is enabled in browser
- Conversations save automatically per project
- Look for `worldchat_<project_id>` in localStorage

**Problem:** Empty name fields in JSON

**Solution:** System auto-fixes missing names from IDs. If still seeing issues:
- Ensure `_fix_missing_names()` method exists in `world_extractor.py`
- Check that method is called in `_write_world_files()`

### General Issues

**Ollama Not Connecting:**
1. Make sure Ollama is running: `ollama serve`
2. Check models: `ollama list`
3. Pull if needed: `ollama pull llama3.2`

**Backend Won't Start:**
1. Verify Python 3.10+: `python --version`
2. Activate virtual environment
3. Check `__init__.py` files exist in all module folders
4. Reinstall: `pip install -r requirements.txt`

**Frontend Won't Start:**
1. Verify Node 18+: `node --version`
2. Delete and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

## 💡 Tips & Best Practices

### World Building
1. **Start broad, then add details**
   - Discuss world concepts naturally
   - Lock in entities only when satisfied
   - Use commands for precision

2. **Use descriptive commands**
   - More fields = richer data
   - `ADD CHARACTER: John, warrior, brave knight, 30, human, fighter` is better than `ADD CHARACTER: John`

3. **Review before building**
   - Check your commands in the chat history
   - Make sure all entities are added
   - Click build when complete

4. **Iterate if needed**
   - Can rebuild to add more entities
   - Previous commands persist in localStorage
   - Manual editing available in World Builder

## 🗺 Roadmap

### ✅ Phase 1 - Core Foundation (Complete)
- Project management
- Basic world building
- AI integration
- Consistency validation

### ✅ Phase 2 - World Building Enhancement (Complete)
- Structured command system
- Conversation persistence
- DND-style schemas
- Accurate extraction (no hallucinations)
- Name auto-fixing

### 🔄 Phase 3 - Story Arcs (In Development)
- Arc creation with world context
- Season planning
- Episode structure
- Character/location arc mapping

### 📅 Phase 4 - Episode Production (Planned)
- Episode editor with AI collaboration
- Context window management
- Auto-summarization
- Timeline tracking
- TTS script export

## 📚 Additional Documentation

- **story.txt** - Full program specification
- **DEVELOPMENT_CHECKLIST.md** - Development progress tracker

## 📞 Support

For issues:
1. Check troubleshooting section above
2. Review backend terminal for errors
3. Check browser console (F12) for frontend errors
4. Verify Ollama is running with models
5. Ensure all commands use correct format

## 🎯 Key Innovation: Structured Commands

Phase 2's breakthrough is the **structured command system** that eliminates AI hallucination:

**Traditional AI Extraction (Unreliable):**
- AI guesses what to extract → hallucinations
- Inconsistent results → frustration
- Need manual cleanup → time waste

**Structured Commands (Phase 2):**
- You explicitly mark entities → 100% accurate
- Regex pattern matching → no AI guessing
- Deterministic parsing → consistent results

This approach separates creative discussion (AI helps) from data creation (you control).

---

**Version:** 2.0 (Phase 2 Complete ✅)  
**Last Updated:** October 2025  
**Status:** Production Ready - Phase 3 in Development