import { DropdownMenu } from '@/components/_base/DropdownMenu';
import { createSolidDecoration } from '@/components/Editor/node-view-renderer/decoration';
import {
  AiOutlineInsertRowAbove,
  AiOutlineInsertRowBelow,
  AiOutlineInsertRowLeft,
  AiOutlineInsertRowRight,
  AiOutlineDeleteRow,
  AiOutlineDeleteColumn,
  AiOutlineDelete,
} from 'solid-icons/ai';
import { BsThreeDotsVertical } from 'solid-icons/bs';

export const tableControlHandleDecorator = createSolidDecoration(({ editor }) => {
  return (
    <div class="relative w-0 h-0 z-[1]">
      <DropdownMenu placement="bottom-end" offset={10}>
        <DropdownMenu.Trigger
          as="button"
          class="absolute -left-2.5 top-0 bg-slate-50 rounded w-4 h-6 shadow border border-slate-50 flex justify-center items-center"
        >
          <BsThreeDotsVertical />
        </DropdownMenu.Trigger>

        <DropdownMenu.Items>
          <DropdownMenu.Item onClick={() => editor.chain().focus().addRowBefore().run()}>
            <AiOutlineInsertRowAbove />
            Add row above
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().addRowAfter().run()}>
            <AiOutlineInsertRowBelow />
            Add row below
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <AiOutlineInsertRowLeft />
            Add column left
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <AiOutlineInsertRowRight />
            Add column right
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().deleteRow().run()}>
            <AiOutlineDeleteRow class="text-red-500" />
            Delete row
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().deleteColumn().run()}>
            <AiOutlineDeleteColumn class="text-red-500" />
            Delete column
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().deleteTable().run()}>
            <AiOutlineDelete class="text-red-500" />
            Delete table
          </DropdownMenu.Item>
        </DropdownMenu.Items>
      </DropdownMenu>
    </div>
  );
});
