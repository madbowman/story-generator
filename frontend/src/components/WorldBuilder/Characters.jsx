import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Characters = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.characters || []}
      itemLabel={(it, i) => it.name || `Character ${i + 1}`}
      onAdd={() => addItem('characters')}
      onRemove={(index) => removeItem('characters', index)}
      onUpdate={(index, field, value) => updateItem('characters', index, field, value)}
      title={'Characters'}
      addLabel={'+ Add Character'}
      emptyMessage={'No characters yet. Click "+ Add Character" to create one.'}
      renderItemEditor={(char, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{char.name || `Character ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={char.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Role</label><input style={styles.input} value={char.role || ''} onChange={(e) => updateField('role', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={char.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="2" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Personality</label><textarea style={styles.textarea} value={char.personality || ''} onChange={(e) => updateField('personality', e.target.value)} rows="2" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Backstory</label><textarea style={styles.textarea} value={char.backstory || ''} onChange={(e) => updateField('backstory', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

export default Characters;
