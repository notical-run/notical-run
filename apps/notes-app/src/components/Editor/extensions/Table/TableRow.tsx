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
          <DropdownMenu.Item onClick={() => editor.chain().focus().deleteRow().run()}>
            <AiOutlineDelete />
            Delete row
          </DropdownMenu.Item>
        </DropdownMenu.Items>
      </DropdownMenu>
    </div>
  );
});

export const TableRowWithHandle = TableRow.extend({
  addProseMirrorPlugins() {
    const { editor, type: tableRowType } = this;

    const getTableRowNode = (pos: ResolvedPos) => {
      for (let i = 2; i <= pos.depth; i++) {
        const node = pos.node(i);
        if (node.type === tableRowType) return [node, i] as const;
      }
      return [null, null];
    };

    let sharedRenderers: DecorationRenderer[] = [];

    const createRenderer = ({ selection }: EditorState) => {
      const [selectedRow, _depth] = getTableRowNode(selection.$anchor);
      if (!selectedRow) return null;
      const getPos = () => {
        const [selectedRow, depth] = getTableRowNode(selection.$anchor);
        if (!selectedRow) return selection.anchor;
        return selection.$from.before(depth);
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
            const [selectedRow, _depth] = getTableRowNode(selection.$anchor);
            if (selectedRow) value.renderer.update(selectedRow);
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
            const [selectedRow, depth] = getTableRowNode(selection.$anchor);
            if (!selectedRow) return;
            const rowStart = selection.$from.before(depth);
            const rowEnd = selection.$from.after(depth);

            const decorations: Decoration[] = [];

            const decoratorState = this.getState(state);
            doc.descendants((node, pos) => {
              if (node?.type !== tableRowType) return;
              if (rowStart > pos || rowEnd <= pos) return;

              const $element = decoratorState?.renderer?.dom as HTMLElement;
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
