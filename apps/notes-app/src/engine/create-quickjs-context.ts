import { registerContentLib } from '@/engine/lib/content';
import { registerGlobalProxy } from '@/engine/lib/global-proxy';
import { registerHTTPLIb } from '@/engine/lib/http';
import { registerStateLib } from '@/engine/lib/state';
import { registerStdApiLib } from '@/engine/lib/stdapi';
import { registerUILib } from '@/engine/lib/ui';
import { getQuickJSRuntime } from '@/engine/quickjs/runtime';
import { INTERNALS_KEY } from '@/engine/internals';
import { EvalEngineContextOptions } from '@/engine/types';

export const createQuickJSContext = async (options: EvalEngineContextOptions) => {
  const quickRuntime = await getQuickJSRuntime();
  quickRuntime.setModuleLoader(async (modulePath, ctx) => {
    try {
      const code = await options.moduleLoader(modulePath);
      return { value: code };
    } catch (e) {
      const err = (e as any)?.message ? ctx.newError((e as any).message) : e;
      return { error: err as Error };
    }
  });
  quickRuntime.setMaxStackSize(10_000);
  quickRuntime.setMemoryLimit(1_000_000);
  // TODO: Execution timeout with interrupts?

  const quickVM = quickRuntime.newContext({
    ownedLifetimes: [quickRuntime],
  });
  quickRuntime.context = quickVM;

  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
Object.defineProperty(globalThis, '${INTERNALS_KEY}', { value: { __native__: 'internals' }, writable: false });
}`),
    )
    .dispose();

  await registerStdApiLib(quickVM, options);
  await registerStateLib(quickVM, options);
  await registerContentLib(quickVM, options);
  await registerUILib(quickVM, options);
  await registerHTTPLIb(quickVM, options);

  // NOTE: This has to be last because it turns globalThis into a proxy
  await registerGlobalProxy(quickVM, options);
  return quickVM;
};
