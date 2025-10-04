"""
World Extractor Module
Extracts world data from AI conversation and builds JSON files
Integrates with existing OllamaClient and project structure
"""

import json
from pathlib import Path
from typing import Dict, List, Any


class WorldExtractor:
    def __init__(self, ollama_client):
        """
        Initialize with existing OllamaClient
        
        Args:
            ollama_client: OllamaClient instance from ai_integration module
        """
        self.ollama = ollama_client
    
    def extract_and_build(self, 
                         projects_dir: Path,
                         project_id: str, 
                         conversation: List[Dict],
                         schemas: Dict) -> Dict[str, Any]:
        """
        Extract world information from conversation and build all JSON files
        
        Args:
            projects_dir: Base projects directory
            project_id: Project ID
            conversation: List of {"role": "user/assistant", "content": "..."}
            schemas: World schema templates
            
        Returns:
            Dict with success status and created files list
        """
        try:
            project_path = projects_dir / project_id
            world_dir = project_path / 'world'
            
            # Create world directory if it doesn't exist
            if not world_dir.exists():
                world_dir.mkdir(parents=True, exist_ok=True)

            extraction_prompt = self._build_extraction_prompt(conversation, schemas)
            
            # Call Ollama to extract data
            extraction_result = self._extract_with_ai(extraction_prompt)
            
            if not extraction_result['success']:
                return {
                    'success': False,
                    'error': extraction_result['error']
                }
            
            extracted_data = extraction_result['data']
            
            # Write JSON files
            created_files = self._write_world_files(world_dir, extracted_data)
            
            return {
                'success': True,
                'files_created': created_files,
                'message': f'Successfully created {len(created_files)} world files'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_extraction_prompt(self, conversation: List[Dict], schemas: Dict) -> str:
        """Build the AI extraction prompt"""
        
        # Combine conversation into text
        conversation_text = "\n\n".join([
            f"{'User' if msg['role'] == 'user' else 'AI'}: {msg['content']}"
            for msg in conversation
            if msg['role'] in ['user', 'assistant']
        ])
        
        prompt = f"""You are a world-building data extraction specialist. Your task is to analyze a conversation about a fictional world and extract ALL information into structured JSON format following D&D style schemas.

CONVERSATION HISTORY:
{conversation_text}

SCHEMAS TO FOLLOW:
{json.dumps(schemas, indent=2)}

CRITICAL EXTRACTION RULES:
1. Read the entire conversation carefully
2. Extract EVERY piece of world-building information mentioned
3. Follow the schema structure EXACTLY - include ALL fields shown in the schema
4. For character IDs and location IDs: use lowercase with underscores (e.g., "silver_keep", "john_doe")
5. For character names: Extract the actual name (e.g., "Gorvoth", "Eilif") into the "name" field
6. For coordinates: if not mentioned, assign logical positions on a grid
7. For travel times: if vague (e.g., "a few days"), interpret reasonably (3 days = 72 hours)
8. For D&D style stats: use standard D&D conventions
9. Fill in reasonable defaults for optional fields, but NEVER leave required fields empty
10. Required fields that must ALWAYS be present:
    - Characters: id, name, role, age, description
    - Locations: id, name, type, description
    - Factions: id, name, type, description
    - Religions: id, name, type, description
11. ONLY extract information that was actually discussed - don't invent major plot points
12. Return ONLY valid JSON, no other text before or after

EXAMPLE CHARACTER FORMAT:
{{
  "id": "gorvoth",
  "name": "Gorvoth",
  "role": "protagonist",
  "age": 30,
  "race": "Orc",
  "class": "warrior",
  ...
}}

CRITICAL: Your response must be ONLY a JSON object with these exact keys:
- world_overview
- locations
- characters  
- npcs
- factions
- religions
- glossary
- content

Each key must contain data matching its schema structure from above.

BEGIN EXTRACTION (JSON only):"""
        
        return prompt
    
    def _extract_with_ai(self, prompt: str) -> Dict:
        """
        Use Ollama AI to extract structured data
        
        Returns:
            Dict with success status and extracted data
        """
        try:
            # Call Ollama with low temperature for accuracy
            result = self.ollama.generate(
                prompt=prompt,
                temperature=0.2,  # Low temperature for structured extraction
                system_prompt="You are a data extraction specialist. You ONLY respond with valid JSON, no other text."
            )
            
            if not result['success']:
                return {
                    'success': False,
                    'error': result['error'],
                    'data': None
                }
            
            response_text = result['response'].strip()
            
            # Handle markdown code blocks
            if '```json' in response_text:
                # Extract JSON from code block
                start = response_text.find('```json') + 7
                end = response_text.find('```', start)
                response_text = response_text[start:end].strip()
            elif '```' in response_text:
                # Generic code block
                start = response_text.find('```') + 3
                end = response_text.find('```', start)
                response_text = response_text[start:end].strip()
            
            # Parse JSON
            try:
                extracted_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                return {
                    'success': False,
                    'error': f'AI returned invalid JSON: {str(e)}',
                    'data': None
                }
            
            # Validate extracted data has required keys
            required_keys = [
                'world_overview', 'locations', 'characters', 'npcs',
                'factions', 'religions', 'glossary', 'content'
            ]
            
            for key in required_keys:
                if key not in extracted_data:
                    extracted_data[key] = self._get_empty_schema(key)
            
            return {
                'success': True,
                'error': None,
                'data': extracted_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Extraction failed: {str(e)}',
                'data': None
            }
    
    def _get_empty_schema(self, section: str) -> Dict:
        """Return empty schema for a section"""
        empty_schemas = {
            'world_overview': {
                'name': '',
                'description': '',
                'timePeriod': '',
                'technologyLevel': '',
                'history': '',
                'rulesPhysics': ''
            },
            'locations': {
                'places': [],
                'routes': []
            },
            'characters': {
                'characters': []
            },
            'npcs': {
                'npcs': []
            },
            'factions': {
                'factions': []
            },
            'religions': {
                'religions': []
            },
            'glossary': {
                'terms': []
            },
            'content': {
                'items': [],
                'hazards': [],
                'machines': []
            }
        }
        
        return empty_schemas.get(section, {})
    
    def _write_world_files(self, world_dir: Path, data: Dict) -> List[str]:
        """Write extracted data to JSON files"""
        
        created_files = []
        
        # File mapping
        file_mapping = {
            'world_overview': 'world_overview.json',
            'locations': 'locations.json',
            'characters': 'characters.json',
            'npcs': 'npcs.json',
            'factions': 'factions.json',
            'religions': 'religions.json',
            'glossary': 'glossary.json',
            'content': 'content.json'
        }
        
        for data_key, filename in file_mapping.items():
            if data_key in data and data[data_key]:
                # Fix missing names before writing
                data[data_key] = self._fix_missing_names(data_key, data[data_key])
                
                file_path = world_dir / filename
                
                # Write JSON with pretty printing
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data[data_key], f, indent=2, ensure_ascii=False)
                
                created_files.append(filename)
        
        return created_files
    
    def _fix_missing_names(self, section: str, data: Dict) -> Dict:
        """Fix missing name fields by extracting from ID"""
        if section == 'characters' and 'characters' in data:
            for char in data['characters']:
                if 'name' not in char or not char['name']:
                    # Extract name from ID: "gorvoth_tribe_warrior" -> "Gorvoth"
                    char['name'] = char['id'].split('_')[0].capitalize()
        
        elif section == 'npcs' and 'npcs' in data:
            for npc in data['npcs']:
                if 'name' not in npc or not npc['name']:
                    npc['name'] = npc['id'].split('_')[0].capitalize()
        
        elif section == 'locations' and 'places' in data:
            for place in data['places']:
                if 'name' not in place or not place['name']:
                    # "silver_keep" -> "Silver Keep"
                    place['name'] = ' '.join(word.capitalize() for word in place['id'].split('_'))
        
        elif section == 'factions' and 'factions' in data:
            for faction in data['factions']:
                if 'name' not in faction or not faction['name']:
                    faction['name'] = ' '.join(word.capitalize() for word in faction['id'].split('_'))
        
        elif section == 'religions' and 'religions' in data:
            for religion in data['religions']:
                if 'name' not in religion or not religion['name']:
                    religion['name'] = ' '.join(word.capitalize() for word in religion['id'].split('_'))
        
        return data