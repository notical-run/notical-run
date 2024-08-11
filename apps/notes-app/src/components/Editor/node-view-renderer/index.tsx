import { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import { Attrs } from '@tiptap/pm/model';
import { NodeView } from '@tiptap/pm/view';
import { createRoot, JSX } from 'solid-js';
import { createStore, reconcile, SetStoreFunction } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';

type GetNodeView<A extends Attrs> = (
  props: NodeViewRendererProps & {
    attrs: A;
    NodeContent: (props: { as: any } & Record<string, any>) => JSX.Element;
    updateAttributes: (attrs: Partial<A>, opts?: { skipHistory?: boolean }) => void;
  },
) => JSX.Element;

export const createSolidNodeView = <A extends Attrs>(
  getNodeView: GetNodeView<A>,
  options?: Partial<NodeView>,
): NodeViewRenderer => {
  return renderProps => {
    const { node, getPos, editor } = renderProps;

    let contentDOM: HTMLElement;
    let dom: HTMLElement;
    let onAttributeUpdate: SetStoreFunction<A>;
    let dispose = () => {};

    createRoot(disposeFn => {
      dispose = disposeFn;

      const NodeContent = (props: any) => (
        <Dynamic
          component={props.as}
          {...props}
          ref={(el: HTMLElement) => (contentDOM = el)}
          as={null}
        />
      );

      const [attrs, setStore] = createStore<A>(node.attrs as A);
      onAttributeUpdate = setStore;

      const updateAttributes = (update: Partial<A>, opts?: { skipHistory?: boolean }) => {
        if (typeof getPos !== 'function') return;
        const tr = editor.state.tr;
        tr.setNodeMarkup(getPos(), node.type, { ...attrs, ...update });
        if (opts?.skipHistory) tr.setMeta('addToHistory', false);
        editor.view.dispatch(tr);
      };

      dom = getNodeView({ ...renderProps, attrs, NodeContent, updateAttributes }) as HTMLElement;
    });

    return {
      dom: dom!,
      contentDOM: contentDOM!,
      update: updatedNode => {
        onAttributeUpdate(reconcile(updatedNode.attrs as A));
        return true;
      },
      ignoreMutation: mutation => {
        return ['characterData', 'selection'].includes(mutation.type);
      },
      destroy: () => dispose(),
      ...options,
    };
  };
};
