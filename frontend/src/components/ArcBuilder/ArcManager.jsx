import { useState, useEffect } from 'react';

export default function ArcManager({ projectId }) {
  const [arcs, setArcs] = useState([]);
  const [selectedArc, setSelectedArc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadArcs();
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 Story Arcs</h2>
      
      <div style={styles.layout}>
        {/* Arc List */}
        <div style={styles.list}>
          {arcs.map((arc) => (
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
                Episodes {arc.episodes.start}-{arc.episodes.end}
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
                <h2>{selectedArc.title}</h2>
                <div style={styles.detailMeta}>
                  <span>Season {selectedArc.season}, Arc {selectedArc.arcNumber}</span>
                  <span>Episodes {selectedArc.episodes.start}-{selectedArc.episodes.end}</span>
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
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
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
};