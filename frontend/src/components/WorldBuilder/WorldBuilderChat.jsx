/**
 * World Builder Chat Component - Phase 2.1
 * Two-step process: Generate Summary → Build World
 * AI creates structured summary, system extracts from it
 */
import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { aiService } from '../../services/api';

import chatStyles from '../../styles/aichat/styles';

// Configuration for conversation management
// This prevents token overflow by limiting conversation history sent to AI
const CONVERSATION_CONFIG = {
  MAX_MESSAGES: 10, // Sliding window size for AI context (reduced for testing)
  ENABLE_SLIDING_WINDOW: true, // Enable/disable sliding window feature

  // Dual-State Architecture:
  // - `messages`: Full conversation history for UI display (never truncated)
  // - `aiMessages`: AI-optimized state with rolling summaries for context efficiency
  // 
  // How rolling summaries work:
  // - When aiMessages > MAX_MESSAGES, summarize first MAX_MESSAGES into one summary
  // - Replace those messages with the summary + keep remaining recent messages
  // - Creates: [Summary1, RecentMsg1, RecentMsg2...] until it grows again
  // - Then: [Summary2(includes Summary1), NewRecentMsgs...] - rolling context!
  // - Prevents exponential growth while maintaining rich conversational context
};

// Generate AI-powered rolling summary for conversation context compression
async function generateConversationSummary(messagesToSummarize, selectedModel) {
  try {
    // Prepare the conversation for AI summarization
    const conversationForSummary = messagesToSummarize.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add summarization prompt
    conversationForSummary.push({
      role: 'user',
      content: `Briefly summarize what the user has told you about their story so far. Include any names, details, or facts they mentioned - no matter how small. Ignore system messages and examples.`
    });

    // Call AI service to generate summary
    const result = await aiService.chat(conversationForSummary, {
      model: selectedModel,
      temperature: 0.1, // Very low temperature for consistent, factual summaries
    });

    if (result.success && result.response) {
      const aiSummary = result.response.trim();
      return `[Previous conversation summary (${messagesToSummarize.length} messages): ${aiSummary}. Current conversation continues below...]`;
    } else {
      // Fallback to simple summary if AI fails
      return `[Previous conversation summary (${messagesToSummarize.length} messages): World building discussion covering characters, locations, and world details. Current conversation continues below...]`;
    }
  } catch (error) {
    console.error('Failed to generate AI summary:', error);
    // Fallback to simple summary if AI fails
    return `[Previous conversation summary (${messagesToSummarize.length} messages): World building discussion covering characters, locations, and world details. Current conversation continues below...]`;
  }
}

export default function WorldBuilderChat({ selectedModel }) {
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

  // Separate AI-optimized message state for sliding window with rolling summaries
  const [aiMessages, setAiMessages] = useState(() => {
    // Load saved AI conversation state for this project from localStorage
    if (currentProject) {
      try {
        const saved = localStorage.getItem(`worldchat_ai_${currentProject}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed;
        }
      } catch (e) {
        console.error('Failed to load saved AI conversation:', e);
      }
    }
    console.log('🔄 No saved aiMessages found, starting fresh');
    return [];
  });
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isGeneratingConversationSummary, setIsGeneratingConversationSummary] = useState(false);
  const [schemas, setSchemas] = useState(null);
  // selectedModel is provided via props from App -> AIStatus
  const [temperature, setTemperature] = useState(0.8);
  const [hasSummary, setHasSummary] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
    if (messages.length === 0 && aiMessages.length === 0 && currentProject) {
      const greeting = {
        role: 'assistant',
        content: `Welcome! I'm ready to help you build the world for "${currentProject}".\n\nI'm here to have a natural conversation about your story world. Just tell me about your characters, locations, plots, or any creative ideas you have in mind.\n\n**Example:**\n"I'm creating a steampunk world with gnomes and goblins"\n"The gnomes live in Buzzlebury, an underground city"\n"King Gnomus rules the gnomes wisely"\n\nLet's start! Tell me about your world - I'll respond conversationally and help you develop your ideas.`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
      setAiMessages([greeting]);
    }
  }, [currentProject, messages.length, aiMessages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

    // Save conversation to localStorage
    if (currentProject && messages.length > 0) {
      try {
        localStorage.setItem(`worldchat_${currentProject}`, JSON.stringify(messages));
        localStorage.setItem(`worldchat_ai_${currentProject}`, JSON.stringify(aiMessages));
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
      // Update AI messages state with rolling summary approach
      const MAX_MESSAGES = CONVERSATION_CONFIG.MAX_MESSAGES;
      let newAiMessages = [...aiMessages, userMessage];

      // If aiMessages exceeds limit, create rolling summary
      if (CONVERSATION_CONFIG.ENABLE_SLIDING_WINDOW && newAiMessages.length > MAX_MESSAGES) {
        setIsGeneratingConversationSummary(true);

        // Summarize first MAX_MESSAGES of current aiMessages
        const messagesToSummarize = newAiMessages.slice(0, MAX_MESSAGES);
        const conversationSummary = await generateConversationSummary(messagesToSummarize, selectedModel);

        // Reset aiMessages with summary + remaining messages
        const remainingMessages = newAiMessages.slice(MAX_MESSAGES);

        newAiMessages = [
          { role: 'system', content: conversationSummary },
          ...remainingMessages
        ];

        setAiMessages(newAiMessages);
        setIsGeneratingConversationSummary(false);
      } else {
        setAiMessages(newAiMessages);
      }

      // Prepare messages for AI (use optimized aiMessages)
      const chatMessages = newAiMessages.map(msg => ({
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

        // Update both message states
        setMessages(prev => [...prev, aiMessage]);
        setAiMessages(prev => [...prev, aiMessage]);

        // Focus back to input after AI responds
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
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

      // Focus back to input even on error
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } finally {
      setIsGenerating(false);
      setIsGeneratingConversationSummary(false);
    }
  };

  const generateWorldSummary = async () => {
    if (messages.length < 2) {
      alert('Please have a conversation about your world first.');
      return;
    }

    setIsGeneratingSummary(true);

    try {
      // Create system prompt for structured summary with explicit relationship examples
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
[For each character, use this EXACT format with empty line between each. ALL fields including currentLocation are REQUIRED:]

id: [unique_id_lowercase]
name: [full name]
role: [protagonist/antagonist/supporting/mentor/etc]
age: [number only]
race: [race/species]
class: [character class/profession]
level: [number only - experience level 1-20]
alignment: [moral alignment]
description: [physical description]
personality: [personality traits]
backstory: [backstory]
motivation: [primary motivation]
fears: [comma separated]
skills: [comma separated skill:proficiency pairs like "combat:expert, magic:novice"]
weaknesses: [comma separated]
equipment: [comma separated]
relationships: [other_character_id:type:status:description | other_character_id:type:status:description]
currentLocation: [location_id where character is now]

COMPLETE EXAMPLE CHARACTER:
id: hero_john
name: John Smith
role: protagonist
age: 25
race: Human
class: Warrior
level: 5
alignment: Neutral Good
description: Tall with dark hair and blue eyes
personality: Brave, loyal, and determined
backstory: Grew up in a small village, trained as a warrior
motivation: Protect the innocent and find his lost sister
fears: Failure, losing loved ones
skills: combat:expert, leadership:novice, survival:proficient
weaknesses: Impulsive, overly trusting
equipment: Steel sword, wooden shield, leather armor
relationships: mentor_bob:mentor:strong:Trained me since childhood | sister_jane:sibling:missing:Searching for her
currentLocation: castle_town

CRITICAL REQUIREMENTS:
- Every character MUST have a relationships line (use "relationships: none" if unsure)
- Every character MUST have a currentLocation using a valid location_id from LOCATIONS section
- Age and level must be numbers only
- Use pipe | to separate multiple relationships
- Keep relationships simple - use basic types like: friend, enemy, ally, colleague

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
alignment: [moral alignment]
headquarters: [location_id]
description: [faction description]
goals: [comma separated]
methods: [how they operate]
leadership: [leadership structure]
membership: [number]
resources: [available resources]
reputation: [how they're viewed]
relationships: [other_faction_id:status:description | other_faction_id:status:description]
members: [comma separated character_ids]

FACTION RELATIONSHIP EXAMPLES:
relationships: shadow_guild:enemy:At war for decades | merchant_league:allied:Trade partners
relationships: none

=== RELIGIONS ===
[For each religion:]
id: [unique_id_lowercase]
name: [religion/deity name]
type: [monotheistic/polytheistic/pantheon/cult/philosophy]
alignment: [moral alignment]
domain: [domain of influence]
description: [religion description]
beliefs: [comma separated core beliefs]
practices: [comma separated practices]
clergy: [clergy organization]
temples: [comma separated location_ids]
followers: [number]
influence: [low/moderate/high/dominant]
relationships: [other_religion_id:status:description | other_religion_id:status:description]
holyDays: [comma separated]
symbols: [religious symbols/icons]

RELIGION RELATIONSHIP EXAMPLES:
relationships: sun_worship:allied:Share similar beliefs | death_cult:opposed:Theological enemies
relationships: none

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

CRITICAL INSTRUCTIONS:
1. Include ONLY the sections and entities we discussed
2. Use empty lines between entities
3. EVERY character must have a relationships line
4. Level must be a NUMBER only (1-20)
5. Age must be a NUMBER only
6. Use the pipe | symbol to separate multiple relationships
7. Be thorough and include all details we talked about`;

      const chatMessages = aiMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      chatMessages.push({
        role: 'user',
        content: summaryPrompt
      });

      const result = await aiService.chat(chatMessages, {
        model: selectedModel,
        temperature: 0.1, // Very low temperature for consistent, structured output (same as conversation summaries)
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
          isBuildSuccess: true
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
      alert(`Failed to build world: ${error.message}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      setAiMessages([]);
      setHasSummary(false);
      if (currentProject) {
        try {
          localStorage.removeItem(`worldchat_${currentProject}`);
          localStorage.removeItem(`worldchat_ai_${currentProject}`);
        } catch (e) {
          console.error('Failed to clear saved conversation:', e);
        }
      }
    }
  };

  const deleteMessage = (messageIndex) => {
    const messageToDelete = messages[messageIndex];
    const isSummary = messageToDelete.isSummary || (
      messageToDelete.role === 'assistant' && (
        messageToDelete.content.includes('=== WORLD SUMMARY ===') ||
        messageToDelete.content.includes('=== CHARACTERS ===') ||
        messageToDelete.content.includes('=== LOCATIONS ===')
      )
    );
    const isBuildSuccess = messageToDelete.isBuildSuccess ||
      (messageToDelete.role === 'system' && messageToDelete.content.includes('World Built Successfully'));

    let confirmMessage = 'Delete this message? This cannot be undone.';
    if (isSummary) {
      confirmMessage = 'Delete this world summary? This cannot be undone.';
    } else if (isBuildSuccess) {
      confirmMessage = 'Delete this build success message? This cannot be undone.';
    }

    if (window.confirm(confirmMessage)) {
      const newMessages = messages.filter((_, index) => index !== messageIndex);
      setMessages(newMessages);

      // Also remove from AI messages if it exists there
      const newAiMessages = aiMessages.filter(msg =>
        !(msg.timestamp === messageToDelete.timestamp && msg.content === messageToDelete.content)
      );
      setAiMessages(newAiMessages);

      // Check if there are any remaining summaries
      const hasAnySummary = newMessages.some(msg =>
        msg.role === 'assistant' && (
          msg.content.includes('=== WORLD SUMMARY ===') ||
          msg.content.includes('=== CHARACTERS ===') ||
          msg.content.includes('=== LOCATIONS ===') ||
          msg.isSummary
        )
      );
      setHasSummary(hasAnySummary);

      // Update localStorage
      if (currentProject) {
        try {
          localStorage.setItem(`worldchat_${currentProject}`, JSON.stringify(newMessages));
          localStorage.setItem(`worldchat_ai_${currentProject}`, JSON.stringify(newAiMessages));
        } catch (e) {
          console.error('Failed to save updated conversation:', e);
        }
      }
    }
  }; if (!currentProject) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={chatStyles.title}>🌍 World Building Chat - Phase 2.1</h3>
          {CONVERSATION_CONFIG.ENABLE_SLIDING_WINDOW && messages.length > CONVERSATION_CONFIG.MAX_MESSAGES && (
            <span style={{
              fontSize: '12px',
              color: '#888',
              backgroundColor: '#f0f0f0',
              padding: '2px 6px',
              borderRadius: '10px',
              whiteSpace: 'nowrap'
            }}>
              📜 {messages.length} msgs (keeping recent {CONVERSATION_CONFIG.MAX_MESSAGES})
            </span>
          )}
        </div>
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
          <Message
            key={idx}
            message={msg}
            messageIndex={idx}
            onDelete={deleteMessage}
          />
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

        {isGeneratingConversationSummary && (
          <div style={chatStyles.summaryIndicator}>
            <div style={chatStyles.spinner}>🔄</div>
            <span style={chatStyles.summaryText}>Generating conversation summary...</span>
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
          ref={inputRef}
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

function Message({ message, messageIndex, onDelete }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isSummary = message.isSummary || (
    message.role === 'assistant' &&
    (message.content.includes('=== WORLD SUMMARY ===') ||
      message.content.includes('=== CHARACTERS ==='))
  );
  const isBuildSuccess = message.isBuildSuccess ||
    (message.role === 'system' && message.content.includes('World Built Successfully'));

  const isDeletable = isSummary || isBuildSuccess;

  return (
    <div style={{
      ...chatStyles.message,
      ...(isUser ? chatStyles.userMessage : isSystem ? chatStyles.systemMessage : isSummary ? chatStyles.summaryMessage : chatStyles.aiMessage)
    }}>
      <div style={chatStyles.messageHeader}>
        <span style={chatStyles.messageRole}>
          {isUser ? '👤 You' : isSystem ? '⚠️ System' : isSummary ? '📝 AI Summary' : '🤖 AI'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={chatStyles.messageTime}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {isDeletable && onDelete && (
            <button
              onClick={() => onDelete(messageIndex)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px 4px',
                borderRadius: '3px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              title={isSummary ? "Delete this summary" : "Delete this build message"}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <div style={chatStyles.messageContent}>
        {message.content}
      </div>
    </div>
  );
}