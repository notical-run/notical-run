import TableRow from '@tiptap/extension-table-row';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ResolvedPos } from '@tiptap/pm/model';
import { BsThreeDotsVertical } from 'solid-icons/bs';
import {
  createSolidDecoration,
  DecorationRenderer,
} from '@/components/Editor/node-view-renderer/decoration';
import { DropdownMenu } from '@/components/_base/DropdownMenu';
import { TbTableDown, TbTableImport } from 'solid-icons/tb';
import { AiOutlineDelete } from 'solid-icons/ai';
import { Extension } from '@tiptap/core';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

const tableRowActions = createSolidDecoration(({ editor }) => {
  return (
    <div class="relative w-0 h-0 z-[1]">
      <DropdownMenu placement="bottom-start" offset={10}>
        <DropdownMenu.Trigger
          as="button"
          class="absolute -left-2.5 top-0 bg-slate-50 rounded w-4 h-6 shadow border border-slate-50 flex justify-center items-center"
        >
          <BsThreeDotsVertical />
        </DropdownMenu.Trigger>

        <DropdownMenu.Items>
          <DropdownMenu.Item onClick={() => editor.chain().focus().addRowBefore().run()}>
            <TbTableImport />
            Add row before
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => editor.chain().focus().addRowAfter().run()}>
            <TbTableDown />
            Add row after
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <TbTableImport />
            Add column before
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <TbTableDown />
            Add column after
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => editor.chain().focus().deleteRow().run()}>
            <AiOutlineDelete />
            Delete row
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => editor.chain().focus().deleteColumn().run()}>
            <AiOutlineDelete />
            Delete column
          </DropdownMenu.Item>
        </DropdownMenu.Items>
      </DropdownMenu>
    </div>
  );
});

export const TableRowWithHandle = Extension.create({
  addProseMirrorPlugins() {
    const { editor } = this;
    const tableCellType = editor.schema.nodes[TableCell.name];
    const tableHeaderType = editor.schema.nodes[TableHeader.name];
    const tableRowType = editor.schema.nodes[TableRow.name];

    const getTableCellSelection = (pos: ResolvedPos) => {
      for (let i = pos.depth; i >= 2; i--) {
        const node = pos.node(i);
        if (node.type === tableCellType || node.type === tableHeaderType)
          return {
            cell: node,
            row: pos.node(i - 1),
            cellDepth: i,
            rowDepth: i - 1,
          };
      }
      return null;
    };

    let sharedRenderers: DecorationRenderer[] = [];

    const createRenderer = ({ selection }: EditorState) => {
      const tableSelection = getTableCellSelection(selection.$anchor);
      const selectedRow = tableSelection?.row;
      if (!selectedRow) return null;

      const getPos = () => {
        const tableSelection = getTableCellSelection(selection.$anchor);
        if (!selectedRow) return selection.anchor;
        return selection.$anchor.before(tableSelection?.rowDepth);
      };

      const renderer = tableRowActions({ node: selectedRow, editor, getPos });
      sharedRenderers.push(renderer);
      return renderer;
    };

    return [
      new Plugin({
        key: new PluginKey('tableRowAction'),
        state: {
          toJSON: () => null,
          fromJSON: () => null,
          init(_config, state) {
            return { renderer: createRenderer(state) };
          },
          apply(_tr, value, _oldState, state) {
            const { selection } = state;
            if (!value?.renderer) return { renderer: createRenderer(state) };
            const tableSelection = getTableCellSelection(selection.$anchor);
            if (tableSelection?.row) value.renderer.update(tableSelection.row);
            return value;
          },
        },

        view() {
          return {
            destroy: () => {
              sharedRenderers.forEach(renderer => renderer.destroy());
              sharedRenderers = [];
            },
          };
        },

        props: {
          decorations(state) {
            const { doc, selection } = state;
            if (!editor.isEditable) return;
            const tableSelection = getTableCellSelection(selection.$anchor);
            const selectedRow = tableSelection?.row;
            if (!selectedRow) return;
            const rowStart = selection.$anchor.before(tableSelection?.rowDepth);
            const rowEnd = selection.$anchor.after(tableSelection?.rowDepth);

            const decorations: Decoration[] = [];

            const decoratorState = this.getState(state);
            doc.descendants((node, pos) => {
              if (node?.type !== tableRowType) return;
              if (rowStart > pos || rowEnd <= pos) return;

              const cellPos = selection.$anchor.posAtIndex(0, tableSelection.cellDepth);
              const cellEl = editor.view.domAtPos(cellPos);
              const $element = decoratorState?.renderer?.dom as HTMLElement;
              if (cellEl?.node) {
                const left = (cellEl.node as HTMLElement).offsetLeft;
                $element.style.left = `${left}px`;
              }
              decorations.push(Decoration.widget(pos, $element));

              return false;
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
