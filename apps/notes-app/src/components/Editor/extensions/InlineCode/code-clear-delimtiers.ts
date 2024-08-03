import { NodeType } from '@tiptap/pm/model';
import { Plugin, TextSelection, Transaction } from '@tiptap/pm/state';

export const codeClearDelimiters = (nodeType: NodeType) =>
  new Plugin({
    appendTransaction: (transactions, _oldState, newState) => {
      let tr: Transaction;
      let cursorPos: number;

      // If content is pasted, don't do this
      if (transactions.some(t => t.getMeta('paste'))) return;

      newState.doc.descendants((node, pos) => {
        if (node.type.name !== 'code') return;

        const textContent = node.textContent;
        if (textContent.length > 1 && textContent.startsWith('`') && textContent.endsWith('`'))
          return;

        tr = tr || newState.tr;

        if (newState.selection.from >= pos && newState.selection.from <= pos + node.nodeSize) {
          cursorPos = newState.selection.from;
        }

        const resolvedPos = tr.doc.resolve(pos);

        const match = textContent.match(/([^`]*)(`.+`)([^`]*)/);

        if (match && (match[1] || match[3])) {
          // If the code contains the delimiter backticks but contains text in the node outside delimiters,
          // move the boundaries of the node to only include the delimited text
          const [_, prefixText, code, suffixText] = match;
          if (suffixText) {
            try {
              cursorPos = tr.doc.resolve((cursorPos ?? 0) + suffixText.length).pos;
            } catch (e) {
              /* empty */
            }
          }

          tr.replaceWith(
            resolvedPos.pos,
            resolvedPos.pos + node.nodeSize,
            [
              prefixText ? newState.schema.text(prefixText) : null,
              nodeType.create(node.attrs, newState.schema.text(code)),
              suffixText ? newState.schema.text(suffixText) : null,
            ].filter(x => !!x),
          );
        } else if (textContent) {
          // If the code doesn't contain the right delimiters,
          // remove code node
          tr.replaceWith(
            resolvedPos.pos,
            resolvedPos.pos + node.nodeSize,
            newState.schema.text(textContent),
          );
        } else if (!textContent) {
          // If a code node is empty, remove it
          // !textContent in if is redundant but specified for clarity
          tr.delete(resolvedPos.pos, resolvedPos.pos + node.nodeSize);
        }
      });

      if (tr! && cursorPos! !== null) {
        try {
          // Can throw if calculated position cannot be resolved. Can be ignored
          tr.setSelection(TextSelection.create(tr.doc, cursorPos!));
        } catch (e) {
          /* empty */
        }
      }

      return tr!;
    },
  });
