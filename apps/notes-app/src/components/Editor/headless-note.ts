import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import * as Y from 'yjs';
import { Node } from '@tiptap/pm/model';
import { EvalEngine } from '@/engine/types';

export type EvalImportOptions = {
  doc: Y.Doc;
  engine: EvalEngine;
};

export const evaluateImport = async ({ doc, engine }: EvalImportOptions) => {
  const element = document.createElement('div');
  const allModules: string[] = [];
  let resolver = (_: string) => {};
  const waitForModuleCode = new Promise<string>(resolve => (resolver = resolve));

  const reeval = async () => {
    // TODO: Rethink withEditor for engine inside imports
    await evaluateAllNodes(editor, engine, {
      evalBlock: (node: Node) => {
        allModules.push(node.textContent);
      },
    });

    resolver(allModules.join('\n\n'));
    editor?.destroy();
  };

  const editor = new TiptapEditor({
    element: element,
    extensions: getExtensions({ document: doc }),
    editorProps: {},
    onCreate: () => reeval(),
    onUpdate: () => reeval(),
    onDestroy() {},
  });

  const onCleanup = () => {
    editor?.destroy();
  };

  return {
    onCleanup,
    moduleCode: waitForModuleCode,
  };
};
