import React from 'react';
import ListDetail from './ListDetail';
import styles from '../../styles/components/styles';

const Glossary = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.terms || []}
      itemLabel={(it, i) => it.term || `Term ${i + 1}`}
      onAdd={() => addItem('terms')}
      onRemove={(index) => removeItem('terms', index)}
      onUpdate={(index, field, value) => updateItem('terms', index, field, value)}
      title={'Glossary'}
      addLabel={'+ Add Term'}
      emptyMessage={'No terms yet.'}
      previewFields={['term','category']}
  openDetailOnAdd={true}
  onViewModeChange={onViewModeChange}
      renderItemEditor={(term, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{term.term || `Term ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Term</label><input style={styles.input} value={term.term || ''} onChange={(e) => updateField('term', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Pronunciation</label><input style={styles.input} value={term.pronunciation || ''} onChange={(e) => updateField('pronunciation', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Category</label><input style={styles.input} value={term.category || ''} onChange={(e) => updateField('category', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Definition</label><textarea style={styles.textarea} value={term.definition || ''} onChange={(e) => updateField('definition', e.target.value)} rows="2" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Etymology</label><input style={styles.input} value={term.etymology || ''} onChange={(e) => updateField('etymology', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Usage</label><input style={styles.input} value={term.usage || ''} onChange={(e) => updateField('usage', e.target.value)} /></div>
        </div>
      )}
    />
  </div>
);

export default Glossary;
