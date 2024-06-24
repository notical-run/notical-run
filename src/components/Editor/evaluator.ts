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

const variant = newVariant(RELEASE_SYNC, { wasmLocation });

let quickJS: Promise<QuickJSWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSWASMModuleFromVariant(variant);
  return quickJS;
}

const isEvalable = (node: Node) =>
  [null, 'javascript'].includes(node.attrs.language);

let quickVM: QuickJSContext | undefined;
const evaluateJS = async (code: string) => {
  const quickJS = await getQuickJS();
  if (!quickJS) return;
  quickVM ??= quickJS.newContext();

  const result = quickVM.evalCode(code);
  const valueHandle = quickVM.unwrapResult(result);
  const value = quickVM.dump(valueHandle);

  valueHandle.dispose();
  return value;
};

export const evaluateBlocks = (editor: Editor) => {
  console.log('>>>> on update...', editor.state.doc.toJSON());

  const walkNode = async (node: Node) => {
    if (node.type.name === 'codeBlock' && isEvalable(node)) {
      // console.log(">>> code bloc", node.attrs, node.textContent);
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
        console.log(node.text, result);
        const tr = editor.state.tr;
        nodeMark.removeFromSet(node.marks);
        (nodeMark as any).attrs = { ...nodeMark.attrs, result };
        nodeMark.addToSet(node.marks);
        editor.view.dispatch(tr);
        return;
      }
    }
  };

  editor.state.doc.content.descendants(node => {
    walkNode(node);
  });
};
