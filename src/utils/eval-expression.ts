import { getQuickVM } from './quickjs';
import { createEffect, createRoot } from 'solid-js';
import { Result } from './result';

export const evalExpression = async (
  code: string,
  onResult: (res: Result<Error, any>) => void,
) => {
  const quickVM = await getQuickVM();

  createRoot(_ => {
    createEffect(() => {
      const result = quickVM.evalCode(code);
      try {
        const valueHandle = quickVM.unwrapResult(result);
        const value = quickVM.dump(valueHandle);
        valueHandle.dispose();
        onResult(Result.ok(value));
      } catch (e) {
        console.error(e);
        onResult(Result.err(e as Error));
      }
    });
  });
};
