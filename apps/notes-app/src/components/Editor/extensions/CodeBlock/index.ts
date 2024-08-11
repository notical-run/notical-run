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
