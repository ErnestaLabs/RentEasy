import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins class names with spaces', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('resolves conflicting Tailwind utilities so the last one wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-slate-500', 'text-[#2f7d32]')).toBe('text-[#2f7d32]');
  });

  it('supports conditional object + array syntax', () => {
    expect(cn('base', { active: true, hidden: false }, ['x', 'y'])).toBe('base active x y');
  });
});
