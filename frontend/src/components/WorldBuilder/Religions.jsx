import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Religions = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.religions || []}
      itemLabel={(it, i) => it.name || `Religion ${i + 1}`}
      onAdd={() => addItem('religions')}
      onRemove={(index) => removeItem('religions', index)}
      onUpdate={(index, field, value) => updateItem('religions', index, field, value)}
      title={'Religions'}
      addLabel={'+ Add Religion'}
      emptyMessage={'No religions yet.'}
      renderItemEditor={(religion, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{religion.name || `Religion ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={religion.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={religion.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

export default Religions;
