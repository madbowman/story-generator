import React from 'react';
import ListDetail from './ListDetail';
import styles from '../../styles/components/styles';

const Factions = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.factions || []}
      itemLabel={(it, i) => it.name || `Faction ${i + 1}`}
      onAdd={() => addItem('factions')}
      onRemove={(index) => removeItem('factions', index)}
      onUpdate={(index, field, value) => updateItem('factions', index, field, value)}
      previewFields={['name','type','headquarters']}
  openDetailOnAdd={true}
  onViewModeChange={onViewModeChange}
      title={'Factions'}
      addLabel={'+ Add Faction'}
      emptyMessage={'No factions yet.'}
      renderItemEditor={(faction, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{faction.name || `Faction ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={faction.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Type</label><input style={styles.input} value={faction.type || ''} onChange={(e) => updateField('type', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Alignment</label><input style={styles.input} value={faction.alignment || ''} onChange={(e) => updateField('alignment', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Headquarters</label><input style={styles.input} value={faction.headquarters || ''} onChange={(e) => updateField('headquarters', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={faction.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Goals</label><input style={styles.input} value={(faction.goals || []).join(', ')} onChange={(e) => updateField('goals', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Methods</label><input style={styles.input} value={faction.methods || ''} onChange={(e) => updateField('methods', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Leadership</label><input style={styles.input} value={faction.leadership || ''} onChange={(e) => updateField('leadership', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Membership</label><input style={styles.input} type="number" value={faction.membership || ''} onChange={(e) => updateField('membership', Number(e.target.value) || 0)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Resources</label><input style={styles.input} value={faction.resources || ''} onChange={(e) => updateField('resources', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Reputation</label><input style={styles.input} value={faction.reputation || ''} onChange={(e) => updateField('reputation', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Relationships (JSON)</label><textarea style={styles.textarea} value={JSON.stringify(faction.relationships || [])} onChange={(e) => { try { updateField('relationships', JSON.parse(e.target.value)); } catch {} }} rows="3" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Members</label><input style={styles.input} value={(faction.members || []).join(', ')} onChange={(e) => updateField('members', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated character IDs" /></div>
        </div>
      )}
    />
  </div>
);

export default Factions;
