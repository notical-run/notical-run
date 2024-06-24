<script lang="ts">
  import { Editor } from "@tiptap/core";
  import type { Node } from "@tiptap/pm/model";
  import { onDestroy, onMount } from "svelte";
  import "highlight.js/styles/tokyo-night-dark.css";
  import { getExtensions } from "./extensions";
  import { QuickJSWASMModule, newQuickJSWASMModuleFromVariant, newVariant, RELEASE_SYNC, QuickJSContext  } from "quickjs-emscripten";
  import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url"

  const variant = newVariant(RELEASE_SYNC, { wasmLocation })

  export async function getQuickJS() {
    return await newQuickJSWASMModuleFromVariant(variant)
  }

  const testContent = `
# Hello world

## Code and shit

\`globalThis.state ??= {}\`

Some inline \`state.num\`

\`state.num = 2\`

\`[201 * state.num, state.num]\`

\`window\`

\`\`\`
const hello = "world";
console.log(hello);
\`\`\`
`;

  let element: HTMLElement | undefined;
  let editor: Editor | undefined;
  let quickJS: QuickJSWASMModule | undefined;

  const isEvalable = (node: Node) =>
    [null, "javascript"].includes(node.attrs.language);

  let quickVM: QuickJSContext | undefined;
  const evaluateJS = (code: string) => {
    if (!quickJS) return;
    quickVM ??= quickJS.newContext();

    const result = quickVM.evalCode(code)
    const valueHandle = quickVM.unwrapResult(result)
    const value = quickVM.dump(valueHandle)

    valueHandle.dispose()
    return value
  }

  const evaluateBlocks = (editor: Editor) => {
    console.log(">>>> on update...", editor.state.doc.toJSON());

    const walkNode = (node: Node) => {
      if (node.type.name === "codeBlock" && isEvalable(node)) {
        // console.log(">>> code bloc", node.attrs, node.textContent);
        return;
      }
      if (node.isText) {
        const nodeMark = node.marks.find((m) => m.type.name === "inlineCode");
        if (nodeMark) {
          let result = null;
          try {
            result = evaluateJS(node.text ?? 'null');
          } catch(e) {
            result = `${e}`
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

    editor.state.doc.content.descendants(walkNode);
  };

  onMount(() => {
    getQuickJS().then((qjs) => {
      quickJS = qjs;
      evaluateBlocks(editor!);
    });
    editor = new Editor({
      element: element,
      extensions: getExtensions(),
      editorProps: {
        attributes: {
          spellcheck: "false",
          class:
            "prose prose-base mx-auto focus:outline-none p-4 border border-gray-200",
        },
      },
      onCreate: ({ editor }) => {
        if (!editor.$doc.attributes.initializedNodeIDs) {
          // TODO: Move to GlobalNodeID as command
          editor.view.dispatch(
            editor.state.tr.setDocAttribute("initializedNodeIDs", true),
          );
        }
      },
      onUpdate: ({ editor }) => evaluateBlocks(editor),
      content: testContent,
      // onTransaction: () => { editor = editor; },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={element} />
