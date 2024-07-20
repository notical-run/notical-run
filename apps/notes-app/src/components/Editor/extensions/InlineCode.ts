import { mergeAttributes } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Result } from '../../../utils/result';
import html from 'solid-js/html';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineCode: {
      updateResult: (result: any) => ReturnType;
      toggleCode: () => ReturnType;
    };
  }
}

const toEvaluatedString = (result: any) => {
  if (result === undefined) return 'undefined';
  try {
    if (typeof result?.__native__ === 'string') {
      if (result?.__native__) return `[native ${result?.__native__}]`;
      return null;
    }
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
      anchoredContent: { default: null, rendered: false, keepOnSplit: false },
    };
  },

  renderHTML({ HTMLAttributes, ...props }) {
    return this.parent!({
      ...props,
      HTMLAttributes: mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'bg-slate-800 text-violet-300',
      }),
    });
  },

  addProseMirrorPlugins() {
    const getResultDecoration = (result: Result<Error, any>) => {
      if (Result.isErr(result))
        return html`
          <code
            class=${'bg-red-100 text-red-500 before:content-[":"] before:pr-1 after:content-none pr-1'}
          >
            ${result.error.message ?? `${result.error || 'Unknown error'}`}
          </code>
        `;

      if (typeof result.value === 'function') {
        return html`
          <button
            class="text-white bg-violet-600 size-5 rounded-full text-xs leading-0 pb-0.5 pl-0.5 ml-1 -mt-2 select-none"
            onClick=${(_e: MouseEvent) => {
              result.value();
            }}
          >
            ▶
          </button>
        `;
      }

      const evalString = toEvaluatedString(result.value);

      if (evalString === null) return null;

      return html`
        <code
          class=${'bg-violet-200 text-slate-500 before:content-[":"] before:pr-1 after:content-none pr-1'}
        >
          ${evalString}
        </code>
      `;
    };

    const getShowDecoration = (content: string) => {
      if (!content?.trim()) return null;
      if (!this.editor.extensionStorage.markdown?.parser) {
        throw new Error('Markdown parser not found');
      }

      const contentHTML: string = this.editor.extensionStorage.markdown.parser.parse(content) ?? '';
      if (!contentHTML.trim()) return null;

      const $root = html`<div class="border border-slate-300 px-2 py-1" />` as HTMLElement;
      $root.innerHTML = contentHTML;

      return $root;
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
                Decoration.widget(pos + node.nodeSize, () => {
                  const resultDecoration = getResultDecoration(mark.attrs.result);
                  const showNode = getShowDecoration(mark.attrs.anchoredContent);

                  return html`<span>${resultDecoration}${showNode}</span>` as HTMLElement;
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
