import { mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Result } from '../../../utils/result';

export const CodeBlock = CodeBlockLowlight.extend({
  name: 'codeBlock',

  addAttributes() {
    return {
      ...this.parent!(),
      exports: {
        default: null,
        rendered: true,
        parseHTML: el => el.dataset.exports ?? null,
        renderHTML: attributes => ({ 'data-exports': attributes.exports }),
        keepOnSplit: false,
      },
    };
  },

  renderHTML({ HTMLAttributes, ...options }) {
    return this.parent!({
      ...options,
      HTMLAttributes: mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
    });
  },

  addProseMirrorPlugins() {
    const getDecoration = (exports: Result<Error, any>) => {
      if (Result.isErr(exports))
        return Object.assign(document.createElement('code'), {
          textContent: `${exports.error}`,
          className: [
            'bg-slate-900 text-red-500',
            'block px-2 py-1 rounded-md -mt-5 after:content-none before:content-none',
          ].join(' '),
        });

      const buttons = Object.entries(exports.value).map(([key, value]) => {
        return Object.assign(document.createElement('button'), {
          textContent: key,
          className: [
            'border border-slate-900 rounded-sm',
            'text-sm text-slate-900',
            'py-0.5 px-1.5',
          ].join(' '),
          onclick: () => (value as any)(),
        });
      });

      const domNode = Object.assign(document.createElement('div'), {
        className: '-mt-4 flex justify-end gap-2',
      });
      domNode.append(...buttons);

      return domNode;
    };

    return [
      ...(this.parent!() ?? []).filter(
        p => !(p as any).key.startsWith('codeBlockViewPlugin$'),
      ),
      new Plugin({
        key: new PluginKey('codeBlockViewPlugin'),
        props: {
          decorations: state => {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (node.type.name !== this.name) return;
              if (!node.attrs.exports) return;

              decorations.push(
                Decoration.widget(pos + node.nodeSize, () =>
                  getDecoration(node.attrs.exports),
                ),
              );
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
