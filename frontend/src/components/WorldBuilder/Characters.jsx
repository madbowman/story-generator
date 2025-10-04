import React from 'react';
import ListDetail from './ListDetail';
import styles from '../../styles/components/styles';

const Characters = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.characters || []}
      itemLabel={(it, i) => it.name || `Character ${i + 1}`}
      onAdd={() => addItem('characters')}
      onRemove={(index) => removeItem('characters', index)}
      onUpdate={(index, field, value) => updateItem('characters', index, field, value)}
  previewFields={['name','role','currentLocation']}
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
          <div style={styles.formGroup}><label style={styles.label}>Skills</label><textarea style={styles.textarea} value={JSON.stringify(char.skills || [])} onChange={(e) => { try { updateField('skills', JSON.parse(e.target.value)); } catch { } }} rows="3" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Weaknesses</label><input style={styles.input} value={(char.weaknesses || []).join(', ')} onChange={(e) => updateField('weaknesses', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Equipment</label><input style={styles.input} value={(char.equipment || []).join(', ')} onChange={(e) => updateField('equipment', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Current Location</label><input style={styles.input} value={char.currentLocation || ''} onChange={(e) => updateField('currentLocation', e.target.value)} /></div>
        </div>
      )}
    />
  </div>
);

export default Characters;
