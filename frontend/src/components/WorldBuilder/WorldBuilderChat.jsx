/**
 * World Builder Chat Component
 * Specialized chat interface for world building and building world files
 * Includes "Build World" button that extracts conversation data
 */
import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { aiService } from '../../services/api';

export default function WorldBuilderChat() {
  const { currentProject, reloadProject } = useProject();
  const [messages, setMessages] = useState(() => {
    // Load saved conversation for this project from localStorage
    if (currentProject) {
      try {
        const saved = localStorage.getItem(`worldchat_${currentProject}`);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load saved conversation:', e);
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [schemas, setSchemas] = useState(null);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [temperature, setTemperature] = useState(0.8);
  const messagesEndRef = useRef(null);

  // Load world schemas on mount
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        console.log('Loading schemas from: http://localhost:5000/api/world/schemas');
        const response = await fetch('http://localhost:5000/api/world/schemas');
        console.log('Schema response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Schemas loaded successfully:', data);
          setSchemas(data);
        } else {
          console.error('Failed to load schemas - HTTP', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Failed to load schemas:', error);
      }
    };
    loadSchemas();
  }, []);

  // Initial AI greeting
  useEffect(() => {
    if (messages.length === 0 && currentProject) {
      const greeting = {
        role: 'assistant',
        content: `Welcome! I'm ready to help you build the world for "${currentProject.title}".\n\nLet's discuss your world together. Tell me about:\n\n• The setting (time period, location, type of world)\n• Key locations and how they're connected\n• Important characters and their roles\n• Factions, religions, or political systems\n• Any unique rules, magic systems, or technology\n\nWe can talk freely about your ideas. When you're happy with everything we've discussed, click the "🌍 Build World from Conversation" button at the bottom and I'll create all the structured world files for you!`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, [currentProject, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Save conversation to localStorage whenever messages change
    if (currentProject && messages.length > 0) {
      try {
        localStorage.setItem(`worldchat_${currentProject}`, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save conversation:', e);
      }
    }
  }, [messages, currentProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isGenerating) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Build messages array with world-building system prompt
      const chatMessages = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const result = await aiService.chat(chatMessages, {
        model: selectedModel,
        temperature: temperature,
      });

      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildWorldFromConversation = async () => {
    if (!currentProject || messages.length < 2) {
      alert('Please have a conversation about your world first (at least 2 messages).');
      return;
    }

    if (!schemas) {
      alert('Schemas not loaded yet. Please wait a moment and try again.');
      return;
    }

    // currentProject is the project ID string itself
    const projectId = currentProject;
    
    console.log('Project ID:', projectId);

    const confirmed = window.confirm(
      'This will analyze our conversation and create all world JSON files.\n\n' +
      'This may take 30-60 seconds depending on the conversation length.\n\n' +
      'Are you ready to build the world?'
    );

    if (!confirmed) return;

    setIsBuilding(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/world/build`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation: messages,
            schemas: schemas
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        // Add success message to chat
        const successMessage = {
          role: 'system',
          content: `✅ **World Built Successfully!**\n\nI've created these world files:\n\n${result.files_created.map(f => `• ${f}`).join('\n')}\n\nYou can now review and edit each section in the World Builder. If you want to make changes, you can either:\n1. Continue our conversation and rebuild\n2. Manually edit the JSON files in the World Builder tabs`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, successMessage]);

        // Reload project data
        if (reloadProject) {
          await reloadProject();
        }

        alert(
          `World built successfully!\n\n` +
          `Created ${result.files_created.length} files:\n${result.files_created.join(', ')}\n\n` +
          `Switch to the World Builder sections to review and edit.`
        );
      } else {
        throw new Error(result.error || 'Failed to build world');
      }
    } catch (error) {
      console.error('Build error:', error);
      alert(`Failed to build world: ${error.message}`);
      
      const errorMessage = {
        role: 'system',
        content: `❌ **Build Failed**\n\nError: ${error.message}\n\nPlease try again or check the console for details.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBuilding(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      // Also clear from localStorage
      if (currentProject) {
        try {
          localStorage.removeItem(`worldchat_${currentProject}`);
        } catch (e) {
          console.error('Failed to clear saved conversation:', e);
        }
      }
    }
  };

  if (!currentProject) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Please create or select a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🌍 World Building Chat</h3>
        <div style={styles.controls}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={styles.modelSelect}
            title="AI Model"
          >
            <option value="llama3.2">llama3.2</option>
            <option value="llama3.1">llama3.1</option>
            <option value="mistral">mistral</option>
          </select>
          
          <div style={styles.tempControl}>
            <label style={styles.tempLabel} title="Creativity Level">
              🌡️ {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={styles.tempSlider}
            />
          </div>

          <button 
            onClick={clearChat}
            style={styles.clearButton}
            title="Clear Chat"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}
        
        {isGenerating && (
          <div style={styles.generatingIndicator}>
            <div style={styles.dots}>
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
            <span style={styles.generatingText}>AI is thinking...</span>
          </div>
        )}
        
        {isBuilding && (
          <div style={styles.buildingIndicator}>
            <div style={styles.spinner}>⏳</div>
            <span style={styles.buildingText}>Building world files... This may take 30-60 seconds...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Build World Button */}
      <div style={styles.buildButtonContainer}>
        <button
          onClick={buildWorldFromConversation}
          disabled={isBuilding || isGenerating || messages.length < 2}
          style={{
            ...styles.buildButton,
            ...(isBuilding || isGenerating || messages.length < 2 ? styles.buildButtonDisabled : {})
          }}
        >
          {isBuilding ? '⏳ Building World...' : '🌍 Build World from Conversation'}
        </button>
        {messages.length < 2 && (
          <p style={styles.buildHint}>
            Have a conversation with the AI first, then build your world
          </p>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Describe your world, characters, locations... (Shift+Enter for new line)"
          style={styles.input}
          rows={3}
          disabled={isGenerating || isBuilding}
        />
        <button 
          type="submit" 
          style={{
            ...styles.sendButton,
            ...((!input.trim() || isGenerating || isBuilding) ? styles.sendButtonDisabled : {})
          }}
          disabled={!input.trim() || isGenerating || isBuilding}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div style={{
      ...styles.message,
      ...(isUser ? styles.userMessage : isSystem ? styles.systemMessage : styles.aiMessage)
    }}>
      <div style={styles.messageHeader}>
        <span style={styles.messageRole}>
          {isUser ? '👤 You' : isSystem ? '⚠️ System' : '🤖 AI'}
        </span>
        <span style={styles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div style={styles.messageContent}>
        {message.content}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #444',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    margin: 0,
    fontWeight: '600',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modelSelect: {
    padding: '6px 10px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  tempControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tempLabel: {
    color: '#aaa',
    fontSize: '12px',
    cursor: 'help',
  },
  tempSlider: {
    width: '80px',
  },
  clearButton: {
    padding: '6px 10px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  emptyText: {
    fontSize: '16px',
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  aiMessage: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    alignSelf: 'flex-start',
    border: '1px solid #444',
  },
  systemMessage: {
    backgroundColor: '#10b981',
    color: '#fff',
    alignSelf: 'center',
    fontSize: '13px',
    maxWidth: '90%',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    fontSize: '12px',
    opacity: 0.8,
  },
  messageRole: {
    fontWeight: '600',
  },
  messageTime: {
    fontSize: '11px',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  generatingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    alignSelf: 'flex-start',
    border: '1px solid #444',
  },
  buildingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    alignSelf: 'center',
    border: '1px solid #2563eb',
  },
  dots: {
    display: 'flex',
    gap: '4px',
    color: '#3b82f6',
  },
  spinner: {
    fontSize: '20px',
  },
  generatingText: {
    color: '#aaa',
    fontSize: '13px',
  },
  buildingText: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
  },
  buildButtonContainer: {
    padding: '12px 16px',
    borderTop: '1px solid #444',
    borderBottom: '1px solid #444',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  buildButton: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buildButtonDisabled: {
    backgroundColor: '#374151',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  buildHint: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
  },
  inputForm: {
    padding: '16px',
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
  },
  sendButton: {
    padding: '10px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};