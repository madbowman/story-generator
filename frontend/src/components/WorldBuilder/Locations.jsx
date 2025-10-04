import React from 'react';
import ListDetail from './ListDetail';
import styles from '../../styles/components/styles';

const Locations = ({ data, addItem, updateItem, removeItem, onViewModeChange }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.places || []}
      itemLabel={(it, i) => it.name || `Location ${i + 1}`}
      onAdd={() => addItem('places')}
      onRemove={(index) => removeItem('places', index)}
      onUpdate={(index, field, value) => updateItem('places', index, field, value)}
  previewFields={['name', 'region', 'description']}
  openDetailOnAdd={true}
  onViewModeChange={onViewModeChange}
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
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={place.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="Location name" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Type</label><input style={styles.input} value={place.type || ''} onChange={(e) => updateField('type', e.target.value)} placeholder="e.g., City, Forest, Mountain" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Region</label><input style={styles.input} value={place.region || ''} onChange={(e) => updateField('region', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Population</label><input style={styles.input} type="number" value={place.population || ''} onChange={(e) => updateField('population', Number(e.target.value) || 0)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={place.description || ''} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe this location" rows="4" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Government</label><input style={styles.input} value={place.government || ''} onChange={(e) => updateField('government', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Economy</label><input style={styles.input} value={place.economy || ''} onChange={(e) => updateField('economy', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Culture</label><input style={styles.input} value={place.culture || ''} onChange={(e) => updateField('culture', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Defenses</label><input style={styles.input} value={place.defenses || ''} onChange={(e) => updateField('defenses', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Notable Features</label><input style={styles.input} value={(place.notableFeatures || []).join(', ')} onChange={(e) => updateField('notableFeatures', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma-separated" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Coords X</label><input style={styles.input} type="number" value={(place.coords && place.coords.x) || ''} onChange={(e) => updateField('coords.x', Number(e.target.value) || 0)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Coords Y</label><input style={styles.input} type="number" value={(place.coords && place.coords.y) || ''} onChange={(e) => updateField('coords.y', Number(e.target.value) || 0)} /></div>
        </div>
      )}
    />
  </div>
);

export default Locations;
