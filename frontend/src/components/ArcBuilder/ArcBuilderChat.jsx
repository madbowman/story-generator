/**
 * Arc Builder Chat Component - Phase 3
 * Two-step process: Generate Arc Summary → Build Arcs
 * AI creates structured arc summary with world context
 */
import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { aiService } from '../../services/api';

import chatStyles from '../../styles/aichat/styles';

export default function ArcBuilderChat({ selectedModel }) {
  const { currentProject, reloadProject } = useProject();
  const [messages, setMessages] = useState(() => {
    // Load saved conversation for this project from localStorage
    if (currentProject) {
      try {
        const saved = localStorage.getItem(`arcchat_${currentProject}`);
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
  const [worldContext, setWorldContext] = useState(null);
  // selectedModel is provided via props from App -> AIStatus
  const [temperature, setTemperature] = useState(0.8);
  const [hasSummary, setHasSummary] = useState(false);
  const messagesEndRef = useRef(null);

  // Load arc schemas and world context on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load arc schemas
        const schemaResponse = await fetch('http://localhost:5000/api/arc/schemas');
        if (schemaResponse.ok) {
          const schemaData = await schemaResponse.json();
          setSchemas(schemaData);
        }

        // Load world context
        if (currentProject) {
          const contextResponse = await fetch(
            `http://localhost:5000/api/projects/${currentProject}/world/context`
          );
          if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            setWorldContext(contextData.context);
          }
        }
      } catch (error) {
        console.error('Failed to load schemas/context:', error);
      }
    };
    loadData();
  }, [currentProject]);

  // Initial AI greeting with world context
  useEffect(() => {
    if (messages.length === 0 && currentProject && worldContext) {
      const characterList = worldContext.characters?.characters?.map(c => c.name).join(', ') || 'None';
      const locationList = worldContext.locations?.places?.map(l => l.name).join(', ') || 'None';
      
      const greeting = {
        role: 'assistant',
        content: `Welcome! I'm ready to help you plan story arcs for "${currentProject.title}".\n\n**Phase 3 Workflow:**\n\n1. **Discuss Story Arcs**: Tell me about your story arcs - plot, characters, episodes\n2. **Generate Arc Summary**: Click "📝 Generate Arc Summary" for structured output\n3. **Build Arcs**: Click "📚 Build Arcs from Summary" to create arcs.json\n\n**Your World Context:**\n• Characters: ${characterList}\n• Locations: ${locationList}\n\nLet's plan your story! What arcs do you have in mind?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, [currentProject, worldContext, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Save conversation to localStorage
    if (currentProject && messages.length > 0) {
      try {
        localStorage.setItem(`arcchat_${currentProject}`, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save conversation:', e);
      }
    }

    // Check if last message is a summary
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && 
        (lastMsg.content.includes('=== ARC SUMMARY ===') || 
         lastMsg.content.includes('=== ARC ==='))) {
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
      // Build complete world context for AI - Include with EVERY message
      const chatMessages = [];
      
      // Add full world context as system message with EVERY user message
      if (worldContext) {
        const contextParts = [];
        
        // World Overview - ALL fields
        if (worldContext.world_overview) {
          const wo = worldContext.world_overview;
          contextParts.push(`WORLD OVERVIEW:
Name: ${wo.name || 'Unknown'}
Description: ${wo.description || 'N/A'}
Time Period: ${wo.timePeriod || 'N/A'}
Technology Level: ${wo.technologyLevel || 'N/A'}
Magic System: ${wo.magicSystem || 'None'}
History: ${wo.history || 'N/A'}
Physics Rules: ${wo.rulesPhysics || 'Standard'}`);
        }
        
        // Characters - ALL fields
        if (worldContext.characters?.characters?.length > 0) {
          const charDetails = worldContext.characters.characters.map(c => {
            const skills = Array.isArray(c.skills) ? c.skills.join(', ') : 'None';
            const fears = Array.isArray(c.fears) ? c.fears.join(', ') : 'None';
            const weaknesses = Array.isArray(c.weaknesses) ? c.weaknesses.join(', ') : 'None';
            const equipment = Array.isArray(c.equipment) ? c.equipment.join(', ') : 'None';
            const rels = c.relationships?.map(r => `${r.character_id} (${r.type}, ${r.status}): ${r.description}`).join('; ') || 'None';
            
            return `${c.id}: ${c.name}
  Role: ${c.role}, Age: ${c.age}, Race: ${c.race}, Class: ${c.class}, Level: ${c.level}
  Alignment: ${c.alignment}
  Description: ${c.description}
  Personality: ${c.personality}
  Backstory: ${c.backstory}
  Motivation: ${c.motivation}
  Fears: ${fears}
  Skills: ${skills}
  Weaknesses: ${weaknesses}
  Equipment: ${equipment}
  Current Location: ${c.currentLocation}
  Relationships: ${rels}`;
          }).join('\n\n');
          contextParts.push(`CHARACTERS:\n${charDetails}`);
        }
        
        // Locations - ALL fields
        if (worldContext.locations?.places?.length > 0) {
          const locDetails = worldContext.locations.places.map(l => {
            const features = Array.isArray(l.notableFeatures) ? l.notableFeatures.join(', ') : 'None';
            const coords = l.coords ? `(${l.coords.x}, ${l.coords.y})` : 'N/A';
            
            return `${l.id}: ${l.name} (${l.type})
  Region: ${l.region || 'N/A'}
  Population: ${l.population || 0}
  Description: ${l.description || 'N/A'}
  Government: ${l.government || 'N/A'}
  Economy: ${l.economy || 'N/A'}
  Culture: ${l.culture || 'N/A'}
  Defenses: ${l.defenses || 'None'}
  Notable Features: ${features}
  Coordinates: ${coords}`;
          }).join('\n\n');
          contextParts.push(`LOCATIONS:\n${locDetails}`);
        }
        
        // Factions - ALL fields
        if (worldContext.factions?.factions?.length > 0) {
          const factDetails = worldContext.factions.factions.map(f => {
            const goals = Array.isArray(f.goals) ? f.goals.join(', ') : 'None';
            const members = Array.isArray(f.members) ? f.members.join(', ') : 'None';
            const rels = f.relationships?.map(r => `${r.faction_id} (${r.status}): ${r.description}`).join('; ') || 'None';
            
            return `${f.id}: ${f.name} (${f.type})
  Alignment: ${f.alignment}
  Headquarters: ${f.headquarters}
  Description: ${f.description || 'N/A'}
  Goals: ${goals}
  Methods: ${f.methods || 'N/A'}
  Leadership: ${f.leadership || 'N/A'}
  Membership: ${f.membership || 0}
  Resources: ${f.resources || 'N/A'}
  Reputation: ${f.reputation || 'N/A'}
  Members: ${members}
  Relationships: ${rels}`;
          }).join('\n\n');
          contextParts.push(`FACTIONS:\n${factDetails}`);
        }
        
        // Religions - ALL fields
        if (worldContext.religions?.religions?.length > 0) {
          const relDetails = worldContext.religions.religions.map(r => {
            const beliefs = Array.isArray(r.beliefs) ? r.beliefs.join(', ') : 'None';
            const practices = Array.isArray(r.practices) ? r.practices.join(', ') : 'None';
            const temples = Array.isArray(r.temples) ? r.temples.join(', ') : 'None';
            const holyDays = Array.isArray(r.holyDays) ? r.holyDays.join(', ') : 'None';
            const rels = r.relationships?.map(rel => `${rel.religion_id} (${rel.status}): ${rel.description}`).join('; ') || 'None';
            
            return `${r.id}: ${r.name} (${r.type})
  Alignment: ${r.alignment}
  Domain: ${r.domain || 'N/A'}
  Description: ${r.description || 'N/A'}
  Beliefs: ${beliefs}
  Practices: ${practices}
  Clergy: ${r.clergy || 'N/A'}
  Temples: ${temples}
  Followers: ${r.followers || 0}
  Influence: ${r.influence || 'Low'}
  Holy Days: ${holyDays}
  Symbols: ${r.symbols || 'N/A'}
  Relationships: ${rels}`;
          }).join('\n\n');
          contextParts.push(`RELIGIONS:\n${relDetails}`);
        }
        
        // NPCs - ALL fields
        if (worldContext.npcs?.npcs?.length > 0) {
          const npcDetails = worldContext.npcs.npcs.map(n => {
            const services = Array.isArray(n.services) ? n.services.join(', ') : 'None';
            
            return `${n.id}: ${n.name} (${n.role})
  Location: ${n.location}
  Description: ${n.description || 'N/A'}
  Personality: ${n.personality || 'N/A'}
  Services: ${services}
  Quest Giver: ${n.questGiver ? 'Yes' : 'No'}
  Attitude: ${n.attitude}`;
          }).join('\n\n');
          contextParts.push(`NPCS:\n${npcDetails}`);
        }
        
        // Glossary - ALL fields
        if (worldContext.glossary?.terms?.length > 0) {
          const glossaryDetails = worldContext.glossary.terms.map(t => 
            `${t.term} [${t.pronunciation || 'N/A'}] (${t.category}): ${t.definition}. Etymology: ${t.etymology || 'Unknown'}. Usage: ${t.usage || 'N/A'}`
          ).join('\n');
          contextParts.push(`GLOSSARY:\n${glossaryDetails}`);
        }
        
        // Items/Content - ALL fields
        if (worldContext.content?.items?.length > 0) {
          const itemDetails = worldContext.content.items.map(i => 
            `${i.id}: ${i.name} (${i.type}, ${i.rarity})
  Description: ${i.description || 'N/A'}
  Properties: ${i.properties || 'None'}
  Value: ${i.value || 0} gp
  Weight: ${i.weight || 0} lbs
  Requires Attunement: ${i.requiresAttunement ? 'Yes' : 'No'}`
          ).join('\n\n');
          contextParts.push(`ITEMS:\n${itemDetails}`);
        }
        
        // chatMessages.push({
        //   role: 'system',
        //   content: `You are helping plan story arcs. Here is the COMPLETE world information with ALL details. Remember everything and use exact IDs when discussing arcs:\n\n${contextParts.join('\n\n')}`
        // });

        chatMessages.push({
          role: 'system',
          content: `You are helping plan story arcs. Here is the COMPLETE world information.

        IMPORTANT: When discussing arcs, you can use character NAMES naturally in conversation, but when I ask you to generate the arc summary, you MUST use the exact IDs shown below.

        NAME → ID MAPPING:
        ${worldContext.characters?.characters?.map(c => `"${c.name}" → ${c.id}`).join('\n') || ''}

        LOCATION NAME → ID MAPPING:
        ${worldContext.locations?.places?.map(l => `"${l.name}" → ${l.id}`).join('\n') || ''}

        [Rest of world context below]

        ${contextParts.join('\n\n')}

        Remember: In conversation use names naturally, but in the arc summary use IDs!`
        });
      }
      
      // Add conversation messages
      chatMessages.push(...messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      })));

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

  const generateArcSummary = async () => {
    if (messages.length < 2) {
      alert('Please have a conversation about your story arcs first.');
      return;
    }

    setIsGeneratingSummary(true);

    try {
      const summaryPrompt = `Based on our conversation, please generate a complete structured arc summary. Use this EXACT format:

=== ARC SUMMARY ===

=== ARC ===
[For each arc, use this format with empty line between arcs:]

id: [unique_arc_id_lowercase]
title: [Arc title]
season: [season number]
arcNumber: [arc number within season]
episodeStart: [first episode number]
episodeEnd: [last episode number]
status: [planned/in_progress/complete]
description: [Arc description]
themes: [comma separated themes]
mainCharacters: [comma separated character_ids]
supportingCharacters: [comma separated character_ids]
primaryLocations: [comma separated location_ids]
factions: [comma separated faction_ids]
resolution: [How the arc concludes]
cliffhanger: [Setup for next arc, or "none"]
previousArc: [previous_arc_id or "none"]
nextArc: [next_arc_id or "none"]

PLOT BEATS (for each episode in the arc):
episode: [episode number]
beatTitle: [Beat title]
beatDescription: [What happens]
characters: [comma separated character_ids involved]
location: [location_id]
outcome: [Result of this beat]

CRITICAL:
- Use ONLY character_ids, location_ids, and faction_ids from our world context
- Each arc must have plot beats for each episode
- Separate multiple arcs with empty lines
- Include all arcs we discussed`;

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
        temperature: 0.3,
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

        alert('Arc summary generated! Review it, then click "Build Arcs from Summary" to create the arcs.json file.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const buildArcsFromSummary = async () => {
    if (!hasSummary) {
      alert('Please generate an arc summary first.');
      return;
    }

    if (!schemas) {
      alert('Schemas not loaded yet. Please wait a moment and try again.');
      return;
    }

    // Find the last summary message
    const summaryMsg = [...messages].reverse().find(m => 
      m.role === 'assistant' && (
        m.content.includes('=== ARC SUMMARY ===') ||
        m.content.includes('=== ARC ===')
      )
    );

    if (!summaryMsg) {
      alert('Could not find summary message. Please generate summary again.');
      return;
    }

    const confirmed = window.confirm(
      'This will extract arc data from the AI summary and create/update arcs.json.\n\n' +
      'Are you ready to build the arcs?'
    );

    if (!confirmed) return;

    setIsBuilding(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${currentProject}/arcs/build-from-summary`,
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
          content: `✅ **Arcs Built Successfully!**\n\nAdded: ${result.arcs_added.length} arc(s)\nSkipped (already exist): ${result.arcs_skipped.length}\nTotal arcs in project: ${result.total_arcs}\n\nYou can now view and edit arcs in the Arc Manager.`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, successMessage]);

        if (reloadProject) {
          await reloadProject();
        }

        alert(
          `Arcs built successfully!\n\n` +
          `Added ${result.arcs_added.length} new arc(s)\n\n` +
          `Switch to Arc Manager to review.`
        );
      } else {
        throw new Error(result.error || 'Failed to build arcs');
      }
    } catch (error) {
      console.error('Build error:', error);
      alert(`Failed to build arcs: ${error.message}`);
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
          localStorage.removeItem(`arcchat_${currentProject}`);
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
        <h3 style={chatStyles.title}>📚 Arc Builder Chat - Phase 3</h3>
        <div style={chatStyles.controls}>
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
            <span style={chatStyles.summaryText}>Generating structured arc summary...</span>
          </div>
        )}
        
        {isBuilding && (
          <div style={chatStyles.buildingIndicator}>
            <div style={chatStyles.spinner}>⏳</div>
            <span style={chatStyles.buildingText}>Extracting arc data from summary...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Two-Step Action Buttons */}
      <div style={chatStyles.actionButtons}>
        <button
          onClick={generateArcSummary}
          disabled={isGeneratingSummary || isGenerating || isBuilding || messages.length < 2}
          style={{
            ...chatStyles.summaryButton,
            ...(isGeneratingSummary || isGenerating || isBuilding || messages.length < 2 ? chatStyles.buttonDisabled : {})
          }}
        >
          {isGeneratingSummary ? '📝 Generating...' : '📝 Generate Arc Summary'}
        </button>
        
        <button
          onClick={buildArcsFromSummary}
          disabled={!hasSummary || isBuilding || isGenerating || isGeneratingSummary}
          style={{
            ...chatStyles.buildButton,
            ...(!hasSummary || isBuilding || isGenerating || isGeneratingSummary ? chatStyles.buttonDisabled : {})
          }}
        >
          {isBuilding ? '⏳ Building...' : '📚 Build Arcs from Summary'}
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
          placeholder="Describe your story arcs, plot beats, episodes... (Shift+Enter for new line)"
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
    (message.content.includes('=== ARC SUMMARY ===') ||
     message.content.includes('=== ARC ==='))
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