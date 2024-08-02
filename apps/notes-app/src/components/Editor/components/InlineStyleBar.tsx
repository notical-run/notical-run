import { Editor as TiptapEditor } from '@tiptap/core';
import { JSX, Ref, Show } from 'solid-js';
import { cn } from '@/utils/classname';
import { FaSolidCode, FaSolidLink, FaSolidListCheck } from 'solid-icons/fa';
import { FaSolidListUl } from 'solid-icons/fa';
import { UpdateLinkModal } from '@/components/Editor/components/UpdateLinkModal';
import { Dialog } from '@/components/_base/Dialog';

const Action = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) => (
  <button
    {...props}
    class={cn(
      'text-xs flex items-center justify-center',
      'min-w-7 px-2 py-1',
      'border-r border-r-slate-300 last:border-none',
      'hover:bg-slate-200',
      props.class,
      { 'bg-slate-200': props.active },
    )}
  />
);

export const InlineStyleBar = (props: {
  class?: string;
  editor?: TiptapEditor;
  ref?: Ref<HTMLDivElement>;
}) => {
  return (
    <div
      class={cn('bg-white border border-slate-200 shadow-lg rounded z-10', props.class)}
      ref={props.ref}
    >
      <Show when={props.editor}>
        <div class="flex justify-start items-stretch">
          <Action onClick={() => props.editor?.chain().focus().toggleBold().run()}>
            <span class="font-bold">B</span>
          </Action>

          <Action onClick={() => props.editor?.chain().focus().toggleItalic().run()}>
            <span class="italic">I</span>
          </Action>

          <Action onClick={() => props.editor?.chain().focus().toggleCode().run()}>
            <FaSolidCode />
          </Action>

          <Action onClick={() => props.editor?.chain().focus().toggleBulletList().run()}>
            <FaSolidListUl />
          </Action>

          <Action onClick={() => props.editor?.chain().focus().toggleTaskList().run()}>
            <FaSolidListCheck />
          </Action>

          <UpdateLinkModal
            getValue={() => props.editor?.getAttributes('link')?.href as string}
            onSubmit={link => {
              if (!link) props.editor?.chain().focus().unsetLink().run();
              else props.editor?.chain().focus().setLink({ href: link }).run();
            }}
          >
            <Dialog.Trigger as={Action}>
              <FaSolidLink />
            </Dialog.Trigger>
          </UpdateLinkModal>
        </div>
      </Show>
    </div>
  );
};
