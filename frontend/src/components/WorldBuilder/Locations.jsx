import React from 'react';
import ListDetail from './ListDetail';
import styles from './styles';

const Locations = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.places || []}
      itemLabel={(it, i) => it.name || `Location ${i + 1}`}
      onAdd={() => addItem('places')}
      onRemove={(index) => removeItem('places', index)}
      onUpdate={(index, field, value) => updateItem('places', index, field, value)}
      detailOnlyOnSelect={false}
      enableDetailView={true}
      title={'Locations'}
      addLabel={'+ Add Location'}
      emptyMessage={'No locations yet. Click "+ Add Location" to create one.'}
      renderItemEditor={(place, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>{place.name || `Location ${index + 1}`}</h3>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input style={styles.input} value={place.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="Location name" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Type</label>
            <input style={styles.input} value={place.type || ''} onChange={(e) => updateField('type', e.target.value)} placeholder="e.g., City, Forest, Mountain" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} value={place.description || ''} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe this location" rows="4" />
          </div>
        </div>
      )}
    />
  </div>
);

export default Locations;
