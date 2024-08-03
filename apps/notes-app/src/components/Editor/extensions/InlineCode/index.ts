import { InputRule, mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
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
    return [
      new InputRule({
        find: text => {
          const match = /(?:^|\s)`([^`]+)`/g.exec(text);
          if (!match?.[1] || match?.index === undefined) return null;
          return { index: match.index, text: match[0], match };
        },
        handler: ({ state, range, match }) => {
          const resolvedPos = state.doc.resolve(range.from);
          if (resolvedPos.node().type === this.type) return;
          const newNode = this.type.create(null, state.schema.text(match[0]));
          state.tr.replaceRangeWith(range.from, range.to, newNode);
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

        // Insert newline after node
        const tr = editor.state.tr;
        tr.setSelection(Selection.near(endPos));
        // tr.insert(endPos.pos, editor.schema.nodes.paragraph.create({}));
        editor.view.dispatch(tr);

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
