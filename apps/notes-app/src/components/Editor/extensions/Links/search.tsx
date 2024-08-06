import { fetchWorkspaceNotes } from '@/api/queries/workspace';
import { SlashCommand, SlashMenu } from '@/components/Editor/extensions/SlashCommands/view';
import { toApiErrorMessage } from '@/utils/api-client';
import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { createRoot, createSignal } from 'solid-js';
import tippy, { Instance as TippyInstance } from 'tippy.js';

export const LinkSearchExtension = Extension.create({
  name: 'linkSearch',

  addOptions() {
    return { suggestion: {} };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey('linkSearchSuggestions'),
        editor: this.editor,
        char: '@',
        allowSpaces: false,

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

        items: async ({ query }): Promise<SlashCommand[] | { error: string }> => {
          const matches = query.trim().match(/^([a-z0-9-_]+)\/$/i);
          if (!matches?.[1]) return [];

          try {
            const notes = await fetchWorkspaceNotes(matches[1]);
            return notes.map(note => ({
              id: note.id,
              label: `@${note.workspace.slug}/${note.name}`,
              command: ({ editor, range }) => {
                editor.chain().focus().insertNoteLink(note.workspace.slug, note.name, range).run();
              },
            }));
          } catch (e) {
            const msg = toApiErrorMessage(e);
            if (!msg) return [];
            return { error: msg };
          }
        },

        render: () => {
          const createMenuRenderer = (props: SuggestionProps) =>
            createRoot(dispose => {
              const [menuItems, setMenuItems] = createSignal<any[]>(props.items);
              const [highlightedIndex, setHighlightedIndex] = createSignal<number>(0);

              const onSelect =
                (props: Pick<SuggestionProps<never, never>, 'editor' | 'range'>) =>
                (item: SlashCommand) => {
                  item.command({ editor: props.editor, range: props.range });
                };

              const ref = (
                <SlashMenu
                  items={menuItems()}
                  onSelect={onSelect(props)}
                  highlightedIndex={highlightedIndex()}
                  setHighlightedIndex={setHighlightedIndex}
                />
              ) as HTMLElement;

              const onKeyDown = (props: SuggestionKeyDownProps): boolean => {
                const items = menuItems();
                const e = props.event;

                if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
                  setHighlightedIndex(index => (index + 1) % items.length);
                  return true;
                }

                if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
                  setHighlightedIndex(index => (index <= 0 ? items.length - 1 : index - 1));
                  return true;
                }

                if (e.key === 'Enter') {
                  const item: SlashCommand | undefined = items[highlightedIndex()];
                  item && onSelect({ editor: this.editor, ...props })(item);
                  return true;
                }

                return false;
              };

              return {
                ref,
                menuItems,
                setMenuItems,
                highlightedIndex,
                setHighlightedIndex,
                onSelect,
                onKeyDown,
                dispose,
              };
            });

          let menuRenderer: ReturnType<typeof createMenuRenderer>;
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
          };
        },
      }),
    ];
  },
});
