import { setMarkAttributes } from '@/utils/editor';
import { Node } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

const nodeTypes = new Set<string>(['codeBlock', 'code']);
const markTypes = new Set<string>([]);

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
        appendTransaction: (_transactions, oldState, newState) => {
          if (newState.doc === oldState.doc) return;
          // Track ids in use to overwrite duplicate ids
          const inUseUuids = new Set();

          const { tr } = newState;
          newState.doc.descendants((node, pos, _parent) => {
            const isIDDuplicated = inUseUuids.has(node.attrs.nodeId);

            if (nodeTypes.has(node.type.name) && (isIDDuplicated || !node.attrs.nodeId)) {
              const uuid = crypto.randomUUID();
              tr.setNodeAttribute(pos, 'nodeId', `${uuid}`);
              return false;
            } else if (node.isText) {
              // NOTE: Not in use currently
              const nodeMark = node.marks.find(m => markTypes.has(m.type.name));
              if (nodeMark && (isIDDuplicated || !nodeMark.attrs.nodeId)) {
                const uuid = crypto.randomUUID();
                inUseUuids.add(uuid);
                setMarkAttributes(node, nodeMark, { nodeId: `${uuid}` });
                return false;
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
