/**
 * Tests for types/index.ts
 * Testing buildPrompt, getStyleLabel, and configuration constants
 */

import {
  buildPrompt,
  getStyleLabel,
  STYLE_CONFIG,
  TEXTURE_CONFIG,
  STYLE_COLORS,
  type MusicStyle,
  type TextureType,
} from '@/types';

describe('types/index.ts', () => {
  describe('STYLE_CONFIG', () => {
    // Main generatable styles (not including 'imported' which is for user uploads)
    const generatableStyles: MusicStyle[] = ['classic', 'indian', 'african', 'asian', 'latino'];
    // All styles including imported
    const allStyles: MusicStyle[] = [...generatableStyles, 'imported'];

    it('should have all 6 music styles defined (5 generatable + imported)', () => {
      expect(Object.keys(STYLE_CONFIG)).toHaveLength(6);
      allStyles.forEach((style) => {
        expect(STYLE_CONFIG[style]).toBeDefined();
      });
    });

    it.each(generatableStyles)('should have valid config with prompt for %s style', (style) => {
      const config = STYLE_CONFIG[style];
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('color');
      expect(config).toHaveProperty('prompt');
      expect(typeof config.label).toBe('string');
      expect(typeof config.prompt).toBe('string');
      expect(config.prompt.length).toBeGreaterThan(0);
      expect(config.prompt.length).toBeLessThanOrEqual(300);
    });

    it('should have valid config for imported style (no prompt needed)', () => {
      const config = STYLE_CONFIG['imported'];
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('color');
      expect(config.label).toBe('Imported');
    });
  });

  describe('TEXTURE_CONFIG', () => {
    const textures: TextureType[] = ['rain', 'vinyl', 'city', 'typing'];

    it('should have all 4 textures defined', () => {
      expect(Object.keys(TEXTURE_CONFIG)).toHaveLength(4);
      textures.forEach((texture) => {
        expect(TEXTURE_CONFIG[texture]).toBeDefined();
      });
    });

    it.each(textures)('should have valid config for %s texture', (texture) => {
      const config = TEXTURE_CONFIG[texture];
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('addition');
      expect(typeof config.addition).toBe('string');
    });
  });

  describe('STYLE_COLORS', () => {
    it('should have Tailwind classes for all styles including imported', () => {
      const styles: MusicStyle[] = ['classic', 'indian', 'african', 'asian', 'latino', 'imported'];
      styles.forEach((style) => {
        expect(STYLE_COLORS[style]).toBeDefined();
        expect(STYLE_COLORS[style]).toContain('text-');
        expect(STYLE_COLORS[style]).toContain('border-');
      });
    });
  });

  describe('getStyleLabel', () => {
    it('should return correct label for classic', () => {
      expect(getStyleLabel('classic')).toBe('Classic Lo-Fi');
    });

    it('should return correct label for indian', () => {
      expect(getStyleLabel('indian')).toBe('Indian Lo-Fi');
    });

    it('should return correct label for african', () => {
      expect(getStyleLabel('african')).toBe('African Lo-Fi');
    });

    it('should return correct label for asian', () => {
      expect(getStyleLabel('asian')).toBe('Asian Lo-Fi');
    });

    it('should return correct label for latino', () => {
      expect(getStyleLabel('latino')).toBe('Latino Lo-Fi');
    });
  });

  describe('buildPrompt', () => {
    it('should build basic prompt without textures', () => {
      const prompt = buildPrompt('classic', []);
      expect(prompt).toContain('Lo-fi hip-hop');
      expect(prompt).toContain('Chill study beats');
      expect(prompt.length).toBeLessThanOrEqual(300);
    });

    it('should include texture additions in prompt', () => {
      const prompt = buildPrompt('classic', ['rain']);
      expect(prompt).toContain('rain ambience');
      expect(prompt).toContain('cozy atmosphere');
    });

    it('should include multiple textures', () => {
      const prompt = buildPrompt('asian', ['vinyl', 'rain']);
      expect(prompt).toContain('vinyl crackle');
      expect(prompt).toContain('rain ambience');
      expect(prompt).toContain('Japanese lo-fi');
    });

    it('should use correct base prompt for each style', () => {
      expect(buildPrompt('indian', [])).toContain('sitar');
      expect(buildPrompt('african', [])).toContain('djembe');
      expect(buildPrompt('asian', [])).toContain('koto');
      expect(buildPrompt('latino', [])).toContain('Bossa nova');
    });

    it('should never exceed 300 characters (MusicGPT limit)', () => {
      // Test with all textures
      const allTextures: TextureType[] = ['rain', 'vinyl', 'city', 'typing'];
      const styles: MusicStyle[] = ['classic', 'indian', 'african', 'asian', 'latino'];

      styles.forEach((style) => {
        const prompt = buildPrompt(style, allTextures);
        expect(prompt.length).toBeLessThanOrEqual(300);
      });
    });

    it('should always end with "Chill study beats." when under limit', () => {
      const prompt = buildPrompt('classic', []);
      expect(prompt).toContain('Chill study beats');
    });
  });
});
