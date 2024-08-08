import { getInternalsHandle, toQuickJSHandle } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { findNodeById } from '@/utils/editor';
import { QuickJSAsyncContext, Scope } from 'quickjs-emscripten-core';

export const registerContentLib = async (
  quickVM: QuickJSAsyncContext,
  options: QuickJSContextOptions,
) => {
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
  Object.defineProperty(globalThis, 'show', { value: {}, writable: false });
  Object.defineProperty(globalThis, 'insert', { value: {}, writable: false });
  Object.defineProperty(globalThis, 'next', { value: {}, writable: false });
}`),
    )
    .dispose();

  return Scope.withScope(scope => {
    const insert = scope.manage(quickVM.getProp(quickVM.global, 'insert'));
    const show = scope.manage(quickVM.getProp(quickVM.global, 'show'));
    const next = scope.manage(quickVM.getProp(quickVM.global, 'next'));
    const internals = scope.manage(getInternalsHandle(quickVM));

    toQuickJSHandle(quickVM, (hook: any, text: string) => {
      insertMarkdownContent(options, hook, text);
      return { __native__: '' };
    }).consume(f => quickVM!.setProp(insert, 'markdown', f));

    toQuickJSHandle(quickVM, (hook: any, text: string) => {
      showMarkdownContent(options, hook, text);
      return { __native__: '' };
    }).consume(f => quickVM!.setProp(show, 'markdown', f));

    toQuickJSHandle(quickVM, (hook: any) => {
      return getMarkdownContent(options, hook);
    }).consume(f => quickVM!.setProp(next, 'markdown', f));

    toQuickJSHandle(quickVM, () => {
      options.contentUpdateSignal[0]();
    }).consume(f => quickVM!.setProp(internals, 'listenToUpdate', f));
  });
};

const insertMarkdownContent = (options: QuickJSContextOptions, hook: any, text: string) => {
  if (!hook || typeof hook.pos !== 'number')
    throw new Error('Invalid target given to insert.markdown');

  options.withEditor(editor => {
    const nodePosAndSize = findNodeById(editor, hook.id);
    if (!nodePosAndSize) return;

    editor.commands.insertContentAt(nodePosAndSize.pos + nodePosAndSize.node.nodeSize + 1, text);
  });
};

const showMarkdownContent = (options: QuickJSContextOptions, hook: any, text: string) => {
  if (!hook || typeof hook.pos !== 'number')
    throw new Error('Invalid target given to show.markdown');

  options.withEditor(editor => {
    const nodePosAndSize = findNodeById(editor, hook.id);
    if (!nodePosAndSize) return;

    const tr = editor.state.tr;
    tr.setNodeAttribute(nodePosAndSize.pos, 'anchoredContent', text);
    editor.view.dispatch(tr.setMeta('addToHistory', false));
  });
};

const getMarkdownContent = (options: QuickJSContextOptions, hook: any): string => {
  if (!hook || typeof hook.pos !== 'number')
    throw new Error('Invalid target given to next.markdown');

  return options.withEditor(primaryEditor => {
    for (const editor of [primaryEditor, ...options.importedEditorInstances.values()]) {
      if (!editor) continue;
      const nodePosAndSize = findNodeById(editor, hook.id);
      if (!nodePosAndSize) continue;

      const parentNode = editor.state.doc.resolve(nodePosAndSize.pos).parent;

      const nextResPos = editor.state.doc.resolve(nodePosAndSize.pos + parentNode.nodeSize);
      const nextNode = nextResPos.node(nextResPos.depth);
      const nodeDoc = editor.schema.topNodeType.create({}, nextNode);

      const mdSerializer = editor.storage.markdown.serializer;

      return mdSerializer.serialize(nodeDoc);
    }
    return undefined;
  });
};
