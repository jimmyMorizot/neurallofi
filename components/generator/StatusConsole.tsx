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
    <div ref={containerRef} className="status-console">
      {messages.length === 0 ? (
        <div className="line">
          &gt; System Ready{showCursor && <span className="cursor-blink">_</span>}
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className={cn('line', message.type)}>
              &gt; {message.text}
            </div>
          ))}
          {showCursor && (
            <div className="line">
              &gt; <span className="cursor-blink">_</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
