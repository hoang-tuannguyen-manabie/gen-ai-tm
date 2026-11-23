import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';
import JSZip from 'jszip';

const STORE_NAME = 'shared-models';

function parseModelRoute(urlStr: string): { code: string; file?: string } | null {
    const url = new URL(urlStr);
    const match = url.pathname.match(/\/model\/([^/]+)(?:\/([^/]+))?\/?$/);
    if (!match) return null;
    return {
        code: decodeURIComponent(match[1]),
        file: match[2] ? decodeURIComponent(match[2]) : undefined,
    };
}

export default async (req: Request, _context: Context) => {
    const route = parseModelRoute(req.url);
    if (!route || !route.code || !/^[a-zA-Z0-9_-]{1,64}$/.test(route.code)) {
        return new Response(JSON.stringify({ error: 'Invalid model code' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        });
    }

    const { code, file } = route;
    const store = getStore({ name: STORE_NAME, consistency: 'strong' });

    if (req.method === 'POST') {
        const body = await req.arrayBuffer();
        if (!body || body.byteLength === 0) {
            return new Response(JSON.stringify({ error: 'Empty model payload' }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        await store.set(code, body, {
            metadata: {
                updatedAt: Date.now(),
                size: body.byteLength,
            },
        });

        return new Response(JSON.stringify({ ok: true, code }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }

    if (req.method === 'DELETE') {
        await store.delete(code);
        return new Response(JSON.stringify({ ok: true, code }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }

    if (req.method === 'GET') {
        const zipBuffer = await store.get(code, { type: 'arrayBuffer', consistency: 'strong' });
        if (zipBuffer === null) {
            return new Response(JSON.stringify({ error: 'Model not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            });
        }

        const requestedFile = file || 'project.zip';
        if (requestedFile === 'project.zip') {
            return new Response(zipBuffer, {
                status: 200,
                headers: {
                    'content-type': 'application/zip',
                    'cache-control': 'no-store',
                },
            });
        }

        const zip = await JSZip.loadAsync(zipBuffer);
        const zipEntry = zip.file(requestedFile);
        if (!zipEntry) {
            return new Response(JSON.stringify({ error: `File ${requestedFile} not found in model` }), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            });
        }

        if (requestedFile.endsWith('.json')) {
            const text = await zipEntry.async('string');
            return new Response(text, {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'cache-control': 'no-store',
                },
            });
        }

        const bin = await zipEntry.async('arraybuffer');
        return new Response(bin, {
            status: 200,
            headers: {
                'content-type': 'application/octet-stream',
                'cache-control': 'no-store',
            },
        });
    }

    return new Response('Method Not Allowed', { status: 405 });
};
