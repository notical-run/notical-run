import { Editor } from '@tiptap/core';
import { Mark, Node } from '@tiptap/pm/model';

export const findMarkById = (
  editor: Editor,
  id: string,
): { node: Node; mark: Mark; pos: number } | null => {
  let foundNodePos = null;
  editor.state.doc.content.descendants((node, pos) => {
    if (node.isText) {
      const mark = node.marks.find(m => m.attrs?.nodeId === id);
      if (mark) {
        foundNodePos = { node, mark, pos };
        return false;
      }
    }
  });

  return foundNodePos;
};

export const setMarkAttributes = (node: Node, mark: Mark, attrs: Record<string, any>) => {
  mark.removeFromSet(node.marks);
  (mark as any).attrs = { ...mark.attrs, ...attrs };
  mark.addToSet(node.marks);
};
