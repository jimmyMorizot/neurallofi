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
    <div className="space-y-3">
      <div className="section-title">Add Textures</div>
      <div className="flex flex-wrap gap-3">
        {textures.map((texture) => {
          const config = TEXTURE_CONFIG[texture];
          const isActive = selected.includes(texture);

          return (
            <button
              key={texture}
              onClick={() => onToggle(texture)}
              disabled={disabled}
              className={cn(
                'flex-1 min-w-[45%] flex items-center gap-2 px-3 py-2.5 rounded-md border transition-all duration-200',
                'bg-transparent border-white/[0.08] text-muted-foreground',
                'hover:text-white hover:border-white/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive && 'texture-active'
              )}
            >
              <span>{config.icon}</span>
              <span className="text-sm">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
