import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin()],

  server: {
    host: '0.0.0.0',
    port: 3141,
  },
});
