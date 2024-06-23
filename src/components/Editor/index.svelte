<script lang="ts">
  import { Editor } from "@tiptap/core";
  import type { Node } from "@tiptap/pm/model";
  import { onDestroy, onMount } from "svelte";
  import "highlight.js/styles/tokyo-night-dark.css";
  import { getExtensions } from "./extensions";

  const testContent = `
# Hello world

## Code and shit

Some inline \`state.counter\`

\`state.counter = 1\`

\`201 * 7\`

\`window.navigator\`

\`\`\`
const hello = "world";
console.log(hello);
\`\`\`

## Stuff
Testing *more* **stuff** [here](https://google.com).

- Testing
- Testing

---

- [ ] Hello World!
- [ ] Foobar Baz
`;

  let element: HTMLElement | undefined;
  let editor: Editor | undefined;

  const isEvalable = (node: Node) =>
    [null, "javascript"].includes(node.attrs.language);

  (window as any).state ??= {};

  const evaluateBlocks = (editor: Editor) => {
    console.log(">>>> on update...", editor.state.doc.toJSON());

    const walkNode = (node: Node, pos: number) => {
      if (node.type.name === "codeBlock" && isEvalable(node)) {
        // console.log(">>> code bloc", node.attrs, node.textContent);
        return;
      }
      if (node.isText) {
        const nodeMark = node.marks.find((m) => m.type.name === "inlineCode");
        if (nodeMark) {
          const result = new Function(`return ${node.text};`)();
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
