"""
Arc Extractor Module - Phase 3
Extracts story arcs from AI-generated structured summary
"""

import re
from typing import Dict, List, Any


class ArcExtractor:
    def __init__(self):
        pass
    
    def extract_from_ai_summary(self, summary: str, schemas: Dict, world_data: Dict) -> Dict:
        """
        Extract arc data from AI-generated summary
        
        Args:
            summary: AI-generated structured summary
            schemas: Arc schema templates
            world_data: World context (characters, locations, etc.) for validation
            
        Returns:
            Dict with extracted arcs
        """
        try:
            # Split summary into arc sections
            sections = self._split_into_arcs(summary)
            
            if not sections:
                return {
                    'success': False,
                    'error': 'No arc sections found in summary'
                }
            
            # Parse each arc
            arcs = []
            for arc_content in sections:
                arc_data = self._parse_arc(arc_content, world_data)
                if arc_data:
                    arcs.append(arc_data)
            
            if not arcs:
                return {
                    'success': False,
                    'error': 'No valid arcs extracted from summary'
                }
            
            return {
                'success': True,
                'arcs': arcs,
                'count': len(arcs)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _split_into_arcs(self, text: str) -> List[str]:
        """Split summary into individual arc sections"""
        # Look for === ARC === markers
        arc_sections = []
        current_arc = []
        in_arc = False
        
        for line in text.split('\n'):
            # Check for arc header: === ARC ===
            if re.match(r'===\s*ARC\s*===', line.strip(), re.IGNORECASE):
                if current_arc:
                    arc_sections.append('\n'.join(current_arc).strip())
                current_arc = []
                in_arc = True
            elif in_arc:
                current_arc.append(line)
        
        # Add last arc
        if current_arc:
            arc_sections.append('\n'.join(current_arc).strip())
        
        return arc_sections
    
    def _parse_arc(self, content: str, world_data: Dict) -> Dict:
        """Parse individual arc from content"""
        arc = {
            'id': '',
            'title': '',
            'season': 1,
            'arcNumber': 1,
            'episodes': {'start': 1, 'end': 1, 'list': []},
            'status': 'planned',
            'description': '',
            'themes': [],
            'mainCharacters': [],
            'supportingCharacters': [],
            'primaryLocations': [],
            'factions': [],
            'plotBeats': [],
            'resolution': '',
            'cliffhanger': '',
            'connections': {'previousArc': None, 'nextArc': None}
        }
        
        current_beat = None
        plot_beats = []
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                # Empty line might end a plot beat
                if current_beat and current_beat.get('episode'):
                    plot_beats.append(current_beat)
                    current_beat = None
                continue
            
            # Match key: value format
            if match := re.match(r'([^:]+):\s*(.+)', line):
                key = match.group(1).strip().lower()
                value = match.group(2).strip()
                
                # Map to arc fields
                if key == 'id':
                    arc['id'] = value
                elif key == 'title':
                    arc['title'] = value
                elif key == 'season':
                    arc['season'] = self._parse_number(value)
                elif key in ['arcnumber', 'arc number', 'arc_number']:
                    arc['arcNumber'] = self._parse_number(value)
                elif key in ['episodestart', 'episode start', 'start episode']:
                    arc['episodes']['start'] = self._parse_number(value)
                elif key in ['episodeend', 'episode end', 'end episode']:
                    arc['episodes']['end'] = self._parse_number(value)
                elif key == 'status':
                    arc['status'] = value
                elif key == 'description':
                    arc['description'] = value
                elif key == 'themes':
                    arc['themes'] = self._parse_array(value)
                elif key in ['maincharacters', 'main characters', 'main_characters']:
                    arc['mainCharacters'] = self._parse_array(value)
                elif key in ['supportingcharacters', 'supporting characters', 'supporting_characters']:
                    arc['supportingCharacters'] = self._parse_array(value)
                elif key in ['primarylocations', 'primary locations', 'locations']:
                    arc['primaryLocations'] = self._parse_array(value)
                elif key == 'factions':
                    arc['factions'] = self._parse_array(value)
                elif key == 'resolution':
                    arc['resolution'] = value
                elif key == 'cliffhanger':
                    arc['cliffhanger'] = value
                elif key in ['previousarc', 'previous arc', 'previous_arc']:
                    arc['connections']['previousArc'] = value if value.lower() != 'none' else None
                elif key in ['nextarc', 'next arc', 'next_arc']:
                    arc['connections']['nextArc'] = value if value.lower() != 'none' else None
                
                # Plot beat fields
                elif key == 'episode':
                    if current_beat and current_beat.get('episode'):
                        plot_beats.append(current_beat)
                    current_beat = {
                        'episode': self._parse_number(value),
                        'title': '',
                        'description': '',
                        'characters': [],
                        'location': '',
                        'outcome': ''
                    }
                elif current_beat:
                    if key in ['beattitle', 'beat title', 'beat_title']:
                        current_beat['title'] = value
                    elif key in ['beatdescription', 'beat description', 'beat_description']:
                        current_beat['description'] = value
                    elif key == 'characters':
                        current_beat['characters'] = self._parse_array(value)
                    elif key == 'location':
                        current_beat['location'] = value
                    elif key == 'outcome':
                        current_beat['outcome'] = value
        
        # Add last plot beat
        if current_beat and current_beat.get('episode'):
            plot_beats.append(current_beat)
        
        arc['plotBeats'] = plot_beats
        
        # Generate episode list from start/end
        if arc['episodes']['start'] and arc['episodes']['end']:
            arc['episodes']['list'] = list(range(
                arc['episodes']['start'],
                arc['episodes']['end'] + 1
            ))
        
        # Auto-generate ID if missing
        if not arc['id'] and arc['title']:
            arc['id'] = self._generate_id(arc['title'])
        
        return arc if arc['id'] else None
    
    def _parse_number(self, value: str) -> int:
        """Parse number from string"""
        try:
            return int(value)
        except ValueError:
            return 0
    
    def _parse_array(self, value: str) -> List[str]:
        """Parse comma-separated array"""
        return [item.strip() for item in value.split(',') if item.strip()]
    
    def _generate_id(self, name: str) -> str:
        """Generate ID from name"""
        return name.lower().replace(' ', '_').replace("'", '').replace('"', '')