import { useEffect } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import {
    behaviourState,
    classLabelModifiedState,
    classState,
    fileData,
    loadState,
    modelState,
    sessionCode,
} from '../../state';
import { useAtom, useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router';
import ClassifierApp, { TeachableModel } from '@genai-fi/classifier';
import { ISample } from '@genai-fi/classifier/main/ClassifierApp';

interface Project {
    id?: string;
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    samples?: ISample[][];
    labels?: string[];
}

export async function loadProject(file: File | Blob): Promise<Project> {
    const app = await ClassifierApp.load(file);

    return {
        id: app.projectId,
        model: app.model,
        behaviours: app.behaviours,
        samples: app.samples,
        labels: app.getLabels(),
    };
}

interface Props {
    onLoaded?: (hadBehaviours: boolean) => void;
    onError?: (err: unknown) => void;
}

function mapToURL(project: string) {
    const clean = project.trim();
    if (clean.startsWith('http')) {
        return clean;
    }
    if (clean.length === 8 && /^[a-z0-9_-]+$/i.test(clean)) {
        const apiBase = import.meta.env.VITE_APP_API || window.location.origin;
        return `${apiBase}/model/${clean}/project.zip`;
    }
}

function buildClassesFromProject(project: Project) {
    const labels = project.labels || [];
    const samples = project.samples || [];
    const count = Math.max(labels.length, samples.length);
    return Array.from({ length: count }, (_, i) => ({
        label: labels[i] || `Class ${i + 1}`,
        samples: (samples[i] || []).map((sample, idx) => ({
            ...sample,
            id: sample.id || `${i}_${idx}_${Date.now()}`,
        })),
    }));
}

export function ModelLoader({ onLoaded, onError }: Props) {
    const [projectFile, setProjectFile] = useAtom(fileData);
    const [params, setParams] = useSearchParams();
    const setBehaviours = useSetAtom(behaviourState);
    const setCode = useSetAtom(sessionCode);
    const setData = useSetAtom(classState);
    const setLabelModified = useSetAtom(classLabelModifiedState);
    const setLoading = useSetAtom(loadState);
    const setModel = useSetAtom(modelState);

    useEffect(() => {
        if (params.has('project')) {
            const project = params.get('project');
            if (project) {
                setLoading(true);
                const url = mapToURL(project);
                if (!url) {
                    setLoading(false);
                    setParams({}, { replace: true });
                    if (onError) onError(new Error('Invalid project code'));
                    return;
                }

                fetch(url)
                    .then(async (result) => {
                        if (result.status !== 200) {
                            if (onError) onError(result);
                            setLoading(false);
                            setParams({}, { replace: true });
                            return;
                        }
                        const loaded = await loadProject(await result.blob());
                        const nextClasses = buildClassesFromProject(loaded);

                        setLabelModified(nextClasses.map(() => true));
                        setData(nextClasses);

                        if (loaded.model) {
                            setModel(loaded.model);
                        }
                        if (loaded.behaviours) {
                            setBehaviours(loaded.behaviours);
                        }

                        setLoading(false);
                        setParams({}, { replace: true });
                        if (onLoaded) {
                            onLoaded(!!loaded.behaviours);
                        }
                    })
                    .catch((e) => {
                        if (onError) onError(e);
                        setLoading(false);
                        setParams({}, { replace: true });
                    });
            }
        }
    }, [params, setParams, onLoaded, setData, setLabelModified, setBehaviours, setModel, onError, setLoading]);

    useEffect(() => {
        if (projectFile) {
            setLoading(true);
            loadProject(projectFile)
                .then((loaded) => {
                    if (loaded.id) setCode(loaded.id);
                    const nextClasses = buildClassesFromProject(loaded);

                    setLabelModified(nextClasses.map(() => true));
                    setData(nextClasses);

                    if (loaded.model) {
                        setModel(loaded.model);
                    }
                    if (loaded.behaviours) {
                        setBehaviours(loaded.behaviours);
                    }

                    setLoading(false);
                    if (onLoaded) {
                        onLoaded(!!loaded.behaviours);
                    }

                    setProjectFile(null);
                })
                .catch((e) => {
                    if (onError) onError(e);
                    setProjectFile(null);
                    setLoading(false);
                });
        }
    }, [
        projectFile,
        setProjectFile,
        onLoaded,
        setData,
        setLabelModified,
        setCode,
        setBehaviours,
        setModel,
        onError,
        setLoading,
    ]);

    return null;
}
