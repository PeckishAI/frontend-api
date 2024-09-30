import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  build: {
    outDir: 'dist', // Ensure this is pointing to the correct output directory
  },
  plugins: [react()],
});
