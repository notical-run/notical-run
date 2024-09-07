import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const toPromiseHandle = (
  bridge: QuickJSBridge,
  value: Promise<any>,
): Maybe<QuickJSHandle> => {
  if (!value || typeof value?.then !== 'function' || typeof value?.catch !== 'function')
    return Maybe.Nothing();

  const promH = bridge.quickVM.newPromise();

  (value as Promise<any>)
    .then(v => promH.resolve(bridge.toHandle(v)))
    .catch(e => promH.reject(bridge.toHandle(e)));

  promH.settled.then(bridge.quickVM.runtime.executePendingJobs);

  return Maybe.Just(promH.handle);
};
