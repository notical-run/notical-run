import { registerContentLib } from '@/engine/lib/content';
import { registerStateLib } from '@/engine/lib/state';
import { registerStdApiLib } from '@/engine/lib/stdapi';
import { getQuickJSRuntime } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';

export const createQuickJSContext = async (options: QuickJSContextOptions) => {
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
Object.defineProperty(globalThis, '_internals', { value: { __native__: 'internals' }, writable: false });
Object.defineProperty(globalThis, 'button', { value: (name, fn) => {
  fn.displayName = name;
  return fn;
} })
}`),
    )
    .dispose();

  await registerStateLib(quickVM, options);
  await registerContentLib(quickVM, options);
  await registerStdApiLib(quickVM, options);

  // State via globalThis
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
globalThis.__native__ = 'globalThis';
globalThis.global = globalThis;

const globalThisProxy = new Proxy(globalThis, {
  get(target, prop, receiver) {
    return Reflect.get(state, prop, receiver);
  },
  set(target, prop, value, receiver) {
    return Reflect.set(state, prop, value, receiver);
  }
});

Object.getOwnPropertyNames(globalThis).forEach(prop => {
  if (prop !== 'global') {
    Object.defineProperty(globalThisProxy, prop, Object.getOwnPropertyDescriptor(globalThis, prop));
  }
});

globalThis.__proto__ = globalThisProxy;
}`),
    )
    .dispose();

  return quickVM;
};
