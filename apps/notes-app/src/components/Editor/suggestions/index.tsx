import { createMenuRenderer, MenuRenderer } from '@/components/Editor/suggestions/menu-renderer';
import { SuggestionsItem } from '@/components/Editor/suggestions/view';
import { toApiErrorMessage } from '@/utils/api-client';
import { Editor, Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import tippy, { Props as TippyProps, Instance as TippyInstance } from 'tippy.js';

type SuggestionMenuOptions = Partial<
  Omit<SuggestionOptions, 'items'> & {
    items: (props: {
      query: string;
      editor: Editor;
    }) => SuggestionsItem[] | { error: string } | Promise<SuggestionsItem[] | { error: string }>;
  }
>;

export const SuggestionsExtension = Extension.create<{
  suggestion: SuggestionMenuOptions;
  tippy?: Partial<TippyProps>;
}>({
  name: 'suggestionsExtension',

  addOptions() {
    return { suggestion: {} };
  },

  addProseMirrorPlugins() {
    const suggestionOptions = this.options.suggestion;
    return [
      Suggestion({
        pluginKey: new PluginKey(this.name + '-suggestions'),
        editor: this.editor,
        allowSpaces: false,
        ...suggestionOptions,

        allow: ({ state, range }) => {
          const resolvedPos = state.doc.resolve(range.from);
          if (resolvedPos.node().type.name !== 'paragraph') return false;
          const isWithWorkspace = !!state.doc
            .textBetween(range.from, range.to)
            .trim()
            .match(/^@([a-z0-9-_]+)\/$/gi);
          return isWithWorkspace;
        },

        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },

        ...this.options.suggestion,

        items: async options => {
          try {
            return (await this.options.suggestion.items?.(options)) ?? [];
          } catch (e) {
            const msg = toApiErrorMessage(e);
            if (!msg) return [];
            return { error: msg } as any;
          }
        },

        render: () => {
          let menuRenderer: MenuRenderer;
          let popup: TippyInstance[];

          return {
            onStart: props => {
              menuRenderer = createMenuRenderer(props);

              popup = tippy('body', {
                getReferenceClientRect: () => props.clientRect!()!,
                appendTo: () => document.body,
                content: menuRenderer.ref,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                ...this.options.tippy,
              });
            },

            onUpdate(props) {
              menuRenderer.setMenuItems(props.items);
            },

            onKeyDown: props => {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return menuRenderer.onKeyDown(props);
            },

            onExit() {
              menuRenderer.dispose();
              popup[0].destroy();
            },

            ...this.options.suggestion.render?.(),
          };
        },
      }),
    ];
  },
});
