import { Node } from '@tiptap/core';
import { inlineCodeNodeView } from '@/components/Editor/extensions/InlineCode/view';
import { MarkdownSerializerState } from 'prosemirror-markdown';
import { codeClearDelimiters } from '@/components/Editor/extensions/InlineCode/code-clear-delimtiers';

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

  renderHTML() {
    return ['code', 0];
  },

  addNodeView() {
    return inlineCodeNodeView;
  },

  addInputRules() {
    return [
      {
        find: /`([^`]+)`$/g,
        handler: ({ state, range, match }) => {
          if (!match[1]) return;
          if (state.doc.resolve(range.from).node().type === this.type) return;
          const newNode = this.type.create(null, state.schema.text(`\`${match[1]}\``));
          state.tr.replaceWith(range.from, range.to, newNode);
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [codeClearDelimiters(this.type)];
  },

  addKeyboardShortcuts() {
    return {
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
