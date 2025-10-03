import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const NPCs = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.npcs || []}
      itemLabel={(it, i) => it.name || `NPC ${i + 1}`}
      onAdd={() => addItem('npcs')}
      onRemove={(index) => removeItem('npcs', index)}
      onUpdate={(index, field, value) => updateItem('npcs', index, field, value)}
      detailOnlyOnSelect={false}
      enableDetailView={true}
      title={'NPCs'}
      addLabel={'+ Add NPC'}
      emptyMessage={'No NPCs yet. Click "+ Add NPC" to create one.'}
      renderItemEditor={(npc, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{npc.name || `NPC ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={npc.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={npc.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

export default NPCs;
