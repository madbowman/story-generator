import { useState, useEffect } from 'react';

export default function ArcManager({ projectId }) {
  const [arcs, setArcs] = useState([]);
  const [selectedArc, setSelectedArc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [editingArc, setEditingArc] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadArcs();
      loadSeasons();
    }
  }, [projectId]);

  const loadArcs = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/arcs`);
      const data = await response.json();
      if (data.success) {
        setArcs(data.arcs || []);
      }
    } catch (error) {
      console.error('Failed to load arcs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasons = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/arcs/seasons`);
      const data = await response.json();
      if (data.success) {
        setSeasons(data.seasons || []);
        if (data.seasons.length > 0 && !selectedSeason) {
          setSelectedSeason(data.seasons[0].season);
        }
      }
    } catch (error) {
      console.error('Failed to load seasons:', error);
    }
  };

  const saveArc = async (arcData) => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/arcs/${arcData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arcData)
      });

      const result = await response.json();
      if (result.success) {
        // Reload arcs to reflect changes
        await loadArcs();
        await loadSeasons();
        setEditingArc(null);
        // Update selected arc if it was the one being edited
        if (selectedArc?.id === arcData.id) {
          setSelectedArc(arcData);
        }
        return true;
      } else {
        alert(`Failed to save arc: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Failed to save arc:', error);
      alert(`Failed to save arc: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteArc = async (arcId) => {
    if (!window.confirm('Are you sure you want to delete this arc? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/arcs/${arcId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        await loadArcs();
        await loadSeasons();
        if (selectedArc?.id === arcId) {
          setSelectedArc(null);
        }
      } else {
        alert(`Failed to delete arc: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete arc:', error);
      alert(`Failed to delete arc: ${error.message}`);
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading arcs...</div>;
  }

  if (!projectId) {
    return (
      <div style={styles.container}>
        <p>Please select a project first.</p>
      </div>
    );
  }

  if (arcs.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>📚 Story Arcs</h2>
        <div style={styles.empty}>
          <p>No arcs created yet.</p>
          <p>Use the Arc Builder Chat to create your first story arc!</p>
        </div>
      </div>
    );
  }

  // Filter arcs by selected season
  const filteredArcs = selectedSeason
    ? arcs.filter(arc => arc.season === selectedSeason)
    : arcs;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📚 Story Arcs</h2>

        {/* Season Filter */}
        {seasons.length > 0 && (
          <div style={styles.seasonFilter}>
            <label style={styles.filterLabel}>Season:</label>
            <select
              value={selectedSeason || ''}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              style={styles.seasonSelect}
            >
              <option value="">All Seasons</option>
              {seasons.map((season) => (
                <option key={season.season} value={season.season}>
                  Season {season.season} ({season.arcCount} arcs)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={styles.layout}>
        {/* Arc List */}
        <div style={styles.list}>
          {filteredArcs.map((arc) => (
            <div
              key={arc.id}
              style={{
                ...styles.arcCard,
                ...(selectedArc?.id === arc.id ? styles.arcCardSelected : {})
              }}
              onClick={() => setSelectedArc(arc)}
            >
              <div style={styles.arcHeader}>
                <h3 style={styles.arcTitle}>{arc.title}</h3>
                <span style={styles.arcSeason}>S{arc.season} A{arc.arcNumber}</span>
              </div>
              <p style={styles.arcEpisodes}>
                Episodes {arc.episodes?.start || 1}-{arc.episodes?.end || 1}
              </p>
              <span style={{
                ...styles.arcStatus,
                ...(arc.status === 'complete' ? styles.statusComplete :
                  arc.status === 'in_progress' ? styles.statusInProgress :
                    styles.statusPlanned)
              }}>
                {arc.status}
              </span>
            </div>
          ))}
        </div>

        {/* Arc Details */}
        <div style={styles.details}>
          {selectedArc ? (
            <>
              <div style={styles.detailHeader}>
                <div style={styles.titleRow}>
                  <h2>{selectedArc.title}</h2>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => setEditingArc({ ...selectedArc })}
                      style={styles.editButton}
                      disabled={saving}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteArc(selectedArc.id)}
                      style={styles.deleteButton}
                      disabled={saving}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <div style={styles.detailMeta}>
                  <span>Season {selectedArc.season}, Arc {selectedArc.arcNumber}</span>
                  <span>Episodes {selectedArc.episodes?.start || 1}-{selectedArc.episodes?.end || 1}</span>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Description</h3>
                <p>{selectedArc.description}</p>
              </div>

              {selectedArc.themes?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Themes</h3>
                  <div style={styles.tags}>
                    {selectedArc.themes.map((theme, idx) => (
                      <span key={idx} style={styles.tag}>{theme}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedArc.mainCharacters?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Main Characters</h3>
                  <div style={styles.tags}>
                    {selectedArc.mainCharacters.map((char, idx) => (
                      <span key={idx} style={styles.tagCharacter}>{char}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedArc.primaryLocations?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Locations</h3>
                  <div style={styles.tags}>
                    {selectedArc.primaryLocations.map((loc, idx) => (
                      <span key={idx} style={styles.tagLocation}>{loc}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedArc.plotBeats?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Plot Beats</h3>
                  {selectedArc.plotBeats.map((beat, idx) => (
                    <div key={idx} style={styles.plotBeat}>
                      <div style={styles.beatHeader}>
                        <span style={styles.beatEpisode}>Episode {beat.episode}</span>
                        <h4 style={styles.beatTitle}>{beat.title}</h4>
                      </div>
                      <p style={styles.beatDescription}>{beat.description}</p>
                      <div style={styles.beatMeta}>
                        <span>📍 {beat.location}</span>
                        <span>👥 {beat.characters?.join(', ')}</span>
                      </div>
                      <p style={styles.beatOutcome}>
                        <strong>Outcome:</strong> {beat.outcome}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedArc.resolution && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Resolution</h3>
                  <p>{selectedArc.resolution}</p>
                </div>
              )}

              {selectedArc.cliffhanger && selectedArc.cliffhanger !== 'none' && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Cliffhanger</h3>
                  <p style={styles.cliffhanger}>{selectedArc.cliffhanger}</p>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyDetails}>
              <p>Select an arc to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingArc && (
        <ArcEditModal
          arc={editingArc}
          onSave={saveArc}
          onCancel={() => setEditingArc(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

// Arc Edit Modal Component
function ArcEditModal({ arc, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({ ...arc });

  const handleSave = async () => {
    const success = await onSave(formData);
    if (success) {
      // Modal will close automatically when onSave succeeds
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateArrayField = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Edit Arc: {arc.title}</h3>
          <button onClick={onCancel} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.modalContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title:</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Season:</label>
              <input
                type="number"
                value={formData.season || 1}
                onChange={(e) => updateField('season', Number(e.target.value))}
                style={styles.input}
                min="1"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Arc Number:</label>
              <input
                type="number"
                value={formData.arcNumber || 1}
                onChange={(e) => updateField('arcNumber', Number(e.target.value))}
                style={styles.input}
                min="1"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Episode Start:</label>
              <input
                type="number"
                value={formData.episodes?.start || 1}
                onChange={(e) => updateField('episodes', { ...formData.episodes, start: Number(e.target.value) })}
                style={styles.input}
                min="1"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Episode End:</label>
              <input
                type="number"
                value={formData.episodes?.end || 1}
                onChange={(e) => updateField('episodes', { ...formData.episodes, end: Number(e.target.value) })}
                style={styles.input}
                min="1"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description:</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              style={styles.textarea}
              rows="4"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Themes (comma separated):</label>
            <input
              type="text"
              value={formData.themes?.join(', ') || ''}
              onChange={(e) => updateArrayField('themes', e.target.value)}
              style={styles.input}
              placeholder="adventure, mystery, friendship"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Main Characters (comma separated IDs):</label>
            <input
              type="text"
              value={formData.mainCharacters?.join(', ') || ''}
              onChange={(e) => updateArrayField('mainCharacters', e.target.value)}
              style={styles.input}
              placeholder="char_hero, char_mentor"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Primary Locations (comma separated IDs):</label>
            <input
              type="text"
              value={formData.primaryLocations?.join(', ') || ''}
              onChange={(e) => updateArrayField('primaryLocations', e.target.value)}
              style={styles.input}
              placeholder="loc_castle, loc_forest"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Resolution:</label>
            <textarea
              value={formData.resolution || ''}
              onChange={(e) => updateField('resolution', e.target.value)}
              style={styles.textarea}
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cliffhanger:</label>
            <textarea
              value={formData.cliffhanger || ''}
              onChange={(e) => updateField('cliffhanger', e.target.value)}
              style={styles.textarea}
              rows="2"
              placeholder="none (if no cliffhanger)"
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onCancel} style={styles.cancelButton} disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSave} style={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  seasonFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  seasonSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    margin: 0,
    color: '#333',
  },
  seasonFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  seasonSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '20px',
    minHeight: '600px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    maxHeight: '80vh',
  },
  arcCard: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#fff',
  },
  arcCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9ff',
  },
  arcHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  arcTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  arcSeason: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#eee',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  arcEpisodes: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0',
  },
  arcStatus: {
    display: 'inline-block',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '12px',
    marginTop: '8px',
  },
  statusPlanned: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  statusInProgress: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  },
  statusComplete: {
    backgroundColor: '#e8f5e9',
    color: '#388e3c',
  },
  details: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    overflowY: 'auto',
    maxHeight: '80vh',
    backgroundColor: '#fff',
  },
  emptyDetails: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  detailHeader: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #eee',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  detailMeta: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
    fontSize: '14px',
    color: '#666',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    color: '#555',
  },
  tagCharacter: {
    backgroundColor: '#e3f2fd',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    color: '#1976d2',
  },
  tagLocation: {
    backgroundColor: '#f3e5f5',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    color: '#7b1fa2',
  },
  plotBeat: {
    backgroundColor: '#fafafa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #eee',
  },
  beatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  beatEpisode: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  beatTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#333',
  },
  beatDescription: {
    margin: '8px 0',
    color: '#555',
    fontSize: '14px',
  },
  beatMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
  },
  beatOutcome: {
    fontSize: '14px',
    color: '#555',
    fontStyle: 'italic',
    margin: '8px 0 0 0',
  },
  cliffhanger: {
    backgroundColor: '#fff3e0',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid #ff9800',
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#999',
  },
  modalContent: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #eee',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};