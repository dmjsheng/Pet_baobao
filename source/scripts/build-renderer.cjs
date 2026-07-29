const { join } = require('node:path');
const { bundleRenderer } = require('../dist/build/renderer-bundle.js');

bundleRenderer({
  entry: join(__dirname, '..', 'src', 'renderer', 'main.ts'),
  output: join(__dirname, '..', 'dist', 'renderer', 'main.js'),
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
