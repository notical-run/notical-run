import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import { createEffect, createSignal, Match, onCleanup, onMount, Ref, Show, Switch } from 'solid-js';
import * as Y from 'yjs';
import { evaluateImport } from './headless-note';
import { createEvalEngine } from '@/engine';
import { EvalEngine } from '@/engine/types';
import { useDebounced } from '@/utils/use-debounced';

import './editor.css';
import { InlineStyleBar } from '@/components/Editor/components/InlineStyleBar';
import { cn } from '@/utils/classname';
import { PromptModal } from '@/components/Editor/components/PromptModal';
import { ConfirmModal } from '@/components/Editor/components/ConfirmModal';
import { fetchViaProxyApi } from '@/api/queries/proxy-api';
import toast from 'solid-toast';

export type EditorProps = {
  editable?: boolean;
  document: Y.Doc;
  moduleLoader: (modulePath: string) => Promise<Y.Doc>;
  ref?: Ref<TiptapEditor>;
  defaultContent?: string | null;
};

type ModalKind =
  | { kind: 'none'; message?: never }
  | { kind: 'prompt'; message: string; onValue: (value: string | null) => void }
  | { kind: 'confirm'; message: string; onConfirm: () => void; onCancel: () => void };

export const Editor = (props: EditorProps) => {
  const [editor, setEditor] = createSignal<TiptapEditor>();
  const [currentModal, setCurrentModal] = createSignal<ModalKind>({ kind: 'none' });

  let element: HTMLElement;
  let inlineMenuElement: HTMLElement;
  let engine: EvalEngine;

  const evaluate = useDebounced(async (editor: TiptapEditor) => {
    await evaluateAllNodes(editor, engine, {});
  }, 100);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') e.preventDefault();
  };

  onMount(async () => {
    window.addEventListener('keydown', onKeyDown);

    const editorClass = cn(
      'prose prose-base focus:outline-none p-4 max-w-full',
      'prose-blockquote:text-slate-500',

      // Headings
      'prose-headings:mt-0 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-slate-900',
      'prose-h1:text-3xl',
      'prose-h2:text-2xl',
      'prose-h3:text-xl',
      'prose-h4:text-lg',
      'prose-h5:text-md prose-h5:text-slate-600',
      'prose-h6:text-sm prose-h6:text-slate-600',

      // Table
      'prose-table:border prose-table:border-slate-20 prose-table:m-0',
      '[&_th:not(:last-child)]:border-r prose-th:border-slate-200 prose-th:bg-slate-100',
      '[&_tr:not(:last-child)]:border-b prose-tr:border-slate-200',
      'prose-td:px-3 prose-td:border-r prose-td:border-slate-200',
      '[&_table_p]:my-0',
      '[&_th_p]:my-0',
    );

    engine = await createEvalEngine({
      withEditor: fn => fn(tiptapEditor),
      moduleLoader: async modulePath => {
        const moduleDoc = await props.moduleLoader(modulePath);
        const module = await evaluateImport({ doc: moduleDoc, engine });
        engine.importedEditorInstances.set(modulePath, module.editor);
        return module.moduleCode;
      },
      apiHelpers: {
        alert: opts => toast.success(opts.message || 'Alert'),
        confirm: opts => setCurrentModal({ kind: 'confirm', ...opts }),
        prompt: opts => setCurrentModal({ kind: 'prompt', ...opts }),
        fetch: fetchViaProxyApi,
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
      onDestroy: () => engine?.destroy(),
    });

    // Update ref
    if (props.ref) {
      if (typeof props.ref === 'function') props.ref(tiptapEditor);
      else props.ref = tiptapEditor;
    }

    setEditor(tiptapEditor);
  });

  createEffect(() => {
    // Update editable
    if (props.editable !== undefined) {
      editor()?.setEditable(props.editable, false);
    }

    // Use default markdown if editor is empty
    if (props.defaultContent && editor()?.isEmpty) {
      editor()?.commands.setContent(props.defaultContent);
    }
  });

  onCleanup(() => {
    editor()?.destroy();
    window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div>
      <Show when={props.editable}>
        <InlineStyleBar editor={editor()} ref={el => (inlineMenuElement = el)} />
      </Show>

      <div ref={el => (element = el)} />

      <Switch>
        <Match when={currentModal()?.kind === 'prompt'}>
          <PromptModal
            title={currentModal()?.message || 'Prompt'}
            onSubmit={value => {
              try {
                (currentModal() as any)?.onValue(value);
              } finally {
                setCurrentModal({ kind: 'none' });
              }
            }}
          />
        </Match>
        <Match when={currentModal()?.kind === 'confirm'}>
          <ConfirmModal
            title={currentModal()?.message || 'Confirm'}
            onConfirm={() => {
              try {
                (currentModal() as any)?.onConfirm();
              } finally {
                setCurrentModal({ kind: 'none' });
              }
            }}
            onCancel={() => {
              try {
                (currentModal() as any)?.onCancel();
              } finally {
                setCurrentModal({ kind: 'none' });
              }
            }}
          />
        </Match>
      </Switch>
    </div>
  );
};
