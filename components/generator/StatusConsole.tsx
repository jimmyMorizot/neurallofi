'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ConsoleMessage } from '@/types';

interface StatusConsoleProps {
  messages: ConsoleMessage[];
  showCursor?: boolean;
}

export function StatusConsole({ messages, showCursor = true }: StatusConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="bg-black border border-white/10 rounded-md p-4 min-h-[100px] max-h-[150px] overflow-y-auto font-mono text-xs"
    >
      {messages.length === 0 ? (
        <div className="console-line info">
          <span>&gt;</span>
          <span>Waiting for input</span>
          {showCursor && <span className="cursor-blink">_</span>}
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className={cn('console-line', message.type)}>
              <span>&gt;</span>
              <span>{message.text}</span>
            </div>
          ))}
          {showCursor && (
            <div className="console-line">
              <span className="cursor-blink">_</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
