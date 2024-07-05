import type { Mark, Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { evalExpression } from '../../utils/eval-expression';
import { evalModule } from '../../utils/eval-module';
import { Result } from '../../utils/result';

const isEvalable = (node: Node) =>
  [null, 'javascript'].includes(node.attrs.language);

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

const nodeCodeCache = new Map<string, string>();

export const evaluateAllNodes = (editor: Editor) => {
  console.log('>>>> on update...', editor.state.doc.toJSON());

  const withEditor = (fn: (f: Editor) => void) => fn(editor);

  const walkNode = async (node: Node, pos: number) => {
    // Code block
    if (node.type.name === 'codeBlock' && isEvalable(node)) {
      const previousCode = nodeCodeCache.get(node.attrs.nodeId);
      if (previousCode === node.textContent) return;

      nodeCodeCache.set(node.attrs.nodeId, node.textContent);

      const exports = await evalModule(node.textContent || 'null', {
        pos,
        id: node.attrs.nodeId,
        nodeSize: node.nodeSize,
        withEditor,
      });

      const tr = editor.state.tr;
      editor.view.dispatch(tr.setNodeAttribute(pos, 'exports', exports));

      return;
    }

    // Inline code
    if (node.isText) {
      const nodeMark = node.marks.find(m => m.type.name === 'inlineCode');
      if (!nodeMark) return;
      const previousCode = nodeCodeCache.get(nodeMark.attrs.nodeId);
      if (previousCode === node.textContent) return;

      nodeCodeCache.set(nodeMark.attrs.nodeId, node.textContent);

      const onResult = (result: Result<Error, any>) => {
        const mark = findMarkById(editor, nodeMark.attrs.nodeId);
        if (!mark) return;

        const tr = editor.state.tr;
        mark.removeFromSet(node.marks);
        (mark as any).attrs = { ...mark.attrs, result };
        mark.addToSet(node.marks);
        editor.view.dispatch(tr);
      };

      await evalExpression(node.text || 'null', onResult, {
        pos,
        id: nodeMark.attrs.nodeId,
        nodeSize: node.nodeSize,
        withEditor,
      });
    }
  };

  editor.state.doc.content.descendants((node, pos) => {
    walkNode(node, pos);
  });
};
