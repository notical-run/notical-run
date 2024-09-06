import { Extension } from '@tiptap/core';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { ResolvedPos } from '@tiptap/pm/model';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { DecorationRenderer } from '@/components/Editor/node-view-renderer/decoration';
import { tableControlHandleDecorator } from '@/components/Editor/extensions/Table/TableControlHandleDecorator';

export const TableControlHandle = Extension.create({
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

      const renderer = tableControlHandleDecorator({ node: selectedRow, editor, getPos });
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
                const $cell = cellEl.node as HTMLElement;
                const left = $cell.offsetLeft + $cell.clientWidth - 10;
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
