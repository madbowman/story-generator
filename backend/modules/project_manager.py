"""
Project Manager Module
Handles project creation, loading, deletion, and listing
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import uuid


class ProjectManager:
    """Manages story builder projects"""
    
    def create_project(self, 
                      projects_dir: Path, 
                      title: str,
                      description: str = "",
                      genre: str = "General") -> Dict:
        """
        Create new project with directory structure
        
        Args:
            projects_dir: Base projects directory
            title: Project title
            description: Project description
            genre: Story genre
        
        Returns:
            Dict with success status and project_id
        """
        if not title or len(title.strip()) == 0:
            return {
                'success': False,
                'error': 'Project title is required'
            }
        
        # Generate unique project ID
        project_id = self._generate_project_id(title)
        project_path = projects_dir / project_id
        
        # Check if project already exists
        if project_path.exists():
            return {
                'success': False,
                'error': f'Project "{title}" already exists'
            }
        
        try:
            # Create directory structure
            self._create_project_structure(project_path)
            
            # Create project metadata
            metadata = {
                'id': project_id,
                'title': title,
                'description': description,
                'genre': genre,
                'created': datetime.now().isoformat(),
                'lastModified': datetime.now().isoformat(),
                'version': '1.0'
            }
            
            # Save metadata
            metadata_file = project_path / 'project_metadata.json'
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            # Initialize empty world files
            self._initialize_world_files(project_path)
            
            return {
                'success': True,
                'project_id': project_id,
                'message': f'Project "{title}" created successfully'
            }
            
        except Exception as e:
            # Clean up on failure
            if project_path.exists():
                shutil.rmtree(project_path)
            
            return {
                'success': False,
                'error': f'Failed to create project: {str(e)}'
            }
    
    def list_projects(self, projects_dir: Path) -> Dict:
        """
        Get list of all projects
        
        Returns:
            Dict with list of projects and their metadata
        """
        if not projects_dir.exists():
            return {
                'success': True,
                'projects': []
            }
        
        projects = []
        
        for project_path in projects_dir.iterdir():
            if project_path.is_dir():
                metadata_file = project_path / 'project_metadata.json'
                
                if metadata_file.exists():
                    try:
                        with open(metadata_file, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                            projects.append({
                                'id': metadata['id'],
                                'title': metadata['title'],
                                'description': metadata.get('description', ''),
                                'genre': metadata.get('genre', 'General'),
                                'created': metadata['created'],
                                'lastModified': metadata.get('lastModified', metadata['created'])
                            })
                    except Exception:
                        # Skip corrupted projects
                        continue
        
        # Sort by last modified (newest first)
        projects.sort(key=lambda x: x['lastModified'], reverse=True)
        
        return {
            'success': True,
            'projects': projects
        }
    
    def load_project(self, projects_dir: Path, project_id: str) -> Optional[Dict]:
        """
        Load project and return all data
        
        Args:
            projects_dir: Base projects directory
            project_id: Project ID to load
        
        Returns:
            Complete project data or None if not found
        """
        project_path = projects_dir / project_id
        
        if not project_path.exists():
            return None
        
        metadata_file = project_path / 'project_metadata.json'
        
        if not metadata_file.exists():
            return None
        
        try:
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            return {
                'success': True,
                'metadata': metadata,
                'project_path': str(project_path)
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to load project: {str(e)}'
            }
    
    def delete_project(self, projects_dir: Path, project_id: str) -> Dict:
        """Delete a project"""
        project_path = projects_dir / project_id
        
        if not project_path.exists():
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        try:
            shutil.rmtree(project_path)
            return {
                'success': True,
                'message': f'Project deleted successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to delete project: {str(e)}'
            }
    
    def _generate_project_id(self, title: str) -> str:
        """Generate unique project ID from title"""
        # Clean title for filesystem
        clean_title = "".join(c if c.isalnum() or c in (' ', '_') else '' for c in title)
        clean_title = clean_title.replace(' ', '_').lower()
        
        # Add short UUID for uniqueness
        unique_id = str(uuid.uuid4())[:8]
        
        return f"{clean_title}_{unique_id}"
    
    def _create_project_structure(self, project_path: Path):
        """Create directory structure for new project"""
        # Main directories
        (project_path / 'world').mkdir(parents=True, exist_ok=True)
        (project_path / 'story' / 'seasons').mkdir(parents=True, exist_ok=True)
        (project_path / 'state').mkdir(parents=True, exist_ok=True)
        (project_path / 'exports' / 'tts_scripts').mkdir(parents=True, exist_ok=True)
    
    def _initialize_world_files(self, project_path: Path):
        """Create empty world data files"""
        world_dir = project_path / 'world'
        
        # World overview
        with open(world_dir / 'world_overview.json', 'w', encoding='utf-8') as f:
            json.dump({
                'name': '',
                'description': '',
                'timePeriod': '',
                'technologyLevel': '',
                'history': '',
                'rulesPhysics': ''
            }, f, indent=2)
        
        # Locations
        with open(world_dir / 'locations.json', 'w', encoding='utf-8') as f:
            json.dump({
                'places': [],
                'routes': []
            }, f, indent=2)
        
        # Characters
        with open(world_dir / 'characters.json', 'w', encoding='utf-8') as f:
            json.dump({'characters': []}, f, indent=2)
        
        # NPCs
        with open(world_dir / 'npcs.json', 'w', encoding='utf-8') as f:
            json.dump({'npcs': []}, f, indent=2)
        
        # Factions
        with open(world_dir / 'factions.json', 'w', encoding='utf-8') as f:
            json.dump({'factions': []}, f, indent=2)
        
        # Religions
        with open(world_dir / 'religions.json', 'w', encoding='utf-8') as f:
            json.dump({'religions': []}, f, indent=2)
        
        # Glossary
        with open(world_dir / 'glossary.json', 'w', encoding='utf-8') as f:
            json.dump({'terms': []}, f, indent=2)
        
        # Content (items, hazards, machines)
        with open(world_dir / 'content.json', 'w', encoding='utf-8') as f:
            json.dump({
                'items': [],
                'hazards': [],
                'machines': []
            }, f, indent=2)
        
        # Initialize state files
        state_dir = project_path / 'state'
        
        with open(state_dir / 'current_state.json', 'w', encoding='utf-8') as f:
            json.dump({
                'lastUpdated': datetime.now().isoformat(),
                'currentDate': '',
                'characterPositions': {},
                'relationships': {},
                'resources': {},
                'knownInformation': []
            }, f, indent=2)
        
        with open(state_dir / 'timeline.json', 'w', encoding='utf-8') as f:
            json.dump({'events': []}, f, indent=2)