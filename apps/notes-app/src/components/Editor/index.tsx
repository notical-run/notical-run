import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import { createEffect, onCleanup, onMount } from 'solid-js';
import * as Y from 'yjs';
import { evaluateImport } from './headless-note';
import { createEvalEngine } from '@/engine';
import { EvalEngine } from '@/engine/types';
import { twMerge } from 'tailwind-merge';
import './editor.css';
import { useDebounced } from '@/utils/use-debounced';

export type EditorProps = {
  editable?: boolean;
  document: Y.Doc;
  moduleLoader: (modulePath: string) => Promise<Y.Doc>;
};

export const Editor = (props: EditorProps) => {
  let element: HTMLElement;
  let editor: TiptapEditor;

  let engine: EvalEngine;
  const cleanupInstances: (() => void)[] = [];

  const evaluate = useDebounced(async (editor: TiptapEditor) => {
    await evaluateAllNodes(editor, engine, {});
  }, 100);

  onMount(async () => {
    const editorClass = twMerge(
      'prose prose-base focus:outline-none p-4 max-w-full',
      'prose-headings:mt-0 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-slate-900',
      'prose-h1:text-3xl',
      'prose-h2:text-2xl',
      'prose-h3:text-xl',
      'prose-h4:text-lg',
      'prose-h5:text-md prose-h5:text-slate-600',
      'prose-h6:text-sm prose-h6:text-slate-600',
    );

    engine = await createEvalEngine({
      withEditor: fn => fn(editor),
      moduleLoader: async modulePath => {
        const moduleDoc = await props.moduleLoader(modulePath);
        const module = await evaluateImport({ doc: moduleDoc, engine });
        cleanupInstances.push(module.onCleanup);
        return module.moduleCode;
      },
    });

    editor = new TiptapEditor({
      element: element,
      extensions: getExtensions({ document: props.document }),
      autofocus: true,
      editorProps: {
        attributes: {
          spellcheck: 'false',
          class: editorClass,
        },
      },
      editable: props.editable,
      onCreate: ({ editor }) => evaluate(editor),
      onUpdate: ({ editor }) => evaluate(editor),
      onDestroy() {
        cleanupInstances.forEach(f => f());
        engine?.destroy();
      },
    });
  });

  createEffect(() => {
    if (props.editable !== undefined) editor?.setEditable(props.editable, false);
  });

  onCleanup(() => {
    editor?.destroy();
  });

  return <div ref={el => (element = el)} />;
};
