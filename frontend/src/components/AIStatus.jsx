/**
 * AI Status Component
 * Displays Ollama connection status and available models
 */
import { useState, useEffect } from 'react';
import { aiService } from '../services/api';

export default function AIStatus({ selectedModel, setSelectedModel }) {
  const [status, setStatus] = useState({ running: false, error: null });
  const [models, setModels] = useState([]);
  const [checking, setChecking] = useState(true);

  const checkAIStatus = async () => {
    setChecking(true);
    
    try {
      const statusResult = await aiService.checkStatus();
      setStatus(statusResult);

      if (statusResult.running) {
        const modelsResult = await aiService.listModels();
        if (modelsResult.success) {
          setModels(modelsResult.models);
          // If no model is selected yet, pick the first returned model
          if (!selectedModel && modelsResult.models && modelsResult.models.length > 0 && setSelectedModel) {
            setSelectedModel(modelsResult.models[0]);
          }
        }
      }
    } catch (error) {
      setStatus({ running: false, error: error.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAIStatus();
    const interval = setInterval(checkAIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.statusRow}>
        <span style={styles.label}>Ollama:</span>
        {checking ? (
          <span style={styles.checking}>Checking...</span>
        ) : (
          <>
            <span style={status.running ? styles.running : styles.offline}>
              {status.running ? '● Running' : '● Offline'}
            </span>
            {!status.running && status.error && (
              <span style={styles.error} title={status.error}>⚠</span>
            )}
          </>
        )}
      </div>
      
      {status.running && models.length > 0 && (
        <div style={styles.modelsRow}>
          <span style={styles.label}>Models:</span>
          {setSelectedModel ? (
            <select
              style={styles.modelSelect}
              value={selectedModel || ''}
              onChange={(e) => setSelectedModel(e.target.value)}
              title="AI Model"
            >
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          ) : (
            <span style={{ color: '#ccc', fontSize: '13px' }}>{selectedModel || models[0]}</span>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '8px 12px',
    backgroundColor: '#2a2a2a',
    borderRadius: '4px',
    fontSize: '13px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modelsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
  },
  label: {
    color: '#aaa',
    fontWeight: '500',
  },
  running: {
    color: '#4ade80',
    fontWeight: '500',
  },
  offline: {
    color: '#ef4444',
    fontWeight: '500',
  },
  checking: {
    color: '#fbbf24',
  },
  error: {
    color: '#ef4444',
    cursor: 'help',
  },
  modelSelect: {
    padding: '2px 6px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '3px',
    fontSize: '12px',
  },
};