import { slashCommands } from '@/components/Editor/extensions/SlashCommands/commands';
import { SlashCommand, SlashMenu } from '@/components/Editor/extensions/SlashCommands/view';
import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionProps } from '@tiptap/suggestion';
import { createRoot, createSignal } from 'solid-js';
import tippy, { Instance as TippyInstance } from 'tippy.js';

export const SlashCommandsExtension = Extension.create({
  name: 'commands',

  addOptions() {
    return { suggestion: {} };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        // startOfLine: true,

        allow: ({ state, range }) => {
          const resolvedPos = state.doc.resolve(range.from);
          return resolvedPos.node().type.name === 'paragraph';
        },

        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },

        ...this.options.suggestion,

        items: ({ query }): SlashCommand[] => {
          if (!query.trim()) return slashCommands;
          return slashCommands.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          );
        },

        render: () => {
          return createRoot(disposeFn => {
            let $element: HTMLElement;
            let popup: TippyInstance[];
            const [itemsAccessor, setItems] = createSignal<any[]>([]);
            const [highlightedIndex, setHighlightedIndex] = createSignal<number>(0);

            const onSelect =
              (props: Pick<SuggestionProps<never, never>, 'editor' | 'range'>) =>
              (item: SlashCommand) => {
                item.command({ editor: props.editor, range: props.range });
              };

            return {
              onStart: props => {
                setItems(props.items);

                $element = (
                  <SlashMenu
                    items={itemsAccessor()}
                    onSelect={onSelect(props)}
                    highlightedIndex={highlightedIndex()}
                    setHighlightedIndex={setHighlightedIndex}
                  />
                ) as HTMLElement;

                popup = tippy('body', {
                  getReferenceClientRect: () => props.clientRect!()!,
                  appendTo: () => document.body,
                  content: $element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate(props) {
                setItems(props.items);
              },

              onKeyDown: props => {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }

                const items = itemsAccessor();

                if (props.event.key === 'ArrowDown') {
                  setHighlightedIndex(index => (index + 1) % items.length);
                  return true;
                }
                if (props.event.key === 'ArrowUp') {
                  setHighlightedIndex(index => (index <= 0 ? items.length - 1 : index - 1));
                  return true;
                }
                if (props.event.key === 'Enter') {
                  const item: SlashCommand | undefined = items[highlightedIndex()];
                  item && onSelect({ editor: this.editor, ...props })(item);
                  return true;
                }

                return false;
              },

              onExit() {
                disposeFn();
                popup[0].destroy();
              },
            };
          });
        },
      }),
    ];
  },
});
