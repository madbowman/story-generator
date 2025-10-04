import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Content = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.items || []}
      itemLabel={(it, i) => it.name || `Item ${i + 1}`}
      onAdd={() => addItem('items')}
      onRemove={(index) => removeItem('items', index)}
      onUpdate={(index, field, value) => updateItem('items', index, field, value)}
      previewFields={['name','type','rarity']}
  openDetailOnAdd={true}
  onViewModeChange={onViewModeChange}
  title={'Items'}
      addLabel={'+ Add Item'}
      emptyMessage={'No items yet.'}
      renderItemEditor={(item, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{item.name || `Item ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={item.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Type</label><input style={styles.input} value={item.type || ''} onChange={(e) => updateField('type', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Rarity</label><input style={styles.input} value={item.rarity || ''} onChange={(e) => updateField('rarity', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={item.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="2" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Properties</label><input style={styles.input} value={item.properties || ''} onChange={(e) => updateField('properties', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Value</label><input style={styles.input} type="number" value={item.value || ''} onChange={(e) => updateField('value', Number(e.target.value) || 0)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Weight</label><input style={styles.input} type="number" value={item.weight || ''} onChange={(e) => updateField('weight', Number(e.target.value) || 0)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Requires Attunement</label><input style={styles.input} type="checkbox" checked={!!item.requiresAttunement} onChange={(e) => updateField('requiresAttunement', e.target.checked)} /></div>
        </div>
      )}
    />
  </div>
);

export default Content;
