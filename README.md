# Story Builder App - Phase 2.1 Complete ✅

A desktop application for creating serialized episodic stories through human-AI collaboration with **AI-powered world building**.

## 🎯 Phase 2.1 - What's New

### AI-Based Summary Extraction
**No more manual commands!** Phase 2.1 introduces a natural, two-step workflow:

1. **Discuss Naturally** - Talk with AI about your world (characters, locations, factions, etc.)
2. **Generate Summary** - AI creates a structured summary with key-value pairs
3. **Build World** - System extracts data from summary into JSON files

### Key Improvements
- ✅ **Natural conversation** - No need to memorize command syntax
- ✅ **AI does the structuring** - AI formats the world summary properly
- ✅ **100% schema-matched** - Summary format matches world_schemas.json exactly
- ✅ **Key-value format** - Easy to read: `name: King Gnomus, role: ruler, age: 150`

---

## ✅ Features

### Project Management
- Create and manage multiple story projects
- Auto-save functionality with status indicators
- Project metadata (title, genre, description)
- Project switching with context preservation

### World Building (Phase 2.1 - AI Summary Extraction)
- **Natural Conversation** - Discuss your world ideas with AI
- **AI-Generated Summary** - AI creates structured world summary
- **Automatic Extraction** - System parses summary into JSON files
- **Schema-Perfect Output** - Matches world_schemas.json exactly
- World overview, locations, characters, NPCs, factions, religions
- schemas and formatting
- Automatic ID generation from names
- JSON file storage with validation

### AI Integration
- Local Ollama integration
- Real-time AI status monitoring
- Available models listing
- Adjustable creativity (temperature)
- Dual chat interfaces:
  - **World Builder Chat** - For AI-assisted world building
  - **General AI Chat** - For episode development and general assistance

### Consistency Validation
- World building completeness checks
- Character relationship verification
- Duplicate ID detection
- Improvement suggestions

### Modern UI
- Three-panel layout (Navigation | Editor | AI Chat)
- Dark theme optimized for long writing sessions
- Responsive components
- Save status indicators
- Collapsible sidebar
- Two-step action buttons (Generate Summary → Build World)

---

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
- AI-based extraction (structured summary parsing)

---

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

---

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

---

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

---

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

---

### Building Your World (Phase 2.1 Workflow)

#### Step 1: Natural Conversation

1. **Click "💬 Build World Chat"** in the sidebar
2. **Read the AI's welcome message** explaining the workflow
3. **Discuss your world naturally:**

```
You: "I'm creating a steampunk fantasy world with gnomes and goblins"
AI: "Fascinating! Tell me more about this world..."

You: "The gnomes live in an underground city called Buzzlebury. 
     They're master inventors and craftsmen."
AI: "Interesting! What kind of government do the gnomes have?"

You: "They're ruled by King Gnomus Sparkspanner, a wise 150-year-old 
     noble who values innovation and peace."
AI: "Great! And what about the goblins?"

You: "The goblins live in Blighted Hollow, a dark city in the north. 
     They're led by warlord Grizzak the Cruel."
AI: "I see conflict brewing! What factions exist in this world?"

You: "The Gnome Kingdom is a peaceful realm of inventors. 
     The Shadow Circle is a cult practicing forbidden magic."
```

#### Step 2: Generate World Summary

4. **When satisfied with your world**, click **"📝 Generate World Summary"**
5. AI creates a structured summary with this format:

```
=== WORLD SUMMARY ===

=== WORLD INFO ===
name: The Divided Isle
description: A steampunk fantasy world split between gnomes and goblins
timePeriod: Industrial Age
technologyLevel: Clockwork Magic
magicSystem: Gear-based enchantments

=== CHARACTERS ===
id: king_gnomus_sparkspanner
name: King Gnomus Sparkspanner
role: protagonist
age: 150
race: gnome
class: noble
alignment: lawful good
description: Elderly gnome with silver beard and gear-adorned crown
personality: wise, patient, innovative
backstory: Ascended to throne after proving his worth through invention
motivation: Maintain peace and advance gnomish technology

id: grizzak_the_cruel
name: Grizzak the Cruel
role: antagonist
age: 45
race: goblin
class: warlord
alignment: chaotic evil
...

=== LOCATIONS ===
id: buzzlebury
name: Buzzlebury
type: city
region: Gnome Kingdom
population: 50000
description: Vast underground city of clockwork wonders
government: Monarchy
economy: Invention and trade
culture: Values innovation and craftsmanship
...

=== FACTIONS ===
id: gnome_kingdom
name: Gnome Kingdom
type: kingdom
alignment: lawful good
description: Underground realm of inventive gnomes
goals: Advance technology, maintain peace
...
```

#### Step 3: Build World from Summary

6. **Review the summary** - Make sure it captured everything correctly
7. **Click "🌍 Build World from Summary"**
8. System extracts the structured data and creates JSON files:
   - `world_overview.json`
   - `characters.json`
   - `locations.json`
   - `factions.json`
   - `religions.json`
   - `npcs.json`
   - `glossary.json`
   - `content.json`

#### Step 4: Review and Edit

9. **Click "World Builder"** in the sidebar to view sections
10. Navigate to **Characters**, **Locations**, etc. to review
11. **Manually edit** any details that need adjustment
12. Use **AI Chat** for suggestions and improvements

---

## 🎨 Summary Format Reference

The AI generates summaries matching `world_schemas.json` exactly. Here are all supported sections:

### WORLD INFO
```
name: [world name]
description: [brief description]
timePeriod: [era]
technologyLevel: [tech level]
magicSystem: [magic system]
history: [key events]
rulesPhysics: [special rules]
```

### CHARACTERS
```
id: [auto-generated from name]
name: [full name]
role: [protagonist/antagonist/supporting/mentor]
age: [number]
race: [race/species]
class: [warrior/mage/rogue/etc]
level: [1-20]
alignment: [alignment]
description: [physical description]
personality: [traits]
backstory: [backstory]
motivation: [primary motivation]
fears: [comma separated]
skills: [skill:proficiency, skill:proficiency]
weaknesses: [comma separated]
equipment: [comma separated]
currentLocation: [location_id]
```

### LOCATIONS
```
id: [auto-generated from name]
name: [location name]
type: [city/town/village/dungeon/wilderness]
region: [larger region]
population: [number]
description: [detailed description]
government: [government type]
economy: [economic activities]
culture: [cultural notes]
defenses: [defensive capabilities]
notableFeatures: [comma separated]
coords: x: [number], y: [number]
```

### FACTIONS
```
id: [auto-generated from name]
name: [faction name]
type: [guild/kingdom/cult/military/criminal]
alignment: [alignment]
headquarters: [location_id]
description: [faction description]
goals: [comma separated]
methods: [how they operate]
leadership: [leadership structure]
membership: [number]
resources: [available resources]
reputation: [how they're viewed]
```

### RELIGIONS
```
id: [auto-generated from name]
name: [religion/deity name]
type: [monotheistic/polytheistic/pantheon/cult/philosophy]
alignment: [alignment]
domain: [domain of influence]
description: [religion description]
beliefs: [comma separated]
practices: [comma separated]
clergy: [clergy organization]
followers: [number]
influence: [low/moderate/high/dominant]
symbols: [religious symbols]
```

### NPCS
```
id: [auto-generated from name]
name: [NPC name]
role: [merchant/guard/innkeeper/etc]
location: [location_id]
description: [brief description]
personality: [key traits]
services: [comma separated]
questGiver: [true/false]
attitude: [friendly/neutral/hostile]
```

### GLOSSARY
```
term: [term or word]
pronunciation: [how to pronounce]
category: [place/person/magic/technology/creature]
definition: [definition]
etymology: [origin]
usage: [usage in context]
```

### ITEMS
```
[Similar key-value format - see world_schemas.json for details]
```

---

## 📁 Project Structure

```
story-generator/
├── backend/
│   ├── app.py                          # Flask application (Phase 2.1)
│   ├── requirements.txt                # Python dependencies
│   ├── world_schemas.json              # world schemas
│   └── modules/
│       ├── ai_integration/
│       │   └── ollama_client.py        # Ollama API client
│       ├── world_builder/
│       │   ├── project_manager.py      # Project CRUD
│       │   ├── world_builder.py        # World data management
│       │   └── world_extractor.py      # AI summary extraction (Phase 2.1)
│       └── consistency/
│           └── validator.py            # Consistency checking
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                     # Main app
│       ├── services/
│       │   └── api.js
│       ├── context/
│       │   └── ProjectContext.jsx
│       └── components/
│           ├── AIStatus.jsx
│           ├── ProjectSelector.jsx
│           └── WorldBuilder/
│               ├── WorldBuilder.jsx
│               ├── WorldBuilderChat.jsx    # Phase 2.1: AI summary workflow
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
            ├── locations.json          # Only places
            ├── characters.json
            ├── npcs.json
            ├── factions.json
            ├── religions.json
            ├── glossary.json
            └── content.json
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
- `GET /api/projects/<id>` - Load project data
- `DELETE /api/projects/<id>` - Delete project

### World Building Endpoints (Phase 2.1)
- `GET /api/world/schemas` - Get world building schemas
- `POST /api/projects/<id>/world/build-from-summary` - Build world from AI summary
- `GET /api/projects/<id>/world/<section>` - Get world section
- `PUT /api/projects/<id>/world/<section>` - Update world section

### Consistency Endpoints
- `POST /api/projects/<id>/consistency/check` - Validate consistency

### Health Check
- `GET /api/health` - Backend health check

---

## 🐛 Troubleshooting

### World Building Issues

**Problem:** AI summary doesn't include all discussed entities

**Solution:** 
- Be explicit in your conversation about what entities exist
- Review the summary before building
- You can regenerate the summary if needed
- Manually add missing items in World Builder sections

**Problem:** Conversation not saving

**Solution:** 
- Check localStorage is enabled in browser
- Conversations save automatically per project
- Look for `worldchat_<project_id>` in localStorage

**Problem:** Build fails with "No entities found"

**Solution:** 
- Make sure you clicked "Generate Summary" first
- Verify the summary contains `=== CHARACTERS ===` or similar sections
- The system looks for the last AI message with these markers

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

---

## 💡 Tips & Best Practices

### World Building (Phase 2.1)
1. **Start broad, then add details**
   - Discuss overall world concept first
   - Add specific characters and locations as you talk
   - Use natural conversation - the AI will structure it

2. **Be thorough in conversation**
   - Mention all important characters, locations, factions
   - Discuss relationships and connections
   - AI can only summarize what you discussed

3. **Review summary before building**
   - Check the AI-generated summary carefully
   - Look for missing entities or incorrect details
   - You can regenerate if needed

4. **Iterate if needed**
   - Continue conversation and regenerate summary
   - Add more details to existing entities
   - Build world multiple times (it overwrites files)

5. **Manual editing available**
   - World Builder sections let you edit JSON directly
   - Use AI Chat for refinement suggestions
   - Consistency checker validates your changes

---

## 🗺 Roadmap

### ✅ Phase 1 - Core Foundation (Complete)
- Project management
- Basic world building
- AI integration
- Consistency validation

### ✅ Phase 2 - Structured Commands (Complete)
- Command-based world building
- Conversation persistence
- World schemas
- Accurate extraction

### ✅ Phase 2.1 - AI Summary Extraction (Complete)
- Natural conversation workflow
- AI-generated structured summaries
- Key-value pair format
- Schema-perfect extraction

### 🔄 Phase 3 - Story Arcs (Next)
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

---

## 📚 Additional Documentation

- **story.txt** - Full program specification
- **DEVELOPMENT_CHECKLIST.md** - Development progress tracker
- **world_schemas.json** - Complete schema reference

---

## 📞 Support

For issues:
1. Check troubleshooting section above
2. Review backend terminal for errors
3. Check browser console (F12) for frontend errors
4. Verify Ollama is running with models
5. Ensure AI summary was generated before building

---

## 🎯 Key Innovation: AI Summary Extraction

Phase 2.1's breakthrough is **AI-powered summary generation**:

**Phase 2 (Manual Commands):**
- User types: `ADD CHARACTER: name, role, description...`
- Regex extracts structured commands
- 100% accurate but tedious

**Phase 2.1 (AI Summary):**
- User discusses naturally with AI
- AI generates structured summary with key-value pairs
- System parses summary into JSON
- Natural workflow, AI does the structuring

**Benefits:**
- ✅ No command syntax to memorize
- ✅ Natural conversation flow
- ✅ AI handles formatting
- ✅ Schema-perfect output
- ✅ Still 100% accurate (from structured summary)

---

**Version:** 2.1 (AI Summary Extraction ✅)  
**Last Updated:** October 2025  
**Status:** Production Ready - Phase 3 in Development