import { getInternalsHandle } from '@/engine/internals';
import { EvalEngineContextOptions } from '@/engine/types';
import { findNodeById } from '@/utils/editor';
import { Scope } from 'quickjs-emscripten-core';
import { QuickJSBridge } from '@/engine/quickjs/types';

export const registerContentLib = async (
  bridge: QuickJSBridge,
  options: EvalEngineContextOptions,
) => {
  const { quickVM } = bridge;

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

    bridge
      .toHandle((hook: any, text: string) => {
        insertMarkdownContent(options, hook, text);
        return { __native__: '' };
      })
      .consume(f => quickVM!.setProp(insert, 'markdown', f));

    bridge
      .toHandle((hook: any, text: string) => {
        showMarkdownContent(options, hook, text);
        return { __native__: '' };
      })
      .consume(f => quickVM!.setProp(show, 'markdown', f));

    bridge
      .toHandle((hook: any) => {
        return getMarkdownContent(options, hook);
      })
      .consume(f => quickVM!.setProp(next, 'markdown', f));

    bridge
      .toHandle(() => {
        options.contentUpdateSignal[0]();
      })
      .consume(f => quickVM!.setProp(internals, 'listenToUpdate', f));
  });
};

const insertMarkdownContent = (options: EvalEngineContextOptions, hook: any, text: string) => {
  if (!hook || typeof hook.pos !== 'number')
    throw new Error('Invalid target given to insert.markdown');

  options.withEditor(editor => {
    const nodePosAndSize = findNodeById(editor, hook.id);
    if (!nodePosAndSize) return;

    editor.commands.insertContentAt(nodePosAndSize.pos + nodePosAndSize.node.nodeSize + 1, text);
  });
};

const showMarkdownContent = (options: EvalEngineContextOptions, hook: any, text: string) => {
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

const getMarkdownContent = (options: EvalEngineContextOptions, hook: any): string => {
  if (!hook || typeof hook.pos !== 'number')
    throw new Error('Invalid target given to next.markdown');

  return options.withAllEditors(editors => {
    for (const editor of editors) {
      const nodePosAndSize = findNodeById(editor, hook.id);
      if (!nodePosAndSize) continue;

      const resPos = editor.state.doc.resolve(nodePosAndSize.pos);
      const afterPos = resPos.after();

      if (afterPos >= editor.state.doc.content.size) return '';

      const nextNode = editor.state.doc.nodeAt(afterPos);

      const nodeDoc = editor.schema.topNodeType.create({}, nextNode);
      return editor.storage.markdown.serializer.serialize(nodeDoc);
    }
  });
};
