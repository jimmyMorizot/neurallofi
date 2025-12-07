/**
 * Tests for components/player/Visualizer.tsx
 */

import { render, act } from '@testing-library/react';
import { Visualizer } from '@/components/player/Visualizer';

describe('Visualizer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render 5 visualizer bars', () => {
      const { container } = render(<Visualizer isPlaying={false} />);

      const bars = container.querySelectorAll('.visualizer-bar');
      expect(bars).toHaveLength(5);
    });

    it('should have visualizer container class', () => {
      const { container } = render(<Visualizer isPlaying={false} />);

      const visualizer = container.querySelector('.visualizer');
      expect(visualizer).toBeInTheDocument();
    });

    it('should have paused class when not playing', () => {
      const { container } = render(<Visualizer isPlaying={false} />);

      const visualizer = container.querySelector('.visualizer');
      expect(visualizer).toHaveClass('paused');
    });

    it('should not have paused class when playing', () => {
      const { container } = render(<Visualizer isPlaying={true} />);

      const visualizer = container.querySelector('.visualizer');
      expect(visualizer).not.toHaveClass('paused');
    });
  });

  describe('initial heights', () => {
    it('should have initial heights when not playing', () => {
      const { container } = render(<Visualizer isPlaying={false} />);

      const bars = container.querySelectorAll('.visualizer-bar');
      // Initial heights are [40, 60, 80, 50, 70]
      expect(bars[0]).toHaveStyle({ height: '40%' });
      expect(bars[1]).toHaveStyle({ height: '60%' });
      expect(bars[2]).toHaveStyle({ height: '80%' });
      expect(bars[3]).toHaveStyle({ height: '50%' });
      expect(bars[4]).toHaveStyle({ height: '70%' });
    });
  });

  describe('animation', () => {
    it('should use getFrequencyData when provided and playing', () => {
      const mockGetFrequencyData = jest.fn().mockReturnValue([30, 50, 70, 40, 60]);

      render(<Visualizer isPlaying={true} getFrequencyData={mockGetFrequencyData} />);

      // Advance timer to trigger animation frame callback
      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(mockGetFrequencyData).toHaveBeenCalled();
    });

    it('should reset to initial heights when playback stops', () => {
      const { container, rerender } = render(<Visualizer isPlaying={true} />);

      // Stop playback
      rerender(<Visualizer isPlaying={false} />);

      const bars = container.querySelectorAll('.visualizer-bar');
      // Should reset to initial heights
      expect(bars[0]).toHaveStyle({ height: '40%' });
      expect(bars[2]).toHaveStyle({ height: '80%' });
    });
  });
});
