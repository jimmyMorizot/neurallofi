'use client';

import { Play, Pause, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { Track } from '@/types';
import { STYLE_CONFIG, STYLE_COLORS } from '@/types';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function TrackCard({ track, isPlaying, onPlay, onPause }: TrackCardProps) {
  const styleConfig = STYLE_CONFIG[track.style];
  const styleColor = STYLE_COLORS[track.style];

  return (
    <Card
      className={cn(
        'glass relative transition-all duration-300 hover:-translate-y-1 hover:border-white/20',
        'hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]',
        isPlaying && 'track-playing'
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* Track Info */}
          <div>
            <h3 className="font-mono text-sm font-bold truncate mb-2">
              {track.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn('text-xs', styleColor)}>
                {styleConfig.icon} {styleConfig.label.split(' ')[0]}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground border-muted">
                v{track.version}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(track.date)}</span>
              <span>•</span>
              <span>{track.size}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                  className="hover:bg-[var(--neon-magenta)]/20 hover:text-[var(--neon-magenta)]"
                >
                  <a href={track.url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download MP3</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={isPlaying ? onPause : onPlay}
                  className={cn(
                    'w-10 h-10 rounded-full',
                    'bg-[var(--neon-purple)] border-[var(--neon-purple)]',
                    'hover:bg-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]',
                    'hover:shadow-[0_0_15px_var(--neon-cyan)]'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
