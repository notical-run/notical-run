import { SuggestionsItem, SuggestionsMenu } from '@/components/Editor/suggestions/view';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { createRoot, createSignal } from 'solid-js';

export const createMenuRenderer = (props: SuggestionProps) =>
  createRoot(dispose => {
    const [menuItems, setMenuItems] = createSignal<any[]>(props.items);
    const [highlightedIndex, setHighlightedIndex] = createSignal<number>(0);

    const onSelect =
      (props: Pick<SuggestionProps<never, never>, 'editor' | 'range'>) =>
      (item: SuggestionsItem) => {
        item.command({ editor: props.editor, range: props.range });
      };

    const ref = (
      <SuggestionsMenu
        items={menuItems()}
        onSelect={onSelect(props)}
        highlightedIndex={highlightedIndex()}
        setHighlightedIndex={setHighlightedIndex}
      />
    ) as HTMLElement;

    const onKeyDown = (keyDownProps: SuggestionKeyDownProps): boolean => {
      const items = menuItems();
      const e = keyDownProps.event;

      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
        setHighlightedIndex(index => (index + 1) % items.length);
        return true;
      }

      if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
        setHighlightedIndex(index => (index <= 0 ? items.length - 1 : index - 1));
        return true;
      }

      if (e.key === 'Enter') {
        const item: SuggestionsItem | undefined = items[highlightedIndex()];
        item && onSelect({ editor: props.editor, ...keyDownProps })(item);
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

export type MenuRenderer = ReturnType<typeof createMenuRenderer>;
