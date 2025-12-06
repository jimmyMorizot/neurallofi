'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function GenerateButton({ onClick, isLoading, disabled }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={cn(
        'w-full h-12 text-base font-bold uppercase tracking-widest transition-all duration-300',
        'bg-gradient-to-r from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10',
        'border border-[var(--neon-cyan)] text-[var(--neon-cyan)]',
        'hover:bg-[var(--neon-cyan)] hover:text-black',
        'hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isLoading && 'btn-generate-loading pointer-events-none border-muted text-muted-foreground bg-black/30'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Initiate Sequence
        </>
      )}
    </Button>
  );
}
