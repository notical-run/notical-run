import { mergeAttributes } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Result } from '../../../utils/result';

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
      result: { default: null, rendered: false, keepOnSplit: false },
    };
  },

  renderHTML({ HTMLAttributes, ...props }) {
    return this.parent!({
      ...props,
      HTMLAttributes: mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: 'bg-slate-800 text-violet-300',
        },
      ),
    });
  },

  addProseMirrorPlugins() {
    const getDecoration = (result: Result<Error, any>) => {
      if (Result.isErr(result))
        return Object.assign(document.createElement('code'), {
          textContent: `${result.error}`,
          className: [
            'bg-red-100 text-red-500',
            'before:content-[":"] before:pr-1 after:content-none pr-1',
          ].join(' '),
        });

      if (typeof result.value === 'function') {
        return Object.assign(document.createElement('button'), {
          textContent: '▶',
          onclick: () => {
            result.value();
          },
          className: [
            'text-white bg-violet-600 size-5 rounded-full text-xs',
            'leading-0 pb-0.5 pl-0.5 ml-1 -mt-2',
          ].join(' '),
        });
      }

      return Object.assign(document.createElement('code'), {
        textContent: toEvaluatedString(result.value),
        className: [
          'bg-violet-200 text-slate-500',
          'before:content-[":"] before:pr-1 after:content-none pr-1',
        ].join(' '),
      });
    };

    return [
      new Plugin({
        key: new PluginKey('inlineCodeViewPlugin'),
        props: {
          decorations: state => {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              const mark = node.marks.find(m => m.type.name === this.name);
              if (!mark || mark.attrs.result === null) return;

              decorations.push(
                Decoration.widget(pos + node.nodeSize, () =>
                  getDecoration(mark.attrs.result),
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
