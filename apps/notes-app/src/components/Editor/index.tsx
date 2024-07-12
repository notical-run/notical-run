import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import { onCleanup, onMount } from 'solid-js';
import clsx from 'clsx';
import * as Y from 'yjs';

const testContent = `
# Hello world

## Code and shit

Some inline \`state.num\`

\`[201 * state.num, state.num]\`

\`() => state.num = 42\`

\`state.hook1 = here()\`

\`\`\`
state.num = 0;

export default () => {
  insert.below(state.hook1, 'Foobar. This text goes below.');
};
export const increment = () => state.num = state.num + 1;
export const decrement = () => state.num = state.num - 1;

export const addTask = () => {
  const date = new Date().toDateString();
  insert.below(state.taskList, \`- [ ] Task (**created on \${date}**)\`);
};
\`\`\`


#### My task list \`state.taskList = here()\`


`;

export type EditorProps = { document: Y.Doc };

export const Editor = ({ document }: EditorProps) => {
  let element: HTMLElement | undefined;
  let editor: TiptapEditor | undefined;

  onMount(() => {
    const editorClass = clsx(
      'prose prose-base focus:outline-none p-4 max-w-full',
      'prose-headings:mt-0 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-slate-900',
      'prose-h1:text-3xl',
      'prose-h2:text-2xl',
      'prose-h3:text-xl',
      'prose-h4:text-lg',
      'prose-h5:text-md prose-h5:text-slate-600',
      'prose-h6:text-sm prose-h6:text-slate-600',
    );

    editor = new TiptapEditor({
      element: element,
      extensions: getExtensions({ document }),
      editorProps: {
        attributes: {
          spellcheck: 'false',
          class: editorClass,
        },
      },
      onCreate: ({ editor }) => {
        evaluateAllNodes(editor);
      },
      onUpdate: ({ editor }) => {
        evaluateAllNodes(editor);
      },
      onDestroy() {
        // TODO: Cleanup created signals
      },
      // content: testContent,
      // onTransaction: () => { editor = editor; },
    });
  });

  onCleanup(() => {
    editor?.destroy();
  });

  return <div ref={el => (element = el)} />;
};
