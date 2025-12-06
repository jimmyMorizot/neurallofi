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
    <div>
      <div className="section-title">Musical Style</div>
      <div className="style-grid">
        {styles.map((style) => {
          const config = STYLE_CONFIG[style];
          const isSelected = selected === style;

          return (
            <button
              key={style}
              onClick={() => onSelect(style)}
              disabled={disabled}
              className={cn(
                'style-card',
                isSelected && 'selected',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {config.icon} {config.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
