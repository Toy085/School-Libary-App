import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['better-sqlite3'], 
  },
});

export default config;
