import { mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

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

              const exports = node.attrs.exports;
              if (!exports) return;

              decorations.push(
                Decoration.widget(pos + node.nodeSize, () => {
                  const buttons = Object.entries(exports).map(
                    ([key, value]) => {
                      return Object.assign(document.createElement('button'), {
                        textContent: key,
                        className: [
                          'border border-slate-900 rounded-sm',
                          'text-sm text-slate-900',
                          'py-0.5 px-1',
                        ].join(' '),
                        onclick: () => (value as any)(),
                      });
                    },
                  );

                  const $div = Object.assign(document.createElement('div'), {
                    className: '-mt-4',
                  });
                  $div.append(...buttons);
                  return $div;
                }),
              );
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
