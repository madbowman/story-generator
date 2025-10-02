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

// Small reusable List/Detail wrapper used by the different sections
const ListDetail = (props) => {
  const {
    items = [],
    itemLabel = (it, i) => `Item ${i + 1}`,
    onAdd = () => {},
    onRemove = () => {},
    onUpdate = () => {},
    renderItemEditor = () => null,
    addLabel = '+ Add',
    emptyMessage = 'No items yet.',
    // when true: clicking an item hides the list and shows the detail full-width
    detailOnlyOnSelect = false,
    // when true: the View button will open the detail full-width (Back returns to list)
    enableDetailView = true,
    // optional title for the list pane
    title = '',
  } = props;

  const [selected, setSelected] = React.useState(items && items.length ? 0 : -1);
  const [viewMode, setViewMode] = React.useState(detailOnlyOnSelect ? 'list' : 'split');

  React.useEffect(() => {
    // If items change (add/remove), ensure selected index stays valid
    if (!items || items.length === 0) {
      setSelected(-1);
    } else if (selected === -1 && items.length > 0) {
      setSelected(0);
    } else if (selected >= items.length) {
      setSelected(items.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleAdd = () => {
    onAdd();
    // select last after a short delay (the parent will add synchronously in this app)
    setTimeout(() => {
      const newIndex = (items || []).length;
      setSelected(newIndex);
      if (detailOnlyOnSelect) setViewMode('detail');
    }, 50);
  };

  const handleRemove = (index) => {
    onRemove(index);
    // adjust selection
    if (selected === index) {
      setSelected(-1);
      if (detailOnlyOnSelect) setViewMode('list');
    } else if (selected > index) setSelected(selected - 1);
  };

  return (
    <div style={styles.listDetail}>
      {viewMode !== 'detail' && (
        <div style={styles.listPane}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{title}</h2>
            <button style={styles.addButton} onClick={handleAdd}>{addLabel}</button>
          </div>

          {(!items || items.length === 0) ? (
            <div style={styles.emptyState}><p>{emptyMessage}</p></div>
          ) : (
            <div style={styles.itemList}>
              {items.map((it, idx) => (
                <div key={it.id || idx} style={{...styles.listItem, ...(selected === idx ? styles.listItemActive : {})}}>
                  <div style={styles.listItemMain} onClick={() => { setSelected(idx); /* only enter detail mode on click if detailOnlyOnSelect */ if (detailOnlyOnSelect) setViewMode('detail'); }}>
                    <div style={styles.listItemTitle}>{itemLabel(it, idx)}</div>
                    <div style={styles.listItemSubtitle}>{(it.type || it.role || it.description || '').slice(0, 60)}</div>
                  </div>
                  <div style={styles.listItemActions}>
                    <button style={styles.smallButton} onClick={() => { setSelected(idx); if (detailOnlyOnSelect || enableDetailView) setViewMode('detail'); }}>View</button>
                    <button style={styles.removeButton} onClick={() => handleRemove(idx)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

  <div style={viewMode === 'detail' && (detailOnlyOnSelect || enableDetailView) ? styles.detailFullPane : styles.detailPane}>
        {selected === -1 ? (
          <div style={styles.emptyState}><p>Select an item to view or edit.</p></div>
        ) : (
          <div>
            {(detailOnlyOnSelect || enableDetailView) && viewMode === 'detail' && (
              <div style={{ marginBottom: '12px' }}>
                <button style={styles.backButton} onClick={() => { setViewMode('list'); setSelected(-1); }}>← Back</button>
              </div>
            )}
            {renderItemEditor(items[selected], selected, (field, value) => onUpdate(selected, field, value))}
          </div>
        )}
      </div>
    </div>
  );
};

// Locations Component (list/detail)
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

const Characters = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.characters || []}
      itemLabel={(it, i) => it.name || `Character ${i + 1}`}
      onAdd={() => addItem('characters')}
      onRemove={(index) => removeItem('characters', index)}
      onUpdate={(index, field, value) => updateItem('characters', index, field, value)}
      addLabel={'+ Add Character'}
      emptyMessage={'No characters yet. Click "+ Add Character" to create one.'}
      renderItemEditor={(char, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{char.name || `Character ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={char.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Role</label><input style={styles.input} value={char.role || ''} onChange={(e) => updateField('role', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={char.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="2" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Personality</label><textarea style={styles.textarea} value={char.personality || ''} onChange={(e) => updateField('personality', e.target.value)} rows="2" /></div>
          <div style={styles.formGroup}><label style={styles.label}>Backstory</label><textarea style={styles.textarea} value={char.backstory || ''} onChange={(e) => updateField('backstory', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

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

// Factions, Religions, Glossary, Content components (simplified versions)
const Factions = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.factions || []}
      itemLabel={(it, i) => it.name || `Faction ${i + 1}`}
      onAdd={() => addItem('factions')}
      onRemove={(index) => removeItem('factions', index)}
      onUpdate={(index, field, value) => updateItem('factions', index, field, value)}
      addLabel={'+ Add Faction'}
      emptyMessage={'No factions yet.'}
      renderItemEditor={(faction, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{faction.name || `Faction ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={faction.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={faction.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

const Religions = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.religions || []}
      itemLabel={(it, i) => it.name || `Religion ${i + 1}`}
      onAdd={() => addItem('religions')}
      onRemove={(index) => removeItem('religions', index)}
      onUpdate={(index, field, value) => updateItem('religions', index, field, value)}
      addLabel={'+ Add Religion'}
      emptyMessage={'No religions yet.'}
      renderItemEditor={(religion, index, updateField) => (
        <div style={styles.card}>
          <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{religion.name || `Religion ${index + 1}`}</h3></div>
          <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={religion.name || ''} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea style={styles.textarea} value={religion.description || ''} onChange={(e) => updateField('description', e.target.value)} rows="3" /></div>
        </div>
      )}
    />
  </div>
);

const Glossary = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.terms || []}
      itemLabel={(it, i) => it.name || `Term ${i + 1}`}
      onAdd={() => addItem('terms')}
      onRemove={(index) => removeItem('terms', index)}
      onUpdate={(index, field, value) => updateItem('terms', index, field, value)}
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

const Content = ({ data, addItem, updateItem, removeItem }) => (
  <div style={styles.form}>
    <ListDetail
      items={data.items || []}
      itemLabel={(it, i) => it.name || `Item ${i + 1}`}
      onAdd={() => addItem('items')}
      onRemove={(index) => removeItem('items', index)}
      onUpdate={(index, field, value) => updateItem('items', index, field, value)}
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
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listDetail: {
    display: 'flex',
    gap: '20px',
    alignItems: 'stretch',
  },
  listPane: {
    width: '320px',
    minWidth: '260px',
    maxHeight: '70vh',
    overflow: 'auto',
  },
  detailPane: {
    flex: 1,
    minWidth: '320px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '6px',
    background: '#111',
    border: '1px solid #2a2a2a',
    cursor: 'pointer',
  },
  listItemActive: {
    background: '#172554',
    borderColor: '#3b82f6',
  },
  listItemMain: {
    flex: 1,
    paddingRight: '8px',
  },
  listItemTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  listItemSubtitle: {
    color: '#9ca3af',
    fontSize: '12px',
    marginTop: '4px',
  },
  listItemActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  smallButton: {
    padding: '6px 10px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  detailFullPane: {
    flex: 1,
    minWidth: '320px',
    maxWidth: '100%'
  },
  backButton: {
    padding: '8px 12px',
    background: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    borderRadius: '6px',
    cursor: 'pointer',
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