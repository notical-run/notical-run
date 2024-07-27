import { createSolidNodeView } from '@/components/Editor/node-view-renderer';
import { cn } from '@/utils/classname';
import { Result } from '@/utils/result';
import { Switch, Match, For } from 'solid-js';
import { BsArrowsExpand } from 'solid-icons/bs';
import { AiOutlineMinus } from 'solid-icons/ai';
import { Button } from '@/components/_base/Button';

export type CodeBlockAttrs = {
  collapsed: boolean;
  exports?: null | Result<Error, Record<string, any>>;
};

export const codeBlockNodeView = createSolidNodeView<CodeBlockAttrs>(
  ({ NodeContent, HTMLAttributes, attrs, updateAttributes }) => {
    const toggleCollapsed = () => {
      updateAttributes({ collapsed: !attrs.collapsed }, { skipHistory: true });
    };

    return (
      <div data-collapsed={attrs.collapsed}>
        <button
          contenteditable={false}
          class={cn(
            'flex items-center gap-2',
            'w-full px-2 py-1',
            'bg-gray-100',
            'text-slate-500 text-left text-xs',
            attrs.collapsed ? 'rounded' : '-mb-6 rounded-t',
          )}
          onClick={toggleCollapsed}
        >
          <div>{attrs.collapsed ? <BsArrowsExpand /> : <AiOutlineMinus />}</div>
          {attrs.collapsed && <div class="flex-1 border-b border-b-slate-300 border-dashed" />}
        </button>

        <pre
          class={cn('hljs', 'rounded-none rounded-b', HTMLAttributes.class, {
            hidden: attrs.collapsed,
          })}
        >
          <NodeContent as="code" />
        </pre>

        <div contenteditable={false}>
          <ExportsView exports={attrs.exports} collapsed={attrs.collapsed} />
        </div>
      </div>
    );
  },
);

const ExportsView = (props: Pick<CodeBlockAttrs, 'exports' | 'collapsed'>) => {
  const toErrorMessage = (e: any) => {
    if (!e) return null;
    if (typeof e === 'string') return e;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.message === 'string') return e.message;
    return `${e}`.startsWith('[object') ? 'Unknown Error' : `${e}`;
  };

  return (
    <Switch>
      <Match when={!props.exports}>{null}</Match>

      <Match when={Result.isErr(props.exports!)}>
        <code
          class={cn(
            'bg-slate-900 text-red-500 text-sm',
            'block px-2 py-1 after:content-none before:content-none mb-6',
            props.collapsed ? 'rounded-b mt-0' : 'rounded-md -mt-5',
          )}
        >
          {`${Result.isErr(props.exports!) && toErrorMessage(props.exports.error)}`}
        </code>
      </Match>

      <Match when={Result.isOk(props.exports!)}>
        <div
          class={cn('flex justify-end flex-wrap gap-2 mb-6', props.collapsed ? 'mt-3' : '-mt-4')}
        >
          <For each={Object.entries(Result.isOk(props.exports!) ? props.exports.value : {})}>
            {([key, value]) => (
              <Button variant="accent" size="sm" onClick={() => (value as any)()}>
                {key}
              </Button>
            )}
          </For>
        </div>
      </Match>
    </Switch>
  );
};
