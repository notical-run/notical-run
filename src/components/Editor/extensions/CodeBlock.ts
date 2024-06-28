import { mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const toEvaluatedString = (result: any) => {
  if (result === undefined) return null;
  try {
    return JSON.stringify(result);
  } catch (_) {
    return result.toString();
  }
};

export const CodeBlock = CodeBlockLowlight.extend({
  name: 'codeBlock',
  addAttributes() {
    return {
      ...this.parent!(),
      result: {
        default: null,
        rendered: true,
        parseHTML: el => el.dataset.result ?? null,
        renderHTML: attributes => ({ 'data-result': attributes.result }),
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

              const resultStr = toEvaluatedString(node.attrs.result);
              if (resultStr === null) return;

              decorations.push(
                Decoration.widget(pos + node.nodeSize, () => {
                  return Object.assign(document.createElement('code'), {
                    textContent: resultStr,
                    className: [
                      'bg-violet-200 text-slate-500',
                      'before:content-none after:content-none p-1',
                      'block w-full',
                    ].join(' '),
                  });
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
