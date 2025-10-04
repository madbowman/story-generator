"""
World Extractor Module - Structured Command-Based Extraction
Extracts world data from structured commands in conversation
No AI guessing - only extracts what user explicitly adds
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
    
    def extract_and_build(self, 
                         projects_dir: Path,
                         project_id: str, 
                         conversation: List[Dict],
                         schemas: Dict) -> Dict[str, Any]:
        """
        Extract world information from structured commands in conversation
        
        Args:
            projects_dir: Base projects directory
            project_id: Project ID
            conversation: List of {"role": "user/assistant", "content": "..."}
            schemas: World schema templates (not used in structured extraction)
            
        Returns:
            Dict with success status and created files list
        """
        try:
            project_path = projects_dir / project_id
            world_dir = project_path / 'world'
            
            # Create world directory if it doesn't exist
            if not world_dir.exists():
                world_dir.mkdir(parents=True, exist_ok=True)
            
            # Extract structured data from conversation commands
            extracted_data = self._extract_from_commands(conversation)
            
            # Check if any data was found
            total_entities = sum([
                len(extracted_data.get('characters', {}).get('characters', [])),
                len(extracted_data.get('locations', {}).get('places', [])),
                len(extracted_data.get('factions', {}).get('factions', [])),
                len(extracted_data.get('religions', {}).get('religions', [])),
                len(extracted_data.get('npcs', {}).get('npcs', [])),
            ])
            
            if total_entities == 0:
                return {
                    'success': False,
                    'error': 'No structured commands found. Use ADD CHARACTER:, ADD LOCATION:, etc. to add entities.'
                }
            
            # Write JSON files
            created_files = self._write_world_files(world_dir, extracted_data)
            
            return {
                'success': True,
                'files_created': created_files,
                'message': f'Successfully created {len(created_files)} world files from {total_entities} entities'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _extract_from_commands(self, conversation: List[Dict]) -> Dict:
        """Extract data from structured commands in conversation"""
        
        data = {
            'world_overview': {
                'name': '',
                'description': '',
                'timePeriod': '',
                'technologyLevel': '',
                'magicSystem': '',
                'history': '',
                'rulesPhysics': ''
            },
            'locations': {'places': [], 'routes': []},
            'characters': {'characters': []},
            'npcs': {'npcs': []},
            'factions': {'factions': []},
            'religions': {'religions': []},
            'glossary': {'terms': []},
            'content': {'items': [], 'hazards': [], 'machines': []}
        }
        
        # Patterns for structured commands
        patterns = {
            'character': r'ADD CHARACTER:\s*(.+)',
            'npc': r'ADD NPC:\s*(.+)',
            'location': r'ADD LOCATION:\s*(.+)',
            'faction': r'ADD FACTION:\s*(.+)',
            'religion': r'ADD RELIGION:\s*(.+)',
            'item': r'ADD ITEM:\s*(.+)',
            'world': r'SET WORLD:\s*(.+)',
        }
        
        for msg in conversation:
            if msg['role'] != 'user':
                continue
            
            content = msg['content']
            
            # Extract characters
            if match := re.search(patterns['character'], content, re.IGNORECASE):
                char = self._parse_character(match.group(1))
                if char:
                    data['characters']['characters'].append(char)
            
            # Extract NPCs
            if match := re.search(patterns['npc'], content, re.IGNORECASE):
                npc = self._parse_npc(match.group(1))
                if npc:
                    data['npcs']['npcs'].append(npc)
            
            # Extract locations
            if match := re.search(patterns['location'], content, re.IGNORECASE):
                location = self._parse_location(match.group(1))
                if location:
                    data['locations']['places'].append(location)
            
            # Extract factions
            if match := re.search(patterns['faction'], content, re.IGNORECASE):
                faction = self._parse_faction(match.group(1))
                if faction:
                    data['factions']['factions'].append(faction)
            
            # Extract religions
            if match := re.search(patterns['religion'], content, re.IGNORECASE):
                religion = self._parse_religion(match.group(1))
                if religion:
                    data['religions']['religions'].append(religion)
            
            # Extract items
            if match := re.search(patterns['item'], content, re.IGNORECASE):
                item = self._parse_item(match.group(1))
                if item:
                    data['content']['items'].append(item)
            
            # Extract world info
            if match := re.search(patterns['world'], content, re.IGNORECASE):
                world_info = self._parse_world(match.group(1))
                data['world_overview'].update(world_info)
        
        return data
    
    def _parse_character(self, text: str) -> Dict:
        """Parse character from command text"""
        # Format: name, role, description, age, race, class
        parts = [p.strip() for p in text.split(',')]
        
        if len(parts) < 1:
            return None
        
        name = parts[0]
        char_id = name.lower().replace(' ', '_').replace("'", '')
        
        char = {
            'id': char_id,
            'name': name,
            'role': parts[1] if len(parts) > 1 else 'character',
            'description': parts[2] if len(parts) > 2 else '',
            'age': int(parts[3]) if len(parts) > 3 and parts[3].isdigit() else 30,
            'race': parts[4] if len(parts) > 4 else 'human',
            'class': parts[5] if len(parts) > 5 else 'adventurer',
            'alignment': 'neutral',
            'backstory': '',
            'personality': '',
            'motivation': '',
            'skills': [],
            'equipment': [],
            'relationships': []
        }
        
        return char
    
    def _parse_npc(self, text: str) -> Dict:
        """Parse NPC from command text"""
        # Format: name, role, location, description
        parts = [p.strip() for p in text.split(',')]
        
        if len(parts) < 1:
            return None
        
        name = parts[0]
        npc_id = name.lower().replace(' ', '_').replace("'", '')
        
        npc = {
            'id': npc_id,
            'name': name,
            'role': parts[1] if len(parts) > 1 else 'npc',
            'location': parts[2] if len(parts) > 2 else '',
            'description': parts[3] if len(parts) > 3 else '',
            'personality': '',
            'services': [],
            'questGiver': False,
            'attitude': 'neutral'
        }
        
        return npc
    
    def _parse_location(self, text: str) -> Dict:
        """Parse location from command text"""
        # Format: name, type, description, region
        parts = [p.strip() for p in text.split(',')]
        
        if len(parts) < 1:
            return None
        
        name = parts[0]
        loc_id = name.lower().replace(' ', '_').replace("'", '')
        
        location = {
            'id': loc_id,
            'name': name,
            'type': parts[1] if len(parts) > 1 else 'location',
            'description': parts[2] if len(parts) > 2 else '',
            'region': parts[3] if len(parts) > 3 else '',
            'population': 0,
            'coords': {'x': 0, 'y': 0}
        }
        
        return location
    
    def _parse_faction(self, text: str) -> Dict:
        """Parse faction from command text"""
        # Format: name, type, description
        parts = [p.strip() for p in text.split(',')]
        
        if len(parts) < 1:
            return None
        
        name = parts[0]
        faction_id = name.lower().replace(' ', '_').replace("'", '')
        
        faction = {
            'id': faction_id,
            'name': name,
            'type': parts[1] if len(parts) > 1 else 'organization',
            'description': parts[2] if len(parts) > 2 else '',
            'alignment': 'neutral',
            'goals': [],
            'members': []
        }
        
        return faction
    
    def _parse_religion(self, text: str) -> Dict:
        """Parse religion from command text"""
        # Format: name, type, description
        parts = [p.strip() for p in text.split(',')]
        
        if len(parts) < 1:
            return None
        
        name = parts[0]
        religion_id = name.lower().replace(' ', '_').replace("'", '')
        
        religion = {
            'id': religion_id,
            'name': name,
            'type': parts[1] if len(parts) > 1 else 'religion',
            'description': parts[2] if len(parts) > 2 else '',
            'alignment': 'neutral',
            'beliefs': [],
            'practices': []
        }
        
        return religion
    
    def _parse_item(self, text: str) -> Dict:
        """Parse item from command text"""
        # Format: name, type, description
        parts = [p.strip() for p in text.split(',')]
        
        if len(parts) < 1:
            return None
        
        name = parts[0]
        item_id = name.lower().replace(' ', '_').replace("'", '')
        
        item = {
            'id': item_id,
            'name': name,
            'type': parts[1] if len(parts) > 1 else 'item',
            'description': parts[2] if len(parts) > 2 else '',
            'rarity': 'common'
        }
        
        return item
    
    def _parse_world(self, text: str) -> Dict:
        """Parse world info from command text"""
        # Format: key=value pairs
        world_info = {}
        
        pairs = text.split(',')
        for pair in pairs:
            if '=' in pair:
                key, value = pair.split('=', 1)
                key = key.strip().lower()
                value = value.strip()
                
                if key in ['name', 'description', 'timeperiod', 'technologylevel', 'magicsystem', 'history', 'rulesphysics']:
                    # Convert to camelCase for schema
                    if key == 'timeperiod':
                        key = 'timePeriod'
                    elif key == 'technologylevel':
                        key = 'technologyLevel'
                    elif key == 'magicsystem':
                        key = 'magicSystem'
                    elif key == 'rulesphysics':
                        key = 'rulesPhysics'
                    
                    world_info[key] = value
        
        return world_info
    
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