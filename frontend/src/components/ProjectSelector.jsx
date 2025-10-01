import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';

const ProjectSelector = () => {
  const { currentProject, setCurrentProject } = useProject();
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      const data = await api.getProjects();
      setProjects(data.projects);
    } catch (err) {
      setError('Failed to load projects: ' + err.message);
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
      const result = await api.createProject(newProject);
      
      if (result.success) {
        // Reload projects
        await loadProjects();
        
        // Select the new project
        const createdProject = projects.find(p => p.id === result.project_id);
        if (createdProject) {
          setCurrentProject(createdProject);
        }
        
        // Close modal and reset form
        setShowCreateModal(false);
        setNewProject({ title: '', description: '', genre: 'General' });
      } else {
        alert(result.error || 'Failed to create project');
      }
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleSelectProject = (project) => {
    setCurrentProject(project);
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const result = await api.deleteProject(projectId);
      
      if (result.success) {
        // If deleted project was selected, clear selection
        if (currentProject && currentProject.id === projectId) {
          setCurrentProject(null);
        }
        
        // Reload projects
        await loadProjects();
      } else {
        alert(result.error || 'Failed to delete project');
      }
    } catch (err) {
      alert('Error deleting project: ' + err.message);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="project-selector">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="project-selector">
      <div className="project-selector-header">
        <h3>Projects</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Current Project Display */}
      {currentProject && (
        <div className="current-project">
          <div className="current-project-label">Current Project:</div>
          <div className="current-project-name">{currentProject.title}</div>
          <div className="current-project-genre">{currentProject.genre}</div>
        </div>
      )}

      {/* Projects List */}
      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects yet.</p>
            <p>Create your first project to get started!</p>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id}
              className={`project-item ${currentProject && currentProject.id === project.id ? 'active' : ''}`}
            >
              <div 
                className="project-item-content"
                onClick={() => handleSelectProject(project)}
              >
                <div className="project-item-title">{project.title}</div>
                <div className="project-item-genre">{project.genre}</div>
                {project.description && (
                  <div className="project-item-description">{project.description}</div>
                )}
                <div className="project-item-meta">
                  <span>Modified: {formatDate(project.lastModified)}</span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id, project.title);
                }}
                title="Delete project"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="title">Project Title *</label>
                <input
                  id="title"
                  type="text"
                  className="form-control"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="genre">Genre</label>
                <select
                  id="genre"
                  className="form-control"
                  value={newProject.genre}
                  onChange={(e) => setNewProject({...newProject, genre: e.target.value})}
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Brief description of your story (optional)"
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .project-selector {
          padding: 1rem;
        }

        .project-selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .project-selector-header h3 {
          margin: 0;
        }

        .current-project {
          background: #e3f2fd;
          border: 2px solid #2196f3;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .current-project-label {
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .current-project-name {
          font-weight: bold;
          font-size: 1rem;
          color: #1976d2;
        }

        .current-project-genre {
          font-size: 0.875rem;
          color: #555;
          margin-top: 0.25rem;
        }

        .projects-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .project-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .project-item:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .project-item.active {
          background: #e3f2fd;
          border-color: #2196f3;
        }

        .project-item-content {
          flex: 1;
        }

        .project-item-title {
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .project-item-genre {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .project-item-description {
          font-size: 0.875rem;
          color: #777;
          margin-bottom: 0.25rem;
        }

        .project-item-meta {
          font-size: 0.75rem;
          color: #999;
        }

        .no-projects {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .loading, .error-message {
          padding: 1rem;
          text-align: center;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #ddd;
        }

        .modal-header h2 {
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
        }

        .modal form {
          padding: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-control {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #2196f3;
        }

        textarea.form-control {
          resize: vertical;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #2196f3;
          color: white;
        }

        .btn-primary:hover {
          background: #1976d2;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-danger {
          background: #f44336;
          color: white;
        }

        .btn-danger:hover {
          background: #d32f2f;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default ProjectSelector;