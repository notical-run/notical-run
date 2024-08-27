import { mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { codeBlockNodeView } from '@/components/Editor/extensions/CodeBlock/view';

export const CodeBlock = CodeBlockLowlight.extend({
  name: 'codeBlock',

  addAttributes() {
    return {
      ...this.parent!(),
      exports: { default: null, rendered: false, keepOnSplit: false },
      collapsed: { default: false, rendered: true, keepOnSplit: true },
    };
  },

  renderHTML({ HTMLAttributes, ...options }) {
    return this.parent!({
      ...options,
      HTMLAttributes: mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    });
  },

  addNodeView() {
    return codeBlockNodeView;
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),

      Tab: ({ editor }) => {
        const { selection } = editor.state;
        const { $from, $to } = selection;
        if ($from.parent.type !== this.type) return false;

        const TAB = '  ';

        console.log(selection.empty);
        console.log(selection.$from, selection.$to);
        console.log(editor.state.doc.textBetween($from.pos, $to.pos));
        if (selection.empty) {
          const tr = editor.state.tr;
          tr.insert(selection.$from.pos, editor.schema.text(TAB));
          editor.view.dispatch(tr);
          return true;
        } else {
          // TODO: Insert indent between text
          // console.log(editor.state.doc.textBetween($from.pos, $to.pos));
        }

        return false;
      },

      ArrowUp: ({ editor }) => {
        const { selection } = editor.state;
        if (selection.$from.parent.type !== this.type) return false;
        if (!selection.empty) return false;

        // Insert paragraph before if at the start of doc
        if (selection.$from.index(0) === 0 && selection.$from.pos === 1) {
          const tr = editor.state.tr;
          tr.insert(0, editor.schema.nodes.paragraph.create());
          editor.view.dispatch(tr);
          return true;
        }

        return false;
      },

      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const parent = selection.$from.parent;
        if (!selection.empty || parent.type.name !== this.name) return false;
        if (selection.$from.pos !== 1 && parent.textContent.length !== 0) return false;

        return this.editor.commands.clearNodes();
      },

      'Mod-a': ({ editor }) => {
        const { selection } = editor.state;
        const parent = selection.$from.parent;
        if (parent.type !== this.type) return false;

        const startPos = selection.$from.start(selection.$from.depth);
        return editor.commands.setTextSelection({ from: startPos, to: startPos + parent.nodeSize });
      },
    };
  },
});
