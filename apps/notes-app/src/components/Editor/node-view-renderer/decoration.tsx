import { Editor, NodeViewRendererProps } from '@tiptap/core';
import { Attrs, Node } from '@tiptap/pm/model';
import { createRoot, JSX } from 'solid-js';
import { createStore, reconcile, SetStoreFunction } from 'solid-js/store';

type GetDecorator<A extends Attrs> = (props: {
  editor: Editor;
  getPos: () => number;
  attrs: A;
  updateAttributes: (attrs: Partial<A>, opts?: { skipHistory?: boolean }) => void;
}) => JSX.Element;

export type DecorationRenderer = {
  dom: HTMLElement;
  update(node: Node): boolean;
  destroy(): void;
};

export const createSolidDecoration = <A extends Attrs>(getDecorator: GetDecorator<A>) => {
  return ({
    node,
    getPos,
    editor,
  }: Pick<NodeViewRendererProps, 'node' | 'editor'> & {
    getPos: () => number;
  }): DecorationRenderer => {
    let dom: HTMLElement;
    let onAttributeUpdate: SetStoreFunction<A>;
    let dispose = () => {};
    let currentNode = node;

    createRoot(disposeFn => {
      dispose = disposeFn;

      const [attrs, setStore] = createStore<A>(node.attrs as A);
      onAttributeUpdate = setStore;

      const updateAttributes = (update: Partial<A>, opts?: { skipHistory?: boolean }) => {
        if (typeof getPos !== 'function') return;
        const tr = editor.state.tr;
        tr.setNodeMarkup(getPos(), node.type, { ...attrs, ...update });
        if (opts?.skipHistory) tr.setMeta('addToHistory', false);
        editor.view.dispatch(tr);
      };

      dom = getDecorator({ editor, getPos, attrs, updateAttributes }) as HTMLElement;
    });

    return {
      dom: dom!,
      update(updatedNode: Node) {
        if (node.type !== updatedNode.type) return false;
        if (currentNode === updatedNode) return false;
        currentNode = updatedNode;

        onAttributeUpdate(reconcile(updatedNode.attrs as A));
        return true;
      },
      destroy: () => dispose(),
    };
  };
};
