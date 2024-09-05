import { InlineStyleBar } from '@/components/Editor/components/InlineStyleBar';
import { useEditorContext } from '@/components/Editor/context';
import { getExtensions } from '@/components/Editor/extensions';
import { cn } from '@/utils/classname';
import { Editor } from '@tiptap/core';
import { createEffect, onCleanup, onMount, Show } from 'solid-js';
import * as Y from 'yjs';

import 'highlight.js/styles/tokyo-night-dark.css';
import './editor.css';

export type NoticalEditorContentProps = {
  document: Y.Doc;
  editable?: boolean;
  defaultContent?: string | null;
};

export const NoticalEditorContent = (props: NoticalEditorContentProps) => {
  const { editor, setEditor, onContentUpdate } = useEditorContext();
  let element: HTMLElement;
  let inlineMenuElement: HTMLElement;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') e.preventDefault();
  };

  onMount(() => {
    window.addEventListener('keydown', onKeyDown);

    const tiptapEditor = new Editor({
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
      onCreate: () => onContentUpdate(),
      onUpdate: () => onContentUpdate(),
    });

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
    window.removeEventListener('keydown', onKeyDown);
    editor()?.destroy();
    setEditor(undefined);
  });

  return (
    <div>
      <div ref={el => (element = el)} />
      <Show when={props.editable}>
        <InlineStyleBar editor={editor()} ref={el => (inlineMenuElement = el)} />
      </Show>
    </div>
  );
};

const editorClass = cn(
  'prose prose-base focus:outline-none p-4 max-w-full overflow-x-auto',
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
