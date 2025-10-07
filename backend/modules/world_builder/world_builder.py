"""
World Builder Module
Handles world building data management and context building
"""

import json
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime


class WorldBuilder:
    """Manages world building data"""
    
    VALID_SECTIONS = [
        'world_overview',
        'locations',
        'characters',
        'npcs',
        'factions',
        'religions',
        'glossary',
        'content'
    ]
    
    def __init__(self, projects_dir: Path):
        """Initialize WorldBuilder with projects directory"""
        self.projects_dir = projects_dir

    def load_world_section(self, project_id: str, section: str) -> Dict:
        """
        Load a specific world section - used by world context endpoint
        
        Args:
            project_id: Project ID
            section: Section name (world_overview, characters, etc.)
            
        Returns:
            Dict with section data or empty dict if not found
        """
        try:
            world_dir = self.projects_dir / project_id / 'world'
            file_path = world_dir / f'{section}.json'
            
            if not file_path.exists():
                return {}
            
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading section {section}: {e}")
            return {}
    
    def get_section(self, 
                   projects_dir: Path, 
                   project_id: str, 
                   section: str) -> Optional[Dict]:
        """Get specific world section data"""
        if section not in self.VALID_SECTIONS:
            return None
        
        section_file = projects_dir / project_id / 'world' / f'{section}.json'
        
        if not section_file.exists():
            return {'error': f'Section {section} not found'}
        
        try:
            with open(section_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return {
                'success': True,
                'section': section,
                'data': data
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to read section: {str(e)}'
            }
    
    def update_section(self,
                      projects_dir: Path,
                      project_id: str,
                      section: str,
                      data: Dict) -> Dict:
        """Update world section with new data"""
        if section not in self.VALID_SECTIONS:
            return {
                'success': False,
                'error': f'Invalid section: {section}'
            }
        
        section_file = projects_dir / project_id / 'world' / f'{section}.json'
        
        if not section_file.exists():
            return {
                'success': False,
                'error': f'Section file not found: {section}'
            }
        
        try:
            # Write updated data
            with open(section_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Update project's last modified timestamp
            self._update_project_timestamp(projects_dir, project_id)
            
            return {
                'success': True,
                'message': f'Section {section} updated successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to update section: {str(e)}'
            }
    
    def build_context(self, projects_dir: Path, project_id: str) -> Dict:
        """
        Build AI context from world data
        
        This gathers all world information to provide context for AI generation
        """
        project_path = projects_dir / project_id
        world_dir = project_path / 'world'
        
        if not world_dir.exists():
            return {}
        
        context = {}
        
        # Load all world sections
        for section in self.VALID_SECTIONS:
            section_file = world_dir / f'{section}.json'
            if section_file.exists():
                try:
                    with open(section_file, 'r', encoding='utf-8') as f:
                        context[section] = json.load(f)
                except Exception:
                    # Skip files that can't be read
                    continue
        
        return context
    
    def _update_project_timestamp(self, projects_dir: Path, project_id: str):
        """Update project's lastModified timestamp"""
        metadata_file = projects_dir / project_id / 'project_metadata.json'
        
        if not metadata_file.exists():
            return
        
        try:
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            metadata['lastModified'] = datetime.now().isoformat()
            
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
        except Exception:
            # Fail silently - timestamp update is not critical
            pass
    
    def add_location(self, 
                    projects_dir: Path,
                    project_id: str,
                    location_data: Dict) -> Dict:
        """Add a new location to the world"""
        result = self.get_section(projects_dir, project_id, 'locations')
        
        if not result.get('success'):
            return result
        
        locations = result['data']
        
        # Add new location
        if 'places' not in locations:
            locations['places'] = []
        
        locations['places'].append(location_data)
        
        # Save updated data
        return self.update_section(projects_dir, project_id, 'locations', locations)
    
    def add_character(self,
                     projects_dir: Path,
                     project_id: str,
                     character_data: Dict) -> Dict:
        """Add a new character to the world"""
        result = self.get_section(projects_dir, project_id, 'characters')
        
        if not result.get('success'):
            return result
        
        characters = result['data']
        
        # Add new character
        if 'characters' not in characters:
            characters['characters'] = []
        
        characters['characters'].append(character_data)
        
        # Save updated data
        return self.update_section(projects_dir, project_id, 'characters', characters)
    
    def add_faction(self,
                   projects_dir: Path,
                   project_id: str,
                   faction_data: Dict) -> Dict:
        """Add a new faction to the world"""
        result = self.get_section(projects_dir, project_id, 'factions')
        
        if not result.get('success'):
            return result
        
        factions = result['data']
        
        # Add new faction
        if 'factions' not in factions:
            factions['factions'] = []
        
        factions['factions'].append(faction_data)
        
        # Save updated data
        return self.update_section(projects_dir, project_id, 'factions', factions)
    
    def get_world_summary(self, projects_dir: Path, project_id: str) -> Dict:
        """Get a summary of the world for display purposes"""
        context = self.build_context(projects_dir, project_id)
        
        summary = {
            'overview': context.get('world_overview', {}),
            'stats': {
                'locations': len(context.get('locations', {}).get('places', [])),
                'characters': len(context.get('characters', {}).get('characters', [])),
                'npcs': len(context.get('npcs', {}).get('npcs', [])),
                'factions': len(context.get('factions', {}).get('factions', [])),
                'religions': len(context.get('religions', {}).get('religions', [])),
                'glossary_terms': len(context.get('glossary', {}).get('terms', []))
            }
        }
        
        return summary