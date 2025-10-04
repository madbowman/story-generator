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
  const [sectionViewMode, setSectionViewMode] = useState('split');

  const sections = [
    { id: 'world_overview', label: 'World Overview', icon: '🌍' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'characters', label: 'Characters', icon: '👤' },
    { id: 'npcs', label: 'NPCs', icon: '👥' },
    { id: 'factions', label: 'Factions', icon: '⚔️' },
    { id: 'religions', label: 'Religions', icon: '✨' },
    { id: 'glossary', label: 'Glossary', icon: '📖' },
  { id: 'content', label: 'Items', icon: '🎒' },
  ];

  useEffect(() => {
    if (currentProject) {
      loadSection(activeSection);
      // reset view mode when switching sections
      setSectionViewMode('split');
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
    // Create new item based on array field type
    const newItem = arrayField === 'places' 
      ? { id: Date.now().toString(), name: '', type: '', description: '' }
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
    const orig = items[index] || {};

    // helper to set nested value by dot-path without mutating original
    const setByPath = (obj, path, val) => {
      const parts = path.split('.');
      let res = Array.isArray(obj) ? [...obj] : { ...obj };
      let cur = res;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cur[p] === undefined || cur[p] === null) cur[p] = {};
        else cur[p] = Array.isArray(cur[p]) ? [...cur[p]] : { ...cur[p] };
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = val;
      return res;
    };

    if (field && field.includes('.')) {
      items[index] = setByPath(orig, field, value);
    } else {
      items[index] = { ...orig, [field]: value };
    }

    setWorldData({ ...worldData, [arrayField]: items });
  };

  const removeItem = async (arrayField, index) => {
    const items = [...(worldData[arrayField] || [])];
    items.splice(index, 1);
    const newData = { ...worldData, [arrayField]: items };

    // optimistic update
    setWorldData(newData);

    // persist change immediately
    setSaving(true);
    setSaveError('');
    setSaveMessage('Deleting...');
    try {
      await api.put(`/projects/${currentProject}/world/${activeSection}`, newData);
      setSaveMessage('Deleted');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      // revert optimistic update
      const reverted = { ...worldData, [arrayField]: [...(worldData[arrayField] || [])] };
      setWorldData(reverted);
      setSaveError('Failed to delete: ' + (err.message || 'unknown error'));
      setTimeout(() => setSaveError(''), 5000);
    } finally {
      setSaving(false);
    }
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
              <Locations data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
            {activeSection === 'characters' && (
              <Characters data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
            {activeSection === 'npcs' && (
              <NPCs data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
            {activeSection === 'factions' && (
              <Factions data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
            {activeSection === 'religions' && (
              <Religions data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
            {activeSection === 'glossary' && (
              <Glossary data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
            {activeSection === 'content' && (
              <Content data={worldData} addItem={addItem} updateItem={updateItem} removeItem={removeItem} onViewModeChange={(m) => setSectionViewMode(m)} />
            )}
          </>
        )}

        {/* Save Button: show only on detail view or world_overview */}
        { (activeSection === 'world_overview' || sectionViewMode === 'detail') && (
          <div style={styles.saveBar}>
            <button style={styles.saveButton} onClick={saveSection} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saveMessage && <span style={styles.saveMessage}>{saveMessage}</span>}
            {saveError && <span style={styles.saveError}>{saveError}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldBuilder;