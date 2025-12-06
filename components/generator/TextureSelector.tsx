'use client';

import { cn } from '@/lib/utils';
import { TEXTURE_CONFIG, type TextureType } from '@/types';

interface TextureSelectorProps {
  selected: TextureType[];
  onToggle: (texture: TextureType) => void;
  disabled?: boolean;
}

const textures: TextureType[] = ['rain', 'vinyl', 'city', 'typing'];

export function TextureSelector({ selected, onToggle, disabled }: TextureSelectorProps) {
  return (
    <div>
      <div className="section-title">Textures</div>
      <div className="flex gap-2 flex-wrap">
        {textures.map((texture) => {
          const config = TEXTURE_CONFIG[texture];
          const isActive = selected.includes(texture);

          return (
            <button
              key={texture}
              onClick={() => onToggle(texture)}
              disabled={disabled}
              className={cn(
                'texture-btn',
                isActive && 'active',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {config.icon} {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
