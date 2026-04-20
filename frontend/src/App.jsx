/**
 * Story Builder App - Main Application
 */
import { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import AIStatus from './components/AIStatus';
import ProjectSelector from './components/ProjectSelector';
import WorldBuilder from './components/WorldBuilder/WorldBuilder';
import WorldBuilderChat from './components/WorldBuilder/WorldBuilderChat';
import styles from './styles/app/styles';

function App() {
  return (
    <ProjectProvider>
      <MainApp />
    </ProjectProvider>
  );
}

function MainApp() {
  const { currentProject, projectData, saveStatus } = useProject();
  const [activeView, setActiveView] = useState(() => {
    try {
      const savedView = localStorage.getItem('activeView');
      return savedView || 'world-chat';
    } catch (e) {
      return 'world-chat';
    }
  });
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const savedSection = localStorage.getItem('activeSection');
      return savedSection || 'world_overview';
    } catch (e) {
      return 'world_overview';
    }
  });
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
    try { localStorage.setItem('selectedModel', model); } catch (e) { }
  };

  // Wrapper functions to persist navigation state
  const handleSetActiveView = (view) => {
    setActiveView(view);
    try { localStorage.setItem('activeView', view); } catch (e) { }
  };

  const handleSetActiveSection = (section) => {
    setActiveSection(section);
    try { localStorage.setItem('activeSection', section); } catch (e) { }
  };

  const [worldSubmenuOpen, setWorldSubmenuOpen] = useState(() => {
    try {
      const v = localStorage.getItem('worldSubmenuOpen');
      return v === null ? true : v === 'true';
    } catch (e) {
      return true;
    }
  });

  const [arcSubmenuOpen, setArcSubmenuOpen] = useState(() => {
    try {
      const v = localStorage.getItem('arcSubmenuOpen');
      return v === null ? true : v === 'true';
    } catch (e) {
      return true;
    }
  });

  const toggleWorldSubmenu = () => {
    setWorldSubmenuOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('worldSubmenuOpen', next ? 'true' : 'false'); } catch (e) { }
      return next;
    });
  };

  const toggleArcSubmenu = () => {
    setArcSubmenuOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('arcSubmenuOpen', next ? 'true' : 'false'); } catch (e) { }
      return next;
    });
  };

  const handleWorldNavClick = () => {
    if (activeView !== 'world') {
      handleSetActiveView('world');
      setWorldSubmenuOpen(true);
      try { localStorage.setItem('worldSubmenuOpen', 'true'); } catch (e) { }
    } else {
      toggleWorldSubmenu();
    }
  };

  const handleArcNavClick = () => {
    if (activeView !== 'arc-chat' && activeView !== 'arc-manager') {
      handleSetActiveView('arc-chat');
      setArcSubmenuOpen(true);
      try { localStorage.setItem('arcSubmenuOpen', 'true'); } catch (e) { }
    } else {
      toggleArcSubmenu();
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
    { id: 'content', label: 'Items', icon: '🎒' },
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
                <h3 style={styles.navTitle}>Navigation</h3>

                {/* World Builder Section */}
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ ...styles.navTitle, fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                    World Building
                  </h4>

                  <NavButton
                    label="Build World Chat"
                    icon="💬"
                    active={activeView === 'world-chat'}
                    onClick={() => handleSetActiveView('world-chat')}
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
                          onClick={() => handleSetActiveSection(section.id)}
                        >
                          <span style={styles.navIcon}>{section.icon}</span>
                          <span>{section.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
            <main style={styles.centerPanel}>
              {activeView === 'world-chat' && <WorldBuilderChat selectedModel={selectedModel} />}
              {activeView === 'world' && <WorldBuilder activeSection={activeSection} setActiveSection={handleSetActiveSection} />}
            </main>
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
        </div>
      </div>
    </div>
  );
}

export default App;