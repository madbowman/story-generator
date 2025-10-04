"""
World Extractor Module - Phase 2.1: AI Summary Extraction
Extracts world data from AI-generated structured summary
"""

import json
import re
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
    
    def extract_from_ai_summary(self, 
                               projects_dir: Path,
                               project_id: str, 
                               summary_message: str,
                               schemas: Dict) -> Dict[str, Any]:
        """
        Extract world information from AI-generated structured summary
        
        Args:
            projects_dir: Base projects directory
            project_id: Project ID
            summary_message: The last AI message containing structured summary
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
            
            # Extract structured data from AI summary
            extracted_data = self._parse_ai_summary(summary_message, schemas)
            
            # Check if any data was found
            total_entities = self._count_entities(extracted_data)
            
            if total_entities == 0:
                return {
                    'success': False,
                    'error': 'No entities found in summary. Please generate a world summary first.'
                }
            
            # Write JSON files
            created_files = self._write_world_files(world_dir, extracted_data)
            
            return {
                'success': True,
                'files_created': created_files,
                'message': f'Successfully created {len(created_files)} world files from {total_entities} entities',
                'entity_counts': self._get_entity_breakdown(extracted_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _parse_ai_summary(self, summary: str, schemas: Dict) -> Dict:
        """Parse AI-generated structured summary"""
        
        # Initialize data structure
        data = {
            'world_overview': {},
            'locations': {'places': []},
            'characters': {'characters': []},
            'npcs': {'npcs': []},
            'factions': {'factions': []},
            'religions': {'religions': []},
            'glossary': {'terms': []},
        'content': {'items': []}
        }
        
        # Split summary into sections
        sections = self._split_into_sections(summary)
        
        # Parse each section
        if 'WORLD INFO' in sections or 'WORLD OVERVIEW' in sections:
            data['world_overview'] = self._parse_world_section(
                sections.get('WORLD INFO') or sections.get('WORLD OVERVIEW', ''),
                schemas.get('world_overview', {})
            )
        
        if 'CHARACTERS' in sections:
            data['characters']['characters'] = self._parse_list_section(
                sections['CHARACTERS'], 
                'character',
                schemas.get('characters', {}).get('characters', [{}])[0] if schemas.get('characters', {}).get('characters') else {}
            )
        
        if 'LOCATIONS' in sections:
            data['locations']['places'] = self._parse_list_section(
                sections['LOCATIONS'],
                'location',
                schemas.get('locations', {}).get('places', [{}])[0] if schemas.get('locations', {}).get('places') else {}
            )
        
        if 'NPCS' in sections:
            data['npcs']['npcs'] = self._parse_list_section(
                sections['NPCS'],
                'npc',
                schemas.get('npcs', {}).get('npcs', [{}])[0] if schemas.get('npcs', {}).get('npcs') else {}
            )
        
        if 'FACTIONS' in sections:
            data['factions']['factions'] = self._parse_list_section(
                sections['FACTIONS'],
                'faction',
                schemas.get('factions', {}).get('factions', [{}])[0] if schemas.get('factions', {}).get('factions') else {}
            )
        
        if 'RELIGIONS' in sections:
            data['religions']['religions'] = self._parse_list_section(
                sections['RELIGIONS'],
                'religion',
                schemas.get('religions', {}).get('religions', [{}])[0] if schemas.get('religions', {}).get('religions') else {}
            )
        
        if 'GLOSSARY' in sections:
            data['glossary']['terms'] = self._parse_list_section(
                sections['GLOSSARY'],
                'term',
                schemas.get('glossary', {}).get('terms', [{}])[0] if schemas.get('glossary', {}).get('terms') else {}
            )
        
        if 'ITEMS' in sections:
            data['content']['items'] = self._parse_list_section(
                sections['ITEMS'],
                'item',
                schemas.get('content', {}).get('items', [{}])[0] if schemas.get('content', {}).get('items') else {}
            )
        
        # Hazards and machines removed from content schema - no parsing
        
        return data
    
    def _split_into_sections(self, text: str) -> Dict[str, str]:
        """Split summary text into sections based on === SECTION === markers"""
        sections = {}
        current_section = None
        current_content = []
        
        for line in text.split('\n'):
            # Check for section header: === SECTION NAME ===
            if match := re.match(r'===\s*([A-Z\s]+)\s*===', line.strip()):
                # Save previous section if exists
                if current_section:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = match.group(1).strip()
                current_content = []
            elif current_section:
                current_content.append(line)
        
        # Save last section
        if current_section:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections
    
    def _parse_world_section(self, content: str, schema: Dict) -> Dict:
        """Parse world overview section with key: value pairs"""
        world_data = {}
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Match key: value format
            if match := re.match(r'([^:]+):\s*(.+)', line):
                key = match.group(1).strip().lower()
                value = match.group(2).strip()
                
                # Map to schema keys
                schema_key = self._map_to_schema_key(key, schema)
                if schema_key:
                    world_data[schema_key] = value
        
        return world_data
    
    def _parse_list_section(self, content: str, entity_type: str, schema: Dict) -> List[Dict]:
        """Parse list section (characters, locations, etc.)"""
        entities = []
        current_entity = {}
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                # Empty line might indicate end of entity
                if current_entity:
                    entities.append(current_entity)
                    current_entity = {}
                continue
            
            # Match key: value format
            if match := re.match(r'([^:]+):\s*(.+)', line):
                key = match.group(1).strip().lower()
                value = match.group(2).strip()
                
                # Map to schema key
                schema_key = self._map_to_schema_key(key, schema)
                if schema_key:
                    # Handle different data types
                    parsed_value = self._parse_value(value, schema_key, schema)
                    current_entity[schema_key] = parsed_value
                    
                    # Auto-generate ID from name if this is a name field
                    if schema_key == 'name' and 'id' not in current_entity:
                        current_entity['id'] = self._generate_id(value)
        
        # Add last entity
        if current_entity:
            entities.append(current_entity)
        
        return entities
    
    def _map_to_schema_key(self, key: str, schema: Dict) -> str:
        """Map user-friendly keys to schema keys"""
        key_lower = key.lower().replace(' ', '').replace('_', '')
        
        for schema_key in schema.keys():
            schema_key_normalized = schema_key.lower().replace('_', '')
            if key_lower == schema_key_normalized:
                return schema_key
        
        return None
    
    def _parse_value(self, value: str, key: str, schema: Dict) -> Any:
        """Parse value based on schema type"""
        schema_hint = schema.get(key, '')
        
        # Check if it's a number
        if 'number' in str(schema_hint).lower():
            try:
                if '.' in value:
                    return float(value)
                return int(value)
            except ValueError:
                return 0
        
        # Check if it's a boolean
        if 'boolean' in str(schema_hint).lower():
            return value.lower() in ['true', 'yes', '1']
        
        # Check if it's an array
        if 'array' in str(schema_hint).lower() or isinstance(schema.get(key), list):
            # Split by comma or semicolon
            return [item.strip() for item in re.split(r'[,;]', value) if item.strip()]
        
        # Check if it's an object (like coords)
        if key == 'coords' or isinstance(schema.get(key), dict):
            # Try to parse x,y format
            if match := re.match(r'x:\s*(\d+),?\s*y:\s*(\d+)', value.lower()):
                return {'x': int(match.group(1)), 'y': int(match.group(2))}
            return {'x': 0, 'y': 0}
        
        # Default: return as string
        return value
    
    def _generate_id(self, name: str) -> str:
        """Generate unique ID from name"""
        return name.lower().replace(' ', '_').replace("'", '').replace('"', '')
    
    def _count_entities(self, data: Dict) -> int:
        """Count total entities across all sections"""
        count = 0
        
        count += len(data.get('characters', {}).get('characters', []))
        count += len(data.get('locations', {}).get('places', []))
        count += len(data.get('npcs', {}).get('npcs', []))
        count += len(data.get('factions', {}).get('factions', []))
        count += len(data.get('religions', {}).get('religions', []))
        count += len(data.get('glossary', {}).get('terms', []))
        count += len(data.get('content', {}).get('items', []))
    # hazards and machines removed
        
        if data.get('world_overview', {}).get('name'):
            count += 1
        
        return count
    
    def _get_entity_breakdown(self, data: Dict) -> Dict:
        """Get breakdown of entities by type"""
        return {
            'world_overview': 1 if data.get('world_overview', {}).get('name') else 0,
            'characters': len(data.get('characters', {}).get('characters', [])),
            'locations': len(data.get('locations', {}).get('places', [])),
            'npcs': len(data.get('npcs', {}).get('npcs', [])),
            'factions': len(data.get('factions', {}).get('factions', [])),
            'religions': len(data.get('religions', {}).get('religions', [])),
            'glossary_terms': len(data.get('glossary', {}).get('terms', [])),
            'items': len(data.get('content', {}).get('items', [])),
        }
    
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
            if data_key in data:
                file_path = world_dir / filename
                
                # Write JSON with pretty printing
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data[data_key], f, indent=2, ensure_ascii=False)
                
                created_files.append(filename)
        
        return created_files