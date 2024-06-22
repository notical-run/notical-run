<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import { getExtensions } from "../utils/editor-extensions";
  import "highlight.js/styles/tokyo-night-dark.css";

  let element: HTMLElement | undefined;
  let editor: Editor | undefined;

  const testContent = `
# Hello world

## Code and shit

Some inline \`code snippet here\`

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

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: getExtensions(),
      editorProps: {
        attributes: {
          class:
            "prose prose-base mx-auto focus:outline-none p-4 border border-gray-200",
        },
      },
      content: testContent,
      // onTransaction: () => { editor = editor; },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={element} />
