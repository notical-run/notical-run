import { getQuickVM, VMEnvOptions } from './quickjs';
import { createEffect, createRoot } from 'solid-js';
import { Result } from './result';
import { QuickJSHandle, VmCallResult } from 'quickjs-emscripten-core';

export const evalExpression = async (
  code: string,
  {
    options,
    onResult,
    handleCleanup,
  }: {
    onResult: (res: Result<Error, any>) => void;
    handleCleanup: (cleanup: () => void) => void;
    options: VMEnvOptions;
  },
) => {
  const quickVM = await getQuickVM(options);

  const toResult = (
    result: VmCallResult<QuickJSHandle>,
  ): Result<Error, any> => {
    try {
      if (result.error) {
        throw result.error.consume(quickVM.dump);
      }

      if (quickVM.typeof(result.value) === 'function') {
        return Result.ok(() => {
          quickVM.callFunction(result.value, quickVM.global);
        });
      }

      return Result.ok(result.value.consume(quickVM.dump));
    } catch (error) {
      console.error(error);
      return Result.err(error as Error);
    }
  };

  createRoot(dispose => {
    handleCleanup(dispose);

    createEffect(() => {
      const hereRef = JSON.stringify({
        pos: options.pos,
        nodeSize: options.nodeSize,
        id: options.id,
      });
      const evalResult = quickVM.evalCode(
        `{ const here = ${hereRef}; ${code} }`,
        'global.js',
        {
          strict: false,
        },
      );
      onResult(toResult(evalResult));
    });
  });
};
