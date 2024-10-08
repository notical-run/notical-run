import { createEffect, createRoot } from 'solid-js';
import { QuickJSHandle, VmCallResult } from 'quickjs-emscripten-core';
import { EvalEngine, EvalNodeOptions } from '@/engine/types';
import { Result } from '../utils/result';
import { findNodeById } from '@/utils/editor';

export const evalExpression = async (
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
  const { quickVM } = engine.bridge;

  const toResult = (result: VmCallResult<QuickJSHandle>): Result<Error, any> => {
    try {
      if (result.error) throw result.error.consume(quickVM.dump);

      const val = engine.bridge.fromHandle(result.value);
      return Result.ok(val);
    } catch (error) {
      console.debug('[VM Error]', error);
      return Result.err(error as Error);
    }
  };

  createRoot(dispose => {
    handleCleanup(dispose);

    createEffect(async () => {
      const nodePosAndSize = engine.withEditor(editor => findNodeById(editor, options.id));

      const hereRef = JSON.stringify({
        pos: nodePosAndSize?.pos ?? options.pos,
        nodeSize: nodePosAndSize?.node.nodeSize ?? options.nodeSize,
        id: options.id,
        __native__: '',
      });
      const evalResult = await quickVM.evalCodeAsync(
        `{
const here = () => {
  // FIXME: Commented out because this is triggering too many updates. Find out why
  // _internals.listenToUpdate();
  return ${hereRef};
};

${code || 'undefined'}
}`,
        'global.js',
        { strict: false },
      );
      onResult(toResult(evalResult));
    });
  });
};
