import { Node } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

const nodeTypes = new Set(['codeBlock']);
const markTypes = new Set(['code', 'inlineCode']);

export const GlobalNodeId = Node.create({
  name: 'globalNodeId',

  addGlobalAttributes() {
    return [
      {
        types: [...nodeTypes],
        attributes: {
          nodeId: {
            default: null,
            rendered: false,
            keepOnSplit: false,
          },
        },
      },
      {
        types: ['doc'],
        attributes: {
          initializedNodeIDs: { default: false },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(_transactions, oldState, newState) {
          if (newState.doc === oldState.doc) return;

          const { tr } = newState;
          newState.doc.descendants((node, pos, _parent) => {
            if (nodeTypes.has(node.type.name) && !node.attrs.nodeId) {
              tr.setNodeAttribute(pos, 'nodeId', `${crypto.randomUUID()}`);
            } else if (node.isText) {
              const nodeMark = node.marks.find(m => markTypes.has(m.type.name));
              if (nodeMark) {
                if (!nodeMark.attrs.nodeId) {
                  nodeMark.removeFromSet(node.marks);
                  (nodeMark as any).attrs = {
                    ...nodeMark.attrs,
                    nodeId: `${crypto.randomUUID()}`,
                  };
                  nodeMark.addToSet(node.marks);
                }
              }
            }
          });

          return tr;
        },
      }),
    ];
  },
});
