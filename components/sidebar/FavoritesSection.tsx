'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoritesSectionProps {
  count: number;
  isActive: boolean;
  onToggle: () => void;
}

export function FavoritesSection({ count, isActive, onToggle }: FavoritesSectionProps) {
  return (
    <div className="favorites-section">
      <div className="section-title">FAVORITES</div>
      <button
        onClick={onToggle}
        className={cn('favorites-btn', isActive && 'active')}
      >
        <div className="icon-wrapper">
          <Heart className={cn('h-4 w-4 icon', isActive && 'fill-current')} />
        </div>
        <span className="label">My Favorites</span>
        <span className="count">{count}</span>
      </button>
    </div>
  );
}
