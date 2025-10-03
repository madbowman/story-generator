import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Glossary = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.terms || []}
      itemLabel={(it, i) => it.name || `Term ${i + 1}`}
      onAdd={() => addItem('terms')}
      onRemove={(index) => removeItem('terms', index)}
      onUpdate={(index, field, value) => updateItem('terms', index, field, value)}
      title={'Glossary'}
      addLabel={'+ Add Term'}
      emptyMessage={'No terms yet.'}
      renderItemEditor={(term, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{term.name || `Term ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Term</label><input style={styles.input} value={term.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Definition</label><textarea style={styles.textarea} value={term.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="2" /></div>
        </div>
      )}
    />
  </div>
);

export default Glossary;
