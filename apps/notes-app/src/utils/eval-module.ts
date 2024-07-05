import { getQuickVM, VMEnvOptions } from './quickjs';
import { Result } from './result';

export const evalModule = async (
  code: string,
  id: string,
  options: VMEnvOptions,
) => {
  try {
    const quickVM = await getQuickVM(options);

    const result = quickVM.evalCode(code, `${id}.js`, { type: 'module' });
    const valueHandle = quickVM.unwrapResult(result);

    const objectKeys = quickVM.getProp(
      quickVM.getProp(quickVM.global, 'Object'),
      'keys',
    );
    const keysResult = quickVM.callFunction(
      objectKeys,
      quickVM.undefined,
      valueHandle,
    );
    objectKeys.dispose();

    const keysH = quickVM.unwrapResult(keysResult);
    const keys: string[] = quickVM.dump(keysH);
    keysH.dispose();

    const exports = Object.fromEntries(
      keys.map(key => {
        const func = () =>
          quickVM.getProp(valueHandle, key).consume(funcH => {
            quickVM!
              .unwrapResult(quickVM!.callFunction(funcH, quickVM.global))
              .consume(() => {});
          });
        return [key, func];
      }),
    );

    return Result.ok(exports);
  } catch (e) {
    console.error(e);
    return Result.err(e as Error);
  }
};
