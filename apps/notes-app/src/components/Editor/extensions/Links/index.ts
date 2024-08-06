import { LinkSearchExtension } from '@/components/Editor/extensions/Links/search';
import { cn } from '@/utils/classname';
import { mergeAttributes, Node, Range } from '@tiptap/core';
import { MarkdownSerializerState } from 'prosemirror-markdown';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    noteLink: {
      insertNoteLink: (workspaceSlug: string, noteId: string, range?: Range) => ReturnType;
    };
  }
}

export const NoteLink = Node.create({
  name: 'noteLink',
  group: 'inline',
  marks: '',
  inline: true,
  excludes: '_',
  selectable: false,
  atom: true,

  addAttributes() {
    const noteIdRegex = /@([a-z0-9-_]+)\/([a-z0-9-_]+)$/gi;

    return {
      workspace: {
        rendered: false,
        parseHTML: (el: HTMLElement) => el.getAttribute('href')?.match(noteIdRegex)?.[1],
      },

      note: {
        rendered: false,
        parseHTML: (el: HTMLElement) => el.getAttribute('href')?.match(noteIdRegex)?.[2],
      },
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: any) => {
          const noteId = `@${node.attrs.workspace}/${node.attrs.note}`;
          state.write(`[${noteId}](/${noteId})`);
        },

        parse: {
          updateDOM(dom: HTMLElement) {
            // TODO: Figure out why this doesn't work on paste
            const noteIdRegex = /\/@[a-z0-9-_]+\/[a-z0-9-_]+$/gi;
            const links = Array.from(dom.querySelectorAll('a'));
            links.forEach($a => {
              if (!$a.href) return;
              if (!new URL($a.href).pathname.match(noteIdRegex)) return;
              $a.setAttribute('data-type', 'noteLink');
            });
          },
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a', 'data-type': 'noteLink' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    // TODO: Use solid router for navigation
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'noteLink',
        href: `/@${node.attrs.workspace}/${node.attrs.note}`,
        class: cn(
          'px-[4px] pt-[2px] pb-[3px] rounded border border-slate-300 leading-none',
          'bg-slate-100 hover:bg-slate-200 text-slate-800 no-underline text-sm',
        ),
        target: '_self',
      }),
      `@${node.attrs.workspace}/${node.attrs.note}`,
    ];
  },

  addExtensions() {
    return [LinkSearchExtension];
  },

  addCommands() {
    return {
      insertNoteLink:
        (workspaceSlug, noteId, range) =>
        ({ editor, tr }) => {
          const linkNode = this.type.create({ workspace: workspaceSlug, note: noteId });
          if (range) tr.deleteRange(range.from, range.to);

          const pos = range?.from || editor.state.selection.from;
          tr.insert(pos, linkNode);

          return true;
        },
    };
  },
});
