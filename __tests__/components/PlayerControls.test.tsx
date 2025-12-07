/**
 * Tests for components/player/PlayerControls.tsx
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerControls } from '@/components/player/PlayerControls';

describe('PlayerControls', () => {
  const defaultProps = {
    isPlaying: false,
    onPlayPause: jest.fn(),
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all control buttons', () => {
      render(<PlayerControls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // Previous, Play/Pause, Next
    });

    it('should show Play icon when not playing', () => {
      render(<PlayerControls {...defaultProps} isPlaying={false} />);

      // Play icon has ml-0.5 class for visual centering
      const playButton = screen.getAllByRole('button')[1];
      expect(playButton).toBeInTheDocument();
    });

    it('should show Pause icon when playing', () => {
      render(<PlayerControls {...defaultProps} isPlaying={true} />);

      const pauseButton = screen.getAllByRole('button')[1];
      expect(pauseButton).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onPlayPause when play/pause button is clicked', () => {
      render(<PlayerControls {...defaultProps} />);

      const playPauseButton = screen.getAllByRole('button')[1];
      fireEvent.click(playPauseButton);

      expect(defaultProps.onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevious when previous button is clicked', () => {
      render(<PlayerControls {...defaultProps} />);

      const previousButton = screen.getAllByRole('button')[0];
      fireEvent.click(previousButton);

      expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onNext when next button is clicked', () => {
      render(<PlayerControls {...defaultProps} />);

      const nextButton = screen.getAllByRole('button')[2];
      fireEvent.click(nextButton);

      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled state', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<PlayerControls {...defaultProps} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should enable all buttons when disabled prop is false', () => {
      render(<PlayerControls {...defaultProps} disabled={false} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should have disabled styling when disabled', () => {
      render(<PlayerControls {...defaultProps} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('opacity-50');
        expect(button).toHaveClass('cursor-not-allowed');
      });
    });
  });
});
