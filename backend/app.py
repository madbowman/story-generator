"""
Story Builder App - Flask Backend
Main application entry point
Phase 2.1: AI Summary-Based World Building
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import json

# FIXED IMPORTS - removed 'backend.' prefix
from modules.ai_integration.ollama_client import OllamaClient
from modules.world_builder.project_manager import ProjectManager
from modules.world_builder.world_builder import WorldBuilder
from modules.world_builder.world_extractor import WorldExtractor
from modules.consistency.validator import ConsistencyValidator
from modules.story_engine import ArcManager, ArcExtractor

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# ADDED: Setup projects directory
PROJECTS_DIR = Path(__file__).parent.parent / 'projects'
PROJECTS_DIR.mkdir(exist_ok=True)

# Initialize managers
ollama = OllamaClient()
project_manager = ProjectManager()
world_builder = WorldBuilder(PROJECTS_DIR)
world_extractor = WorldExtractor(ollama)
consistency_validator = ConsistencyValidator()

arc_manager = ArcManager(PROJECTS_DIR)
arc_extractor = ArcExtractor()

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
# WORLD BUILDING FROM CONVERSATION - PHASE 2.1
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

# PHASE 2.1: AI summary-based extraction
@app.route('/api/projects/<project_id>/world/build-from-summary', methods=['POST'])
def build_world_from_summary(project_id):
    """
    Build world from AI-generated summary (Phase 2.1)
    Body: {
        "summary": str (AI-generated structured summary),
        "schemas": {...}
    }
    """
    data = request.json
    
    summary = data.get('summary', '')
    schemas = data.get('schemas', {})
    
    if not summary:
        return jsonify({
            'success': False,
            'error': 'Summary is required'
        }), 400
    
    if not schemas:
        return jsonify({
            'success': False,
            'error': 'Schemas are required'
        }), 400
    
    # Extract from AI summary
    result = world_extractor.extract_from_ai_summary(
        projects_dir=PROJECTS_DIR,
        project_id=project_id,
        summary_message=summary,
        schemas=schemas
    )
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400
    
# ============================================================================
# ARC ENDPOINTS - Phase 3
# ============================================================================

@app.route('/api/arc/schemas', methods=['GET'])
def get_arc_schemas():
    """Get arc schema templates"""
    try:
        schema_path = Path(__file__).parent / 'arc_schemas.json'
        
        if not schema_path.exists():
            return jsonify({
                'success': False,
                'error': 'Arc schemas file not found'
            }), 404
        
        with open(schema_path, 'r', encoding='utf-8') as f:
            schemas = json.load(f)
        
        return jsonify(schemas)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs', methods=['GET'])
def get_project_arcs(project_id):
    """Get all arcs for a project"""
    try:
        arcs_data = arc_manager.load_arcs(project_id)
        return jsonify({
            'success': True,
            'arcs': arcs_data.get('arcs', []),
            'metadata': arcs_data.get('metadata', {})
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs/<arc_id>', methods=['GET'])
def get_project_arc(project_id, arc_id):
    """Get a specific arc"""
    try:
        result = arc_manager.get_arc(project_id, arc_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs', methods=['POST'])
def create_arc(project_id):
    """Create a new arc"""
    try:
        arc_data = request.json
        
        if not arc_data:
            return jsonify({
                'success': False,
                'error': 'No arc data provided'
            }), 400
        
        result = arc_manager.add_arc(project_id, arc_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs/<arc_id>', methods=['PUT'])
def update_arc(project_id, arc_id):
    """Update an existing arc"""
    try:
        arc_data = request.json
        
        if not arc_data:
            return jsonify({
                'success': False,
                'error': 'No arc data provided'
            }), 400
        
        result = arc_manager.update_arc(project_id, arc_id, arc_data)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs/<arc_id>', methods=['DELETE'])
def delete_arc(project_id, arc_id):
    """Delete an arc"""
    try:
        result = arc_manager.delete_arc(project_id, arc_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs/build-from-summary', methods=['POST'])
def build_arcs_from_summary(project_id):
    """Build arcs from AI-generated summary"""
    try:
        data = request.json
        summary = data.get('summary', '')
        schemas = data.get('schemas', {})
        
        if not summary:
            return jsonify({
                'success': False,
                'error': 'No summary provided'
            }), 400
        
        # Load world data for context/validation
        world_data = {
            'characters': world_builder.load_world_section(project_id, 'characters'),
            'locations': world_builder.load_world_section(project_id, 'locations'),
            'factions': world_builder.load_world_section(project_id, 'factions')
        }
        
        # Extract arcs from summary
        extraction_result = arc_extractor.extract_from_ai_summary(
            summary, schemas, world_data
        )
        
        if not extraction_result['success']:
            return jsonify(extraction_result), 400
        
        # Load existing arcs
        arcs_data = arc_manager.load_arcs(project_id)
        
        # Add extracted arcs
        added_arcs = []
        skipped_arcs = []
        
        for arc in extraction_result['arcs']:
            # Check if ID already exists
            existing_ids = [a['id'] for a in arcs_data['arcs']]
            if arc['id'] in existing_ids:
                skipped_arcs.append(arc['id'])
                continue
            
            arcs_data['arcs'].append(arc)
            added_arcs.append(arc['id'])
        
        # Save all arcs
        if arc_manager.save_arcs(project_id, arcs_data):
            return jsonify({
                'success': True,
                'arcs_added': added_arcs,
                'arcs_skipped': skipped_arcs,
                'total_arcs': len(arcs_data['arcs']),
                'message': f"Successfully added {len(added_arcs)} arc(s)"
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save arcs'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/arcs/season/<int:season>', methods=['GET'])
def get_arcs_by_season(project_id, season):
    """Get all arcs for a specific season"""
    try:
        arcs = arc_manager.get_arcs_by_season(project_id, season)
        
        return jsonify({
            'success': True,
            'season': season,
            'arcs': arcs,
            'count': len(arcs)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/projects/<project_id>/world/context', methods=['GET'])
def get_world_context(project_id):
    """Get complete world context for arc planning"""
    try:
        context = {
            'characters': world_builder.load_world_section(project_id, 'characters'),
            'locations': world_builder.load_world_section(project_id, 'locations'),
            'factions': world_builder.load_world_section(project_id, 'factions'),
            'religions': world_builder.load_world_section(project_id, 'religions'),
            'npcs': world_builder.load_world_section(project_id, 'npcs'),
            'world_overview': world_builder.load_world_section(project_id, 'world_overview')
        }
        
        return jsonify({
            'success': True,
            'context': context
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Story Builder Backend - Phase 2.1"
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
    print("Story Builder Backend Starting - Phase 2.1")
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