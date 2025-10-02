import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';

const ProjectSelector = () => {
  const { currentProject, loadProject } = useProject();
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New project form
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    genre: 'General'
  });

  const genres = [
    'General',
    'Science Fiction',
    'Fantasy',
    'Horror',
    'Mystery',
    'Thriller',
    'Historical',
    'Romance',
    'Adventure',
    'Drama'
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/projects').then(res => res.data);
      setProjects(data.projects || []);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!newProject.title.trim()) {
      alert('Project title is required');
      return;
    }

    try {
      const result = await api.post('/projects', newProject).then(res => res.data);
      
      if (result.success) {
        await loadProjects();
        
        // Load the newly created project
        if (result.project_id) {
          await loadProject(result.project_id);
        }
        
        setShowCreateModal(false);
        setNewProject({ title: '', description: '', genre: 'General' });
      } else {
        alert(result.error || 'Failed to create project');
      }
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleSelectProject = async (project) => {
    await loadProject(project.id);
    setShowDropdown(false);
  };

  const handleDeleteProject = async (projectId, projectTitle, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Delete "${projectTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      
      // Note: currentProject is a string (project ID), not an object
      if (currentProject === projectId) {
        // Project was deleted, will show welcome screen
      }
      
      await loadProjects();
    } catch (err) {
      alert('Error deleting project: ' + err.message);
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.selector} onClick={() => setShowDropdown(!showDropdown)}>
          <div style={styles.selectorContent}>
            {loading ? (
              <span style={styles.placeholderText}>Loading...</span>
            ) : currentProject ? (
              <div style={styles.currentProject}>
                <span style={styles.currentProjectTitle}>
                  {projects.find(p => p.id === currentProject)?.title || 'Unknown Project'}
                </span>
                {projects.find(p => p.id === currentProject)?.genre && (
                  <span style={styles.currentProjectGenre}>
                    {projects.find(p => p.id === currentProject)?.genre}
                  </span>
                )}
              </div>
            ) : (
              <span style={styles.placeholderText}>
                {projects.length === 0 ? 'No projects yet' : 'Select a project'}
              </span>
            )}
          </div>
          <span style={styles.arrow}>▼</span>
        </div>

        <button 
          style={styles.createButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowCreateModal(true);
          }}
          title="Create new project"
        >
          + New
        </button>

        {showDropdown && (
          <>
            <div style={styles.backdrop} onClick={() => setShowDropdown(false)} />
            <div style={styles.dropdown}>
              {projects.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No projects yet</p>
                  <p style={styles.emptySubtext}>Click "+ New" to create your first project</p>
                </div>
              ) : (
                projects.map(project => (
                  <div
                    key={project.id}
                    style={{
                      ...styles.dropdownItem,
                      ...(currentProject === project.id ? styles.dropdownItemActive : {})
                    }}
                    onClick={() => handleSelectProject(project)}
                  >
                    <div style={styles.dropdownItemContent}>
                      <div style={styles.dropdownItemTitle}>{project.title}</div>
                      {project.genre && (
                        <div style={styles.dropdownItemGenre}>{project.genre}</div>
                      )}
                      {project.description && (
                        <div style={styles.dropdownItemDesc}>{project.description}</div>
                      )}
                    </div>
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => handleDeleteProject(project.id, project.title, e)}
                      title="Delete project"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Project</h2>
              <button 
                style={styles.modalClose}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Title *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter project title"
                  required
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Genre</label>
                <select
                  style={styles.select}
                  value={newProject.genre}
                  onChange={(e) => setNewProject({...newProject, genre: e.target.value})}
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Brief description of your story (optional)"
                  rows="3"
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={styles.buttonPrimary}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    minWidth: '300px',
  },
  selector: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: '#1e1e1e',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '42px',
  },
  selectorContent: {
    flex: 1,
    overflow: 'hidden',
  },
  currentProject: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  currentProjectTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
  currentProjectGenre: {
    padding: '2px 8px',
    background: '#3b82f6',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  placeholderText: {
    color: '#888',
    fontSize: '14px',
  },
  arrow: {
    color: '#888',
    fontSize: '10px',
    marginLeft: '8px',
  },
  createButton: {
    padding: '10px 16px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '8px',
    background: '#1e1e1e',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: '14px',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    color: '#666',
    fontSize: '12px',
    margin: 0,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid #2a2a2a',
  },
  dropdownItemActive: {
    background: '#2a2a2a',
  },
  dropdownItemContent: {
    flex: 1,
    overflow: 'hidden',
  },
  dropdownItemTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  dropdownItemGenre: {
    color: '#3b82f6',
    fontSize: '12px',
    marginBottom: '4px',
  },
  dropdownItemDesc: {
    color: '#888',
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  deleteButton: {
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1e1e1e',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid #3a3a3a',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #3a3a3a',
  },
  modalTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  form: {
    padding: '24px',
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
    background: '#0a0a0a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    background: '#0a0a0a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#0a0a0a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #3a3a3a',
  },
  buttonSecondary: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#ccc',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    padding: '10px 20px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default ProjectSelector;