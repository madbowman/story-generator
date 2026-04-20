# Story Builder App

A desktop application for creating serialized episodic stories through human-AI collaboration with **AI-powered world building**.

## Phase 1: AI-Based Summary Extraction

1. **Discuss Naturally** - Talk with AI about your world (characters, locations, factions, etc.)
2. **Generate Summary** - AI creates a structured summary with key-value pairs
3. **Build World** - System extracts data from summary into JSON files

## Tech Stack
- Frontend: React/TypeScript
- Backend: Python
- Local Inference: Ollama (Llama 3/Qwen)

## Current State (The "Bad" Logic)
- Context is poorly managed

## Goal
- Refactor the current context management

## Development Commands
- Ollama Start: `ollama serve`
- Backend Start: `cd backend; python app.py` (Port 5000)
- Frontend Start: `cd frontend; npm run dev` (Port 3000)