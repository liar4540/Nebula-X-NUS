import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { TRAIN_CONFIGS } from '../../data/trainConfigs';
import { useTheme } from '../../hooks/useTheme';
import { restartTour } from '../ui/GuidedTour';
import { Settings, Sun, Moon, BookOpen } from 'lucide-react';

export function TopBar() {
  const selectedTrain = useStore(s => s.selectedTrain);
  const setSelectedTrain = useStore(s => s.setSelectedTrain);
  const globalStatus = useStore(s => s.globalStatus);
  const demoMode = useStore(s => s.demoMode);
  const setDemoMode = useStore(s => s.setDemoMode);
  const subsystemHealth = useStore(s => s.subsystemHealth);
  const { theme, toggleTheme } = useTheme();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  // Fleet health: % of subsystems that are normal
  const normalCount = Object.values(subsystemHealth).filter(s => s < 0.3).length;
  const fleetPercent = Math.round((normalCount / 4) * 100);

  const statusLabel = globalStatus === 'anomaly'
    ? 'ANOMALY DETECTED'
    : globalStatus === 'evaluating'
      ? 'EVALUATING'
      : 'ALL SYSTEMS NORMAL';

  // Group trains by line
  const lineGroups = TRAIN_CONFIGS.reduce((acc, train) => {
    if (!acc[train.line]) acc[train.line] = [];
    acc[train.line].push(train);
    return acc;
  }, {} as Record<string, typeof TRAIN_CONFIGS>);

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <span className="logo-mark">NEBULA DTWIN</span>

          <select
            className="train-selector"
            value={selectedTrain.id}
            onChange={(e) => setSelectedTrain(e.target.value)}
          >
            {Object.entries(lineGroups).map(([line, trains]) => (
              <optgroup key={line} label={line}>
                {trains.map(train => (
                  <option key={train.id} value={train.id}>
                    {train.model} / Car {train.carNumber}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className={`status-pill ${globalStatus}`}>
            <div className="status-dot" />
            {statusLabel}
          </div>
        </div>

        <div className="topbar-right">
          <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
            Fleet Status: {fleetPercent}% Normal
          </span>

          <div
            className="demo-badge"
            onClick={() => setDemoMode(!demoMode)}
          >
            Demo Mode [{demoMode ? 'ON' : 'OFF'}]
          </div>

          {/* Settings gear */}
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
              className="playback-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{ width: 32, height: 32 }}
            >
              <Settings size={15} />
            </button>

            {settingsOpen && (
              <div className="settings-dropdown">
                {/* Theme toggle */}
                <button className="settings-item" onClick={toggleTheme}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <div className={`theme-switch ${theme === 'light' ? 'active' : ''}`}>
                    <div className="theme-switch-knob" />
                  </div>
                </button>

                {/* Restart tutorial */}
                <button
                  className="settings-item"
                  onClick={() => {
                    setSettingsOpen(false);
                    restartTour();
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={14} />
                    Restart Tutorial
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
