import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), svgr(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000, 
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router-dom')) {
              return 'react-core';
            }

            if (id.includes('node_modules/xlsx')) {
              return 'xlsx-lib';
            }

            if (id.includes('node_modules/jspdf') || 
                id.includes('node_modules/jspdf-autotable') ||
                id.includes('node_modules/html2canvas')) {
              return 'pdf-libs';
            }

            if (id.includes('node_modules/@tanstack') || 
                id.includes('node_modules/date-fns') ||
                id.includes('node_modules/lucide-react') ||
                id.includes('node_modules/clsx') ||
                id.includes('node_modules/tailwind-merge')) {
              return 'utils-ui';
            }

            if (id.includes('node_modules/react-hook-form') || 
                id.includes('node_modules/zod') ||
                id.includes('node_modules/@hookform')) {
              return 'forms-data';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});