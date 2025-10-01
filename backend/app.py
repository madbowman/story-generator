"""
Story Builder App - Flask Backend
Main application entry point
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path

# FIXED IMPORTS - removed 'backend.' prefix
from modules.ai_integration.ollama_client import OllamaClient
from modules.world_builder.project_manager import ProjectManager
from modules.world_builder.world_builder import WorldBuilder  # ADDED
from modules.consistency.validator import ConsistencyValidator  # ADDED

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize managers
ollama = OllamaClient()
project_manager = ProjectManager()
world_builder = WorldBuilder()  # ADDED
consistency_validator = ConsistencyValidator()  # ADDED

# ADDED: Setup projects directory
PROJECTS_DIR = Path(__file__).parent.parent / 'projects'
PROJECTS_DIR.mkdir(exist_ok=True)

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
    result = project_manager.list_projects(PROJECTS_DIR)  # FIXED: added PROJECTS_DIR
    return jsonify(result)

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
    genre = data.get('genre', 'General')
    
    result = project_manager.create_project(
        PROJECTS_DIR,  # FIXED: added PROJECTS_DIR
        title=title,
        description=description,
        genre=genre
    )
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@app.route('/api/projects/<project_id>', methods=['GET'])
def load_project(project_id):
    """Load project data"""
    result = project_manager.load_project(PROJECTS_DIR, project_id)  # FIXED: added PROJECTS_DIR
    
    if result and result.get('success'):
        return jsonify(result)
    else:
        return jsonify({"success": False, "error": "Project not found"}), 404

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project"""
    result = project_manager.delete_project(PROJECTS_DIR, project_id)  # FIXED: added PROJECTS_DIR
    return jsonify(result), 200 if result['success'] else 404

# ADDED: World building endpoints
@app.route('/api/projects/<project_id>/world/<section>', methods=['GET'])
def get_world_section(project_id, section):
    """Get specific world section"""
    result = world_builder.get_section(PROJECTS_DIR, project_id, section)
    if result:
        return jsonify(result)
    return jsonify({'error': f'Section {section} not found'}), 404

@app.route('/api/projects/<project_id>/world/<section>', methods=['PUT'])
def update_world_section(project_id, section):
    """Update world section"""
    data = request.json
    result = world_builder.update_section(PROJECTS_DIR, project_id, section, data)
    return jsonify(result), 200 if result['success'] else 400

# ADDED: Consistency check endpoint
@app.route('/api/projects/<project_id>/consistency/check', methods=['POST'])
def check_consistency(project_id):
    """Run consistency validation"""
    data = request.json
    scope = data.get('scope', 'world')
    result = consistency_validator.validate(PROJECTS_DIR, project_id, scope)
    return jsonify(result)

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
    print(f"Projects directory: {PROJECTS_DIR}")
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