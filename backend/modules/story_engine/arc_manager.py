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
    
    def get_arcs_file_path(self, project_id: str, season: int = None) -> Path:
        """Get path to arcs file - season-specific or combined"""
        story_dir = self.projects_dir / project_id / 'story'
        if season is not None:
            return story_dir / f'season{season}_arcs.json'
        else:
            return story_dir / 'arcs.json'  # Fallback for compatibility
    
    def initialize_season_arcs_file(self, project_id: str, season: int) -> Dict:
        """Create initial season arcs file structure - matches arc_schemas.json format"""
        arcs_data = {
            'arcs': [],
            'metadata': {
                'season': season,
                'totalArcs': 0,
                'totalSeasons': 1,
                'lastUpdated': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        # Create story directory if it doesn't exist
        story_dir = self.projects_dir / project_id / 'story'
        story_dir.mkdir(parents=True, exist_ok=True)
        
        # Write initial file
        arcs_file = self.get_arcs_file_path(project_id, season)
        with open(arcs_file, 'w', encoding='utf-8') as f:
            json.dump(arcs_data, f, indent=2, ensure_ascii=False)
        
        return arcs_data
    
    def load_season_arcs(self, project_id: str, season: int) -> Dict:
        """Load arcs for a specific season"""
        arcs_file = self.get_arcs_file_path(project_id, season)
        
        if not arcs_file.exists():
            return self.initialize_season_arcs_file(project_id, season)
        
        with open(arcs_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_all_arcs(self, project_id: str) -> Dict:
        """Load all arcs from all seasons and combine them"""
        story_dir = self.projects_dir / project_id / 'story'
        
        if not story_dir.exists():
            story_dir.mkdir(parents=True, exist_ok=True)
        
        # Find all season arc files
        season_files = list(story_dir.glob('season*_arcs.json'))
        
        all_arcs = []
        seasons = set()
        
        for season_file in season_files:
            try:
                with open(season_file, 'r', encoding='utf-8') as f:
                    season_data = json.load(f)
                    all_arcs.extend(season_data.get('arcs', []))
                    # Get season from metadata or fallback to filename parsing
                    season_num = season_data.get('metadata', {}).get('season')
                    if not season_num:
                        # Extract from filename: season1_arcs.json -> 1
                        import re
                        match = re.search(r'season(\d+)_arcs\.json', str(season_file))
                        season_num = int(match.group(1)) if match else 1
                    seasons.add(season_num)
            except Exception as e:
                print(f"Error loading {season_file}: {e}")
        
        return {
            'arcs': all_arcs,
            'metadata': {
                'totalArcs': len(all_arcs),
                'totalSeasons': len(seasons),
                'lastUpdated': datetime.utcnow().isoformat() + 'Z'
            }
        }
    
    def save_season_arcs(self, project_id: str, season: int, arcs_data: Dict) -> bool:
        """Save arcs data for a specific season"""
        try:
            # Update metadata to match schema format
            arcs_data['metadata']['season'] = season
            arcs_data['metadata']['totalArcs'] = len(arcs_data.get('arcs', []))
            arcs_data['metadata']['totalSeasons'] = 1  # This file represents one season
            arcs_data['metadata']['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
            
            # Write to season-specific file
            arcs_file = self.get_arcs_file_path(project_id, season)
            with open(arcs_file, 'w', encoding='utf-8') as f:
                json.dump(arcs_data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving season {season} arcs: {e}")
            return False
    
    def save_arcs_by_season(self, project_id: str, all_arcs: List[Dict]) -> bool:
        """Save arcs grouped by season into separate files"""
        try:
            # Group arcs by season
            arcs_by_season = {}
            for arc in all_arcs:
                season = arc.get('season', 1)
                if season not in arcs_by_season:
                    arcs_by_season[season] = []
                arcs_by_season[season].append(arc)
            
            # Save each season separately
            for season, arcs in arcs_by_season.items():
                season_data = {
                    'arcs': arcs,
                    'metadata': {
                        'season': season,
                        'totalArcs': len(arcs),
                        'totalSeasons': 1,
                        'lastUpdated': datetime.utcnow().isoformat() + 'Z'
                    }
                }
                
                if not self.save_season_arcs(project_id, season, season_data):
                    return False
            
            return True
        except Exception as e:
            print(f"Error saving arcs by season: {e}")
            return False
    
    def add_arc(self, project_id: str, arc_data: Dict) -> Dict:
        """Add a new arc to the appropriate season file"""
        season = arc_data.get('season', 1)
        season_arcs_data = self.load_season_arcs(project_id, season)
        
        # Check if ID already exists in this season
        existing_ids = [arc['id'] for arc in season_arcs_data['arcs']]
        if arc_data['id'] in existing_ids:
            return {
                'success': False,
                'error': f"Arc with ID '{arc_data['id']}' already exists in season {season}"
            }
        
        season_arcs_data['arcs'].append(arc_data)
        
        if self.save_season_arcs(project_id, season, season_arcs_data):
            return {
                'success': True,
                'arc': arc_data,
                'message': f"Arc '{arc_data['title']}' added successfully to season {season}"
            }
        else:
            return {
                'success': False,
                'error': 'Failed to save arc'
            }
    
    def update_arc(self, project_id: str, arc_id: str, arc_data: Dict) -> Dict:
        """Update an existing arc"""
        # First, find which season the arc is in
        arc_season = None
        story_dir = self.projects_dir / project_id / 'story'
        season_files = list(story_dir.glob('season*_arcs.json'))
        
        for season_file in season_files:
            try:
                with open(season_file, 'r', encoding='utf-8') as f:
                    season_data = json.load(f)
                    for arc in season_data.get('arcs', []):
                        if arc['id'] == arc_id:
                            # Get season from metadata or filename
                            arc_season = season_data.get('metadata', {}).get('season')
                            if not arc_season:
                                import re
                                match = re.search(r'season(\d+)_arcs\.json', str(season_file))
                                arc_season = int(match.group(1)) if match else 1
                            break
                if arc_season:
                    break
            except Exception:
                continue
        
        if not arc_season:
            return {
                'success': False,
                'error': f"Arc '{arc_id}' not found in any season"
            }
        
        # Load the season data and update the arc
        season_arcs_data = self.load_season_arcs(project_id, arc_season)
        
        found = False
        for i, arc in enumerate(season_arcs_data['arcs']):
            if arc['id'] == arc_id:
                season_arcs_data['arcs'][i] = arc_data
                found = True
                break
        
        if not found:
            return {
                'success': False,
                'error': f"Arc '{arc_id}' not found"
            }
        
        if self.save_season_arcs(project_id, arc_season, season_arcs_data):
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
        """Delete an arc from its season file"""
        # First, find which season the arc is in
        arc_season = None
        story_dir = self.projects_dir / project_id / 'story'
        season_files = list(story_dir.glob('season*_arcs.json'))
        
        for season_file in season_files:
            try:
                with open(season_file, 'r', encoding='utf-8') as f:
                    season_data = json.load(f)
                    for arc in season_data.get('arcs', []):
                        if arc['id'] == arc_id:
                            # Get season from metadata or filename
                            arc_season = season_data.get('metadata', {}).get('season')
                            if not arc_season:
                                import re
                                match = re.search(r'season(\d+)_arcs\.json', str(season_file))
                                arc_season = int(match.group(1)) if match else 1
                            break
                if arc_season:
                    break
            except Exception:
                continue
        
        if not arc_season:
            return {
                'success': False,
                'error': f"Arc '{arc_id}' not found in any season"
            }
        
        # Load the season data and remove the arc
        season_arcs_data = self.load_season_arcs(project_id, arc_season)
        
        original_count = len(season_arcs_data['arcs'])
        season_arcs_data['arcs'] = [arc for arc in season_arcs_data['arcs'] if arc['id'] != arc_id]
        
        if len(season_arcs_data['arcs']) == original_count:
            return {
                'success': False,
                'error': f"Arc '{arc_id}' not found"
            }
        
        if self.save_season_arcs(project_id, arc_season, season_arcs_data):
            return {
                'success': True,
                'message': f"Arc '{arc_id}' deleted successfully from season {arc_season}"
            }
        else:
            return {
                'success': False,
                'error': 'Failed to save after deletion'
            }
    
    def get_arc(self, project_id: str, arc_id: str) -> Dict:
        """Get a specific arc from any season"""
        story_dir = self.projects_dir / project_id / 'story'
        season_files = list(story_dir.glob('season*_arcs.json'))
        
        for season_file in season_files:
            try:
                with open(season_file, 'r', encoding='utf-8') as f:
                    season_data = json.load(f)
                    for arc in season_data.get('arcs', []):
                        if arc['id'] == arc_id:
                            return {
                                'success': True,
                                'arc': arc
                            }
            except Exception:
                continue
        
        return {
            'success': False,
            'error': f"Arc '{arc_id}' not found"
        }
    
    def get_arcs_by_season(self, project_id: str, season: int) -> List[Dict]:
        """Get all arcs for a specific season"""
        season_arcs_data = self.load_season_arcs(project_id, season)
        return season_arcs_data.get('arcs', [])