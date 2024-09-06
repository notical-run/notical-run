import { EvalEngine, EvalNodeOptions } from '@/engine/types';
import { Result } from '../utils/result';
import { Editor } from '@tiptap/core';
import { fromQuickJSHandle } from '@/engine/quickjs';
import { getQJSPropPath } from '@/engine/quickjs/utils';

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

export const evalModule = async (
  code: string,
  {
    options,
    engine,
    onResult,
    handleCleanup,
  }: {
    onResult: (res: Result<Error, any>) => void;
    engine: EvalEngine;
    handleCleanup: (cleanup: () => void) => void;
    options: EvalNodeOptions;
  },
) => {
  handleCleanup(() => {}); // TODO: Add module scoped cleanup + reactive evaluation

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
      strict: false,
    });
    if (moduleResult.error) {
      const err = moduleResult.error.consume(quickVM.dump);
      throw new Error(err?.message ?? err ?? 'Eval error');
    }
    const exportsHandle = moduleResult.value;

    const keysResult = getQJSPropPath(quickVM, ['Object', 'keys']).consume(objectKeys =>
      quickVM.callFunction(objectKeys, quickVM.undefined, exportsHandle),
    );
    const exportKeys: string[] = quickVM.unwrapResult(keysResult).consume(quickVM.dump);

    const toExport = (key: string) => {
      return fromQuickJSHandle(quickVM, quickVM.getProp(exportsHandle, key));
    };

    const exports = Object.fromEntries(
      exportKeys.map(key => [key, toExport(key)]).filter(([_, f]) => f),
    );
    return onResult(Result.ok(exports));
  } catch (e) {
    console.debug('[VM Error]', e);
    return onResult(Result.err(e as Error));
  }
};
