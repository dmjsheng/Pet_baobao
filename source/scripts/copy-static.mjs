import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = join(import.meta.dirname, '..', 'src', 'renderer');
const target = join(import.meta.dirname, '..', 'dist', 'renderer');
mkdirSync(target, { recursive: true });
for (const file of ['index.html', 'styles.css']) cpSync(join(source, file), join(target, file));
