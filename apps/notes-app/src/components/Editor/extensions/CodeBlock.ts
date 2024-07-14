import { findChildren, mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Result } from '../../../utils/result';
import html from 'solid-js/html';
import { Node } from '@tiptap/pm/model';
import clsx from 'clsx';

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
    return ({ node, HTMLAttributes, getPos, editor }) => {
      if (typeof getPos !== 'function') return {};
      const { collapsed } = node.attrs;

      const toggleCollapsed = () => {
        const tr = editor.state.tr;
        editor.view.dispatch(tr.setNodeAttribute(getPos(), 'collapsed', !collapsed));
      };

      const code = html`<code></code>`;
      // prettier-ignore
      const wrapper = html`<div data-collapsed="${node.attrs.collapsed}">
        <button
          class="${clsx(
            'block w-full bg-gray-200 px-2 py-1',
            'text-slate-500 text-left text-xs',
            {
              '-mb-6 rounded-t': !collapsed,
              'rounded': collapsed,
            },
          )}"
          onClick=${toggleCollapsed}
        >
          ${collapsed ? '▶' : '▼'}
        </button>

        <pre
          class="${clsx(
            'rounded-none rounded-b',
            this.options.HTMLAttributes.class,
            HTMLAttributes.class,
            { hidden: collapsed },
          )}"
        >
          ${code}
        </pre>
      </div>` as HTMLElement;

      return {
        dom: wrapper,
        contentDOM: code,
        update: updatedNode => {
          // TODO: Update state here instead of re-creating dom
          if (updatedNode.type !== this.type) return false;
          return false;
        },
      };
    };
  },

  addProseMirrorPlugins() {
    const getDecoration = (node: Node) => {
      const { exports, collapsed } = node.attrs;

      if (Result.isErr(exports))
        return html`<code
          class="${clsx(
            'bg-slate-900 text-red-500',
            'block px-2 py-1 after:content-none before:content-none mb-6',
            {
              'rounded-b mt-0': collapsed,
              'rounded-md -mt-5': !collapsed,
            },
          )}"
        >
          ${`${exports.error}`}
        </code>` as HTMLElement;

      const buttons = Object.entries(exports.value).map(([key, value]) => {
        if (!value) return null;
        return html`<button
          class="${clsx('bg-violet-700 rounded-md', 'text-sm text-white', 'py-0.5 px-1.5')}"
          onclick=${() => (value as any)()}
        >
          ${key}
        </button>` as HTMLElement;
      });

      return html`<div
        class="${clsx('flex justify-end flex-wrap gap-2 mb-6', collapsed ? 'mt-4' : '-mt-4')}"
      >
        ${buttons.filter(Boolean)}
      </div>` as HTMLElement;
    };

    return [
      ...(this.parent!() ?? []).filter(p => !(p as any).key.startsWith('codeBlockViewPlugin$')),
      new Plugin({
        key: new PluginKey('codeBlockViewPlugin'),
        props: {
          decorations: state => {
            const blocks = findChildren(
              state.doc,
              node => node.type.name === this.name && node.attrs.exports,
            );

            const decorations = blocks.map(({ node, pos }) =>
              Decoration.widget(pos + node.nodeSize, () => getDecoration(node)),
            );

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
