import { createQuickJSContext } from '@/engine/create-quickjs-context';
import { EvalEngine, EvalEngineOptions, QuickJSContextOptions } from '@/engine/types';
import { createSignal } from 'solid-js';

export const createEvalEngine = async (options: EvalEngineOptions): Promise<EvalEngine> => {
  const contentUpdateSignal = createSignal(false);
  const engine: QuickJSContextOptions = {
    nodeCache: new Map(),
    stateStore: new Map(),
    contentUpdateSignal: contentUpdateSignal,
    onContentUpdate: () => contentUpdateSignal[1](b => !b),
    ...options,
  };

  const quickVM = await createQuickJSContext(engine);

  const destroy = () => {
    quickVM.dispose();
  };

  return {
    quickVM,
    destroy,
    ...engine,
  };
};
