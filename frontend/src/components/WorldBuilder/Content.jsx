import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Content = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.items || []}
      itemLabel={(it, i) => it.name || `Item ${i + 1}`}
      onAdd={() => addItem('items')}
      onRemove={(index) => removeItem('items', index)}
      onUpdate={(index, field, value) => updateItem('items', index, field, value)}
      title={'Items & Hazards'}
      addLabel={'+ Add Item'}
      emptyMessage={'No items yet.'}
      renderItemEditor={(item, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{item.name || `Item ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={item.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={item.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="2" /></div>
        </div>
      )}
    />
  </div>
);

export default Content;
