"""
Arc Manager Module - Phase 3
Handles CRUD operations for story arcs
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class ArcManager:
    def __init__(self, projects_dir: Path):
        self.projects_dir = projects_dir
    
    def get_arcs_file_path(self, project_id: str) -> Path:
        """Get path to arcs.json file"""
        return self.projects_dir / project_id / 'story' / 'arcs.json'
    
    def initialize_arcs_file(self, project_id: str) -> Dict:
        """Create initial arcs.json structure"""
        arcs_data = {
            'arcs': [],
            'metadata': {
                'totalArcs': 0,
                'totalSeasons': 0,
                'lastUpdated': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        # Create story directory if it doesn't exist
        story_dir = self.projects_dir / project_id / 'story'
        story_dir.mkdir(parents=True, exist_ok=True)
        
        # Write initial file
        arcs_file = self.get_arcs_file_path(project_id)
        with open(arcs_file, 'w', encoding='utf-8') as f:
            json.dump(arcs_data, f, indent=2, ensure_ascii=False)
        
        return arcs_data
    
    def load_arcs(self, project_id: str) -> Dict:
        """Load all arcs for a project"""
        arcs_file = self.get_arcs_file_path(project_id)
        
        if not arcs_file.exists():
            return self.initialize_arcs_file(project_id)
        
        with open(arcs_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_arcs(self, project_id: str, arcs_data: Dict) -> bool:
        """Save arcs data"""
        try:
            # Update metadata
            arcs_data['metadata']['totalArcs'] = len(arcs_data.get('arcs', []))
            arcs_data['metadata']['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
            
            # Calculate total seasons
            seasons = set()
            for arc in arcs_data.get('arcs', []):
                seasons.add(arc.get('season', 1))
            arcs_data['metadata']['totalSeasons'] = len(seasons)
            
            # Write to file
            arcs_file = self.get_arcs_file_path(project_id)
            with open(arcs_file, 'w', encoding='utf-8') as f:
                json.dump(arcs_data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving arcs: {e}")
            return False
    
    def add_arc(self, project_id: str, arc_data: Dict) -> Dict:
        """Add a new arc"""
        arcs_data = self.load_arcs(project_id)
        
        # Check if ID already exists
        existing_ids = [arc['id'] for arc in arcs_data['arcs']]
        if arc_data['id'] in existing_ids:
            return {
                'success': False,
                'error': f"Arc with ID '{arc_data['id']}' already exists"
            }
        
        arcs_data['arcs'].append(arc_data)
        
        if self.save_arcs(project_id, arcs_data):
            return {
                'success': True,
                'arc': arc_data,
                'message': f"Arc '{arc_data['title']}' added successfully"
            }
        else:
            return {
                'success': False,
                'error': 'Failed to save arc'
            }
    
    def update_arc(self, project_id: str, arc_id: str, arc_data: Dict) -> Dict:
        """Update an existing arc"""
        arcs_data = self.load_arcs(project_id)
        
        # Find and update the arc
        found = False
        for i, arc in enumerate(arcs_data['arcs']):
            if arc['id'] == arc_id:
                arcs_data['arcs'][i] = arc_data
                found = True
                break
        
        if not found:
            return {
                'success': False,
                'error': f"Arc '{arc_id}' not found"
            }
        
        if self.save_arcs(project_id, arcs_data):
            return {
                'success': True,
                'arc': arc_data,
                'message': f"Arc '{arc_data['title']}' updated successfully"
            }
        else:
            return {
                'success': False,
                'error': 'Failed to save arc'
            }
    
    def delete_arc(self, project_id: str, arc_id: str) -> Dict:
        """Delete an arc"""
        arcs_data = self.load_arcs(project_id)
        
        # Find and remove the arc
        original_count = len(arcs_data['arcs'])
        arcs_data['arcs'] = [arc for arc in arcs_data['arcs'] if arc['id'] != arc_id]
        
        if len(arcs_data['arcs']) == original_count:
            return {
                'success': False,
                'error': f"Arc '{arc_id}' not found"
            }
        
        if self.save_arcs(project_id, arcs_data):
            return {
                'success': True,
                'message': f"Arc '{arc_id}' deleted successfully"
            }
        else:
            return {
                'success': False,
                'error': 'Failed to save after deletion'
            }
    
    def get_arc(self, project_id: str, arc_id: str) -> Dict:
        """Get a specific arc"""
        arcs_data = self.load_arcs(project_id)
        
        for arc in arcs_data['arcs']:
            if arc['id'] == arc_id:
                return {
                    'success': True,
                    'arc': arc
                }
        
        return {
            'success': False,
            'error': f"Arc '{arc_id}' not found"
        }
    
    def get_arcs_by_season(self, project_id: str, season: int) -> List[Dict]:
        """Get all arcs for a specific season"""
        arcs_data = self.load_arcs(project_id)
        return [arc for arc in arcs_data['arcs'] if arc.get('season') == season]