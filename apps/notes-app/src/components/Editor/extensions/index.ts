import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { Markdown } from 'tiptap-markdown';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import * as Y from 'yjs';
import { SlashCommandsExtension } from '@/components/Editor/extensions/SlashCommands';
import { NoteLink } from '@/components/Editor/extensions/Links';
import { GlobalNodeId } from './GlobalNodeId';
import { InlineCode } from './InlineCode';
import { CodeBlock } from './CodeBlock';
import { TrailingNode } from './TrailingNode';

export const getExtensions = ({
  document: yDoc,
  inlineMenuElement,
  disableTrailingNode,
  disableNodeIds,
  readonly,
}: {
  document?: Y.Doc;
  inlineMenuElement?: HTMLElement;
  disableTrailingNode?: boolean;
  disableNodeIds?: boolean;
  readonly?: boolean;
}) =>
  [
    StarterKit.configure({ codeBlock: false, code: false, history: false }),
    readonly ||
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'paragraph') return 'Start writing or type `/` for commands...';
          return '';
        },
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-node-empty',
      }),
    Markdown.configure({
      html: true,
      tightLists: true,
      linkify: true,
      breaks: true,
      transformPastedText: true,
      transformCopiedText: false,
    }),
    Link.configure({
      protocols: ['http', 'https', 'mailto'],
      autolink: false,
      openOnClick: true,
      linkOnPaste: false,
      HTMLAttributes: { class: 'text-violet-900 underline' },
      // validate: url => true,
    }),
    readonly || disableTrailingNode || TrailingNode,

    readonly ||
      (inlineMenuElement &&
        BubbleMenu.configure({
          element: inlineMenuElement,
          shouldShow: ({ editor, state }) => {
            if (!editor.isActive('paragraph')) return false;
            if (editor.isActive('code')) return false;
            return !state.selection.empty;
          },
        })),
    readonly || SlashCommandsExtension,
    NoteLink,

    disableNodeIds || GlobalNodeId,
    InlineCode,
    CodeBlock.configure({
      lowlight: createLowlight({ javascript }),
      defaultLanguage: 'javascript',
      exitOnTripleEnter: false,
    }),

    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'flex items-start justify-start gap-3 [&_p]:my-0',
      },
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: 'list-none pl-1',
      },
    }),

    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,

    yDoc && Collaboration.configure({ document: yDoc }),
  ].filter(Boolean) as Extension[];
