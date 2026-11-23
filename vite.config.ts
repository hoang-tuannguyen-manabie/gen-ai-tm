/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

function localModelSharePlugin(): Plugin {
    const store = new Map<string, Buffer>();
    return {
        name: 'local-model-share',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split('?')[0] || '';
                const match = url.match(/^\/model\/([^/]+)(?:\/([^/]+))?\/?$/);
                if (!match) return next();

                const code = decodeURIComponent(match[1]);
                const file = match[2] ? decodeURIComponent(match[2]) : 'project.zip';

                if (req.method === 'POST') {
                    const chunks: Buffer[] = [];
                    req.on('data', (chunk: Buffer) => chunks.push(chunk));
                    req.on('end', () => {
                        store.set(code, Buffer.concat(chunks));
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ ok: true, code }));
                    });
                    return;
                }

                if (req.method === 'DELETE') {
                    store.delete(code);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: true, code }));
                    return;
                }

                if (req.method === 'GET' && file === 'project.zip') {
                    const data = store.get(code);
                    if (!data) {
                        res.statusCode = 404;
                        res.end('Not found');
                        return;
                    }
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/zip');
                    res.end(data);
                    return;
                }

                return next();
            });
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react(), localModelSharePlugin()],
    build: {
        rollupOptions: {
            output: {
                inlineDynamicImports: mode === 'robot',
            },
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        clearMocks: true,
        execArgv: process.version.startsWith('v22') ? ['--no-webstorage'] : [],
        coverage: {
            provider: 'v8',
            reporter: ['cobertura', 'html'],
        },
        server: {
            deps: {
                inline: ['@genai-fi/base'],
            },
        },
    },
    resolve: {
        alias: {
            '@genaitm': path.resolve(import.meta.dirname, './src'),
        },
    },
}));
