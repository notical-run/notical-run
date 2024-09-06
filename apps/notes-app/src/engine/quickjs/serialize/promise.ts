import { QuickJSBridge } from '@/engine/quickjs/types';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const toPromiseHandle = (
  bridge: QuickJSBridge,
  value: Promise<any>,
): QuickJSHandle | null => {
  if (!value || typeof value?.then !== 'function' || typeof value?.catch !== 'function')
    return null;

  const promH = bridge.quickVM.newPromise();

  (value as Promise<any>)
    .then(v => promH.resolve(bridge.toHandle(v)))
    .catch(e => promH.reject(bridge.toHandle(e)));

  promH.settled.then(bridge.quickVM.runtime.executePendingJobs);

  return promH.handle;
};
