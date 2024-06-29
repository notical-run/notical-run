import { getQuickVM } from './quickjs';
import { createEffect, createRoot } from 'solid-js';
import { Result } from './result';
import { QuickJSHandle, Scope, VmCallResult } from 'quickjs-emscripten-core';

export const evalExpression = async (
  code: string,
  onResult: (res: Result<Error, any>) => void,
) => {
  const quickVM = await getQuickVM();

  const toResult = (result: VmCallResult<QuickJSHandle>): Result<Error, any> =>
    Scope.withScope(scope => {
      try {
        if (result.error) {
          throw new Error(quickVM.dump(scope.manage(result.error)));
        }

        if (quickVM.typeof(result.value) === 'function') {
          return Result.ok(() => {
            quickVM.callFunction(result.value, quickVM.global);
          });
        }

        return Result.ok(quickVM.dump(scope.manage(result.value)));
      } catch (error) {
        console.error(error);
        return Result.err(error as Error);
      }
    });

  createRoot(_ => {
    createEffect(() => {
      const evalResult = quickVM.evalCode(code, 'global.js', { strict: false });
      onResult(toResult(evalResult));
    });
  });
};
