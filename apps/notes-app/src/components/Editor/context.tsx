import { EvalEngine } from '@/engine/types';
import { Editor } from '@tiptap/core';
import { Accessor, createContext, useContext } from 'solid-js';
import * as Y from 'yjs';

export const EditorContext = createContext<{
  editor: Accessor<Editor | undefined>;
  evalEngine: Accessor<EvalEngine | undefined>;
  setEditor(editor: Editor | undefined): void;
  setEvalEngine(evalEngine: EvalEngine | undefined): void;
  onContentUpdate(): void;
  moduleDocumentLoader(path: string): Promise<Y.Doc>;
}>();

export const useEditorContext = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('Editor context not found');
  return ctx;
};
