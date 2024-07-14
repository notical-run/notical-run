import type { Mark, Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { evalExpression } from '@/utils/eval-expression';
import { evalModule } from '@/utils/eval-module';
import { Result } from '@/utils/result';
import { EvalEngine } from '@/engine/types';

const isEvalable = (node: Node) => [null, 'javascript'].includes(node.attrs.language);

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

export const defaultEvalBlock = async (node: Node, pos: number, engine: EvalEngine) => {
  const exports = await evalModule(node.textContent || 'null', engine, {
    id: node.attrs.nodeId,
    pos,
    nodeSize: node.nodeSize,
  });

  engine.withEditor(editor => {
    const tr = editor.state.tr;
    editor.view.dispatch(tr.setNodeAttribute(pos, 'exports', exports));
  });
};

type Options = {
  evalBlock?: (node: Node, pos: number, engine: EvalEngine) => Promise<void> | void;
};

export const evaluateAllNodes = async (
  editor: Editor,
  engine: EvalEngine,
  { evalBlock = defaultEvalBlock }: Options,
) => {
  const evalutingNodes = new Set<Node>();
  let resolver = (_: unknown) => {};
  const waitForEvaluation = new Promise(resolve => (resolver = resolve));

  const onNodeEvalComplete = (node: Node) => {
    evalutingNodes.delete(node);
    if (evalutingNodes.size === 0) resolver(null);
  };

  console.log('>>>> on update...', editor.state.doc.toJSON());
  engine.onContentUpdate();

  const walkNode = async (node: Node, pos: number) => {
    try {
      // Code block
      if (node.type.name === 'codeBlock' && isEvalable(node)) {
        const previousCode = engine.nodeCache.get(node.attrs.nodeId);
        if (previousCode?.code === node.textContent) return;

        previousCode?.cleanup();
        engine.nodeCache.set(node.attrs.nodeId, {
          code: node.textContent,
          cleanup: () => {}, // TODO: Handle cleanup if using signals
        });

        await evalBlock(node, pos, engine);

        return;
      }

      // Inline code
      if (node.isText) {
        const nodeMark = node.marks.find(m => m.type.name === 'inlineCode');
        if (!nodeMark) return;
        const previousCode = engine.nodeCache.get(nodeMark.attrs.nodeId);
        if (previousCode?.code === node.textContent) return;

        const onResult = (result: Result<Error, any>) => {
          const mark = findMarkById(editor, nodeMark.attrs.nodeId);
          if (!mark) return;

          const tr = editor.state.tr;
          mark.removeFromSet(node.marks);
          (mark as any).attrs = { ...mark.attrs, result };
          mark.addToSet(node.marks);
          editor.view.dispatch(tr);
        };

        previousCode?.cleanup();

        await evalExpression(node.text || 'null', {
          onResult,
          handleCleanup: cleanup => {
            engine.nodeCache.set(nodeMark.attrs.nodeId, {
              code: node.textContent,
              cleanup,
            });
          },
          engine,
          options: {
            pos,
            id: nodeMark.attrs.nodeId,
            nodeSize: node.nodeSize,
          },
        });
      }
    } finally {
      onNodeEvalComplete(node);
    }
  };

  editor.state.doc.content.descendants((node, pos) => {
    evalutingNodes.add(node);
    walkNode(node, pos);
  });

  return waitForEvaluation;
};
