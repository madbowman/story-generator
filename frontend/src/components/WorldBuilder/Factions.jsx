import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Factions = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.factions || []}
      itemLabel={(it, i) => it.name || `Faction ${i + 1}`}
      onAdd={() => addItem('factions')}
      onRemove={(index) => removeItem('factions', index)}
      onUpdate={(index, field, value) => updateItem('factions', index, field, value)}
      title={'Factions'}
      addLabel={'+ Add Faction'}
      emptyMessage={'No factions yet.'}
      renderItemEditor={(faction, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{faction.name || `Faction ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={faction.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={faction.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

export default Factions;
