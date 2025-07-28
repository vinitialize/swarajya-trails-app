import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        {
          name: 'copy-version',
          buildStart() {
            // Copy version.json to public during build
            try {
              if (fs.existsSync('version.json')) {
                if (!fs.existsSync('public')) {
                  fs.mkdirSync('public');
                }
                fs.copyFileSync('version.json', 'public/version.json');
                console.log('📄 Copied version.json to public directory');
              }
            } catch (error) {
              console.warn('⚠️  Failed to copy version.json:', error.message);
            }
          }
        }
      ]
    };
});
