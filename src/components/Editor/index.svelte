<script lang="ts">
  import { Editor } from "@tiptap/core";
  import { onDestroy, onMount } from "svelte";
  import "highlight.js/styles/tokyo-night-dark.css";
  import { getExtensions } from "./extensions";
  import { evaluateAllNodes } from "./evaluator";
  const testContent = `
# Hello world

## Code and shit

Some inline \`state.num\`

\`[201 * state.num, state.num]\`

\`state\`

\`\`\`
export const increment = () => state.num = (state.num ?? 0) + 1;
export const decrement = () => state.num = (state.num ?? 0) - 1;
\`\`\`
`;

  let element: HTMLElement | undefined;
  let editor: Editor | undefined;

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
      onUpdate: ({ editor }) => evaluateAllNodes(editor),
      content: testContent,
      // onTransaction: () => { editor = editor; },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={element} />
