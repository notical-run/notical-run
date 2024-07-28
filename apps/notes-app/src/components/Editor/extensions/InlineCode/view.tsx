import { createSolidNodeView } from '@/components/Editor/node-view-renderer';
import { cn } from '@/utils/classname';
import { Result } from '@/utils/result';
import { createMemo, Match, Switch } from 'solid-js';

export type InlineCodeAttrs = {
  result?: null | Result<Error, any>;
};

export const inlineCodeNodeView = createSolidNodeView<InlineCodeAttrs>(
  ({ NodeContent, HTMLAttributes, attrs }) => {
    return (
      <span>
        <NodeContent
          as="code"
          class={cn(
            `bg-slate-800 text-violet-300 before:content-[""] after:content-[""] rounded`,
            HTMLAttributes.class,
          )}
        />

        <span contenteditable={false}>
          <EvalResult result={attrs.result} />
        </span>
      </span>
    );
  },
);

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

const EvalResult = (props: { result: InlineCodeAttrs['result'] }) => {
  const evalResult = createMemo(() => props.result && Result.asValue(props.result!));
  const evalResultString = createMemo(() => props.result && toEvaluatedString(evalResult()));
  const evalError = createMemo(() => props.result && Result.asError(props.result));

  return (
    <Switch>
      <Match when={!props.result}>
        <></>
      </Match>

      <Match when={Result.isErr(props.result!)}>
        <code class='bg-red-100 text-red-500 before:content-[":"] before:pr-1 after:content-none pr-1'>
          {evalError()?.message ?? `${evalError() || 'Unknown error'}`}
        </code>
      </Match>

      <Match when={typeof evalResult() === 'function'}>
        <button
          class="text-white bg-violet-600 size-5 rounded-full text-xs leading-0 pb-0.5 pl-0.5 ml-1 -mt-2 select-none"
          onClick={(_e: MouseEvent) => (evalResult() as any)?.()}
        >
          ▶
        </button>
      </Match>

      <Match when={Result.isOk(props.result!)}>
        <code
          class={
            'bg-violet-200 text-slate-500 before:content-[":"] before:pr-1 after:content-none pr-1'
          }
        >
          {evalResultString()}
        </code>
      </Match>
    </Switch>
  );
};
