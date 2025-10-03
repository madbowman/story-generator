"""
Story Builder App - Flask Backend
Main application entry point
Phase 2: World Building from Conversation
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import json  # PHASE 2: Added for world schemas

# FIXED IMPORTS - removed 'backend.' prefix
from modules.ai_integration.ollama_client import OllamaClient
from modules.world_builder.project_manager import ProjectManager
from modules.world_builder.world_builder import WorldBuilder
from modules.world_builder.world_extractor import WorldExtractor  # PHASE 2: Added
from modules.consistency.validator import ConsistencyValidator

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize managers
ollama = OllamaClient()
project_manager = ProjectManager()
world_builder = WorldBuilder()
world_extractor = WorldExtractor(ollama)  # PHASE 2: Added
consistency_validator = ConsistencyValidator()

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
    result = project_manager.list_projects(PROJECTS_DIR)
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
        PROJECTS_DIR,
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
    result = project_manager.load_project(PROJECTS_DIR, project_id)
    
    if result and result.get('success'):
        return jsonify(result)
    else:
        return jsonify({"success": False, "error": "Project not found"}), 404

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project"""
    result = project_manager.delete_project(PROJECTS_DIR, project_id)
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
# WORLD BUILDING FROM CONVERSATION - PHASE 2
# ============================================================================

@app.route('/api/world/schemas', methods=['GET'])
def get_world_schemas():
    """Get world building JSON schemas for AI reference"""
    schemas_path = Path(__file__).parent / 'world_schemas.json'
    
    try:
        with open(schemas_path, 'r', encoding='utf-8') as f:
            schemas = json.load(f)
        return jsonify(schemas)
    except FileNotFoundError:
        return jsonify({'error': 'Schemas file not found'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid schemas file'}), 500

@app.route('/api/projects/<project_id>/world/build', methods=['POST'])
def build_world_from_conversation(project_id):
    """
    Build world files from AI conversation
    Body: {
        "conversation": [{"role": "user/assistant", "content": "..."}],
        "schemas": {...}
    }
    """
    data = request.json
    
    conversation = data.get('conversation', [])
    schemas = data.get('schemas', {})
    
    if not conversation or len(conversation) < 2:
        return jsonify({
            'success': False,
            'error': 'Conversation must have at least 2 messages'
        }), 400
    
    if not schemas:
        return jsonify({
            'success': False,
            'error': 'Schemas are required'
        }), 400
    
    # Extract and build world
    result = world_extractor.extract_and_build(
        projects_dir=PROJECTS_DIR,
        project_id=project_id,
        conversation=conversation,
        schemas=schemas
    )
    
    if result['success']:
        return jsonify(result), 200
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