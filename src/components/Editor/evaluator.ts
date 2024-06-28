import type { Editor } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import type { QuickJSContext } from 'quickjs-emscripten-core';
import {
  QuickJSWASMModule,
  newQuickJSWASMModuleFromVariant,
  newVariant,
  RELEASE_SYNC,
} from 'quickjs-emscripten';
import wasmLocation from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { get, writable, type Writable } from 'svelte/store';

const variant = newVariant(RELEASE_SYNC, { wasmLocation });

let quickJS: Promise<QuickJSWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSWASMModuleFromVariant(variant);
  return quickJS;
}

const isEvalable = (node: Node) =>
  [null, 'javascript'].includes(node.attrs.language);

const stateStore: Record<string, Writable<any>> = {};

let quickVM: QuickJSContext | undefined;
const evaluateJS = async (code: string) => {
  const quickJS = await getQuickJS();
  if (!quickJS) return;
  if (!quickVM) {
    quickVM = quickJS.newContext();
    const setStateHandle = quickVM.newFunction('setState', (keyH, valH) => {
      const key = quickVM?.dump(keyH);
      const val = quickVM?.dump(valH);
      if (!stateStore[key]) {
        stateStore[key] = writable(val);
      } else {
        stateStore[key].set(val);
      }
      keyH.dispose();
      valH.dispose();
    });
    const getStateHandle = quickVM.newFunction('getState', keyH => {
      const key = quickVM?.dump(keyH);
      if (!stateStore[key]) {
        stateStore[key] = writable(undefined);
      }
      // onSubscribe(stateStore[key].subscribe(onUpdate));
      const val = get(stateStore[key]);
      if (typeof val === 'number') return quickVM?.newNumber(val);
      if (typeof val === 'string') return quickVM?.newString(val);
      if (typeof val === 'boolean') return val ? quickVM?.true : quickVM?.false;
      // TODO: MOOOAR
      return quickVM?.undefined;
    });
    quickVM.setProp(quickVM.global, 'setState', setStateHandle);
    quickVM.setProp(quickVM.global, 'getState', getStateHandle);
    quickVM
      .unwrapResult(
        quickVM.evalCode(
          `
const _target = {};
globalThis.state = new Proxy(_target, {
  get(_, key) { return getState(key); },
  set(_, key, value) {
    setState(key, value);
    _target[key] = value;
    return value;
  },
})
          `,
        ),
      )
      .dispose();
    setStateHandle.dispose();
  }

  const result = quickVM.evalCode(code);
  const valueHandle = quickVM.unwrapResult(result);
  const value = quickVM.dump(valueHandle);

  valueHandle.dispose();
  return value;
};

const nodeCodeCache = new Map<string, string>();

export const evaluateAllNodes = (editor: Editor) => {
  console.log('>>>> on update...', editor.state.doc.toJSON());

  const walkNode = async (node: Node, pos: number) => {
    if (node.type.name === 'codeBlock' && isEvalable(node)) {
      const previousCode = nodeCodeCache.get(node.attrs.nodeId);
      if (previousCode === node.textContent) return;

      let result = null;
      try {
        nodeCodeCache.set(node.attrs.nodeId, node.textContent);
        result = await evaluateJS(node.textContent || 'null');
      } catch (e) {
        result = `${e}`;
      }
      const tr = editor.state.tr;
      editor.view.dispatch(tr.setNodeAttribute(pos, 'result', result));
      return;
    }

    if (node.isText) {
      const nodeMark = node.marks.find(m => m.type.name === 'inlineCode');
      if (nodeMark) {
        let result = null;
        try {
          result = await evaluateJS(node.text || 'null');
        } catch (e) {
          result = `${e}`;
        }
        // console.log(node.text, result);
        const tr = editor.state.tr;
        nodeMark.removeFromSet(node.marks);
        (nodeMark as any).attrs = { ...nodeMark.attrs, result };
        nodeMark.addToSet(node.marks);
        editor.view.dispatch(tr);
        return;
      }
    }
  };

  editor.state.doc.content.descendants((node, pos) => {
    walkNode(node, pos);
  });
};
