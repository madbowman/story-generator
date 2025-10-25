import React from 'react';
import ListDetail from './ListDetail';
import RelationshipEditor from './RelationshipEditor';
import SkillsEditor from './SkillsEditor';
import styles from '../../styles/components/styles';

const Characters = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => {
  const allCharacters = data.characters || [];
  const allLocations = data.places || [];

  // Debug logging to help troubleshoot
  console.log('Characters component data:', data);
  console.log('Available locations:', allLocations);

  // Helper function to get all locations (sorted alphabetically)
  const getAllLocations = () => {
    return allLocations
      .filter(location => location && location.id && location.name) // Filter out invalid locations
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  };

  // Helper function to get location name by ID
  const getLocationNameById = (locationId) => {
    if (!locationId) return '';
    const location = allLocations.find(loc => loc.id === locationId);
    return location ? location.name : locationId; // Fallback to ID if name not found
  };

  // Helper function to get location ID by name
  const getLocationIdByName = (locationName) => {
    if (!locationName) return '';
    const location = allLocations.find(loc => loc.name === locationName);
    return location ? location.id : locationName; // Fallback to name if ID not found
  }; return (
    <div style={styles.form}>
      <ListDetail
        items={data.characters || []}
        itemLabel={(it, i) => it.name || `Character ${i + 1}`}
        onAdd={() => addItem('characters')}
        onRemove={(index) => removeItem('characters', index)}
        onUpdate={(index, field, value) => updateItem('characters', index, field, value)}
        previewFields={['name', 'role', 'currentLocation']}
        openDetailOnAdd={true}
        onViewModeChange={onViewModeChange}
        title={'Characters'}
        addLabel={'+ Add Character'}
        emptyMessage={'No characters yet. Click "+ Add Character" to create one.'}
        renderItemEditor={(char, index, updateField) => (
          <div style={styles.card}>
            <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{char.name || `Character ${index + 1}`}</h3></div>
            <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={char.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Role</label><input style={styles.input} value={char.role || ''} onChange={(e) => updateField('role', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Age</label><input style={styles.input} type="number" value={char.age || ''} onChange={(e) => updateField('age', Number(e.target.value) || 0)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Race</label><input style={styles.input} value={char.race || ''} onChange={(e) => updateField('race', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Class</label><input style={styles.input} value={char.class || ''} onChange={(e) => updateField('class', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Level</label><input style={styles.input} type="number" value={char.level || ''} onChange={(e) => updateField('level', Number(e.target.value) || 0)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Alignment</label><input style={styles.input} value={char.alignment || ''} onChange={(e) => updateField('alignment', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={char.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="2" /></div>
            <div style={styles.formGroup}><label style={styles.label}>Personality</label><textarea style={styles.textarea} value={char.personality || ''} onChange={(e) => updateField('personality', e.target.value)} rows="2" /></div>
            <div style={styles.formGroup}><label style={styles.label}>Backstory</label><textarea style={styles.textarea} value={char.backstory || ''} onChange={(e) => updateField('backstory', e.target.value)} rows="3" /></div>
            <div style={styles.formGroup}><label style={styles.label}>Motivation</label><input style={styles.input} value={char.motivation || ''} onChange={(e) => updateField('motivation', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Fears</label><input style={styles.input} value={(char.fears || []).join(', ')} onChange={(e) => updateField('fears', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>

            <SkillsEditor
              skills={char.skills || []}
              onUpdate={(newSkills) => updateField('skills', newSkills)}
            />

            <div style={styles.formGroup}><label style={styles.label}>Weaknesses</label><input style={styles.input} value={(char.weaknesses || []).join(', ')} onChange={(e) => updateField('weaknesses', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
            <div style={styles.formGroup}><label style={styles.label}>Equipment</label><input style={styles.input} value={(char.equipment || []).join(', ')} onChange={(e) => updateField('equipment', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>

            <RelationshipEditor
              relationships={char.relationships || []}
              allCharacters={allCharacters.filter(c => c.id !== char.id)}
              onUpdate={(newRelationships) => updateField('relationships', newRelationships)}
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>Current Location</label>
              <select
                style={styles.input}
                value={char.currentLocation || ''}
                onChange={(e) => updateField('currentLocation', e.target.value)}
              >
                <option value="">Select a location...</option>
                {getAllLocations().map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
                <option value="custom">Other (type custom location)</option>
              </select>
              {char.currentLocation === 'custom' && (
                <input
                  style={{ ...styles.input, marginTop: '8px' }}
                  placeholder="Enter custom location"
                  value={char.customLocation || ''}
                  onChange={(e) => updateField('customLocation', e.target.value)}
                />
              )}
              {char.currentLocation && char.currentLocation !== 'custom' && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                  Selected: {getLocationNameById(char.currentLocation)}
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Characters;
