import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import { createEffect, createSignal, onCleanup, onMount, Ref, Show } from 'solid-js';
import * as Y from 'yjs';
import { evaluateImport } from './headless-note';
import { createEvalEngine } from '@/engine';
import { EvalEngine } from '@/engine/types';
import { twMerge } from 'tailwind-merge';
import { useDebounced } from '@/utils/use-debounced';

import './editor.css';
import { InlineStyleBar } from '@/components/Editor/components/InlineStyleBar';
import { cn } from '@/utils/classname';

export type EditorProps = {
  editable?: boolean;
  document: Y.Doc;
  moduleLoader: (modulePath: string) => Promise<Y.Doc>;
  ref?: Ref<TiptapEditor>;
  defaultContent?: string | null;
};

export const Editor = (props: EditorProps) => {
  const [editor, setEditor] = createSignal<TiptapEditor>();
  let element: HTMLElement;
  let inlineMenuElement: HTMLElement;

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
      'prose-blockquote:text-slate-500',
    );

    engine = await createEvalEngine({
      withEditor: fn => fn(editor()!),
      moduleLoader: async modulePath => {
        const moduleDoc = await props.moduleLoader(modulePath);
        const module = await evaluateImport({ doc: moduleDoc, engine });
        cleanupInstances.push(module.onCleanup);
        return module.moduleCode;
      },
    });

    const tiptapEditor = new TiptapEditor({
      element: element,
      extensions: getExtensions({ document: props.document, inlineMenuElement }),
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

    // Update ref
    if (props.ref) {
      if (typeof props.ref === 'function') props.ref(tiptapEditor);
      else props.ref = tiptapEditor;
    }

    setEditor(tiptapEditor);
  });

  createEffect(() => {
    if (props.editable !== undefined) {
      editor()?.setEditable(props.editable, false);
    }

    if (props.defaultContent && editor()?.isEmpty) {
      editor()?.commands.setContent(props.defaultContent);
    }
  });

  onCleanup(() => {
    editor()?.destroy();
  });

  return (
    <div>
      <Show when={props.editable}>
        <InlineStyleBar editor={editor()} ref={el => (inlineMenuElement = el)} />
      </Show>

      <div ref={el => (element = el)} />
    </div>
  );
};
