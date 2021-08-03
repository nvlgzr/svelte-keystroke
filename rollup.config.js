import svelte from 'rollup-plugin-svelte';

const pkg = require('./package.json');

export default {
  input: 'src/Keystroke.svelte',
  output: [
    { file: pkg.main, 'format': 'umd', name: 'Keystroke' }
  ],
  plugins: [
    svelte(),
  ],
};
