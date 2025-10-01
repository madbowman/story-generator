"""
Story Builder App - Flask Backend
Main application entry point
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from modules.ai_integration.ollama_client import OllamaClient
from modules.project_manager import ProjectManager

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize managers
ollama = OllamaClient()
project_manager = ProjectManager()

# ============================================================================
# AI ENDPOINTS
# ============================================================================

@app.route('/api/ai/status', methods=['GET'])
def ai_status():
    """Check if Ollama is running"""
    status = ollama.check_status()
    return jsonify(status)

@app.route('/api/ai/models', methods=['GET'])
def ai_models():
    """List available Ollama models"""
    result = ollama.list_models()
    return jsonify(result)

@app.route('/api/ai/generate', methods=['POST'])
def ai_generate():
    """
    Generate AI response
    Body: {
        "prompt": str,
        "model": str (optional),
        "temperature": float (optional),
        "system_prompt": str (optional)
    }
    """
    data = request.json
    
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400
    
    model = data.get('model')
    temperature = data.get('temperature', 0.8)
    system_prompt = data.get('system_prompt')
    
    result = ollama.generate(
        prompt=prompt,
        model=model,
        temperature=temperature,
        system_prompt=system_prompt
    )
    
    return jsonify(result)

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """
    Chat with AI using conversation history
    Body: {
        "messages": [{"role": "user/assistant", "content": "..."}],
        "model": str (optional),
        "temperature": float (optional)
    }
    """
    data = request.json
    
    messages = data.get('messages')
    if not messages:
        return jsonify({"success": False, "error": "Messages are required"}), 400
    
    model = data.get('model')
    temperature = data.get('temperature', 0.8)
    
    result = ollama.chat(
        messages=messages,
        model=model,
        temperature=temperature
    )
    
    return jsonify(result)

# ============================================================================
# PROJECT ENDPOINTS
# ============================================================================

@app.route('/api/projects', methods=['GET'])
def list_projects():
    """List all projects"""
    projects = project_manager.list_projects()
    return jsonify({"success": True, "projects": projects})

@app.route('/api/projects', methods=['POST'])
def create_project():
    """
    Create new project
    Body: {
        "title": str,
        "description": str (optional),
        "genre": str (optional)
    }
    """
    data = request.json
    
    title = data.get('title')
    if not title:
        return jsonify({"success": False, "error": "Title is required"}), 400
    
    description = data.get('description', '')
    genre = data.get('genre', '')
    
    result = project_manager.create_project(
        title=title,
        description=description,
        genre=genre
    )
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@app.route('/api/projects/<project_name>', methods=['GET'])
def load_project(project_name):
    """Load project data"""
    result = project_manager.load_project(project_name)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 404

@app.route('/api/projects/<project_name>/save', methods=['POST'])
def save_project_file(project_name):
    """
    Save data to project file
    Body: {
        "file_path": str (e.g., "world/characters.json"),
        "data": dict
    }
    """
    data = request.json
    
    file_path = data.get('file_path')
    file_data = data.get('data')
    
    if not file_path or file_data is None:
        return jsonify({
            "success": False,
            "error": "file_path and data are required"
        }), 400
    
    result = project_manager.save_file(project_name, file_path, file_data)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Story Builder Backend"
    })

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# RUN APP
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("Story Builder Backend Starting...")
    print("=" * 60)
    print(f"Backend API: http://localhost:5000")
    print(f"Projects directory: {project_manager.projects_root}")
    print("=" * 60)
    
    # Check Ollama status on startup
    status = ollama.check_status()
    if status['running']:
        print("✓ Ollama is running")
        models = ollama.list_models()
        if models['success']:
            print(f"✓ Available models: {', '.join(models['models'])}")
    else:
        print(f"✗ Ollama not detected: {status['error']}")
        print("  Start Ollama to enable AI features")
    
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)