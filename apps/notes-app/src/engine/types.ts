import { QuickJSBridge } from '@/engine/quickjs/types';
import { Result } from '@/utils/result';
import { Editor } from '@tiptap/core';
import { Signal } from 'solid-js';

export type EvalEngine = EvalEngineContextOptions & {
  bridge: QuickJSBridge;
  destroy: () => void;
  nodeCache: Map<string, { code: string; cleanup: () => void }>;
  evalExpression: (
    code: string,
    options: {
      onResult: (res: Result<Error, any>) => void;
      options: EvalNodeOptions;
    },
  ) => Promise<void>;
  evalModule: (
    code: string,
    options: {
      onResult: (res: Result<Error, any>) => void;
      options: EvalNodeOptions;
    },
  ) => Promise<void>;
};

export type EvalEngineContextOptions = EvalEngineOptions & {
  stateStore: Map<string, Signal<any>>;
  importedEditorInstances: Map<string, Editor>;
  contentUpdateSignal: Signal<boolean>;
  onContentUpdate: () => void;
  onCleanup: (fn: () => void) => void;
  withAllEditors: <R>(fn: (editor: Editor[]) => R) => R;
};

export type ModuleLoader = (modulePath: string) => Promise<string>;

export type EvalEngineOptions = {
  withEditor: <R>(fn: (editor: Editor) => R) => R;
  moduleLoader: ModuleLoader;
  apiHelpers: {
    alert: (opts: { message: string; onClose: () => void }) => void;
    prompt: (opts: { message: string; onValue: (value: string | null) => void }) => void;
    confirm: (opts: { message: string; onConfirm: () => void; onCancel: () => void }) => void;
    fetch: (request: Request) => Promise<Response>;
  };
};

export type EvalNodeOptions = {
  id: string;
  pos: number;
  nodeSize: number;
};
