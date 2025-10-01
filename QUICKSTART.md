# Quick Start Guide

Get the Story Builder App running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:

- [ ] **Python 3.10+** installed ([Download](https://www.python.org/downloads/))
- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **Ollama** installed and running ([Download](https://ollama.ai))

## Quick Setup

### Option 1: Automated Setup (Recommended)

**On Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```batch
setup.bat
```

The script will:
- Check your system
- Set up the backend
- Set up the frontend
- Create necessary directories

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

## Running the App

You need **3 terminals** open:

### Terminal 1: Backend Server
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```
✓ Should see: "Backend API: http://localhost:5000"

### Terminal 2: Frontend Server
```bash
cd frontend
npm run dev
```
✓ Should see: "Local: http://localhost:3000"

### Terminal 3: Ollama (if not already running)
```bash
ollama serve
```
✓ Should see: "Ollama is running"

**Then pull a model if you haven't:**
```bash
ollama pull llama3.2
```

## Open the App

Open your browser to: **http://localhost:3000**

You should see:
- ✓ Green "Running" indicator for Ollama (top right)
- Welcome screen with instructions
- Project selector in the header

## First Steps

### 1. Create Your First Project

1. Click the **"+"** button next to "Select Project..."
2. Fill in:
   - **Title:** "My First Story" (or anything you like)
   - **Genre:** Choose one (e.g., "Science Fiction")
   - **Description:** Brief description of your story idea
3. Click **"Create Project"**

### 2. Build Your World

The World Builder should now be visible:

1. Click **"World Builder"** in the left sidebar (if not already selected)
2. Fill in the **World Overview**:
   - World Name
   - Description
   - Time Period
   - Technology Level
   - History
   - Rules & Physics
3. Click **"Save Overview"**

### 3. Add Locations

1. Click **"Locations"** in the World Builder sidebar
2. Click **"+ Add Location"**
3. Fill in:
   - Name (e.g., "Capital City")
   - Type (e.g., "City")
   - Description
4. Click **"Add"**
5. Click **"Save Locations"**

### 4. Chat with AI

The AI Chat panel is on the right side:

1. Type a message like: *"Help me develop interesting characters for a sci-fi story"*
2. Press **Send** or hit **Enter**
3. AI will respond with suggestions
4. Continue the conversation to refine your ideas

**Tips:**
- Adjust the temperature slider (🌡️) for more/less creativity
- Switch models from the dropdown if you have multiple installed
- Clear chat history with the 🗑️ button

## Troubleshooting

### "Ollama: ● Offline" (Red)

**Problem:** Ollama isn't connected

**Fix:**
```bash
# In a new terminal
ollama serve

# Then pull a model
ollama pull llama3.2
```

### Backend Error: "Module not found"

**Problem:** Dependencies not installed

**Fix:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Error: "npm command not found"

**Problem:** Node.js not installed

**Fix:** Install Node.js from https://nodejs.org/

### Port Already in Use

**Problem:** Port 5000 or 3000 is occupied

**Fix Option 1:** Stop the other application
**Fix Option 2:** Change ports in the config files

## What's Working (Phase 1 MVP)

✅ Project creation and management  
✅ World overview editor  
✅ Locations management  
✅ AI chat collaboration  
✅ Auto-save functionality  
✅ Multiple project support  

## What's Coming Next (Phase 2)

🔲 Episode editor with draft workflow  
🔲 Character editor (full implementation)  
🔲 Factions, religions, NPCs editors  
🔲 Season/Arc management  
🔲 Consistency checking  
🔲 TTS script export  

## Next Steps

Now that you have the app running:

1. **Experiment with World Building:** Add more locations, try different sections
2. **Collaborate with AI:** Use the chat to develop ideas
3. **Create Multiple Projects:** Test the project switcher
4. **Provide Feedback:** Note any issues or ideas for improvement

## Keyboard Shortcuts

- **Enter** - Send message in AI chat
- **Shift+Enter** - New line in AI chat
- **Ctrl+S / Cmd+S** - Manual save (auto-save also works)

## Getting Help

If you encounter issues:

1. Check the terminal outputs for error messages
2. Review the full README.md for detailed troubleshooting
3. Verify all prerequisites are installed correctly
4. Make sure all 3 services are running (Backend, Frontend, Ollama)

---

**Happy Story Building! 📖✨**