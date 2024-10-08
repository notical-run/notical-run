import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { Result } from '@/utils/result';
import { EvalEngine } from '@/engine/types';
import { findNodeById } from '@/utils/editor';

const isEvalable = (node: Node) => [null, 'javascript'].includes(node.attrs.language);

type Options = {
  evalBlock?: (node: Node, pos: number, engine: EvalEngine) => Promise<void> | void;
};

// NOTE: Re-think eval + import eval
export const defaultEvalBlock: Options['evalBlock'] = async (node, pos, engine) => {
  await engine.evalModule(node.textContent, {
    options: {
      id: node.attrs.nodeId,
      pos,
      nodeSize: node.nodeSize,
    },
    onResult: exports => {
      engine.withEditor(editor => {
        const tr = editor.state.tr;
        tr.setNodeAttribute(pos, 'exports', exports);
        editor.view.dispatch(tr.setMeta('addToHistory', false));
      });
    },
  });
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

  console.debug('>>>> evaluating...', editor.state.doc.toJSON());
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
      if (node.type.name === 'code') {
        const previousCode = engine.nodeCache.get(node.attrs.nodeId);
        const code = node.textContent?.replace(/(^`)|(`$)/g, '') ?? '';
        let isFirstEvaluation = !previousCode;
        if (previousCode?.code === code) return;

        const onResult = (result: Result<Error, any>) => {
          const foundNode = findNodeById(editor, node.attrs.nodeId);
          if (!foundNode) return;

          const tr = editor.state.tr;
          tr.setNodeAttribute(foundNode.pos, 'result', result);
          editor.view.dispatch(tr.setMeta('addToHistory', isFirstEvaluation));
          isFirstEvaluation = false;
        };

        previousCode?.cleanup();

        await engine.evalExpression(code, {
          onResult,
          options: {
            pos,
            id: node.attrs.nodeId,
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
