"""
Consistency Validator Module
Validates logical consistency in world building and stories
Phase 1: Basic world validation
"""

import json
from pathlib import Path
from typing import Dict, List


class ConsistencyValidator:
    """Validates consistency across project data"""
    
    def validate(self, 
                projects_dir: Path, 
                project_id: str,
                scope: str = 'world') -> Dict:
        """
        Run consistency validation
        
        Args:
            projects_dir: Base projects directory
            project_id: Project to validate
            scope: 'world' or 'episode' (Phase 2)
        
        Returns:
            Validation results with warnings and suggestions
        """
        project_path = projects_dir / project_id
        
        if not project_path.exists():
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        if scope == 'world':
            return self._validate_world(project_path)
        elif scope == 'episode':
            return {
                'success': False,
                'message': 'Episode validation available in Phase 2'
            }
        
        return {
            'success': False,
            'error': 'Invalid scope'
        }
    
    def _validate_world(self, project_path: Path) -> Dict:
        """Validate world building consistency"""
        warnings = []
        suggestions = []
        
        world_dir = project_path / 'world'
        
        # Load all world data
        try:
            world_data = self._load_world_data(world_dir)
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to load world data: {str(e)}'
            }
        
        # Check world overview completeness
        overview_checks = self._check_world_overview(world_data.get('world_overview', {}))
        warnings.extend(overview_checks['warnings'])
        suggestions.extend(overview_checks['suggestions'])
        
        # Check locations consistency
        location_checks = self._check_locations(world_data.get('locations', {}))
        warnings.extend(location_checks['warnings'])
        suggestions.extend(location_checks['suggestions'])
        
        # Check characters
        character_checks = self._check_characters(
            world_data.get('characters', {}),
            world_data.get('locations', {}),
            world_data.get('factions', {})
        )
        warnings.extend(character_checks['warnings'])
        suggestions.extend(character_checks['suggestions'])
        
        # Check factions
        faction_checks = self._check_factions(world_data.get('factions', {}))
        warnings.extend(faction_checks['warnings'])
        suggestions.extend(faction_checks['suggestions'])
        
        return {
            'success': True,
            'valid': len(warnings) == 0,
            'warnings': warnings,
            'suggestions': suggestions,
            'summary': {
                'total_warnings': len(warnings),
                'total_suggestions': len(suggestions)
            }
        }
    
    def _load_world_data(self, world_dir: Path) -> Dict:
        """Load all world JSON files"""
        data = {}
        
        files = [
            'world_overview.json',
            'locations.json',
            'characters.json',
            'npcs.json',
            'factions.json',
            'religions.json',
            'glossary.json',
            'content.json'
        ]
        
        for file_name in files:
            file_path = world_dir / file_name
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    key = file_name.replace('.json', '')
                    data[key] = json.load(f)
        
        return data
    
    def _check_world_overview(self, overview: Dict) -> Dict:
        """Check world overview completeness"""
        warnings = []
        suggestions = []
        
        required_fields = ['name', 'description', 'timePeriod', 'technologyLevel']
        
        for field in required_fields:
            if not overview.get(field) or len(str(overview.get(field)).strip()) == 0:
                warnings.append({
                    'type': 'incomplete_world_overview',
                    'severity': 'medium',
                    'message': f'World overview missing: {field}',
                    'suggestion': f'Add {field} to world overview for better context'
                })
        
        return {'warnings': warnings, 'suggestions': suggestions}
    
    def _check_locations(self, locations: Dict) -> Dict:
        """Check locations consistency"""
        warnings = []
        suggestions = []
        
        places = locations.get('places', [])
        routes = locations.get('routes', [])
        
        # Check for duplicate location IDs
        location_ids = [p.get('id') for p in places if p.get('id')]
        if len(location_ids) != len(set(location_ids)):
            warnings.append({
                'type': 'duplicate_location_ids',
                'severity': 'high',
                'message': 'Duplicate location IDs detected',
                'suggestion': 'Ensure each location has a unique ID'
            })
        
        # Check routes reference valid locations
        place_ids_set = set(location_ids)
        for route in routes:
            from_id = route.get('from')
            to_id = route.get('to')
            
            if from_id not in place_ids_set:
                warnings.append({
                    'type': 'invalid_route',
                    'severity': 'high',
                    'message': f'Route references non-existent location: {from_id}',
                    'suggestion': f'Remove route or create location with ID: {from_id}'
                })
            
            if to_id not in place_ids_set:
                warnings.append({
                    'type': 'invalid_route',
                    'severity': 'high',
                    'message': f'Route references non-existent location: {to_id}',
                    'suggestion': f'Remove route or create location with ID: {to_id}'
                })
            
            # Check travel time is reasonable
            travel_time = route.get('travel_time_hours', 0)
            if travel_time <= 0:
                warnings.append({
                    'type': 'invalid_travel_time',
                    'severity': 'medium',
                    'message': f'Route {from_id} -> {to_id} has invalid travel time',
                    'suggestion': 'Set realistic travel time in hours'
                })
        
        # Suggest adding routes if locations exist but no routes defined
        if len(places) > 1 and len(routes) == 0:
            suggestions.append({
                'type': 'missing_routes',
                'message': 'You have multiple locations but no routes defined',
                'suggestion': 'Consider adding travel routes between locations'
            })
        
        return {'warnings': warnings, 'suggestions': suggestions}
    
    def _check_characters(self, 
                         characters: Dict,
                         locations: Dict,
                         factions: Dict) -> Dict:
        """Check character consistency"""
        warnings = []
        suggestions = []
        
        char_list = characters.get('characters', [])
        place_ids = {p.get('id') for p in locations.get('places', [])}
        faction_ids = {f.get('id') for f in factions.get('factions', [])}
        
        # Check for duplicate character IDs
        char_ids = [c.get('id') for c in char_list if c.get('id')]
        if len(char_ids) != len(set(char_ids)):
            warnings.append({
                'type': 'duplicate_character_ids',
                'severity': 'high',
                'message': 'Duplicate character IDs detected',
                'suggestion': 'Ensure each character has a unique ID'
            })
        
        # Check character relationships reference valid characters
        char_ids_set = set(char_ids)
        for character in char_list:
            relationships = character.get('relationships', [])
            for rel in relationships:
                related_id = rel.get('character_id')
                if related_id and related_id not in char_ids_set:
                    warnings.append({
                        'type': 'invalid_relationship',
                        'severity': 'medium',
                        'message': f'Character {character.get("name")} has relationship with non-existent character ID: {related_id}',
                        'suggestion': 'Remove relationship or create the referenced character'
                    })
        
        return {'warnings': warnings, 'suggestions': suggestions}
    
    def _check_factions(self, factions: Dict) -> Dict:
        """Check faction consistency"""
        warnings = []
        suggestions = []
        
        faction_list = factions.get('factions', [])
        
        # Check for duplicate faction IDs
        faction_ids = [f.get('id') for f in faction_list if f.get('id')]
        if len(faction_ids) != len(set(faction_ids)):
            warnings.append({
                'type': 'duplicate_faction_ids',
                'severity': 'high',
                'message': 'Duplicate faction IDs detected',
                'suggestion': 'Ensure each faction has a unique ID'
            })
        
        return {'warnings': warnings, 'suggestions': suggestions}