'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = 'pwa-install-dismissed';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already installed (standalone mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the prompt permanently
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Capture the beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  // Dismiss the prompt forever
  const dismissForever = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
    setCanInstall(false);
  }, []);

  // Dismiss temporarily (just close the popup)
  const dismissTemporarily = useCallback(() => {
    setCanInstall(false);
  }, []);

  return {
    canInstall,
    isInstalled,
    isDismissed,
    promptInstall,
    dismissForever,
    dismissTemporarily,
  };
}
