import { createQuickJSContext } from '@/engine/create-quickjs-context';
import { evalExpression } from '@/engine/eval-expression';
import { EvalEngine, EvalEngineOptions, EvalEngineContextOptions } from '@/engine/types';
import { evalModule } from '@/engine/eval-module';
import { createSignal } from 'solid-js';

export const createEvalEngine = async (options: EvalEngineOptions): Promise<EvalEngine> => {
  const contentUpdateSignal = createSignal(false);
  const cleanupFunctions: (() => void)[] = [];

  const engine: EvalEngineContextOptions = {
    stateStore: new Map(),
    importedEditorInstances: new Map(),
    contentUpdateSignal: contentUpdateSignal,
    onContentUpdate: () => contentUpdateSignal[1](b => !b),
    onCleanup: (fn: () => void) => cleanupFunctions.push(fn),
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

  const nodeCache = new Map<string, { code: string; cleanup: () => void }>();

  const evalExpr: EvalEngine['evalExpression'] = (code, { onResult, options }) =>
    evalExpression(code, {
      onResult,
      options,
      handleCleanup: cleanup => nodeCache.set(options.id, { code, cleanup }),
      engine: engineInstance,
    });

  const moduleEvaluator: EvalEngine['evalModule'] = (code, { onResult, options }) =>
    evalModule(code, {
      onResult,
      options,
      handleCleanup: cleanup => nodeCache.set(options.id, { code, cleanup }),
      engine: engineInstance,
    });

  const engineInstance: EvalEngine = Object.assign(engine, {
    nodeCache,
    quickVM,
    destroy,
    evalExpression: evalExpr,
    evalModule: moduleEvaluator,
  });

  return engineInstance;
};
