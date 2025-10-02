import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import api from '../../services/api';

const WorldBuilder = () => {
  const { currentProject } = useProject();
  const [activeSection, setActiveSection] = useState('world_overview');
  const [worldData, setWorldData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sections = [
    { id: 'world_overview', label: 'World Overview', icon: '🌍' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'characters', label: 'Characters', icon: '👤' },
    { id: 'npcs', label: 'NPCs', icon: '👥' },
    { id: 'factions', label: 'Factions', icon: '⚔️' },
    { id: 'religions', label: 'Religions', icon: '✨' },
    { id: 'glossary', label: 'Glossary', icon: '📖' },
    { id: 'content', label: 'Items & Hazards', icon: '🎒' },
  ];

  useEffect(() => {
    if (currentProject) {
      loadSection(activeSection);
    }
  }, [currentProject, activeSection]);

  const loadSection = async (section) => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${currentProject}/world/${section}`);
      if (response.data.success) {
        setWorldData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load section:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async () => {
    setSaving(true);
    try {
      await api.put(`/projects/${currentProject}/world/${activeSection}`, worldData);
      alert('Saved successfully!');
    } catch (error) {
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setWorldData({ ...worldData, [field]: value });
  };

  const addItem = (arrayField) => {
    const newItem = arrayField === 'places' 
      ? { id: Date.now().toString(), name: '', type: '', description: '' }
      : arrayField === 'routes'
      ? { from: '', to: '', mode: '', distance_km: 0, travel_time_hours: 0 }
      : arrayField === 'characters'
      ? { id: Date.now().toString(), name: '', role: '', description: '', personality: '', backstory: '', skills: [], weaknesses: [], relationships: [] }
      : { id: Date.now().toString(), name: '', description: '' };
    
    setWorldData({
      ...worldData,
      [arrayField]: [...(worldData[arrayField] || []), newItem]
    });
  };

  const updateItem = (arrayField, index, field, value) => {
    const items = [...(worldData[arrayField] || [])];
    items[index] = { ...items[index], [field]: value };
    setWorldData({ ...worldData, [arrayField]: items });
  };

  const removeItem = (arrayField, index) => {
    const items = [...(worldData[arrayField] || [])];
    items.splice(index, 1);
    setWorldData({ ...worldData, [arrayField]: items });
  };

  if (!currentProject) {
    return (
      <div style={styles.empty}>
        <p>Select or create a project to start world building</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Section Tabs */}
      <div style={styles.tabs}>
        {sections.map(section => (
          <button
            key={section.id}
            style={{
              ...styles.tab,
              ...(activeSection === section.id ? styles.tabActive : {})
            }}
            onClick={() => setActiveSection(section.id)}
          >
            <span style={styles.tabIcon}>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            {activeSection === 'world_overview' && (
              <WorldOverview data={worldData} updateField={updateField} />
            )}
            {activeSection === 'locations' && (
              <Locations data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
            {activeSection === 'characters' && (
              <Characters data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
            {activeSection === 'npcs' && (
              <NPCs data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
            {activeSection === 'factions' && (
              <Factions data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
            {activeSection === 'religions' && (
              <Religions data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
            {activeSection === 'glossary' && (
              <Glossary data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
            {activeSection === 'content' && (
              <Content data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
            )}
          </>
        )}

        {/* Save Button */}
        <div style={styles.saveBar}>
          <button style={styles.saveButton} onClick={saveSection} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// World Overview Component
const WorldOverview = ({ data, updateField }) => (
  <div style={styles.form}>
    <h2 style={styles.sectionTitle}>World Overview</h2>
    
    <div style={styles.formGroup}>
      <label style={styles.label}>World Name</label>
      <input
        style={styles.input}
        value={data.name || ''}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Enter world name"
      />
    </div>

    <div style={styles.formGroup}>
      <label style={styles.label}>Description</label>
      <textarea
        style={styles.textarea}
        value={data.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Brief description of your world"
        rows="4"
      />
    </div>

    <div style={styles.formGroup}>
      <label style={styles.label}>Time Period</label>
      <input
        style={styles.input}
        value={data.timePeriod || ''}
        onChange={(e) => updateField('timePeriod', e.target.value)}
        placeholder="e.g., Medieval, Modern, Future"
      />
    </div>

    <div style={styles.formGroup}>
      <label style={styles.label}>Technology Level</label>
      <input
        style={styles.input}
        value={data.technologyLevel || ''}
        onChange={(e) => updateField('technologyLevel', e.target.value)}
        placeholder="e.g., Stone Age, Industrial, Advanced"
      />
    </div>

    <div style={styles.formGroup}>
      <label style={styles.label}>History</label>
      <textarea
        style={styles.textarea}
        value={data.history || ''}
        onChange={(e) => updateField('history', e.target.value)}
        placeholder="Major historical events"
        rows="6"
      />
    </div>

    <div style={styles.formGroup}>
      <label style={styles.label}>Rules & Physics</label>
      <textarea
        style={styles.textarea}
        value={data.rulesPhysics || ''}
        onChange={(e) => updateField('rulesPhysics', e.target.value)}
        placeholder="How does your world work? Magic? Science? Special rules?"
        rows="6"
      />
    </div>
  </div>
);

// Locations Component
const Locations = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Locations</h2>
      <button style={styles.addButton} onClick={() => addItem('places')}>
        + Add Location
      </button>
    </div>

    {(data.places || []).map((place, index) => (
      <div key={place.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Location {index + 1}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('places', index)}>
            Remove
          </button>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            value={place.name || ''}
            onChange={(e) => updateItem('places', index, 'name', e.target.value)}
            placeholder="Location name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Type</label>
          <input
            style={styles.input}
            value={place.type || ''}
            onChange={(e) => updateItem('places', index, 'type', e.target.value)}
            placeholder="e.g., City, Forest, Mountain"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            value={place.description || ''}
            onChange={(e) => updateItem('places', index, 'description', e.target.value)}
            placeholder="Describe this location"
            rows="3"
          />
        </div>
      </div>
    ))}

    {(!data.places || data.places.length === 0) && (
      <div style={styles.emptyState}>
        <p>No locations yet. Click "+ Add Location" to create one.</p>
      </div>
    )}
  </div>
);

// Characters Component
const Characters = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Main Characters</h2>
      <button style={styles.addButton} onClick={() => addItem('characters')}>
        + Add Character
      </button>
    </div>

    {(data.characters || []).map((char, index) => (
      <div key={char.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{char.name || `Character ${index + 1}`}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('characters', index)}>
            Remove
          </button>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            value={char.name || ''}
            onChange={(e) => updateItem('characters', index, 'name', e.target.value)}
            placeholder="Character name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Role</label>
          <input
            style={styles.input}
            value={char.role || ''}
            onChange={(e) => updateItem('characters', index, 'role', e.target.value)}
            placeholder="e.g., Protagonist, Antagonist, Mentor"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            value={char.description || ''}
            onChange={(e) => updateItem('characters', index, 'description', e.target.value)}
            placeholder="Physical description"
            rows="2"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Personality</label>
          <textarea
            style={styles.textarea}
            value={char.personality || ''}
            onChange={(e) => updateItem('characters', index, 'personality', e.target.value)}
            placeholder="Personality traits"
            rows="2"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Backstory</label>
          <textarea
            style={styles.textarea}
            value={char.backstory || ''}
            onChange={(e) => updateItem('characters', index, 'backstory', e.target.value)}
            placeholder="Character's history"
            rows="3"
          />
        </div>
      </div>
    ))}

    {(!data.characters || data.characters.length === 0) && (
      <div style={styles.emptyState}>
        <p>No characters yet. Click "+ Add Character" to create one.</p>
      </div>
    )}
  </div>
);

// NPCs Component (similar to Characters)
const NPCs = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>NPCs (Supporting Characters)</h2>
      <button style={styles.addButton} onClick={() => addItem('npcs')}>
        + Add NPC
      </button>
    </div>

    {(data.npcs || []).map((npc, index) => (
      <div key={npc.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{npc.name || `NPC ${index + 1}`}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('npcs', index)}>
            Remove
          </button>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            value={npc.name || ''}
            onChange={(e) => updateItem('npcs', index, 'name', e.target.value)}
            placeholder="NPC name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            value={npc.description || ''}
            onChange={(e) => updateItem('npcs', index, 'description', e.target.value)}
            placeholder="Describe this NPC"
            rows="3"
          />
        </div>
      </div>
    ))}

    {(!data.npcs || data.npcs.length === 0) && (
      <div style={styles.emptyState}>
        <p>No NPCs yet. Click "+ Add NPC" to create one.</p>
      </div>
    )}
  </div>
);

// Factions, Religions, Glossary, Content components (simplified versions)
const Factions = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Factions</h2>
      <button style={styles.addButton} onClick={() => addItem('factions')}>
        + Add Faction
      </button>
    </div>
    {(data.factions || []).map((faction, index) => (
      <div key={faction.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{faction.name || `Faction ${index + 1}`}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('factions', index)}>Remove</button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={faction.name || ''} onChange={(e) => updateItem('factions', index, 'name', e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} value={faction.description || ''} onChange={(e) => updateItem('factions', index, 'description', e.target.value)} rows="3" />
        </div>
      </div>
    ))}
    {(!data.factions || data.factions.length === 0) && <div style={styles.emptyState}><p>No factions yet.</p></div>}
  </div>
);

const Religions = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Religions</h2>
      <button style={styles.addButton} onClick={() => addItem('religions')}>+ Add Religion</button>
    </div>
    {(data.religions || []).map((religion, index) => (
      <div key={religion.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{religion.name || `Religion ${index + 1}`}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('religions', index)}>Remove</button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={religion.name || ''} onChange={(e) => updateItem('religions', index, 'name', e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} value={religion.description || ''} onChange={(e) => updateItem('religions', index, 'description', e.target.value)} rows="3" />
        </div>
      </div>
    ))}
    {(!data.religions || data.religions.length === 0) && <div style={styles.emptyState}><p>No religions yet.</p></div>}
  </div>
);

const Glossary = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Glossary</h2>
      <button style={styles.addButton} onClick={() => addItem('terms')}>+ Add Term</button>
    </div>
    {(data.terms || []).map((term, index) => (
      <div key={term.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{term.name || `Term ${index + 1}`}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('terms', index)}>Remove</button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Term</label>
          <input style={styles.input} value={term.name || ''} onChange={(e) => updateItem('terms', index, 'name', e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Definition</label>
          <textarea style={styles.textarea} value={term.description || ''} onChange={(e) => updateItem('terms', index, 'description', e.target.value)} rows="2" />
        </div>
      </div>
    ))}
    {(!data.terms || data.terms.length === 0) && <div style={styles.emptyState}><p>No terms yet.</p></div>}
  </div>
);

const Content = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Items & Hazards</h2>
      <button style={styles.addButton} onClick={() => addItem('items')}>+ Add Item</button>
    </div>
    {(data.items || []).map((item, index) => (
      <div key={item.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{item.name || `Item ${index + 1}`}</h3>
          <button style={styles.removeButton} onClick={() => removeItem('items', index)}>Remove</button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={item.name || ''} onChange={(e) => updateItem('items', index, 'name', e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} value={item.description || ''} onChange={(e) => updateItem('items', index, 'description', e.target.value)} rows="2" />
        </div>
      </div>
    ))}
    {(!data.items || data.items.length === 0) && <div style={styles.emptyState}><p>No items yet.</p></div>}
  </div>
);

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#0a0a0a',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '16px',
    borderBottom: '1px solid #333',
    overflowX: 'auto',
    background: '#1a1a1a',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#3b82f6',
    color: '#fff',
  },
  tabIcon: {
    fontSize: '18px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  form: {
    maxWidth: '800px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
  },
  addButton: {
    padding: '10px 16px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#ccc',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#1a1a1a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#1a1a1a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #3a3a3a',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #3a3a3a',
  },
  cardTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '18px',
    fontWeight: '500',
  },
  removeButton: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    color: '#ef4444',
    fontSize: '12px',
    cursor: 'pointer',
  },
  saveBar: {
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #3a3a3a',
  },
  saveButton: {
    padding: '12px 24px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
    background: '#1a1a1a',
    border: '1px dashed #3a3a3a',
    borderRadius: '8px',
  },
};

export default WorldBuilder;