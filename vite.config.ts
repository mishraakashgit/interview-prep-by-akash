import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The Amplify client libraries make the main chunk ~180 KB gzipped, which is fine for this app.
  build: { chunkSizeWarningLimit: 700 },
});
