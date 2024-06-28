import { getQuickVM } from './quickjs';
import { createEffect } from 'solid-js';

export const evalExpression = async (
  code: string,
  onResult: (res: any) => void,
) => {
  const quickVM = await getQuickVM();

  createEffect(() => {
    const result = quickVM.evalCode(code);
    const valueHandle = quickVM.unwrapResult(result);
    const value = quickVM.dump(valueHandle);
    valueHandle.dispose();
    onResult(value);
  });
};
