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
        if (node.type.name === 'code') {
          const textContent = node.textContent;
          if (textContent.length > 1 && textContent.startsWith('`') && textContent.endsWith('`'))
            return;

          if (newState.selection.from >= pos && newState.selection.from <= pos + node.nodeSize) {
            cursorPos = newState.selection.from;
          }

          const match = textContent.match(/([^`]*)(`.+`)([^`]*)/);

          tr = tr || newState.tr;
          if (match && (match[1] || match[3])) {
            // If the code contains the delimiter backticks but contains text in the node outside delimiters,
            // move the boundaries of the node to only include the delimited text
            const [_, prefixText, code, suffixText] = match;
            if (suffixText) {
              try {
                const resolvedPos = tr.doc.resolve((cursorPos ?? 0) + suffixText.length);
                cursorPos = resolvedPos.pos;
              } catch (e) {
                /* empty */
              }
            }

            tr.replaceWith(
              pos,
              pos + node.nodeSize,
              [
                prefixText ? newState.schema.text(prefixText) : null,
                nodeType.create(null, newState.schema.text(code)),
                suffixText ? newState.schema.text(suffixText) : null,
              ].filter(x => !!x),
            );
          } else if (textContent) {
            // If the code doesn't contain the right delimiters,
            // remove code node
            tr.replaceWith(pos, pos + node.nodeSize, newState.schema.text(textContent));
          }

          return false;
        }
      });

      if (tr! && cursorPos! !== null) {
        try {
          tr.setSelection(TextSelection.create(tr.doc, cursorPos!));
        } catch (e) {
          /* empty */
        }
      }

      return tr!;
    },
  });
