import { mergeAttributes } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineCode: {
      updateResult: (result: any) => ReturnType;
      toggleCode: () => ReturnType;
    };
  }
}

const toEvaluatedString = (result: any) => {
  if (result === undefined) return null;
  try {
    return JSON.stringify(result);
  } catch (_) {
    return result.toString();
  }
};

export const InlineCode = Code.extend({
  name: 'inlineCode',

  addAttributes() {
    return {
      ...this.parent,
      result: {
        default: null,
        rendered: true,
        parseHTML: el => el.dataset.result ?? null,
        renderHTML: attributes => ({ 'data-result': attributes.result }),
        keepOnSplit: false,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'code',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'bg-slate-800 text-violet-300',
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('inlineCodeViewPlugin'),
        props: {
          decorations: state => {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              const mark = node.marks.find(m => m.type.name === this.name);
              if (!mark) return;

              const resultStr = toEvaluatedString(mark.attrs.result);
              if (resultStr === null) return;

              decorations.push(
                Decoration.widget(pos + node.nodeSize, () => {
                  return Object.assign(document.createElement('code'), {
                    textContent: resultStr,
                    className: [
                      'bg-violet-200 text-slate-500',
                      'before:content-[":"] before:pr-1 after:content-none pr-1',
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
