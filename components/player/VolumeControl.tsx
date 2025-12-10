'use client';

import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

export function VolumeControl({
  volume,
  onVolumeChange,
  disabled,
}: VolumeControlProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleMuteToggle = () => {
    onVolumeChange(volume === 0 ? 0.8 : 0);
  };

  return (
    <div className="volume-control-wrapper flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMuteToggle}
        disabled={disabled}
        className="text-muted-foreground hover:text-white hover:bg-transparent h-8 w-8"
      >
        <VolumeIcon className="h-4 w-4" />
      </Button>

      <Slider
        value={[volume * 100]}
        onValueChange={([value]) => onVolumeChange(value / 100)}
        max={100}
        step={1}
        disabled={disabled}
        className={cn('w-20', disabled && 'opacity-50')}
      />
    </div>
  );
}
