import { Editor as TiptapEditor } from '@tiptap/core';
import 'highlight.js/styles/tokyo-night-dark.css';
import { getExtensions } from './extensions';
import { evaluateAllNodes } from './evaluator';
import * as Y from 'yjs';
import { Node } from '@tiptap/pm/model';

export type EvalImportOptions = {
  doc: Y.Doc;
  moduleLoader: (modulePath: string) => Promise<Y.Doc>;
};

export const evaluateImport = ({ doc, moduleLoader }: EvalImportOptions) => {
  const element = document.createElement('div');
  // TODO: Save {nodeid: export} format instead
  const allModules: string[] = [];
  let resolver = (_: string) => {};
  const waitForModuleCode = new Promise<string>(resolve => (resolver = resolve));

  const reeval = async () => {
    await evaluateAllNodes(editor, {
      evalBlock: (node: Node) => {
        allModules.push(node.textContent);
      },
      moduleLoader: async modulePath => {
        const moduleDoc = await moduleLoader(modulePath);
        const module = evaluateImport({ doc: moduleDoc, moduleLoader });
        return module.moduleCode;
      },
    });

    console.log(allModules);

    resolver(allModules.join('\n\n'));
    editor?.destroy();
  };

  const editor = new TiptapEditor({
    element: element,
    extensions: getExtensions({ document: doc }),
    editorProps: {},
    onCreate: () => reeval(),
    onUpdate: () => reeval(),
    onDestroy() {},
  });

  const onCleanup = () => {
    editor?.destroy();
  };

  return {
    onCleanup,
    moduleCode: waitForModuleCode,
  };
};
