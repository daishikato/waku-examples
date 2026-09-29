import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'waku/config';

// The OG image libraries are loaded by Node from node_modules rather than
// through Vite: @resvg/resvg-js is a native binary, and the layout engine
// inside satori finds its own files through __dirname, which a bundled ES
// module does not have. Dev pre-bundling scans every source file, so it has to
// be told to skip them as well.
const loadedByNode = ['@resvg/resvg-js', 'satori'];

const src = (name: string) =>
  fileURLToPath(new URL(`./src/${name}`, import.meta.url));

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { exclude: loadedByNode },
    environments: {
      rsc: { resolve: { external: loadedByNode } },
    },
    resolve: {
      // The app imports as `lib/shopify` and `components/cart/...`, which
      // Next.js resolves from tsconfig's baseUrl. Vite does not read baseUrl,
      // so the same two roots are declared here.
      alias: [
        { find: /^lib\//, replacement: src('lib/') },
        { find: /^components\//, replacement: src('components/') },
      ],
    },
  },
});
