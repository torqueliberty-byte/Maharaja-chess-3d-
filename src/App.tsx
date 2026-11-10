import { useEffect, useRef, useState } from 'react';
import { initWizardChess } from './wizardChessEngine.js';

const LOGO_URL = '/assets/aistudio/maharaja_chess_3d_512_a978d0b9.png';

interface WizardChessSettings {
  combatCamera: boolean;
  showMoveHighlights: boolean;
  autoFlipHumanCamera: boolean;
}

interface WizardChessAPI {
  toggleUI?: (force?: boolean) => void;
  startAIMode?: (color: 'w' | 'b') => void;
  startHumanMode?: () => void;
  undoLastMove?: () => boolean;
  resetChessBoard?: (orientCamera?: boolean, preserveScript?: boolean) => void;
  updateSettings?: (partial: Partial<WizardChessSettings>) => WizardChessSettings;
  getSettings?: () => WizardChessSettings;
}

function getEngine(): WizardChessAPI | undefined {
  return (window as unknown as { wizardChess?: WizardChessAPI }).wizardChess;
}

export default function App() {
  const initializedRef = useRef(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiSide, setAiSide] = useState<'w' | 'b'>('w');
  const [activeMode, setActiveMode] = useState<'ai' | 'human'>('ai');
  const [settings, setSettings] = useState<WizardChessSettings>({
    combatCamera: true,
    showMoveHighlights: true,
    autoFlipHumanCamera: true
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initWizardChess();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSheetOpen(false);
        setSettingsOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRestoreUI = () => {
    const eng = getEngine();
    if (eng?.toggleUI) {
      eng.toggleUI(false);
    } else {
      document.body.classList.remove('cinematic-ui-hidden');
      const btnHide = document.getElementById('btn-hide-ui');
      if (btnHide) btnHide.textContent = 'Hide UI [H]';
    }
  };

  const handleStartAI = (side: 'w' | 'b' = aiSide) => {
    setAiSide(side);
    setActiveMode('ai');
    setMenuOpen(false);
    setSettingsOpen(false);
    setMobileSheetOpen(false);
    getEngine()?.startAIMode?.(side);
  };

  const handleStartHuman = () => {
    setActiveMode('human');
    setMenuOpen(false);
    setSettingsOpen(false);
    setMobileSheetOpen(false);
    getEngine()?.startHumanMode?.();
  };

  const handleToggleSetting = (key: keyof WizardChessSettings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key], autoFlipHumanCamera: true };
      getEngine()?.updateSettings?.(next);
      return next;
    });
  };

  return (
    <>
      <div id="loading-overlay">
        <img
          src={LOGO_URL}
          alt="Maharaja Chess 3D Logo"
          className="loader-logo"
        />
        <div className="loader-title">Maharaja Chess 3D</div>
        <div className="loader-bar-wrap">
          <div className="loader-bar" id="loader-bar"></div>
        </div>
        <div id="loader-text">Summoning Magical Castle &amp; Sculpted Chess Pieces...</div>
      </div>

      <div id="canvas-container"></div>

      {/* ===================================================================
          CINEMATIC FANTASY MAIN MENU OVERLAY (Over Live 3D Castle & Portal)
          =================================================================== */}
      <div
        id="main-menu-overlay"
        className={`main-menu-overlay ${menuOpen ? 'open' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="main-menu-title"
      >
        <div className="main-menu-card">
          <div className="main-menu-logo-wrap">
            <img
              src={LOGO_URL}
              alt="Maharaja Chess 3D Official Logo"
              className="main-menu-logo-img"
            />
          </div>

          <h1 className="main-menu-title" id="main-menu-title">
            MAHARAJA CHESS 3D
          </h1>
          <div className="main-menu-subtitle">
            Royal Sanctum • 3D Floating Castle Arena
          </div>
          <div className="main-menu-divider"></div>

          {/* AI Color Selection Bar */}
          <div className="menu-color-selector" aria-label="Select your piece color for AI Mode">
            <span className="menu-color-label">AI Mode Player Side</span>
            <div className="menu-color-options">
              <button
                type="button"
                className={`menu-color-pill ${aiSide === 'w' ? 'active' : ''}`}
                id="btn-menu-side-white"
                onClick={() => setAiSide('w')}
              >
                <span className="color-swatch-dot white"></span>
                White
              </button>
              <button
                type="button"
                className={`menu-color-pill ${aiSide === 'b' ? 'active' : ''}`}
                id="btn-menu-side-black"
                onClick={() => setAiSide('b')}
              >
                <span className="color-swatch-dot black"></span>
                Black
              </button>
            </div>
          </div>

          {/* Primary Mode Buttons */}
          <div className="main-menu-actions">
            <button
              type="button"
              className="menu-primary-btn gold-btn"
              id="btn-menu-play-ai"
              onClick={() => handleStartAI(aiSide)}
            >
              <div className="menu-btn-icon">⚔️</div>
              <div className="menu-btn-copy">
                <span className="menu-btn-title">PLAY WITH AI</span>
                <span className="menu-btn-sub">
                  Human vs Computer • Playing as {aiSide === 'w' ? 'White' : 'Black'}
                </span>
              </div>
            </button>

            <button
              type="button"
              className="menu-primary-btn royal-btn"
              id="btn-menu-play-human"
              onClick={handleStartHuman}
            >
              <div className="menu-btn-icon">👑</div>
              <div className="menu-btn-copy">
                <span className="menu-btn-title">PLAY WITH HUMAN</span>
                <span className="menu-btn-sub">
                  2 Players on Same Device • Auto-Rolls Board Each Turn
                </span>
              </div>
            </button>
          </div>

          {/* Secondary Menu Row: Settings */}
          <div className="main-menu-secondary-row">
            <button
              type="button"
              className="menu-secondary-btn"
              id="btn-menu-settings"
              onClick={() => setSettingsOpen(true)}
            >
              ⚙ Settings
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          SETTINGS MODAL (Accessible from Main Menu and In-Game)
          =================================================================== */}
      {settingsOpen && (
        <div
          className="settings-modal-backdrop"
          id="settings-modal"
          onClick={() => setSettingsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
        >
          <div
            className="settings-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-modal-header">
              <div className="settings-header-brand">
                <img
                  src={LOGO_URL}
                  alt="Maharaja Chess 3D"
                  className="settings-header-logo"
                />
                <h2 className="settings-modal-title" id="settings-modal-title">
                  Maharaja Chess 3D Settings
                </h2>
              </div>
              <button
                type="button"
                className="settings-close-btn"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close Settings"
              >
                ✕
              </button>
            </div>

            <div className="settings-modal-body">
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">AI Mode Player Color</div>
                  <div className="settings-row-desc">Select which side you command against the AI</div>
                </div>
                <div className="settings-segmented">
                  <button
                    type="button"
                    className={`settings-seg-btn ${aiSide === 'w' ? 'active' : ''}`}
                    onClick={() => {
                      setAiSide('w');
                      if (!menuOpen && activeMode === 'ai') {
                        handleStartAI('w');
                      }
                    }}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    className={`settings-seg-btn ${aiSide === 'b' ? 'active' : ''}`}
                    onClick={() => {
                      setAiSide('b');
                      if (!menuOpen && activeMode === 'ai') {
                        handleStartAI('b');
                      }
                    }}
                  >
                    Black
                  </button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">Front Capture Duel Camera</div>
                  <div className="settings-row-desc">
                    Glide in to the front close-up view when a piece is captured
                  </div>
                </div>
                <button
                  type="button"
                  className={`settings-toggle-btn ${settings.combatCamera ? 'on' : 'off'}`}
                  onClick={() => handleToggleSetting('combatCamera')}
                >
                  {settings.combatCamera ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">Legal Move Highlights</div>
                  <div className="settings-row-desc">
                    Show glowing rings and target dots for legal chess moves
                  </div>
                </div>
                <button
                  type="button"
                  className={`settings-toggle-btn ${settings.showMoveHighlights ? 'on' : 'off'}`}
                  onClick={() => handleToggleSetting('showMoveHighlights')}
                >
                  {settings.showMoveHighlights ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="settings-modal-footer">
              <button
                type="button"
                className="hud-btn primary"
                onClick={() => setSettingsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="hud-btn mobile-only-restore-ui"
        id="btn-mobile-show-ui"
        onClick={handleRestoreUI}
        title="Show HUD Controls"
      >
        Show UI
      </button>

      {/* ===================================================================
          IN-GAME TOP HUD BAR
          =================================================================== */}
      <div id="hud-top" className={menuOpen ? 'menu-hidden-hud' : ''}>
        <div className="hud-group" id="hud-left">
          <div className="brand-pill">
            <img
              src={LOGO_URL}
              alt="Maharaja Chess 3D"
              className="brand-logo-img"
            />
            <span className="brand-title">Maharaja Chess 3D</span>
          </div>
          <div className="status-pill" id="status-pill">
            <span className="turn-dot" id="turn-dot"></span>
            <span id="turn-text">WHITE TO MOVE</span>
            <span className="mode-badge" id="mode-badge">
              {activeMode === 'human' ? 'Human vs Human' : `AI Mode • ${aiSide === 'w' ? 'White' : 'Black'}`}
            </span>
          </div>
        </div>

        <div className="mobile-top-quick-actions">
          <button
            type="button"
            className="hud-btn mobile-quick-btn"
            onClick={() => getEngine()?.undoLastMove?.()}
            title="Undo Last Move"
          >
            Undo
          </button>
          <button
            type="button"
            className="hud-btn mobile-quick-btn"
            onClick={() => {
              setMobileSheetOpen(false);
              setMenuOpen(true);
            }}
            title="Back to Main Menu"
          >
            Menu
          </button>
          <button
            type="button"
            className={`hud-btn mobile-controls-trigger ${mobileSheetOpen ? 'active' : ''}`}
            id="btn-mobile-controls"
            aria-expanded={mobileSheetOpen}
            aria-controls="hud-right"
            onClick={() => setMobileSheetOpen((prev) => !prev)}
          >
            {mobileSheetOpen ? 'Close' : 'Controls'}
          </button>
        </div>

        <div
          className={`mobile-sheet-backdrop ${mobileSheetOpen ? 'open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileSheetOpen(false);
          }}
          aria-hidden="true"
        ></div>

        <div
          className={`hud-group ${mobileSheetOpen ? 'mobile-sheet-open' : ''}`}
          id="hud-right"
        >
          <div
            className="mobile-sheet-handle-wrap"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSheetOpen(false);
            }}
            aria-hidden="true"
          >
            <div className="mobile-sheet-handle"></div>
          </div>

          <div className="mobile-sheet-header">
            <span className="mobile-sheet-title">Game Controls</span>
            <button
              type="button"
              className="mobile-sheet-close"
              id="btn-mobile-sheet-close"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSheetOpen(false);
              }}
              aria-label="Close Controls"
            >
              Close ✕
            </button>
          </div>

          <div className="mobile-sheet-section-label">Game Actions</div>

          <button
            className="hud-btn"
            id="btn-undo"
            title="Undo last move"
            onClick={() => setMobileSheetOpen(false)}
          >
            Undo
          </button>

          <button
            className="hud-btn"
            id="btn-reset"
            title="Restart the current game"
            onClick={() => setMobileSheetOpen(false)}
          >
            Restart
          </button>

          <button
            className="hud-btn"
            id="btn-side-toggle"
            title="Switch between Playing as White and Playing as Black (AI Mode)"
            onClick={() => {
              setAiSide((prev) => (prev === 'w' ? 'b' : 'w'));
              setMobileSheetOpen(false);
            }}
          >
            Play as Black
          </button>

          <button
            className="hud-btn"
            id="btn-ai-move"
            title="Let the AI make the next move immediately"
            onClick={() => setMobileSheetOpen(false)}
          >
            AI Move
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">Menu &amp; Display</div>

          <button
            type="button"
            className="hud-btn"
            id="btn-open-settings"
            title="Open Settings"
            onClick={() => {
              setMobileSheetOpen(false);
              setSettingsOpen(true);
            }}
          >
            Settings
          </button>

          <button
            className="hud-btn"
            id="btn-hide-ui"
            title="Toggle HUD visibility (Shortcut: H)"
            onClick={() => setMobileSheetOpen(false)}
          >
            Hide UI [H]
          </button>

          <button
            type="button"
            className="hud-btn primary"
            id="btn-back-menu"
            title="Return to Main Menu"
            onClick={() => {
              setMobileSheetOpen(false);
              setMenuOpen(true);
            }}
          >
            Back to Menu
          </button>

          <div className="mobile-sheet-hint">
            <strong>Touch:</strong> Tap Piece to Select &amp; Tap Square to Move
          </div>
        </div>
      </div>

      {/* ===================================================================
          IN-GAME BOTTOM HUD BAR
          =================================================================== */}
      <div id="hud-bottom" className={menuOpen ? 'menu-hidden-hud' : ''}>
        <div className="hint-pill" id="controls-hint">
          <strong>
            {activeMode === 'human' ? 'Human vs Human:' : 'AI Mode:'}
          </strong>{' '}
          Tap/Click Piece to Select &amp; Move &nbsp;•&nbsp; Undo &amp; Restart Available Above
        </div>
        <div className="captured-pill" id="captured-tray"></div>
      </div>

      {/* ===================================================================
          CHECKMATE OVERLAY BANNER
          =================================================================== */}
      <div id="checkmate-overlay" role="status" aria-live="polite">
        <div className="checkmate-banner">
          <div className="checkmate-ornament">✦ &nbsp; Sanctum Judgment &nbsp; ✦</div>
          <div className="checkmate-crown" id="checkmate-crown">♔</div>
          <div className="checkmate-title" id="checkmate-title">Checkmate</div>
          <div className="checkmate-rule"></div>
          <div className="checkmate-subtitle" id="checkmate-subtitle">
            White Triumphs • The Black King Has Fallen
          </div>
          <div className="checkmate-actions">
            <button className="checkmate-btn" id="btn-checkmate-replay" type="button">
              Replay King Fall
            </button>
            <button className="checkmate-btn" id="btn-checkmate-newgame" type="button">
              Play Again
            </button>
            <button className="checkmate-btn secondary" id="btn-checkmate-undo" type="button">
              Undo Move
            </button>
            <button
              className="checkmate-btn secondary"
              type="button"
              onClick={() => {
                getEngine()?.resetChessBoard?.(true, false);
                setMenuOpen(true);
              }}
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
