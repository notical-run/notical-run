import { getQuickVM } from './quickjs';

export const evalModule = async (code: string, id: string) => {
  const quickVM = await getQuickVM();

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
      const funcH = quickVM.getProp(valueHandle, key);

      const func = () => quickVM.callFunction(funcH, quickVM.undefined);
      return [key, func];
    }),
  );
  return exports;
};
