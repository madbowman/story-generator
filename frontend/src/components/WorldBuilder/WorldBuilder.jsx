/**
 * World Builder Component
 * Main interface for collaborative world building
 */
import { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

export default function WorldBuilder() {
  const { projectData, saveFile } = useProject();
  const [activeSection, setActiveSection] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);

  if (!projectData) {
    return <div style={styles.empty}>No project loaded</div>;
  }

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'locations', label: 'Locations' },
    { id: 'factions', label: 'Factions' },
    { id: 'religions', label: 'Religions' },
    { id: 'characters', label: 'Characters' },
    { id: 'npcs', label: 'NPCs' },
    { id: 'glossary', label: 'Glossary' },
    { id: 'content', label: 'Content' },
  ];

  const handleSave = async (data) => {
    setIsSaving(true);
    await saveFile(`world/${activeSection}.json`, data);
    setIsSaving(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>World Building</h3>
        {sections.map(section => (
          <button
            key={section.id}
            style={{
              ...styles.sectionButton,
              ...(activeSection === section.id ? styles.sectionButtonActive : {})
            }}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeSection === 'overview' && (
          <WorldOverview 
            data={projectData.world.overview} 
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeSection === 'locations' && (
          <LocationsEditor
            data={projectData.world.locations}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeSection === 'characters' && (
          <CharactersEditor
            data={projectData.world.characters}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {/* Other sections will be similar */}
        {!['overview', 'locations', 'characters'].includes(activeSection) && (
          <div style={styles.placeholder}>
            {activeSection} editor - Coming soon
          </div>
        )}
      </div>
    </div>
  );
}

function WorldOverview({ data, onSave, isSaving }) {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>World Overview</h2>

      <div style={styles.formGroup}>
        <label style={styles.label}>World Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          style={styles.input}
          placeholder="The name of your world"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          style={styles.textarea}
          placeholder="General description of your world"
          rows={4}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Time Period</label>
        <input
          type="text"
          value={formData.timePeriod || ''}
          onChange={(e) => handleChange('timePeriod', e.target.value)}
          style={styles.input}
          placeholder="e.g., Medieval, Future, Modern, etc."
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Technology Level</label>
        <input
          type="text"
          value={formData.technologyLevel || ''}
          onChange={(e) => handleChange('technologyLevel', e.target.value)}
          style={styles.input}
          placeholder="e.g., Stone Age, Industrial, Space-faring, etc."
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>History</label>
        <textarea
          value={formData.history || ''}
          onChange={(e) => handleChange('history', e.target.value)}
          style={styles.textarea}
          placeholder="Key historical events that shaped this world"
          rows={6}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Rules & Physics</label>
        <textarea
          value={formData.rulesPhysics || ''}
          onChange={(e) => handleChange('rulesPhysics', e.target.value)}
          style={styles.textarea}
          placeholder="How does this world work? Any special rules or physics?"
          rows={6}
        />
      </div>

      <button 
        type="submit" 
        style={styles.saveButton}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Overview'}
      </button>
    </form>
  );
}

function LocationsEditor({ data, onSave, isSaving }) {
  const [locations, setLocations] = useState(data.places || []);
  const [routes, setRoutes] = useState(data.routes || []);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const handleSave = () => {
    onSave({ places: locations, routes: routes });
  };

  const addLocation = (newLocation) => {
    setLocations(prev => [...prev, { ...newLocation, id: Date.now().toString() }]);
    setShowAddLocation(false);
  };

  const removeLocation = (id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  return (
    <div style={styles.editorContainer}>
      <div style={styles.header}>
        <h2 style={styles.title}>Locations</h2>
        <button 
          style={styles.addButton}
          onClick={() => setShowAddLocation(true)}
        >
          + Add Location
        </button>
      </div>

      <div style={styles.itemsList}>
        {locations.length === 0 ? (
          <div style={styles.emptyState}>
            No locations yet. Click "Add Location" to create one.
          </div>
        ) : (
          locations.map(location => (
            <div key={location.id} style={styles.itemCard}>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{location.name}</h4>
                <button
                  style={styles.removeButton}
                  onClick={() => removeLocation(location.id)}
                >
                  ×
                </button>
              </div>
              <p style={styles.itemType}>{location.type}</p>
              <p style={styles.itemDescription}>{location.description}</p>
            </div>
          ))
        )}
      </div>

      <button 
        style={styles.saveButton}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Locations'}
      </button>

      {showAddLocation && (
        <AddLocationDialog
          onAdd={addLocation}
          onClose={() => setShowAddLocation(false)}
        />
      )}
    </div>
  );
}

function AddLocationDialog({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd(formData);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.dialogTitle}>Add Location</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              autoFocus
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={styles.input}
              placeholder="e.g., City, Forest, Mountain"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={styles.textarea}
              rows={3}
            />
          </div>
          <div style={styles.buttonRow}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.createButton}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CharactersEditor({ data, onSave, isSaving }) {
  const [characters, setCharacters] = useState(data.characters || []);

  return (
    <div style={styles.editorContainer}>
      <h2 style={styles.title}>Characters</h2>
      <div style={styles.placeholder}>
        Character editor - Full implementation coming next
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  sidebar: {
    width: '200px',
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRight: '1px solid #444',
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: '16px',
    marginBottom: '16px',
  },
  sectionButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: 'none',
    borderRadius: '4px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '4px',
    fontSize: '14px',
  },
  sectionButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: '30px',
    overflow: 'auto',
  },
  form: {
    maxWidth: '800px',
  },
  editorContainer: {
    maxWidth: '900px',
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    color: '#aaa',
    fontSize: '13px',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  saveButton: {
    padding: '10px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  itemsList: {
    marginBottom: '20px',
  },
  itemCard: {
    backgroundColor: '#2a2a2a',
    padding: '16px',
    borderRadius: '6px',
    marginBottom: '12px',
    border: '1px solid #444',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  itemTitle: {
    color: '#fff',
    fontSize: '16px',
    margin: 0,
  },
  itemType: {
    color: '#10b981',
    fontSize: '13px',
    margin: '4px 0',
  },
  itemDescription: {
    color: '#ccc',
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    width: '28px',
    height: '28px',
    fontSize: '20px',
    cursor: 'pointer',
    lineHeight: '1',
  },
  emptyState: {
    color: '#666',
    padding: '40px',
    textAlign: 'center',
    fontSize: '14px',
  },
  empty: {
    color: '#666',
    padding: '40px',
    textAlign: 'center',
  },
  placeholder: {
    color: '#666',
    padding: '40px',
    textAlign: 'center',
    fontSize: '14px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#1a1a1a',
    padding: '24px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
  },
  dialogTitle: {
    margin: '0 0 20px 0',
    color: '#fff',
    fontSize: '18px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  createButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};