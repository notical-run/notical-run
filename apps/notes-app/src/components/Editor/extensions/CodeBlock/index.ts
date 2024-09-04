import { mergeAttributes, Range } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { codeBlockNodeView } from '@/components/Editor/extensions/CodeBlock/view';

const updateLinesInRange = (
  code: string,
  updateLine: (line: string) => string,
  { from, to }: Range,
) => {
  if (from <= 0 || to > code.length) return { code, start: from, end: to };

  const { lines, selStart, selEnd } = code.split('\n').reduce(
    (acc, line) => {
      const offset = line.length + acc.offset + 1;
      const isStartLine = acc.offset <= from && from <= offset;
      if (from <= offset && to > acc.offset) {
        const newLine = updateLine(line);
        const delta = newLine.length - line.length;
        return {
          offset,
          selStart: isStartLine ? acc.selStart + delta : acc.selStart,
          selEnd: acc.selEnd + delta,
          lines: [...acc.lines, newLine],
        };
      }
      return { ...acc, offset, lines: [...acc.lines, line] };
    },
    { offset: 0, selStart: from, selEnd: to, lines: [] as string[] },
  );

  return { code: lines.join('\n'), start: selStart, end: selEnd };
};

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
    const INDENT = '  ';

    return {
      ...this.parent?.(),

      Tab: ({ editor }) => {
        const { selection } = editor.state;
        const { $from, $to } = selection;
        // If selection start or end is outside block, don't indent
        if ($from.parent.type !== this.type) return false;
        if ($to.parent.type !== this.type) return false;

        // If selection is empty, just insert indent at cursor position
        if (selection.empty) {
          const tr = editor.state.tr;
          tr.insert($from.pos, editor.schema.text(INDENT));
          editor.view.dispatch(tr);
          return true;
        }

        const block = $from.parent;
        const startPos = selection.$from.start(selection.$from.depth);
        const indentState = updateLinesInRange(block.textContent, line => INDENT + line, {
          from: $from.parentOffset,
          to: $to.parentOffset,
        });

        return editor
          .chain()
          .command(({ tr }) => {
            tr.replaceWith(
              startPos,
              startPos + block.nodeSize,
              editor.schema.text(indentState.code),
            );
            return true;
          })
          .setTextSelection({ from: startPos + indentState.start, to: startPos + indentState.end })
          .run();
      },

      'Shift-Tab': ({ editor }) => {
        const { selection } = editor.state;
        const { $from, $to } = selection;
        // If selection start or end is outside block, don't de-indent
        if ($from.parent.type !== this.type) return false;
        if ($to.parent.type !== this.type) return false;

        const block = $from.parent;
        const startPos = selection.$from.start(selection.$from.depth);
        const indentState = updateLinesInRange(
          block.textContent,
          line => (line.startsWith(INDENT) ? line.replace(INDENT, '') : line),
          { from: $from.parentOffset, to: $to.parentOffset },
        );

        return editor
          .chain()
          .command(({ tr }) => {
            tr.replaceWith(
              startPos,
              startPos + block.nodeSize,
              editor.schema.text(indentState.code),
            );
            return true;
          })
          .setTextSelection({ from: startPos + indentState.start, to: startPos + indentState.end })
          .run();
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
