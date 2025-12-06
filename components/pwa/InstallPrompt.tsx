'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallPrompt() {
  const {
    canInstall,
    isInstalled,
    isDismissed,
    promptInstall,
    dismissForever,
    dismissTemporarily,
  } = usePWAInstall();

  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show with animation after a short delay
  useEffect(() => {
    if (canInstall && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [canInstall, isInstalled, isDismissed]);

  const handleDismiss = () => {
    if (dontAskAgain) {
      dismissForever();
    } else {
      dismissTemporarily();
    }
    setIsVisible(false);
  };

  const handleInstall = async () => {
    await promptInstall();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-prompt">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="pwa-prompt-close"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Icon */}
      <div className="pwa-prompt-icon">
        <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
          <defs>
            <linearGradient id="promptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6fe7f3"/>
              <stop offset="100%" stopColor="#f72585"/>
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="96" fill="#0b0c24"/>
          <path
            d="M160 380V132L352 380V132"
            stroke="url(#promptGrad)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="pwa-prompt-content">
        <h3 className="pwa-prompt-title">Installer Neural Lofi</h3>
        <p className="pwa-prompt-description">
          Acces rapide et experience optimale, meme hors ligne
        </p>
      </div>

      {/* Actions */}
      <div className="pwa-prompt-actions">
        <button onClick={handleInstall} className="pwa-prompt-install">
          <Download className="h-4 w-4" />
          Installer
        </button>
        <button onClick={handleDismiss} className="pwa-prompt-later">
          Plus tard
        </button>
      </div>

      {/* Don't ask again checkbox */}
      <label className="pwa-prompt-checkbox">
        <input
          type="checkbox"
          checked={dontAskAgain}
          onChange={(e) => setDontAskAgain(e.target.checked)}
        />
        <span>Ne plus me demander</span>
      </label>
    </div>
  );
}
