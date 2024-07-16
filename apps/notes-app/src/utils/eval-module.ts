import { EvalEngine, EvalNodeOptions } from '@/engine/types';
import { Result } from './result';
import { Editor } from '@tiptap/core';

const findNodeById = (editor: Editor, id: string): [number, number] | null => {
  let foundNodePos = null;
  editor.state.doc.content.descendants((node, pos) => {
    if (node.attrs?.nodeId === id) {
      foundNodePos = [pos, node.nodeSize];
      return false;
    }
  });

  return foundNodePos;
};

export const evalModule = async (code: string, engine: EvalEngine, options: EvalNodeOptions) => {
  try {
    const quickVM = engine.quickVM;

    const nodePosAndSize = engine.withEditor(editor => findNodeById(editor, options.id));
    const hereRef = JSON.stringify({
      pos: nodePosAndSize?.[0] ?? options.pos,
      nodeSize: nodePosAndSize?.[1] ?? options.nodeSize,
      id: options.id,
      __native__: '',
    });

    const moduleCode = `
const here = () => {
  _internals.listenToUpdate();
  return ${hereRef};
};

${code}`;

    const moduleResult = await quickVM.evalCodeAsync(moduleCode, `${options.id}.js`, {
      type: 'module',
    });
    if (moduleResult.error) {
      const err = moduleResult.error.consume(quickVM.dump);
      throw new Error(err?.message ?? err ?? 'Eval error');
    }
    const exportsHandle = moduleResult.value;

    const keysResult = quickVM
      .getProp(quickVM.global, 'Object')
      .consume(object => quickVM.getProp(object, 'keys'))
      .consume(objectKeys => quickVM.callFunction(objectKeys, quickVM.undefined, exportsHandle));

    const exportKeys: string[] = quickVM.unwrapResult(keysResult).consume(quickVM.dump);

    const toExport = (key: string) => {
      const func = () =>
        quickVM.getProp(exportsHandle, key).consume(funcH => {
          quickVM!.unwrapResult(quickVM!.callFunction(funcH, quickVM.global)).consume(() => {});
        });
      return func;
    };

    const exports = Object.fromEntries(exportKeys.map(key => [key, toExport(key)]));
    return Result.ok(exports);
  } catch (e) {
    console.error(e);
    return Result.err(e as Error);
  }
};
