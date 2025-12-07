'use client';

import { useState } from 'react';
import { Key, AlertTriangle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveApiKey: (apiKey: string) => void;
  errorMessage?: string;
}

export function ApiKeyModal({
  open,
  onOpenChange,
  onSaveApiKey,
  errorMessage,
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
      <DialogContent className="api-key-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            API Credits Exhausted
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {errorMessage || 'The server API credits have been exhausted.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4">
            <p className="text-sm text-gray-300 mb-3">
              To continue generating music, you can add your own MusicGPT API key.
              Your key will be stored <strong className="text-cyan-400">locally in your browser</strong> and
              will never be sent to our servers.
            </p>
            <a
              href="https://musicgpt.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Get your API key at MusicGPT
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
                <Key className="h-4 w-4 inline mr-1" />
                Your MusicGPT API Key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="w-full px-3 py-2 pr-10 bg-gray-900 border border-gray-600 rounded-lg
                           text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400
                           focus:ring-1 focus:ring-cyan-400 font-mono text-sm"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-yellow-400">*</span>
              <span>
                Your API key is stored only in your browser&apos;s localStorage and is sent directly
                to MusicGPT. We never store or log your key on our servers.
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600
                         disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium
                         transition-colors"
              >
                Save API Key
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
