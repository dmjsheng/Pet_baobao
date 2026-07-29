import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bundleRenderer } from '../src/build/renderer-bundle';

describe('bundleRenderer', () => {
  it('emits a browser script without CommonJS require calls', async () => {
    const output = join(mkdtempSync(join(tmpdir(), 'baobao-renderer-')), 'main.js');
    await bundleRenderer({ entry: join(process.cwd(), 'src', 'renderer', 'main.ts'), output });
    expect(readFileSync(output, 'utf8')).not.toContain('require(');
  });
});
