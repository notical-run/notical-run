import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import { onCleanup, onMount } from 'solid-js';
import clsx from 'clsx';

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

const useDebounced = (func: any, wait: number) => {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const Editor = () => {
  let element: HTMLElement | undefined;
  let editor: TiptapEditor | undefined;

  const saveUpdate = useDebounced(() => {
    if (editor)
      localStorage.setItem('editor-state', JSON.stringify(editor.getJSON()));
  }, 1000);

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
      extensions: getExtensions(),
      editorProps: {
        attributes: {
          spellcheck: 'false',
          class: editorClass,
        },
      },
      onCreate: ({ editor }) => {
        if (!editor.$doc.attributes.initializedNodeIDs) {
          // TODO: Move to GlobalNodeID as command
          editor.view.dispatch(
            editor.state.tr.setDocAttribute('initializedNodeIDs', true),
          );
        }
      },
      onUpdate: ({ editor }) => {
        evaluateAllNodes(editor);
        saveUpdate();
      },
      onDestroy() {
        // TODO: Cleanup created signals
      },
      content: testContent,
      // onTransaction: () => { editor = editor; },
    });

    let storedJson = localStorage.getItem('editor-state');
    storedJson = storedJson && JSON.parse(storedJson);
    if (storedJson) {
      editor.commands.setContent(storedJson);
    }
  });

  onCleanup(() => {
    editor?.destroy();
  });

  return <div ref={el => (element = el)} />;
};
