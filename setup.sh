#!/bin/bash

# Story Builder Setup Script
# This script sets up both backend and frontend

echo "============================================"
echo "Story Builder - Setup Script"
echo "============================================"
echo ""

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.10 or higher."
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d " " -f 2)
echo "✓ Python $PYTHON_VERSION found"
echo ""

# Check Node
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✓ Node.js $NODE_VERSION found"
echo ""

# Check Ollama
echo "Checking Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. AI features will not work."
    echo "   Download from: https://ollama.ai"
else
    echo "✓ Ollama found"
fi
echo ""

# Setup Backend
echo "============================================"
echo "Setting up Backend..."
echo "============================================"
cd backend || exit

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✓ Backend setup complete"
echo ""

# Setup Frontend
echo "============================================"
echo "Setting up Frontend..."
echo "============================================"
cd ../frontend || exit

echo "Installing Node dependencies..."
npm install

echo "✓ Frontend setup complete"
echo ""

# Create projects directory
cd ..
mkdir -p projects

echo "============================================"
echo "Setup Complete! 🎉"
echo "============================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Terminal 1 - Backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python app.py"
echo ""
echo "2. Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Terminal 3 - Ollama (if not running):"
echo "   ollama serve"
echo ""
echo "Then open: http://localhost:3000"
echo "============================================"