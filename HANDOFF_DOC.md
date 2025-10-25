# Story Builder - Phase 3 Handoff Document

**Date:** October 2025  
**Current Phase:** 3 (Story Arcs)  
**Status:** In Development - AI Context Issue  

---

## 📋 Executive Summary

Story Builder is a desktop application for creating serialized episodic stories through human-AI collaboration. **Phase 3** introduces story arc planning where users discuss arcs with AI, which generates a structured summary that the system extracts into a centralized arcs.json file.

### Key Innovation: Arc Planning with World Context
1. **Load World Context** - AI has access to all characters, locations, factions
2. **Natural Conversation** - User discusses story arcs with AI
3. **Generate Arc Summary** - AI creates structured summary with plot beats
4. **Build Arcs** - System extracts data from summary into arcs.json

---

## 🗃️ Architecture Overview

### Tech Stack
**Backend:**
- Python 3.10+ / Flask
- Ollama (Local AI - llama3.2)
- JSON file storage

**Frontend:**
- React 18 / Vite
- localStorage (conversation persistence)
- Inline CSS (organized in separate style files)

**Projects Location:**
```
ROOT/projects/
  └── <project_id>/
      ├── project_metadata.json
      ├── world/
      │   ├── world_overview.json
      │   ├── locations.json
      │   ├── characters.json (with relationships)
      │   ├── npcs.json
      │   ├── factions.json (with relationships)
      │   ├── religions.json (with relationships)
      │   ├── glossary.json
      │   └── content.json
      └── story/
          └── arcs.json (PHASE 3 - ONE file with ALL arcs)
```

---

## 🔑 Key Changes in Phase 3

### What's New in Phase 3

**Phase 2.1 (Previous):**
- World building with relationships
- Characters, locations, factions, religions with relationship support
- Natural conversation → AI summary → JSON extraction

**Phase 3 (Current):**
- Story arc planning with world context
- AI loads all world data (characters, locations, etc.)
- Natural arc discussion → AI arc summary → arcs.json
- **ONE arcs.json file** containing ALL arcs for the project
- Plot beats mapped to episodes
- Arc connections (previousArc, nextArc)

### Arc Structure
Each arc contains:
- Basic info: id, title, season, arcNumber
- Episodes: start, end, list
- Characters: mainCharacters[], supportingCharacters[]
- Locations: primaryLocations[]
- Themes and factions
- Plot beats (per episode with characters, location, outcome)
- Resolution and optional cliffhanger
- Connections to previous/next arcs

---

## 📂 File Structure

### Backend Files (backend/)
```
app.py                                    # Main Flask app with Phase 3 endpoints
requirements.txt                          # Python dependencies
world_schemas.json                        # World building schemas
arc_schemas.json                          # NEW - Arc structure schemas
modules/
  ├── __init__.py
  ├── ai_integration/
  │   ├── __init__.py
  │   └── ollama_client.py               # Ollama API client
  ├── world_builder/
  │   ├── __init__.py
  │   ├── project_manager.py             # Project CRUD
  │   ├── world_builder.py               # World data management (with load_world_section)
  │   └── world_extractor.py             # AI summary extraction (with relationships)
  ├── story_engine/                       # NEW - Phase 3
  │   ├── __init__.py
  │   ├── arc_manager.py                 # Arc CRUD operations
  │   └── arc_extractor.py               # Arc summary extraction
  └── consistency/
      └── validator.py                    # Consistency validation
```

### Frontend Files (frontend/src/)
```
main.jsx
App.jsx                                   # Updated with Phase 3 navigation
index.css
services/
  └── api.js
context/
  └── ProjectContext.jsx
components/
  ├── AIStatus.jsx
  ├── ProjectSelector.jsx
  ├── WorldBuilder/
  │   ├── WorldBuilder.jsx
  │   ├── WorldBuilderChat.jsx          # Phase 2.1 chat (with relationships)
  │   ├── WorldOverview.jsx
  │   ├── Characters.jsx
  │   ├── Locations.jsx
  │   ├── Factions.jsx
  │   ├── Religions.jsx
  │   ├── NPCs.jsx
  │   ├── Glossary.jsx
  │   ├── Content.jsx
  │   └── ListDetail.jsx
  └── ArcBuilder/                         # NEW - Phase 3
      ├── ArcBuilderChat.jsx             # Arc planning chat (with world context injection)
      └── ArcManager.jsx                 # View/edit arcs
styles/
  ├── app/
  │   └── styles.js
  ├── components/
  │   └── styles.js                      # World Builder styles
  └── aichat/
      └── styles.js                      # Chat interface styles
```

---

## 🔌 API Endpoints

### AI Endpoints
- `GET /api/ai/status` - Check Ollama status
- `GET /api/ai/models` - List available models
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/chat` - Chat with conversation history

### Project Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/<id>` - Load project
- `DELETE /api/projects/<id>` - Delete project

### World Building Endpoints (Phase 2.1)
- `GET /api/world/schemas` - Get world schemas
- `POST /api/projects/<id>/world/build-from-summary` - Build from AI summary
- `GET /api/projects/<id>/world/<section>` - Get world section
- `PUT /api/projects/<id>/world/<section>` - Update world section
- `GET /api/projects/<id>/world/context` - Get complete world context (for arcs)

### Story Arc Endpoints (Phase 3) ⭐
- `GET /api/arc/schemas` - Get arc schemas
- `GET /api/projects/<id>/arcs` - List all arcs
- `GET /api/projects/<id>/arcs/<arc_id>` - Get specific arc
- `POST /api/projects/<id>/arcs` - Create new arc
- `PUT /api/projects/<id>/arcs/<arc_id>` - Update arc
- `DELETE /api/projects/<id>/arcs/<arc_id>` - Delete arc
- `POST /api/projects/<id>/arcs/build-from-summary` - Build arcs from AI summary ⭐
- `GET /api/projects/<id>/arcs/season/<season>` - Get arcs by season

### Consistency
- `POST /api/projects/<id>/consistency/check` - Validate consistency

### Health
- `GET /api/health` - Backend health check

---

## 🎯 Phase 3 Workflow

### User Experience Flow

1. **Create Project & Build World** (Prerequisites)
   - Create project
   - Build world using WorldBuilderChat (Phase 2.1)
   - Ensure characters, locations, factions exist with ALL fields populated

2. **Arc Builder Chat**
   - Click "💬 Build Arc Chat" in sidebar
   - AI receives complete world context on first user message
   - World context includes ALL fields from schema (age, backstory, relationships, etc.)
   - Natural conversation with AI about story arcs

3. **Generate Arc Summary**
   - Click "📝 Generate Arc Summary"
   - AI creates structured summary with plot beats

4. **Build Arcs**
   - Click "📚 Build Arcs from Summary"
   - System extracts → Creates/updates arcs.json

5. **Review & Edit**
   - Click "📋 Arc Manager"
   - View all arcs with full details

---

## ⚠️ Known Issues - Phase 3

### CRITICAL: AI Context Not Working with llama3.2

**Issue:** The AI (llama3.2) receives complete world context in system message but doesn't utilize it. When asked about character details (age, backstory, etc.), the AI responds as if it has no knowledge of the world.

**What We've Tried:**
1. ✅ World context API endpoint works correctly (`/api/projects/<id>/world/context`)
2. ✅ Frontend loads world context successfully
3. ✅ All schema fields included in context (characters, locations, factions, religions, NPCs, items, glossary)
4. ✅ Context sent as system message on first user input
5. ✅ worldContextSent flag prevents duplicate sending
6. ✅ Network payload shows complete world data in system message

**Root Cause:** llama3.2 via Ollama doesn't consistently process system messages. This is a known limitation with local LLMs.

**Potential Solutions to Try:**
1. **Switch Model:** Try llama3.1 or mistral (better instruction following)
2. **User Message Instead:** Change `role: "system"` to `role: "user"` for world context
3. **Prefix Every Message:** Include condensed world context in every user message (inefficient)
4. **Commercial API:** Use OpenAI/Anthropic API instead of local Ollama

**Files Involved:**
- `frontend/src/components/ArcBuilder/ArcBuilderChat.jsx` (lines 94-231 - handleSubmit function)
- `backend/modules/world_builder/world_builder.py` (load_world_section method)
- `backend/app.py` (world context endpoint)

---

## 💾 Data Flow

### World Context Loading

```
1. User opens Arc Builder Chat
2. useEffect loads world context from API
3. worldContext state populated with ALL world data
4. User sends first message
5. handleSubmit checks: if (worldContext && !worldContextSent)
6. Builds complete context string with ALL fields
7. Adds as system message (role: "system")
8. Sets worldContextSent = true
9. AI receives context but may not use it (llama3.2 issue)
```

### Arc Extraction Process

```python
# arc_extractor.py
def extract_from_ai_summary(summary, schemas, world_data):
    1. Split summary by === ARC === markers
    2. For each arc section:
       - Parse key-value pairs (id: value, season: 1)
       - Extract plot beats for each episode
       - Map characters/locations to world_data IDs
       - Auto-generate arc ID from title
    3. Return list of arc objects
    4. arc_manager saves to arcs.json
```

### arcs.json Structure

```json
{
  "arcs": [
    {
      "id": "discovery_arc",
      "title": "The Discovery",
      "season": 1,
      "arcNumber": 1,
      "episodes": {
        "start": 1,
        "end": 5,
        "list": [1, 2, 3, 4, 5]
      },
      "plotBeats": [
        {
          "episode": 1,
          "title": "The Awakening",
          "description": "Character discovers abilities",
          "characters": ["char_id1", "char_id2"],
          "location": "location_id",
          "outcome": "Powers manifest"
        }
      ]
    }
  ],
  "metadata": {
    "totalArcs": 1,
    "totalSeasons": 1,
    "lastUpdated": "2025-10-05T12:00:00Z"
  }
}
```

---

## 🧪 Testing Checklist

### Phase 2.1 Tests (Prerequisites)
- [ ] Build world with characters, locations, factions
- [ ] Verify relationships in characters.json, factions.json, religions.json
- [ ] Verify currentLocation in all characters
- [ ] Verify all schema fields populated (age, backstory, motivation, etc.)

### Phase 3 Backend Tests
- [ ] `GET /api/arc/schemas` returns arc schemas
- [ ] `GET /api/projects/<id>/world/context` returns complete world data
- [ ] Verify WorldBuilder has `__init__(projects_dir)` method
- [ ] Verify WorldBuilder has `load_world_section(project_id, section)` method
- [ ] app.py initializes: `world_builder = WorldBuilder(PROJECTS_DIR)`

### Phase 3 Frontend Tests
- [ ] Arc Builder Chat loads without errors
- [ ] World context loads in browser (check Network tab)
- [ ] First user message includes system message with world data
- [ ] worldContextSent flag prevents duplicate context
- [ ] **FAILING:** AI utilizes world context in responses

### File Verification
- [ ] `projects/<id>/story/` directory exists
- [ ] `backend/arc_schemas.json` exists
- [ ] `backend/modules/story_engine/` folder exists with all 3 files
- [ ] `frontend/src/components/ArcBuilder/` folder exists with 2 files

---

## 🛠 Running the Application

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```
✓ Backend: http://localhost:5000

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
✓ Frontend: http://localhost:3000

### Terminal 3: Ollama
```bash
ollama serve
```

### Verify Setup
```bash
# Test world context endpoint
curl http://localhost:5000/api/projects/YOUR_PROJECT_ID/world/context

# Should return JSON with complete world data
```

---

## 📊 Current State Summary

### ✅ Phase 1: COMPLETE
- Core foundation
- Project management
- File structure

### ✅ Phase 2.1: COMPLETE
- World building with AI summary extraction
- Relationships support (characters, factions, religions)
- currentLocation field for all characters
- Generic (non-specific) schemas
- CSS organized into separate files

### 🔄 Phase 3: IN DEVELOPMENT (90% Complete)
- ✅ Story arc planning architecture
- ✅ Arc Builder Chat component
- ✅ AI arc summary generation logic
- ✅ Arc extraction to arcs.json
- ✅ Arc Manager for viewing/editing arcs
- ✅ World context loading (all fields)
- ✅ Backend endpoints for arcs
- ❌ **BLOCKER:** AI not utilizing world context (llama3.2 limitation)

### 📅 Phase 4: PLANNED
- Episode production
- Context window management (3-episode context)
- Auto-summarization
- Timeline tracking
- TTS script export

### 📅 Phase 5+: PLANNED
- Polish & additional features

---

## 💡 Tips for Next Developer

1. **World context is required** - Build complete world (Phase 2.1) before creating arcs
2. **ONE arcs.json file** - All arcs in `projects/<id>/story/arcs.json`
3. **Temperature matters** - 0.3 for summaries, 0.8 for chat
4. **WorldBuilder requires projects_dir** - Initialize: `WorldBuilder(PROJECTS_DIR)`
5. **World context sent once** - worldContextSent flag tracks this
6. **All schema fields included** - World context has every field from world_schemas.json
7. **AI context issue** - llama3.2 ignores system messages, try different model
8. **localStorage keys** - `worldchat_${project_id}` and `arcchat_${project_id}`
9. **Submenu states persist** - worldSubmenuOpen and arcSubmenuOpen in localStorage
10. **Debug with Network tab** - Check `/api/ai/chat` payload to verify context sent

---

## 🔧 Debugging the AI Context Issue

### Verify Context is Sent
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Send first message in Arc Builder Chat
4. Find `/api/ai/chat` request
5. Click Payload tab
6. Look for `messages[0].role === "system"`
7. Should contain all world data

### Test Different Models
```javascript
// In Arc Builder Chat dropdown, try:
- llama3.1 (better at following instructions)
- mistral (good context handling)
- llama3.2:latest (updated version)
```

### Alternative: User Message Injection
If system messages don't work, modify ArcBuilderChat.jsx line ~180:

```javascript
chatMessages.push({
  role: 'user',  // Change from 'system'
  content: `[WORLD INFORMATION]\n\n${contextParts.join('\n\n')}\n\n[END]`
});

chatMessages.push({
  role: 'assistant',
  content: 'I have received all world information and will use exact IDs.'
});
```

---

## 🔗 Phase 3 Data Flow

```
User → Arc Builder Chat
  ↓
Load World Context (/api/projects/<id>/world/context)
  ↓
Store in worldContext state (ALL fields)
  ↓
User sends first message
  ↓
Inject world context as system message (ONCE)
  ↓
AI receives context (but may not use it - llama3.2)
  ↓
Natural Conversation
  ↓
Generate Arc Summary (AI with temp 0.3)
  ↓
Extract Arcs (arc_extractor.py)
  ↓
Save to arcs.json (arc_manager.py)
  ↓
Display in Arc Manager (ArcManager.jsx)
```

---

**End of Handoff Document**

**Next Steps:**
1. Fix AI context utilization (try different models or user message injection)
2. Complete Phase 3 testing once AI context works
3. Begin Phase 4 planning (episode production)

*For questions, refer to code comments in key files listed above.*  

---

## 📋 Executive Summary

Story Builder is a desktop application for creating serialized episodic stories through human-AI collaboration. **Phase 3** introduces story arc planning where users discuss arcs with AI, which generates a structured summary that the system extracts into a centralized arcs.json file.

### Key Innovation: Arc Planning with World Context
1. **Load World Context** - AI has access to all characters, locations, factions
2. **Natural Conversation** - User discusses story arcs with AI
3. **Generate Arc Summary** - AI creates structured summary with plot beats
4. **Build Arcs** - System extracts data from summary into arcs.json

---

## 🗃️ Architecture Overview

### Tech Stack
**Backend:**
- Python 3.10+ / Flask
- Ollama (Local AI - llama3.2)
- JSON file storage

**Frontend:**
- React 18 / Vite
- localStorage (conversation persistence)
- Inline CSS (organized in separate style files)

**Projects Location:**
```
ROOT/projects/
  └── <project_id>/
      ├── project_metadata.json
      ├── world/
      │   ├── world_overview.json
      │   ├── locations.json
      │   ├── characters.json (with relationships)
      │   ├── npcs.json
      │   ├── factions.json (with relationships)
      │   ├── religions.json (with relationships)
      │   ├── glossary.json
      │   └── content.json
      └── story/
          └── arcs.json (PHASE 3 - ONE file with ALL arcs)
```

---

## 🔑 Key Changes in Phase 3

### What's New in Phase 3

**Phase 2.1 (Previous):**
- World building with relationships
- Characters, locations, factions, religions with relationship support
- Natural conversation → AI summary → JSON extraction

**Phase 3 (Current):**
- Story arc planning with world context
- AI loads all world data (characters, locations, etc.)
- Natural arc discussion → AI arc summary → arcs.json
- **ONE arcs.json file** containing ALL arcs for the project
- Plot beats mapped to episodes
- Arc connections (previousArc, nextArc)

### Arc Structure
Each arc contains:
- Basic info: id, title, season, arcNumber
- Episodes: start, end, list
- Characters: mainCharacters[], supportingCharacters[]
- Locations: primaryLocations[]
- Themes and factions
- Plot beats (per episode with characters, location, outcome)
- Resolution and optional cliffhanger
- Connections to previous/next arcs

---

## 📂 File Structure

### Backend Files (backend/)
```
app.py                                    # Main Flask app with Phase 3 endpoints
requirements.txt                          # Python dependencies
world_schemas.json                        # World building schemas
arc_schemas.json                          # NEW - Arc structure schemas
modules/
  ├── __init__.py
  ├── ai_integration/
  │   ├── __init__.py
  │   └── ollama_client.py               # Ollama API client
  ├── world_builder/
  │   ├── __init__.py
  │   ├── project_manager.py             # Project CRUD
  │   ├── world_builder.py               # World data management
  │   └── world_extractor.py             # AI summary extraction (with relationships)
  ├── story_engine/                       # NEW - Phase 3
  │   ├── __init__.py
  │   ├── arc_manager.py                 # Arc CRUD operations
  │   └── arc_extractor.py               # Arc summary extraction
  └── consistency/
      └── validator.py                    # Consistency validation
```

### Frontend Files (frontend/src/)
```
main.jsx
App.jsx                                   # Updated with Phase 3 navigation
index.css
services/
  └── api.js
context/
  └── ProjectContext.jsx
components/
  ├── AIStatus.jsx
  ├── ProjectSelector.jsx
  ├── WorldBuilder/
  │   ├── WorldBuilder.jsx
  │   ├── WorldBuilderChat.jsx          # Phase 2.1 chat (with relationships)
  │   ├── WorldOverview.jsx
  │   ├── Characters.jsx
  │   ├── Locations.jsx
  │   ├── Factions.jsx
  │   ├── Religions.jsx
  │   ├── NPCs.jsx
  │   ├── Glossary.jsx
  │   ├── Content.jsx
  │   └── ListDetail.jsx
  └── ArcBuilder/                         # NEW - Phase 3
      ├── ArcBuilderChat.jsx             # Arc planning chat
      └── ArcManager.jsx                 # View/edit arcs
styles/
  ├── app/
  │   └── styles.js
  ├── components/
  │   └── styles.js                      # World Builder styles
  └── aichat/
      └── styles.js                      # Chat interface styles
```

---

## 🔌 API Endpoints

### AI Endpoints
- `GET /api/ai/status` - Check Ollama status
- `GET /api/ai/models` - List available models
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/chat` - Chat with conversation history

### Project Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/<id>` - Load project
- `DELETE /api/projects/<id>` - Delete project

### World Building Endpoints (Phase 2.1)
- `GET /api/world/schemas` - Get world schemas
- `POST /api/projects/<id>/world/build-from-summary` - Build from AI summary
- `GET /api/projects/<id>/world/<section>` - Get world section
- `PUT /api/projects/<id>/world/<section>` - Update world section
- `GET /api/projects/<id>/world/context` - Get complete world context (for arcs)

### Story Arc Endpoints (Phase 3) ⭐
- `GET /api/arc/schemas` - Get arc schemas
- `GET /api/projects/<id>/arcs` - List all arcs
- `GET /api/projects/<id>/arcs/<arc_id>` - Get specific arc
- `POST /api/projects/<id>/arcs` - Create new arc
- `PUT /api/projects/<id>/arcs/<arc_id>` - Update arc
- `DELETE /api/projects/<id>/arcs/<arc_id>` - Delete arc
- `POST /api/projects/<id>/arcs/build-from-summary` - Build arcs from AI summary ⭐
- `GET /api/projects/<id>/arcs/season/<season>` - Get arcs by season

### Consistency
- `POST /api/projects/<id>/consistency/check` - Validate consistency

### Health
- `GET /api/health` - Backend health check

---

## 🎯 Phase 3 Workflow

### User Experience Flow

1. **Create Project & Build World** (Prerequisites)
   - Create project
   - Build world using WorldBuilderChat (Phase 2.1)
   - Ensure characters, locations, factions exist

2. **Arc Builder Chat**
   - Click "💬 Build Arc Chat" in sidebar
   - AI loads world context (characters, locations, factions)
   - Natural conversation with AI:
     ```
     User: "Season 1, Arc 1: Episodes 1-5. Linxia discovers her powers 
     while Master Feng trains her. Mengmeng helps."
     AI: "Great! What are the key plot points for each episode?"
     User: "Episode 1: Discovery at academy_hall..."
     ```

3. **Generate Arc Summary**
   - Click "📝 Generate Arc Summary"
   - AI creates structured summary:
     ```
     === ARC SUMMARY ===
     
     === ARC ===
     id: discovery_arc
     title: The Discovery
     season: 1
     arcNumber: 1
     episodeStart: 1
     episodeEnd: 5
     mainCharacters: linxia, master_feng
     primaryLocations: academy_hall
     
     PLOT BEATS:
     episode: 1
     beatTitle: The Awakening
     beatDescription: Linxia discovers magical abilities
     characters: linxia, master_feng
     location: academy_hall
     outcome: Powers manifest
     ...
     ```

4. **Build Arcs**
   - Click "📚 Build Arcs from Summary"
   - System extracts → Creates/updates arcs.json
   - Success message shows arcs added

5. **Review & Edit**
   - Click "📋 Arc Manager"
   - View all arcs on left panel
   - Click arc to see details with plot beats
   - See themes, characters, locations, resolution, cliffhanger

---

## 💾 Data Flow

### Arc Extraction Process

```python
# arc_extractor.py
def extract_from_ai_summary(summary, schemas, world_data):
    1. Split summary by === ARC === markers
    2. For each arc section:
       - Parse key-value pairs (id: value, season: 1)
       - Extract plot beats for each episode
       - Map characters/locations to world_data IDs
       - Auto-generate arc ID from title
    3. Return list of arc objects
    4. arc_manager saves to arcs.json
```

### arcs.json Structure

```json
{
  "arcs": [
    {
      "id": "discovery_arc",
      "title": "The Discovery",
      "season": 1,
      "arcNumber": 1,
      "episodes": {
        "start": 1,
        "end": 5,
        "list": [1, 2, 3, 4, 5]
      },
      "plotBeats": [
        {
          "episode": 1,
          "title": "The Awakening",
          "description": "Linxia discovers magical abilities",
          "characters": ["linxia", "master_feng"],
          "location": "academy_hall",
          "outcome": "Powers manifest"
        }
      ]
    }
  ],
  "metadata": {
    "totalArcs": 1,
    "totalSeasons": 1,
    "lastUpdated": "2025-10-05T12:00:00Z"
  }
}
```

---

## 🧪 Testing Checklist

### Phase 2.1 Tests (Prerequisites)
- [ ] Build world with characters, locations, factions
- [ ] Verify relationships in characters.json, factions.json, religions.json
- [ ] Verify currentLocation in all characters
- [ ] Verify NO routes in locations.json
- [ ] Verify ONLY items in content.json

### Phase 3 Tests (Story Arcs)
- [ ] Start backend: `python app.py`
- [ ] Start frontend: `npm run dev`
- [ ] Check arc schemas loaded: `http://localhost:5000/api/arc/schemas`
- [ ] Open Arc Builder Chat
- [ ] Verify world context loads (see character/location names in greeting)
- [ ] Have 5+ message conversation about arcs
- [ ] Click "Generate Arc Summary" → verify structured output with plot beats
- [ ] Click "Build Arcs" → verify arcs.json created
- [ ] Check Arc Manager → verify arcs display
- [ ] Click arc → verify full details show (plot beats, characters, locations)
- [ ] Create second arc → verify both appear
- [ ] Check arcs.json has array of arcs with metadata

### File Verification
- [ ] `projects/<id>/story/arcs.json` exists
- [ ] arcs.json has proper structure (arcs array + metadata)
- [ ] Each arc has plotBeats array
- [ ] Plot beats reference valid character_ids and location_ids
- [ ] Episodes structure correct (start, end, list)

---

## 🛠 Running the Application

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```
✓ Backend: http://localhost:5000

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
✓ Frontend: http://localhost:3000

### Terminal 3: Ollama
```bash
ollama serve
```

---

## 📊 Current State Summary

### ✅ Phase 1: COMPLETE
- Core foundation
- Project management
- File structure

### ✅ Phase 2.1: COMPLETE
- World building with AI summary extraction
- Relationships support (characters, factions, religions)
- currentLocation field for all characters
- Generic (non-D&D) schemas
- Routes removed from locations
- Hazards/machines removed from content
- CSS organized into separate files

### ✅ Phase 3: COMPLETE
- Story arc planning with world context
- Arc Builder Chat with world data loading
- AI arc summary generation
- Arc extraction to arcs.json (ONE file, ALL arcs)
- Arc Manager for viewing/editing arcs
- Plot beats per episode
- Arc connections (previousArc, nextArc)
- Season organization

### 📅 Phase 4: PLANNED
- Episode production
- Context window management (3-episode context)
- Auto-summarization
- Timeline tracking
- TTS script export

### 📅 Phase 5+: PLANNED
- Polish & additional features

---

## 💡 Tips for Next Developer

1. **World context is required** - Build world (Phase 2.1) before creating arcs (Phase 3)
2. **ONE arcs.json file** - All arcs stored in single file at `projects/<id>/story/arcs.json`
3. **Temperature matters** - 0.3 for summaries, 0.8 for chat
4. **Arc IDs auto-generate** - From arc titles, lowercase, underscores
5. **Plot beats are key** - Each arc must have beats for each episode
6. **Relationships work** - Characters, factions, religions all support relationships now
7. **currentLocation required** - All characters must have valid currentLocation
8. **World context loads automatically** - AI sees all characters/locations when building arcs
9. **localStorage keys** - `worldchat_${project_id}` and `arcchat_${project_id}`
10. **Submenu states persist** - worldSubmenuOpen and arcSubmenuOpen in localStorage

---

## 🔗 Phase 3 Data Flow

```
User → Arc Builder Chat
  ↓
Load World Context (/api/projects/<id>/world/context)
  ↓
Natural Conversation (AI has context)
  ↓
Generate Arc Summary (AI with temp 0.3)
  ↓
Extract Arcs (arc_extractor.py)
  ↓
Save to arcs.json (arc_manager.py)
  ↓
Display in Arc Manager (ArcManager.jsx)
```

---

**End of Handoff Document**

*For questions, refer to README.md or code comments in key files listed above.*


