'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function GenerateButton({ onClick, isLoading, disabled }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={cn(
        'btn-generate',
        isLoading && 'loading'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Initialize AI'
      )}
    </button>
  );
}
