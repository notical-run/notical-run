import { setMarkAttributes } from '@/utils/editor';
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
            rendered: true,
            keepOnSplit: false,
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(_transactions, oldState, newState) {
          if (newState.doc === oldState.doc) return;
          // Track ids in use to overwrite duplicate ids
          const inUseUuids = new Set();

          const { tr } = newState;
          newState.doc.descendants((node, pos, _parent) => {
            const isIDDuplicated = inUseUuids.has(node.attrs.nodeId);
            if (nodeTypes.has(node.type.name) && (isIDDuplicated || !node.attrs.nodeId)) {
              const uuid = crypto.randomUUID();
              tr.setNodeAttribute(pos, 'nodeId', `${uuid}`);
            } else if (node.isText) {
              const nodeMark = node.marks.find(m => markTypes.has(m.type.name));
              if (nodeMark && (isIDDuplicated || !nodeMark.attrs.nodeId)) {
                const uuid = crypto.randomUUID();
                inUseUuids.add(uuid);
                setMarkAttributes(node, nodeMark, { nodeId: `${uuid}` });
              }
            }

            inUseUuids.add(node.attrs.nodeId);
          });

          return tr;
        },
      }),
    ];
  },
});
