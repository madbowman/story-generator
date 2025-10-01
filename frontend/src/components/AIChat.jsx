/**
 * AI Chat Component
 * Collaborative chat interface with AI for world building and story development
 */
import { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';

export default function AIChat({ context = null, onResponse = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [temperature, setTemperature] = useState(0.8);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Build messages array for AI
      const chatMessages = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Add context as system message if provided
      const systemPrompt = context 
        ? `You are a collaborative story development AI assistant. Here's the current context:\n\n${JSON.stringify(context, null, 2)}\n\nHelp the user develop their story world and episodes. Be creative, ask clarifying questions, and maintain consistency with established elements.`
        : 'You are a collaborative story development AI assistant. Help the user develop their story world and episodes.';

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
        
        if (onResponse) {
          onResponse(result.response);
        }
      } else {
        const errorMessage = {
          role: 'system',
          content: `Error: ${result.error}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
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

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>AI Collaboration</h3>
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
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Start a conversation with the AI</p>
            <p style={styles.emptyHint}>
              Ask about world building, character development, plot ideas, or anything else!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message key={idx} message={msg} />
          ))
        )}
        
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
        
        <div ref={messagesEndRef} />
      </div>

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
          placeholder="Type your message... (Shift+Enter for new line)"
          style={styles.input}
          rows={3}
          disabled={isGenerating}
        />
        <button 
          type="submit" 
          style={styles.sendButton}
          disabled={!input.trim() || isGenerating}
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
    marginBottom: '8px',
  },
  emptyHint: {
    fontSize: '13px',
    textAlign: 'center',
    maxWidth: '400px',
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
    backgroundColor: '#ef4444',
    color: '#fff',
    alignSelf: 'center',
    fontSize: '13px',
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
  dots: {
    display: 'flex',
    gap: '4px',
    color: '#3b82f6',
  },
  generatingText: {
    color: '#aaa',
    fontSize: '13px',
  },
  inputForm: {
    padding: '16px',
    borderTop: '1px solid #444',
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
};