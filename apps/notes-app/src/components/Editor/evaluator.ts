import type { Mark, Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { evalExpression } from '../../utils/eval-expression';
import { evalModule } from '../../utils/eval-module';
import { Result } from '../../utils/result';
import { ModuleLoader, onContentUpdate } from '../../utils/quickjs';

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

export const defaultEvalBlock = async (
  node: Node,
  pos: number,
  editor: Editor,
  moduleLoader: ModuleLoader,
) => {
  const exports = await evalModule(node.textContent || 'null', {
    pos,
    id: node.attrs.nodeId,
    nodeSize: node.nodeSize,
    withEditor: fn => fn(editor),
    moduleLoader,
  });

  const tr = editor.state.tr;
  editor.view.dispatch(tr.setNodeAttribute(pos, 'exports', exports));
};

const nodeCodeCache = new Map<string, { code: string; cleanup: () => void }>();

type Options = {
  evalBlock?: (
    node: Node,
    pos: number,
    editor: Editor,
    moduleLoader: ModuleLoader,
  ) => Promise<void> | void;
  moduleLoader: ModuleLoader;
};

export const evaluateAllNodes = async (
  editor: Editor,
  { evalBlock = defaultEvalBlock, moduleLoader }: Options,
) => {
  const evalutingNodes = new Set<Node>();
  let resolver = (_: unknown) => {};
  const waitForEvaluation = new Promise(resolve => (resolver = resolve));

  const onNodeEvalComplete = (node: Node) => {
    evalutingNodes.delete(node);
    if (evalutingNodes.size === 0) resolver(null);
  };

  console.log('>>>> on update...', editor.state.doc.toJSON());
  onContentUpdate();

  const walkNode = async (node: Node, pos: number) => {
    try {
      // Code block
      if (node.type.name === 'codeBlock' && isEvalable(node)) {
        const previousCode = nodeCodeCache.get(node.attrs.nodeId);
        if (previousCode?.code === node.textContent) return;

        previousCode?.cleanup();
        nodeCodeCache.set(node.attrs.nodeId, {
          code: node.textContent,
          cleanup: () => {}, // TODO: Handle cleanup if using signals
        });

        await evalBlock(node, pos, editor, moduleLoader);

        return;
      }

      // Inline code
      if (node.isText) {
        const nodeMark = node.marks.find(m => m.type.name === 'inlineCode');
        if (!nodeMark) return;
        const previousCode = nodeCodeCache.get(nodeMark.attrs.nodeId);
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
            nodeCodeCache.set(nodeMark.attrs.nodeId, {
              code: node.textContent,
              cleanup,
            });
          },
          options: {
            pos,
            id: nodeMark.attrs.nodeId,
            nodeSize: node.nodeSize,
            withEditor: fn => fn(editor),
            moduleLoader,
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
