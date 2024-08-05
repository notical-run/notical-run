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
import { AlertToast } from '@/components/Editor/components/AlertToast';

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
  | { kind: 'confirm'; message: string; onConfirm: () => void; onCancel: () => void }
  | { kind: 'alert'; message: string; onClose: () => void };

export const Editor = (props: EditorProps) => {
  const [editor, setEditor] = createSignal<TiptapEditor>();
  const [currentModal, setCurrentModal] = createSignal<ModalKind>({ kind: 'none' });

  let element: HTMLElement;
  let inlineMenuElement: HTMLElement;

  let engine: EvalEngine;
  const cleanupInstances: (() => void)[] = [];

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
      apiHelpers: {
        alert: opts => setCurrentModal({ kind: 'alert', ...opts }),
        confirm: opts => setCurrentModal({ kind: 'confirm', ...opts }),
        prompt: opts => setCurrentModal({ kind: 'prompt', ...opts }),
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
              } catch (e) {} // eslint-disable-line no-empty
              setCurrentModal({ kind: 'none' });
            }}
          />
        </Match>
        <Match when={currentModal()?.kind === 'confirm'}>
          <ConfirmModal
            title={currentModal()?.message || 'Confirm'}
            onConfirm={() => {
              try {
                (currentModal() as any)?.onConfirm();
              } catch (e) {} // eslint-disable-line no-empty
              setCurrentModal({ kind: 'none' });
            }}
            onCancel={() => {
              try {
                (currentModal() as any)?.onCancel();
              } catch (e) {} // eslint-disable-line no-empty
              setCurrentModal({ kind: 'none' });
            }}
          />
        </Match>
        <Match when={currentModal()?.kind === 'alert'}>
          <AlertToast
            title={currentModal()?.message || 'Alert'}
            onClose={() => {
              try {
                (currentModal() as any)?.onClose();
              } catch (e) {} // eslint-disable-line no-empty
              setCurrentModal({ kind: 'none' });
            }}
          />
        </Match>
      </Switch>
    </div>
  );
};
