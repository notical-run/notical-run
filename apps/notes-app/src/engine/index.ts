import { createQuickJSContext } from '@/engine/create-quickjs-context';
import { EvalEngine, EvalEngineOptions, QuickJSContextOptions } from '@/engine/types';
import { createSignal } from 'solid-js';

export const createEvalEngine = async (options: EvalEngineOptions): Promise<EvalEngine> => {
  const contentUpdateSignal = createSignal(false);
  const cleanupFunctions: (() => void)[] = [];

  const engine: QuickJSContextOptions = {
    nodeCache: new Map(),
    stateStore: new Map(),
    importedEditorInstances: new Map(),
    contentUpdateSignal: contentUpdateSignal,
    onContentUpdate: () => contentUpdateSignal[1](b => !b),
    addCleanup: (fn: () => void) => cleanupFunctions.push(fn),
    withAllEditors: fn => {
      return options.withEditor(primaryEditor => {
        return fn([primaryEditor, ...engine.importedEditorInstances.values()]);
      });
    },
    ...options,
  };

  const quickVM = await createQuickJSContext(engine);

  const destroy = () => {
    engine.importedEditorInstances.forEach(editor => editor.destroy());
    cleanupFunctions.forEach(f => f?.());
    quickVM.dispose();
  };

  return Object.assign(engine, {
    quickVM,
    destroy,
  });
};
