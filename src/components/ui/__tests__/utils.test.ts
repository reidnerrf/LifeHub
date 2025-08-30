import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    expect(cn('foo', false && 'bar')).toBe('foo');
    expect(cn('foo', 'foo')).toBe('foo foo'); // clsx doesn't dedupe identical strings
    expect(cn('foo', 'foo', 'bar')).toBe('foo foo bar');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('text-center text-left')).toBe('text-left');
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500');
  });
});
