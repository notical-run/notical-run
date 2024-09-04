import { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import { Attrs } from '@tiptap/pm/model';
import { NodeView } from '@tiptap/pm/view';
import { createRoot, JSX } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
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

    console.log('new render for some reason');

    return createRoot(dispose => {
      let contentDOM: HTMLElement;
      const NodeContent = (props: any) => (
        <Dynamic
          component={props.as}
          {...props}
          ref={(el: HTMLElement) => (contentDOM = el)}
          as={null}
        />
      );

      const [attrs, setStore] = createStore<A>(node.attrs as A);

      const updateAttributes = (update: Partial<A>, opts?: { skipHistory?: boolean }) => {
        if (typeof getPos !== 'function') return;
        const tr = editor.state.tr;
        tr.setNodeMarkup(getPos(), node.type, { ...attrs, ...update });
        if (opts?.skipHistory) tr.setMeta('addToHistory', false);
        editor.view.dispatch(tr);
      };

      const dom = getNodeView({
        ...renderProps,
        attrs,
        NodeContent,
        updateAttributes,
      }) as HTMLElement;

      let currentNode = node;
      return {
        dom: dom!,
        contentDOM: contentDOM!,
        update: updatedNode => {
          if (node.type !== updatedNode.type) return false;
          if (currentNode === updatedNode) return false;
          currentNode = updatedNode;

          setStore(reconcile(updatedNode.attrs as A));
          return true;
        },
        ignoreMutation: mutation => {
          return ['characterData'].includes(mutation.type);
        },
        destroy: () => {
          dispose();
        },
        ...options,
      };
    });
  };
};
