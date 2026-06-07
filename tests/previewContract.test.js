import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('app preview contract', () => {
  it('does not run passive account-write effects for anonymous preview visitors', async () => {
    const source = await readFile('src/App.jsx', 'utf8');

    expect(source).toContain("if (isPreviewVisitor || backendStatus !== 'connected') return;");
    expect(source).toContain('if (isPreviewVisitor) return;');
    expect(source).toContain('if (isPreviewVisitor) return undefined;');
  });
});
