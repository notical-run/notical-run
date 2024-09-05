import { fetchNote } from '@/api/queries/workspace';
import { EditorContext } from '@/components/Editor/context';
import { evaluateAllNodes } from '@/components/Editor/evaluator';
import { NoticalEditorContent } from '@/components/Editor/NoticalEditorContent';
import { NoticalEditorEngine } from '@/components/Editor/NoticalEditorEngine';
import { EvalEngine } from '@/engine/types';
import { useDebounced } from '@/utils/use-debounced';
import { Editor } from '@tiptap/core';
import { toUint8Array } from 'js-base64';
import { createSignal, ParentProps } from 'solid-js';
import * as Y from 'yjs';

export const NoticalEditorRoot = (props: ParentProps<{ disableEvaluation?: boolean }>) => {
  const [editor, setEditor] = createSignal<Editor>();
  const [evalEngine, setEvalEngine] = createSignal<EvalEngine>();

  const evaluate = useDebounced(async () => {
    const editorInstance = editor();
    const engine = evalEngine();
    if (!editorInstance || !engine) return;
    if (props.disableEvaluation) return;
    await evaluateAllNodes(editorInstance, engine, {});
  }, 100);

  const onContentUpdate = () => {
    evaluate();
  };

  const importModuleCache = new Map<string, Y.Doc>();
  const moduleDocumentLoader = async (modulePath: string) => {
    if (!modulePath) throw new Error('Module path cannot be empty');
    if (importModuleCache.has(modulePath)) return importModuleCache.get(modulePath)!;

    const importMatch = modulePath.match(/^@([a-z0-9-_]+)\/([a-z0-9-_]+)$/i);
    if (!importMatch || importMatch.length < 3) throw new Error('Invalid import path');

    const [_, workspace, noteId] = importMatch;
    const response = await fetchNote(workspace, noteId);
    if (!response) throw new Error('Invalid response for note');

    const moduleYDoc = new Y.Doc();
    Y.applyUpdateV2(moduleYDoc, toUint8Array(response.content ?? ''));

    importModuleCache.set(modulePath, moduleYDoc);

    return moduleYDoc;
  };

  return (
    <EditorContext.Provider
      value={{
        editor,
        evalEngine,
        setEditor,
        setEvalEngine,
        onContentUpdate,
        moduleDocumentLoader,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};

export const NoticalEditor = Object.assign(NoticalEditorRoot, {
  Root: NoticalEditorRoot,
  Content: NoticalEditorContent,
  Engine: NoticalEditorEngine,
});
