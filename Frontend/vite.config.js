import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),        // Remove this if not using React plugin
    tailwindcss(),
  ],
});
