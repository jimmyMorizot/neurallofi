'use client';

import { cn } from '@/lib/utils';
import { STYLE_CONFIG, type MusicStyle } from '@/types';

interface StyleSelectorProps {
  selected: MusicStyle;
  onSelect: (style: MusicStyle) => void;
  disabled?: boolean;
}

const styles: MusicStyle[] = ['classic', 'indian', 'african', 'asian', 'latino'];

export function StyleSelector({ selected, onSelect, disabled }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="section-title">Select Style</div>
      <div className="grid grid-cols-2 gap-3">
        {styles.map((style) => {
          const config = STYLE_CONFIG[style];
          const isSelected = selected === style;

          return (
            <button
              key={style}
              onClick={() => onSelect(style)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-300',
                'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:-translate-y-0.5',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                isSelected && 'style-card-selected'
              )}
            >
              <span
                className={cn(
                  'text-2xl transition-transform duration-300',
                  isSelected && 'scale-110'
                )}
              >
                {config.icon}
              </span>
              <span className="text-sm font-medium">{config.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
