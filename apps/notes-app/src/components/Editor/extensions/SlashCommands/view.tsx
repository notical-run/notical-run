import { cn } from '@/utils/classname';
import { Editor, Range } from '@tiptap/core';
import { For, JSX, Match, Switch } from 'solid-js';

export type SlashCommand = {
  id: string;
  icon?: () => JSX.Element;
  label: string;
  command: (opts: { editor: Editor; range: Range }) => void;
};

export type SlashMenuProps = {
  items: SlashCommand[];
  onSelect: (item: SlashCommand) => void;
  highlightedIndex: number;
  setHighlightedIndex: (n: number) => void;
};

export const SlashMenu = (props: SlashMenuProps) => {
  return (
    <div>
      <Switch>
        <Match when={(props.items as any).error}>
          <div class="bg-slate-800 px-2 py-2 rounded text-red-400">
            {(props.items as any).error}
          </div>
        </Match>

        <Match when={props.items.length > 0}>
          <div class="bg-white shadow-md border border-slate-200" role="listbox">
            <For each={props.items}>
              {(item, index) => (
                <button
                  class={cn(
                    'flex w-full items-center min-w-40 px-2 py-1',
                    'gap-3 text-left text-slate-500',
                    { 'bg-slate-200': index() === props.highlightedIndex },
                  )}
                  onClick={() => props.onSelect(item)}
                  onMouseOver={() => props.setHighlightedIndex(index())}
                  data-action={item.id}
                  role="listitem"
                  aria-selected={index() === props.highlightedIndex}
                >
                  {item.icon?.()}
                  <span class="text-slate-800">{item.label}</span>
                </button>
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </div>
  );
};
