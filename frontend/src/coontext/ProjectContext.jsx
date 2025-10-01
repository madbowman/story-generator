/**
 * Project Context
 * Manages current project state across the application
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { projectService } from '../services/api';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');

  const loadProject = async (projectName) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectService.loadProject(projectName);
      
      if (result.success) {
        setCurrentProject(projectName);
        setProjectData(result.data);
        localStorage.setItem('lastProject', projectName);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (title, description, genre) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectService.createProject(title, description, genre);
      
      if (result.success) {
        const projectName = result.path.split('/').pop();
        await loadProject(projectName);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async (filePath, data) => {
    if (!currentProject) {
      setError('No project loaded');
      return { success: false, error: 'No project loaded' };
    }

    setSaveStatus('saving');
    
    try {
      const result = await projectService.saveFile(currentProject, filePath, data);
      
      if (result.success) {
        setSaveStatus('saved');
        updateLocalData(filePath, data);
        setTimeout(() => setSaveStatus('saved'), 2000);
        return { success: true };
      } else {
        setSaveStatus('error');
        return { success: false, error: result.error };
      }
    } catch (err) {
      setSaveStatus('error');
      return { success: false, error: err.message };
    }
  };

  const updateLocalData = (filePath, data) => {
    if (!projectData) return;

    const pathParts = filePath.split('/');
    
    if (pathParts[0] === 'world') {
      const worldFile = pathParts[1].replace('.json', '');
      setProjectData(prev => ({
        ...prev,
        world: {
          ...prev.world,
          [worldFile]: data
        }
      }));
    } else if (pathParts[0] === 'state') {
      const stateFile = pathParts[1].replace('.json', '');
      setProjectData(prev => ({
        ...prev,
        state: {
          ...prev.state,
          [stateFile]: data
        }
      }));
    }
  };

  const closeProject = () => {
    setCurrentProject(null);
    setProjectData(null);
    setError(null);
    localStorage.removeItem('lastProject');
  };

  useEffect(() => {
    const lastProject = localStorage.getItem('lastProject');
    if (lastProject) {
      loadProject(lastProject);
    }
  }, []);

  const value = {
    currentProject,
    projectData,
    loading,
    error,
    saveStatus,
    loadProject,
    createProject,
    saveFile,
    closeProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};