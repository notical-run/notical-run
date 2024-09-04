import { createSolidNodeView } from '@/components/Editor/node-view-renderer';
import { cn } from '@/utils/classname';
import { Result } from '@/utils/result';
import { Switch, Match, For } from 'solid-js';
import { BsArrowsExpand, BsPlay, BsPlayCircle } from 'solid-icons/bs';
import { AiOutlineMinus, AiOutlineStop } from 'solid-icons/ai';
import { Button } from '@/components/_base/Button';

export type CodeBlockAttrs = {
  collapsed: boolean;
  exports?: null | Result<Error, Record<string, any>>;
  language?: string;
  nodeId?: string | null;
};

export const codeBlockNodeView = createSolidNodeView<CodeBlockAttrs>(
  ({ NodeContent, HTMLAttributes, attrs, updateAttributes }) => {
    const toggleCollapsed = () => {
      updateAttributes({ collapsed: !attrs.collapsed }, { skipHistory: true });
    };

    const toggleEvaluation = () => {
      const language = attrs.language === 'text' ? 'javascript' : 'text';
      // Reset nodeId to issue a new id and get the code block re-evaluated
      updateAttributes({ language, exports: null, nodeId: null }, { skipHistory: true });
    };

    return (
      <div data-collapsed={attrs.collapsed}>
        <div
          contenteditable={false}
          class={cn(
            'flex items-center gap-2 w-full h-6 overflow-hidden',
            'bg-slate-100 text-slate-500 text-left text-xs',
            attrs.collapsed ? 'rounded' : 'rounded-t',
          )}
        >
          <button
            class="flex-1 flex items-center justify-left pl-2 py-1 gap-2"
            onClick={toggleCollapsed}
          >
            <div>{attrs.collapsed ? <BsArrowsExpand /> : <AiOutlineMinus />}</div>
            <div
              class={cn('flex-1 h-0 border-b border-b-slate-400 border-dashed', {
                'opacity-0': !attrs.collapsed,
              })}
            />
          </button>

          <ToggleCodeEvaluationBtn language={attrs.language} toggleEvaluation={toggleEvaluation} />
        </div>

        <pre
          {...HTMLAttributes}
          class={cn('hljs', 'rounded-none rounded-b', HTMLAttributes.class, 'mt-0 mb-0', {
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

const ToggleCodeEvaluationBtn = (
  props: Pick<CodeBlockAttrs, 'language'> & { toggleEvaluation: () => void },
) => {
  return (
    <button
      class="flex items-center justify-center px-2 h-full rounded hover:bg-slate-200 text-md"
      onClick={props.toggleEvaluation}
    >
      {props.language === 'text' ? (
        <span class="flex items-center gap-1 text-slate-400">
          <BsPlayCircle /> Enable
        </span>
      ) : (
        <span class="flex items-center gap-1 text-slate-400">
          <AiOutlineStop /> Disable
        </span>
      )}
    </button>
  );
};

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
            'bg-slate-900 text-red-500 text-xs',
            'block px-2 py-1 after:content-none before:content-none mb-6',
            props.collapsed ? 'rounded-b mt-0' : 'rounded-md mt-1',
          )}
        >
          {`${Result.isErr(props.exports!) && toErrorMessage(props.exports.error)}`}
        </code>
      </Match>

      <Match when={Result.isOk(props.exports!)}>
        <div class="flex justify-end flex-wrap gap-2 mb-6 mt-1">
          <For each={Object.entries(Result.isOk(props.exports!) ? props.exports.value : {})}>
            {([key, value]) => (
              <Button
                variant="accent"
                size="sm"
                onClick={() => (value as any)()}
                onPointerDown={(e: any) => e.preventDefault()}
              >
                {key}
              </Button>
            )}
          </For>
        </div>
      </Match>
    </Switch>
  );
};
