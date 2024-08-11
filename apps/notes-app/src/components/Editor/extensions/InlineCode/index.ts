import { InputRule, Node } from '@tiptap/core';
import { inlineCodeNodeView } from '@/components/Editor/extensions/InlineCode/view';
import { MarkdownSerializerState } from 'prosemirror-markdown';
import { codeClearDelimiters } from '@/components/Editor/extensions/InlineCode/code-clear-delimtiers';
import { Selection } from '@tiptap/pm/state';

export const InlineCode = Node.create({
  name: 'code',
  inline: true,
  group: 'inline',
  content: 'text*',
  marks: '',
  defining: true,
  exitable: true,
  selectable: true,

  addAttributes() {
    return {
      result: { default: null, rendered: false, keepOnSplit: false },
      anchoredContent: { default: null, rendered: false, keepOnSplit: false },
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: any) => state.write(node.textContent),
        parse: {
          updateDOM(dom: HTMLElement) {
            dom.innerHTML = dom.innerHTML.replace(
              /(?!<pre>)(<code>)((?:(?!<\/code>).)*)(<\/code>)/g,
              '$1`$2`$3',
            );
          },
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'code' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', HTMLAttributes, 0];
  },

  addNodeView() {
    return inlineCodeNodeView;
  },

  addInputRules() {
    const regex = /(?:^|\s)(`(?!\s+`)((?:[^`]+))`(?!\s+`))$/;
    // const regex = /(?:^|\s)(`([^`]+)`)$/g
    return [
      new InputRule({
        find: regex,
        handler: ({ state, range, match }) => {
          // If inside typing code, ignore
          const selectPos = state.selection.$from;
          if (selectPos.node(selectPos.depth).type === this.type) return;

          const offset = match[0].lastIndexOf(match[1]);
          const startPos = range.from + offset;
          const endPos = range.from + offset + match[1].length;
          if (startPos < 0) return;

          // If match is already code
          const startResolvedPos = state.doc.resolve(startPos);
          if (startResolvedPos.node(startResolvedPos.depth).type === this.type) return;

          const newNode = this.type.create(null, state.schema.text(match[1]));
          state.tr.replaceRangeWith(startPos, endPos, newNode).scrollIntoView();
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [codeClearDelimiters(this.type)];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        if ($from.parent.type !== this.type) return false;

        const endPos = state.doc.resolve($from.end($from.depth - 1));

        // If at the start of node, add line before node
        if ($from.parentOffset === 0) {
          return editor.commands.insertContentAt($from.before(), { type: 'paragraph' });
        } else {
          // Select next line
          const tr = editor.state.tr;
          tr.setSelection(Selection.near(endPos));
          editor.view.dispatch(tr);
        }

        return false;
      },

      ArrowUp: ({ editor }) => {
        const { selection } = editor.state;
        if (selection.$from.parent.type !== this.type) return false;
        if (!selection.empty) return false;

        // Insert paragraph before if at the start of doc
        if (selection.$from.index(0) === 0 && selection.$from.pos <= 2) {
          const tr = editor.state.tr;
          tr.insert(0, editor.schema.nodes.paragraph.create());
          editor.view.dispatch(tr);
          return true;
        }

        return false;
      },

      ArrowRight: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        if ($from.parent.type !== this.type) return false;
        if ($from.parent.nodeSize - $from.parentOffset - 2 > 0) return false;
        if ($from.after() === undefined) return false;

        // Insert space after node
        const nextNode = editor.state.doc.nodeAt($from.after());
        if (!nextNode) {
          if (!state.selection.empty) return false;
          const tr = editor.state.tr;
          tr.insertText(' ', $from.after());
          editor.view.dispatch(tr);
        }

        return false;
      },

      ArrowDown: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        if ($from.parent.type !== this.type) return false;

        // Insert paragraph after if at the end of doc
        const nextNode = editor.state.doc.nodeAt($from.after(1));
        if (!nextNode) {
          if (!state.selection.empty) return false;
          const tr = editor.state.tr;
          tr.insert($from.after(), editor.schema.nodes.paragraph.create());
          editor.view.dispatch(tr);
        }

        return false;
      },
    };
  },

  addCommands() {
    return {
      toggleCode:
        () =>
        ({ tr, state }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          const newNode = this.type.create(null, state.schema.text(`\`${text}\``));
          tr.replaceWith(from, to, newNode);
          return false;
        },
    };
  },
});
