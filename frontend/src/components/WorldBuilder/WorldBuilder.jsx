import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import api from '../../services/api';
import ListDetail from './ListDetail';
import WorldOverview from './WorldOverview';
import Locations from './Locations';
import Characters from './Characters';
import NPCs from './NPCs';
import Factions from './Factions';
import Religions from './Religions';
import Glossary from './Glossary';
import Content from './Content';
import styles from './styles';

const WorldBuilder = ({ activeSection: propActiveSection, setActiveSection: propSetActiveSection }) => {
  const { currentProject } = useProject();
  const [internalSection, setInternalSection] = useState('world_overview');
  const activeSection = propActiveSection || internalSection;
  const setActiveSection = propSetActiveSection || setInternalSection;
  const [worldData, setWorldData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

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
    setSaveMessage('');
    setSaveError('');
    try {
      await api.put(`/projects/${currentProject}/world/${activeSection}`, worldData);
      setSaveMessage('Saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveError('Failed to save: ' + (error.message || 'unknown error'));
      setTimeout(() => setSaveError(''), 5000);
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
          {saveMessage && <span style={styles.saveMessage}>{saveMessage}</span>}
          {saveError && <span style={styles.saveError}>{saveError}</span>}
        </div>
      </div>
    </div>
  );
};

export default WorldBuilder;