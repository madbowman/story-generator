/**
 * Story Builder App - Main Application
 * Phase 2: Added World Builder Chat
 */
import { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import AIStatus from './components/AIStatus';
import ProjectSelector from './components/ProjectSelector';
import WorldBuilder from './components/WorldBuilder/WorldBuilder';
import WorldBuilderChat from './components/WorldBuilder/WorldBuilderChat';

function App() {
  return (
    <ProjectProvider>
      <MainApp />
    </ProjectProvider>
  );
}

function MainApp() {
  const { currentProject, projectData, saveStatus } = useProject();
  const [activeView, setActiveView] = useState('world-chat');
  const [activeSection, setActiveSection] = useState('world_overview');
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const v = localStorage.getItem('selectedModel');
      return v || null;
    } catch (e) {
      return null;
    }
  });

  const handleSetSelectedModel = (model) => {
    setSelectedModel(model);
    try { localStorage.setItem('selectedModel', model); } catch (e) {}
  };
  const [worldSubmenuOpen, setWorldSubmenuOpen] = useState(() => {
    try {
      const v = localStorage.getItem('worldSubmenuOpen');
      return v === null ? true : v === 'true';
    } catch (e) {
      return true;
    }
  });

  const toggleWorldSubmenu = () => {
    setWorldSubmenuOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('worldSubmenuOpen', next ? 'true' : 'false'); } catch (e) {}
      return next;
    });
  };

  // sidebar collapse removed — always show full sidebar


  const handleWorldNavClick = () => {
    if (activeView !== 'world') {
      setActiveView('world');
      setWorldSubmenuOpen(true);
      try { localStorage.setItem('worldSubmenuOpen', 'true'); } catch (e) {}
    } else {
      toggleWorldSubmenu();
    }
  };
  
  const sections = [
    { id: 'world_overview', label: 'World Overview', icon: '🌍' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'characters', label: 'Characters', icon: '👤' },
    { id: 'npcs', label: 'NPCs', icon: '👥' },
    { id: 'factions', label: 'Factions', icon: '⚔️' },
    { id: 'religions', label: 'Religions', icon: '✨' },
    { id: 'glossary', label: 'Glossary', icon: '📖' },
    { id: 'content', label: 'Items & Hazards', icon: '🎒' },
  ];

  return (
    <div style={styles.app}>
      {/* Top Bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>📖 Story Builder</h1>
          <div style={styles.projectSelector}>
            <ProjectSelector />
          </div>
        </div>

        <div style={styles.headerRight}>
          <SaveIndicator status={saveStatus} />
          <AIStatus selectedModel={selectedModel} setSelectedModel={handleSetSelectedModel} />
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {!currentProject ? (
          <WelcomeScreen />
        ) : (
          <>
            {/* Left Sidebar - Navigation */}
            <aside style={styles.sidebar}>
              <div style={{ padding: '8px 12px' }} />
              <nav style={styles.nav}>
                <h3 style={styles.navTitle}>Project</h3>
                
                {/* PHASE 2: New World Builder Chat Button */}
                <NavButton
                  label="Build World Chat"
                  icon="💬"
                  active={activeView === 'world-chat'}
                  onClick={() => setActiveView('world-chat')}
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <NavButton
                    label="World Builder"
                    icon="🌍"
                    active={activeView === 'world'}
                    onClick={handleWorldNavClick}
                  />
                  <button
                    style={styles.navToggle}
                    onClick={toggleWorldSubmenu}
                    aria-expanded={worldSubmenuOpen}
                    aria-label="Toggle World Builder submenu"
                  >
                    {worldSubmenuOpen ? '▾' : '▸'}
                  </button>
                </div>
                {activeView === 'world' && worldSubmenuOpen && (
                  <div style={{ marginTop: '8px', paddingLeft: '6px' }}>
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        style={{
                          ...styles.navButton,
                          ...(activeSection === section.id ? styles.navButtonActive : {}),
                          paddingLeft: '28px',
                          fontSize: '13px'
                        }}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <span style={styles.navIcon}>{section.icon}</span>
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <NavButton
                  label="Story Arcs"
                  icon="📚"
                  active={activeView === 'arcs'}
                  onClick={() => setActiveView('arcs')}
                />
                <NavButton
                  label="Episodes"
                  icon="📝"
                  active={activeView === 'episodes'}
                  onClick={() => setActiveView('episodes')}
                />
                <NavButton
                  label="Export"
                  icon="📤"
                  active={activeView === 'export'}
                  onClick={() => setActiveView('export')}
                />
              </nav>

              {projectData && (
                <div style={styles.projectInfo}>
                  <h4 style={styles.projectInfoTitle}>
                    {projectData.metadata.title}
                  </h4>
                  {projectData.metadata.genre && (
                    <span style={styles.projectGenre}>
                      {projectData.metadata.genre}
                    </span>
                  )}
                  {projectData.metadata.description && (
                    <p style={styles.projectDescription}>
                      {projectData.metadata.description}
                    </p>
                  )}
                </div>
              )}
            </aside>

            {/* Center Panel - Main Editor */}
            {/* PHASE 2: Updated conditional to show world-chat view */}
            {(activeView === 'world-chat' || activeView !== 'world' || worldSubmenuOpen) ? (
              <main style={styles.centerPanel}>
                {activeView === 'world-chat' && <WorldBuilderChat selectedModel={selectedModel} />}
                {activeView === 'world' && <WorldBuilder activeSection={activeSection} setActiveSection={setActiveSection} />}
                {activeView === 'arcs' && <PlaceholderView title="Story Arcs" />}
                {activeView === 'episodes' && <PlaceholderView title="Episodes" />}
                {activeView === 'export' && <PlaceholderView title="Export" />}
              </main>
            ) : null}

            {/* Right sidebar removed — contextual widgets were replaced with an inline contextual area or can be added later if needed */}
          </>
        )}
      </div>
    </div>
  );
}

function NavButton({ label, icon, active, onClick }) {
  return (
    <button
      style={{
        ...styles.navButton,
        ...(active ? styles.navButtonActive : {})
      }}
      onClick={onClick}
    >
      <span style={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SaveIndicator({ status }) {
  const indicators = {
    saved: { text: '✓ Saved', color: '#10b981' },
    saving: { text: '⏳ Saving...', color: '#fbbf24' },
    error: { text: '⚠ Error', color: '#ef4444' },
  };

  const indicator = indicators[status] || indicators.saved;

  return (
    <div style={{ ...styles.saveIndicator, color: indicator.color }}>
      {indicator.text}
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div style={styles.welcome}>
      <div style={styles.welcomeContent}>
        <h2 style={styles.welcomeTitle}>Welcome to Story Builder</h2>
        <p style={styles.welcomeText}>
          Create serialized episodic stories through collaborative AI-assisted writing.
        </p>
        <div style={styles.welcomeSteps}>
          <div style={styles.welcomeStep}>
            <span style={styles.welcomeStepNumber}>1</span>
            <p style={styles.welcomeStepText}>
              Create a new project or select an existing one from the dropdown above
            </p>
          </div>
          <div style={styles.welcomeStep}>
            <span style={styles.welcomeStepNumber}>2</span>
            <p style={styles.welcomeStepText}>
              Build your story world collaboratively with AI assistance
            </p>
          </div>
          <div style={styles.welcomeStep}>
            <span style={styles.welcomeStepNumber}>3</span>
            <p style={styles.welcomeStepText}>
              Develop episodes with consistent characters, locations, and timelines
            </p>
          </div>
          <div style={styles.welcomeStep}>
            <span style={styles.welcomeStepNumber}>4</span>
            <p style={styles.welcomeStepText}>
              Export production-ready TTS scripts for audio production
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderView({ title }) {
  return (
    <div style={styles.placeholder}>
      <h2 style={styles.placeholderTitle}>{title}</h2>
      <p style={styles.placeholderText}>
        This feature is coming in the next phase of development.
      </p>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    height: '60px',
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    gap: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1,
  },
  logo: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  projectSelector: {
    minWidth: '300px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  saveIndicator: {
    fontSize: '13px',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#1a1a1a',
    borderRight: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  nav: {
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  navTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '4px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  navIcon: {
    fontSize: '18px',
  },
  navToggle: {
    background: 'transparent',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
  },
  projectInfo: {
    padding: '20px',
    flex: 1,
    overflow: 'auto',
  },
  projectInfoTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    color: '#fff',
  },
  projectGenre: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '12px',
  },
  projectDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#aaa',
    lineHeight: '1.5',
  },
  centerPanel: {
    flex: 1,
    overflow: 'hidden',
  },
  // sidebarCollapseButton removed
  welcome: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  welcomeContent: {
    maxWidth: '600px',
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: '32px',
    marginBottom: '16px',
    color: '#fff',
  },
  welcomeText: {
    fontSize: '16px',
    color: '#aaa',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  welcomeSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  welcomeStep: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  welcomeStepNumber: {
    width: '32px',
    height: '32px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  },
  welcomeStepText: {
    margin: 0,
    color: '#ccc',
    fontSize: '14px',
    lineHeight: '1.6',
    paddingTop: '4px',
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  placeholderTitle: {
    fontSize: '24px',
    color: '#fff',
    marginBottom: '12px',
  },
  placeholderText: {
    fontSize: '14px',
    color: '#666',
  },
};

export default App;