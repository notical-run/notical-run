import { Editor } from '@tiptap/core';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';
import { Signal } from 'solid-js';

export type EvalEngine = EvalEngineOptions & {
  quickVM: QuickJSAsyncContext;
  nodeCache: Map<string, { code: string; cleanup: () => void }>;
  stateStore: Map<string, Signal<any>>;
  importedEditorInstances: Map<string, Editor>;
  contentUpdateSignal: Signal<boolean>;
  onContentUpdate: () => void;
  destroy: () => void;
  addCleanup: (f: () => void) => void;
};

export type QuickJSContextOptions = Omit<EvalEngine, 'quickVM' | 'destroy'>;

export type ModuleLoader = (modulePath: string) => Promise<string>;

export type EvalEngineOptions = {
  withEditor: <R>(fn: (editor: Editor) => R) => R;
  moduleLoader: ModuleLoader;
  apiHelpers: {
    alert: (opts: { message: string; onClose: () => void }) => void;
    prompt: (opts: { message: string; onValue: (value: string | null) => void }) => void;
    confirm: (opts: { message: string; onConfirm: () => void; onCancel: () => void }) => void;
  };
};

export type EvalNodeOptions = {
  id: string;
  pos: number;
  nodeSize: number;
};
