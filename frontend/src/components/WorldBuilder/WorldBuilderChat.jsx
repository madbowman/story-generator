/**
 * World Builder Chat Component - Phase 2.1
 * Two-step process: Generate Summary → Build World
 * AI creates structured summary, system extracts from it
 */
import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { aiService } from '../../services/api';

import chatStyles from '../../styles/aichat/styles';

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
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [schemas, setSchemas] = useState(null);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [temperature, setTemperature] = useState(0.8);
  const [hasSummary, setHasSummary] = useState(false);
  const messagesEndRef = useRef(null);

  // Load world schemas on mount
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/world/schemas');
        if (response.ok) {
          const data = await response.json();
          setSchemas(data);
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
        content: `Welcome! I'm ready to help you build the world for "${currentProject.title}".\n\n**Phase 2.1 Workflow:**\n\n1. **Discuss Naturally**: Tell me about your world - characters, locations, factions, religions, etc.\n2. **Generate Summary**: When ready, click "📝 Generate World Summary" and I'll create a structured summary\n3. **Build World**: Click "🌍 Build World from Summary" to extract the data into JSON files\n\n**Example Conversation:**\n"I'm creating a steampunk world with gnomes and goblins"\n"The gnomes live in Buzzlebury, an underground city"\n"King Gnomus rules the gnomes wisely"\n\nLet's start! Tell me about your world.`,
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
    
    // Save conversation to localStorage
    if (currentProject && messages.length > 0) {
      try {
        localStorage.setItem(`worldchat_${currentProject}`, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save conversation:', e);
      }
    }

    // Check if last message is a summary
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && 
        (lastMsg.content.includes('=== WORLD SUMMARY ===') || 
         lastMsg.content.includes('=== CHARACTERS ===') ||
         lastMsg.content.includes('=== LOCATIONS ==='))) {
      setHasSummary(true);
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

  const generateWorldSummary = async () => {
    if (messages.length < 2) {
      alert('Please have a conversation about your world first.');
      return;
    }

    setIsGeneratingSummary(true);

    try {
      // Create system prompt for structured summary
      const summaryPrompt = `Based on our conversation, please generate a complete structured world summary. Use this EXACT format with key-value pairs:

=== WORLD SUMMARY ===

=== WORLD INFO ===
name: [world name]
description: [brief world description]
timePeriod: [time period or era]
technologyLevel: [technology level]
magicSystem: [how magic works if applicable]
history: [key historical events]
rulesPhysics: [special physics rules or laws]

=== CHARACTERS ===
[For each character, use this format with empty line between each:]
id: [unique_id_lowercase]
name: [full name]
role: [protagonist/antagonist/supporting/mentor/etc]
age: [number]
race: [race/species]
class: [DND class like warrior/mage/rogue]
level: [1-20]
alignment: [DND alignment]
description: [physical description]
personality: [personality traits]
backstory: [backstory]
motivation: [primary motivation]
fears: [comma separated]
skills: [comma separated skill:proficiency pairs]
weaknesses: [comma separated]
equipment: [comma separated]
currentLocation: [location_id]

=== LOCATIONS ===
[For each location:]
id: [unique_id_lowercase]
name: [location name]
type: [city/town/village/dungeon/wilderness/etc]
region: [larger region]
population: [number]
description: [detailed description]
government: [government type]
economy: [economic activities]
culture: [cultural notes]
defenses: [defensive capabilities]
notableFeatures: [comma separated]
coords: x: [number], y: [number]

=== FACTIONS ===
[For each faction:]
id: [unique_id_lowercase]
name: [faction name]
type: [guild/kingdom/cult/military/criminal/etc]
alignment: [DND alignment]
headquarters: [location_id]
description: [faction description]
goals: [comma separated]
methods: [how they operate]
leadership: [leadership structure]
membership: [number]
resources: [available resources]
reputation: [how they're viewed]

=== RELIGIONS ===
[For each religion:]
id: [unique_id_lowercase]
name: [religion/deity name]
type: [monotheistic/polytheistic/pantheon/cult/philosophy]
alignment: [DND alignment]
domain: [domain of influence]
description: [religion description]
beliefs: [comma separated core beliefs]
practices: [comma separated practices]
clergy: [clergy organization]
followers: [number]
influence: [low/moderate/high/dominant]
symbols: [religious symbols/icons]

=== NPCS ===
[For each NPC:]
id: [unique_id_lowercase]
name: [NPC name]
role: [merchant/guard/innkeeper/etc]
location: [location_id]
description: [brief description]
personality: [key traits]
services: [comma separated]
questGiver: [true/false]
attitude: [friendly/neutral/hostile]

=== GLOSSARY ===
[For each term:]
term: [term or word]
pronunciation: [how to pronounce]
category: [place/person/magic/technology/creature/etc]
definition: [definition]
etymology: [origin]
usage: [usage in context]

=== ITEMS ===
[For each item:]
id: [unique_id_lowercase]
name: [item name]
type: [weapon/armor/potion/artifact/tool/etc]
rarity: [common/uncommon/rare/legendary]
description: [item description]
properties: [special properties]
value: [number]
weight: [number]
requiresAttunement: [true/false]

Include ONLY the sections and entities we discussed. Use empty lines between entities. Be thorough and include all details we talked about.`;

      const chatMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      chatMessages.push({
        role: 'user',
        content: summaryPrompt
      });

      const result = await aiService.chat(chatMessages, {
        model: selectedModel,
        temperature: 0.3, // Lower temperature for structured output
      });

      if (result.success) {
        const summaryMessage = {
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString(),
          isSummary: true
        };
        setMessages(prev => [...prev, summaryMessage]);
        setHasSummary(true);

        alert('World summary generated! Review it, then click "Build World from Summary" to create the JSON files.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const buildWorldFromSummary = async () => {
    if (!hasSummary) {
      alert('Please generate a world summary first.');
      return;
    }

    if (!schemas) {
      alert('Schemas not loaded yet. Please wait a moment and try again.');
      return;
    }

    // Find the last summary message
    const summaryMsg = [...messages].reverse().find(m => 
      m.role === 'assistant' && (
        m.content.includes('=== WORLD SUMMARY ===') ||
        m.content.includes('=== CHARACTERS ===') ||
        m.content.includes('=== LOCATIONS ===')
      )
    );

    if (!summaryMsg) {
      alert('Could not find summary message. Please generate summary again.');
      return;
    }

    const confirmed = window.confirm(
      'This will extract the world data from the AI summary and create JSON files.\n\n' +
      'Are you ready to build the world?'
    );

    if (!confirmed) return;

    setIsBuilding(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${currentProject}/world/build-from-summary`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: summaryMsg.content,
            schemas: schemas
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        const successMessage = {
          role: 'system',
          content: `✅ **World Built Successfully!**\n\nCreated ${result.files_created.length} files:\n${result.files_created.map(f => `• ${f}`).join('\n')}\n\n**Entity Counts:**\n${Object.entries(result.entity_counts || {}).map(([k, v]) => `• ${k}: ${v}`).join('\n')}\n\nYou can now review and edit in the World Builder sections.`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, successMessage]);

        if (reloadProject) {
          await reloadProject();
        }

        alert(
          `World built successfully!\n\n` +
          `Created ${result.files_created.length} files\n\n` +
          `Switch to World Builder sections to review.`
        );
      } else {
        throw new Error(result.error || 'Failed to build world');
      }
    } catch (error) {
      console.error('Build error:', error);
      alert(`Failed to build world: ${error.message}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      setHasSummary(false);
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
      <div style={chatStyles.container}>
        <div style={chatStyles.emptyState}>
          <p style={chatStyles.emptyText}>Please create or select a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={chatStyles.container}>
      <div style={chatStyles.header}>
  <h3 style={chatStyles.title}>🌍 World Building Chat - Phase 2.1</h3>
        <div style={chatStyles.controls}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={chatStyles.modelSelect}
            title="AI Model"
          >
            <option value="llama3.2">llama3.2</option>
            <option value="llama3.1">llama3.1</option>
            <option value="mistral">mistral</option>
          </select>
          
            <div style={chatStyles.tempControl}>
            <label style={chatStyles.tempLabel} title="Creativity Level">
              🌡️ {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={chatStyles.tempSlider}
            />
          </div>

          <button 
            onClick={clearChat}
            style={chatStyles.clearButton}
            title="Clear Chat"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={chatStyles.messagesContainer}>
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}
        
        {isGenerating && (
          <div style={chatStyles.generatingIndicator}>
            <div style={chatStyles.dots}>
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
            <span style={chatStyles.generatingText}>AI is thinking...</span>
          </div>
        )}
        
        {isGeneratingSummary && (
          <div style={chatStyles.summaryIndicator}>
            <div style={chatStyles.spinner}>📝</div>
            <span style={chatStyles.summaryText}>Generating structured world summary...</span>
          </div>
        )}
        
        {isBuilding && (
          <div style={chatStyles.buildingIndicator}>
            <div style={chatStyles.spinner}>⏳</div>
            <span style={chatStyles.buildingText}>Extracting world data from summary...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Two-Step Action Buttons */}
      <div style={chatStyles.actionButtons}>
        <button
          onClick={generateWorldSummary}
          disabled={isGeneratingSummary || isGenerating || isBuilding || messages.length < 2}
          style={{
            ...chatStyles.summaryButton,
            ...(isGeneratingSummary || isGenerating || isBuilding || messages.length < 2 ? chatStyles.buttonDisabled : {})
          }}
        >
          {isGeneratingSummary ? '📝 Generating...' : '📝 Generate World Summary'}
        </button>
        
        <button
          onClick={buildWorldFromSummary}
          disabled={!hasSummary || isBuilding || isGenerating || isGeneratingSummary}
          style={{
            ...chatStyles.buildButton,
            ...(!hasSummary || isBuilding || isGenerating || isGeneratingSummary ? chatStyles.buttonDisabled : {})
          }}
        >
          {isBuilding ? '⏳ Building...' : '🌍 Build World from Summary'}
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={chatStyles.inputForm}>
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
          style={chatStyles.input}
          rows={3}
          disabled={isGenerating || isBuilding || isGeneratingSummary}
        />
        <button 
          type="submit" 
          style={{
            ...chatStyles.sendButton,
            ...((!input.trim() || isGenerating || isBuilding || isGeneratingSummary) ? chatStyles.sendButtonDisabled : {})
          }}
          disabled={!input.trim() || isGenerating || isBuilding || isGeneratingSummary}
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
  const isSummary = message.isSummary || (
    message.role === 'assistant' && 
    (message.content.includes('=== WORLD SUMMARY ===') ||
     message.content.includes('=== CHARACTERS ==='))
  );

  return (
    <div style={{
      ...chatStyles.message,
      ...(isUser ? chatStyles.userMessage : isSystem ? chatStyles.systemMessage : isSummary ? chatStyles.summaryMessage : chatStyles.aiMessage)
    }}>
      <div style={chatStyles.messageHeader}>
        <span style={chatStyles.messageRole}>
          {isUser ? '👤 You' : isSystem ? '⚠️ System' : isSummary ? '📝 AI Summary' : '🤖 AI'}
        </span>
        <span style={chatStyles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div style={chatStyles.messageContent}>
        {message.content}
      </div>
    </div>
  );
}