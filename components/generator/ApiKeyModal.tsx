'use client';

import { useState } from 'react';
import { Key, AlertTriangle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveApiKey: (apiKey: string) => void;
}

export function ApiKeyModal({
  open,
  onOpenChange,
  onSaveApiKey,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSaveApiKey(apiKey.trim());
      setApiKey('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="api-key-modal-content">
        {/* Icon avec effet glow */}
        <div className="api-key-modal-icon">
          <div className="icon-wrapper">
            <AlertTriangle className="h-8 w-8" strokeWidth={2} />
          </div>
        </div>

        {/* Header */}
        <div className="api-key-modal-header">
          <h3 className="api-key-modal-title">API Credits Exhausted</h3>
          <p className="api-key-modal-description">
            The server has reached its API credit limit. Add your own key to continue generating music.
          </p>
        </div>

        {/* Info Box */}
        <div className="api-key-modal-info">
          <p className="info-text">
            Your API key will be stored <strong className="text-cyan-400">locally in your browser</strong> and
            sent directly to MusicGPT. We never store or log your key on our servers.
          </p>
          <a
            href="https://musicgpt.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="info-link"
          >
            Get your API key at MusicGPT
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="api-key-modal-form">
          <div className="form-group">
            <label htmlFor="api-key" className="form-label">
              <Key className="h-4 w-4" />
              Your MusicGPT API Key
            </label>
            <div className="input-wrapper">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="api-key-input"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="toggle-visibility"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Security notice */}
          <div className="security-notice">
            <span className="notice-icon">🔒</span>
            <span className="notice-text">
              Stored locally only. Never logged on our servers.
            </span>
          </div>

          {/* Actions */}
          <div className="api-key-modal-actions">
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="action-save"
            >
              <Key className="h-4 w-4" />
              Save API Key
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="action-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
