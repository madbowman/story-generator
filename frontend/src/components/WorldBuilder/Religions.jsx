import React from 'react';
import ListDetail from './ListDetail';
import styles from '../../styles/components/styles';

const Religions = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.religions || []}
      itemLabel={(it, i) => it.name || `Religion ${i + 1}`}
      onAdd={() => addItem('religions')}
      onRemove={(index) => removeItem('religions', index)}
      onUpdate={(index, field, value) => updateItem('religions', index, field, value)}
      previewFields={['name','domain','influence']}
      openDetailOnAdd={true}
      onViewModeChange={onViewModeChange}
      title={'Religions'}
      addLabel={'+ Add Religion'}
      emptyMessage={'No religions yet.'}
      renderItemEditor={(religion, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{religion.name || `Religion ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={religion.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Type</label><input style={styles.input} value={religion.type || ''} onChange={(e) => updateField('type', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Alignment</label><input style={styles.input} value={religion.alignment || ''} onChange={(e) => updateField('alignment', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Domain</label><input style={styles.input} value={religion.domain || ''} onChange={(e) => updateField('domain', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={religion.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Beliefs</label><input style={styles.input} value={(religion.beliefs || []).join(', ')} onChange={(e) => updateField('beliefs', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Practices</label><input style={styles.input} value={(religion.practices || []).join(', ')} onChange={(e) => updateField('practices', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Clergy</label><input style={styles.input} value={religion.clergy || ''} onChange={(e) => updateField('clergy', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Temples</label><input style={styles.input} value={(religion.temples || []).join(', ')} onChange={(e) => updateField('temples', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated location IDs" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Followers</label><input style={styles.input} type="number" value={religion.followers || ''} onChange={(e) => updateField('followers', Number(e.target.value) || 0)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Influence</label><input style={styles.input} value={religion.influence || ''} onChange={(e) => updateField('influence', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Relationships (JSON)</label><textarea style={styles.textarea} value={JSON.stringify(religion.relationships || [])} onChange={(e) => { try { updateField('relationships', JSON.parse(e.target.value)); } catch {} }} rows="3" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Holy Days</label><input style={styles.input} value={(religion.holyDays || []).join(', ')} onChange={(e) => updateField('holyDays', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Symbols</label><input style={styles.input} value={religion.symbols || ''} onChange={(e) => updateField('symbols', e.target.value)} /></div>
        </div>
      )}
    />
  </div>
);

export default Religions;
