import type { Mark, Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { evalExpression } from '../../utils/eval-expression';
import { evalModule } from '../../utils/eval-module';

const isEvalable = (node: Node) =>
  [null, 'javascript'].includes(node.attrs.language);

const nodeCodeCache = new Map<string, string>();

const findMarkById = (editor: Editor, id: string): Mark | null => {
  let foundNode = null;
  editor.state.doc.content.descendants(node => {
    if (node.isText) {
      const mark = node.marks.find(m => m.attrs?.nodeId === id);
      if (mark) {
        foundNode = mark;
        return false;
      }
    }
  });

  return foundNode;
};

export const evaluateAllNodes = (editor: Editor) => {
  console.log('>>>> on update...', editor.state.doc.toJSON());

  const walkNode = async (node: Node, pos: number) => {
    if (node.type.name === 'codeBlock' && isEvalable(node)) {
      const previousCode = nodeCodeCache.get(node.attrs.nodeId);
      if (previousCode === node.textContent) return;

      let exports = null;
      try {
        nodeCodeCache.set(node.attrs.nodeId, node.textContent);
        exports = await evalModule(
          node.textContent || 'null',
          node.attrs.nodeId,
        );
      } catch (e) {
        exports = `${e}`;
      }
      const tr = editor.state.tr;
      editor.view.dispatch(tr.setNodeAttribute(pos, 'exports', exports));
      return;
    }

    if (node.isText) {
      const nodeMark = node.marks.find(m => m.type.name === 'inlineCode');
      if (!nodeMark) return;
      let result = null;
      try {
        result = await evalExpression(node.text || 'null', result => {
          const mark = findMarkById(editor, nodeMark.attrs.nodeId);
          if (mark) {
            const tr = editor.state.tr;
            mark.removeFromSet(node.marks);
            (mark as any).attrs = { ...mark.attrs, result };
            mark.addToSet(node.marks);
            editor.view.dispatch(tr);
          }
        });
      } catch (e) {
        result = `${e}`;
        const tr = editor.state.tr;
        nodeMark.removeFromSet(node.marks);
        (nodeMark as any).attrs = { ...nodeMark.attrs, result };
        nodeMark.addToSet(node.marks);
        editor.view.dispatch(tr);
      }
      return;
    }
  };

  editor.state.doc.content.descendants((node, pos) => {
    walkNode(node, pos);
  });
};
