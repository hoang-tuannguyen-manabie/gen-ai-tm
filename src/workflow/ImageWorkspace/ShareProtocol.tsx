import ClassifierApp, { TeachableModel } from '@genai-fi/classifier';
import { useCallback, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { BehaviourType } from '../Behaviour/Behaviour';
import {
    behaviourState,
    classState,
    IClassification,
    modelShared,
    sessionCode,
    shareModel,
    shareModelError,
    shareSamples,
} from '@genaitm/state';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

interface CacheState {
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    rawSamples?: IClassification[];
    code: string;
}

const MAX_SHARED_SAMPLES_PER_CLASS = 15;

function getApiBase() {
    return import.meta.env.VITE_APP_API || window.location.origin;
}

function limitSharedSamples(samples?: IClassification[]) {
    if (!samples) return undefined;
    return samples.map((s) => {
        const list = s.samples || [];
        if (list.length <= MAX_SHARED_SAMPLES_PER_CLASS) return list;
        const step = list.length / MAX_SHARED_SAMPLES_PER_CLASS;
        return Array.from({ length: MAX_SHARED_SAMPLES_PER_CLASS }, (_, idx) => list[Math.floor(idx * step)]);
    });
}

function startPeerShare(code: string, zipBlob: Blob, peerRef: { current: Peer | null }): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || import.meta.env.VITE_APP_API) {
            resolve(false);
            return;
        }
        try {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            const peer = new Peer(`tm-share-${code}`, {
                host: '0.peerjs.com',
                port: 443,
                secure: true,
            });
            peerRef.current = peer;

            const timer = setTimeout(() => resolve(false), 6000);

            peer.on('open', () => {
                clearTimeout(timer);
                resolve(true);
            });

            peer.on('connection', (conn) => {
                const sendZip = async () => {
                    const buf = await zipBlob.arrayBuffer();
                    conn.send({ type: 'project-zip', data: buf });
                };
                conn.on('open', () => {
                    sendZip().catch(() => {});
                });
                conn.on('data', (msg: unknown) => {
                    if (msg && typeof msg === 'object' && (msg as { type?: string }).type === 'request-zip') {
                        sendZip().catch(() => {});
                    }
                });
            });

            peer.on('error', () => {
                clearTimeout(timer);
                resolve(false);
            });
        } catch {
            resolve(false);
        }
    });
}

async function sendModel(
    code: string,
    model: TeachableModel,
    behaviours: BehaviourType[],
    peerRef: { current: Peer | null },
    samples?: IClassification[]
) {
    const app = new ClassifierApp(
        model.getVariant(),
        model,
        behaviours,
        limitSharedSamples(samples)
    );
    app.projectId = code;
    const blob = await app.saveComponents();
    if (!blob.zip) return;

    const peerPromise = startPeerShare(code, blob.zip, peerRef);

    let httpOk = false;
    try {
        const response = await fetch(`${getApiBase()}/model/${code}/`, {
            method: 'POST',
            body: blob.zip,
        });
        const contentType = response.headers?.get?.('content-type') || '';
        httpOk = response.ok && !contentType.includes('text/html');
    } catch {
        httpOk = false;
    }

    if (httpOk) {
        return;
    }

    const peerOk = await peerPromise;
    if (!peerOk) {
        throw new Error('Failed to upload model');
    }
}

export default function ShareProtocol() {
    const includeSamples = useAtomValue(shareSamples);
    const classes = useAtomValue(classState);
    const code = useAtomValue(sessionCode);
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);
    const cache = useRef<CacheState>({ model, behaviours, code });
    const peerRef = useRef<Peer | null>(null);
    const [share, setShare] = useAtom(shareModel);
    const setModelShared = useSetAtom(modelShared);
    const setShareError = useSetAtom(shareModelError);

    cache.current.model = model;
    cache.current.behaviours = behaviours;
    cache.current.rawSamples = includeSamples ? classes : undefined;
    cache.current.code = code;

    const send = useCallback(() => {
        const model = cache.current.model;
        const behaviours = cache.current.behaviours || [];
        const classes = cache.current.rawSamples;
        const code = cache.current.code;

        if (model) {
            setModelShared(false);
            setShareError(null);
            sendModel(code, model, behaviours, peerRef, classes)
                .then(() => {
                    setModelShared(true);
                })
                .catch((err) => {
                    console.error('Failed to share model', err);
                    setModelShared(false);
                    setShare(false);
                    setShareError(err instanceof Error ? err.message : 'Failed to share model');
                });
        }
    }, [setModelShared, setShare, setShareError]);

    useEffect(() => {
        if (share && model) {
            const timer = setInterval(send, 20 * 60 * 1000); // every 20 minutes
            send();
            return () => clearInterval(timer);
        } else if (!share && model) {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            setModelShared((wasShared) => {
                if (wasShared) {
                    fetch(`${getApiBase()}/model/${cache.current.code}/`, {
                        method: 'DELETE',
                    }).catch((err) => {
                        if (err instanceof TypeError && err.message?.includes('Failed to fetch')) {
                            console.debug('Collaboration server not available');
                        } else {
                            console.error('Failed to unshare model', err);
                        }
                    });
                }
                return false;
            });
        }
    }, [share, includeSamples, model, send, setModelShared]);

    useEffect(() => {
        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };
    }, []);

    return null;
}
