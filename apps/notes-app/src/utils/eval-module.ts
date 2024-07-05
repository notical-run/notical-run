import { getQuickVM, VMEnvOptions } from './quickjs';
import { Result } from './result';

export const evalModule = async (code: string, options: VMEnvOptions) => {
  try {
    const quickVM = await getQuickVM(options);

    const moduleResult = quickVM.evalCode(code, `${options.id}.js`, {
      type: 'module',
    });
    const exportsHandle = quickVM.unwrapResult(moduleResult);

    const keysResult = quickVM
      .getProp(quickVM.global, 'Object')
      .consume(object => quickVM.getProp(object, 'keys'))
      .consume(objectKeys =>
        quickVM.callFunction(objectKeys, quickVM.undefined, exportsHandle),
      );

    const exportKeys: string[] = quickVM
      .unwrapResult(keysResult)
      .consume(quickVM.dump);

    const toExport = (key: string) => {
      const func = () =>
        quickVM.getProp(exportsHandle, key).consume(funcH => {
          quickVM!
            .unwrapResult(quickVM!.callFunction(funcH, quickVM.global))
            .consume(() => {});
        });
      return func;
    };

    const exports = Object.fromEntries(
      exportKeys.map(key => [key, toExport(key)]),
    );
    return Result.ok(exports);
  } catch (e) {
    console.error(e);
    return Result.err(e as Error);
  }
};
