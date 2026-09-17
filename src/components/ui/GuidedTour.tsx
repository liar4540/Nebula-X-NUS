import { useState, useEffect, useCallback, useRef } from 'react';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement: 'bottom' | 'top' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour-id="3d-twin"]',
    title: '3D Digital Twin',
    description:
      'Click and drag to rotate the carriage. Scroll to zoom. Click on bogies, doors, brakes, or HVAC to inspect health status.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour-id="subsystem-health"]',
    title: 'Subsystem Health',
    description:
      'View real-time anomaly scores for each subsystem. Green = Normal, Orange = Warning, Red = Broken. Click any card to focus the 3D camera.',
    placement: 'right',
  },
  {
    targetSelector: '[data-tour-id="fault-injection"]',
    title: 'Fault Injection',
    description:
      'Simulate component failures live during your demo. Watch the digital twin react with colour changes and the ML models flag the degradation.',
    placement: 'top',
  },
  {
    targetSelector: '[data-tour-id="ml-diagnostics"]',
    title: 'ML Diagnostics',
    description:
      'Compare how Isolation Forest, Autoencoder, and LSTM models detect degradation. SHAP bars show which sensor features drive each alert.',
    placement: 'left',
  },
];

const STORAGE_KEY = 'smrt_tour_completed';

export function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-launch on first visit
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let DOM render
      const timer = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom restart event
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setActive(true);
    };
    window.addEventListener('restart-tour', handler);
    return () => window.removeEventListener('restart-tour', handler);
  }, []);

  // Measure target element
  useEffect(() => {
    if (!active) return;
    const currentStep = TOUR_STEPS[step];
    if (!currentStep) return;

    const measure = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        setSpotlightRect(el.getBoundingClientRect());
      }
    };

    measure();
    // Remeasure on resize
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, step]);

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setActive(false);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  if (!active || !spotlightRect) return null;

  const currentStep = TOUR_STEPS[step];
  const padding = 8;

  // Compute popover position
  const popoverStyle: React.CSSProperties = {};
  switch (currentStep.placement) {
    case 'bottom':
      popoverStyle.top = spotlightRect.bottom + padding + 12;
      popoverStyle.left = Math.max(16, Math.min(
        window.innerWidth - 356,
        spotlightRect.left + spotlightRect.width / 2 - 170
      ));
      break;
    case 'top':
      popoverStyle.bottom = window.innerHeight - spotlightRect.top + padding + 12;
      popoverStyle.left = Math.max(16, Math.min(
        window.innerWidth - 356,
        spotlightRect.left + spotlightRect.width / 2 - 170
      ));
      break;
    case 'right':
      popoverStyle.top = Math.max(16, spotlightRect.top + spotlightRect.height / 2 - 80);
      popoverStyle.left = Math.min(
        window.innerWidth - 356,
        spotlightRect.right + padding + 12
      );
      break;
    case 'left':
      popoverStyle.top = Math.max(16, spotlightRect.top + spotlightRect.height / 2 - 80);
      popoverStyle.right = Math.max(16, window.innerWidth - spotlightRect.left + padding + 12);
      break;
  }

  return (
    <div className="tour-overlay">
      {/* Full-screen backdrop that blocks interaction */}
      <div className="tour-backdrop" onClick={handleSkip} />

      {/* Spotlight cutout */}
      <div
        className="tour-spotlight"
        style={{
          top: spotlightRect.top - padding,
          left: spotlightRect.left - padding,
          width: spotlightRect.width + padding * 2,
          height: spotlightRect.height + padding * 2,
        }}
      />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="tour-popover"
        style={popoverStyle}
        key={step} // Re-trigger animation on step change
      >
        <div className="tour-step-badge">
          Step {step + 1} of {TOUR_STEPS.length}
        </div>
        <div className="tour-title">{currentStep.title}</div>
        <div className="tour-description">{currentStep.description}</div>

        <div className="tour-actions">
          <div className="tour-dots">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`tour-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tour-btn" onClick={handleSkip}>
              Skip
            </button>
            <button className="tour-btn tour-btn-primary" onClick={handleNext}>
              {step < TOUR_STEPS.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Call this to restart the tour from any component */
export function restartTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('restart-tour'));
}
