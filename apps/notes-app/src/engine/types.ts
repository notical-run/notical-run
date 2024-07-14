import { Editor } from '@tiptap/core';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';
import { Signal } from 'solid-js';

export type EvalEngine = EvalEngineOptions & {
  quickVM: QuickJSAsyncContext;
  nodeCache: Map<string, { code: string; cleanup: () => void }>;
  stateStore: Map<string, Signal<any>>;
  contentUpdateSignal: Signal<boolean>;
  onContentUpdate: () => void;
  destroy: () => void;
};

export type QuickJSContextOptions = Omit<EvalEngine, 'quickVM' | 'destroy'>;

export type ModuleLoader = (modulePath: string) => Promise<string>;

export type EvalEngineOptions = {
  withEditor: <R>(fn: (editor: Editor) => R) => R;
  moduleLoader: ModuleLoader;
};

export type EvalNodeOptions = {
  id: string;
  pos: number;
  nodeSize: number;
};
