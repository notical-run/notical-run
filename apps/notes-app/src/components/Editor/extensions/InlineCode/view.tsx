import { createSolidNodeView } from '@/components/Editor/node-view-renderer';
import { cn } from '@/utils/classname';
import { Result } from '@/utils/result';
import { Editor } from '@tiptap/core';
import { createEffect, createMemo, Match, Show, Switch } from 'solid-js';
import { FaSolidCirclePlay } from 'solid-icons/fa';

export type InlineCodeAttrs = {
  result?: null | Result<Error, any>;
  anchoredContent?: null | string;
};

export const inlineCodeNodeView = createSolidNodeView<InlineCodeAttrs>(
  ({ NodeContent, HTMLAttributes, attrs, editor }) => {
    return (
      <span>
        <NodeContent
          as="code"
          class={cn(
            `bg-slate-800 text-violet-300`,
            'before:content-[""] after:content-[""]',
            HTMLAttributes.class,
          )}
        />

        <span contenteditable={false}>
          <EvalResult result={attrs.result} />
          <Show when={attrs.anchoredContent}>
            <AnchoredContent editor={editor} content={attrs.anchoredContent} />
          </Show>
        </span>
      </span>
    );
  },
);

export const AnchoredContent = (props: {
  editor: Editor;
  content: InlineCodeAttrs['anchoredContent'];
}) => {
  let editorEl: HTMLDivElement | undefined;

  createEffect(() => {
    if (!props.content || !editorEl) return;
    if (!props.content?.trim()) return null;
    if (!props.editor.extensionStorage.markdown?.parser) {
      throw new Error('Markdown parser not found');
    }

    // TODO: Use readonly tiptap instance instead?
    const contentHTML: string =
      props.editor.extensionStorage.markdown.parser.parse(props.content) ?? '';
    if (!contentHTML.trim()) return null;

    editorEl.innerHTML = contentHTML!;
  });

  return (
    <div
      contenteditable={false}
      ref={el => (editorEl = el)}
      class="border border-slate-300 px-2 py-1"
    />
  );
};

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
          class="text-violet-600 text-xl hover:text-violet-500 size-5 rounded-full pl-1 pt-1 pr-6 select-none"
          onClick={(_e: MouseEvent) => (evalResult() as any)?.()}
        >
          <FaSolidCirclePlay />
        </button>
      </Match>

      <Match when={Result.isOk(props.result!) && evalResultString()}>
        <code class='bg-violet-200 text-slate-500 before:content-[":"] before:pr-1 before:pl-1 after:content-none pr-1'>
          {evalResultString()}
        </code>
      </Match>
    </Switch>
  );
};
