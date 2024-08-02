import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import { GlobalNodeId } from './GlobalNodeId';
import { InlineCode } from './InlineCode';
import { CodeBlock } from './CodeBlock';
import { TrailingNode } from './TrailingNode';
import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import BubbleMenu from '@tiptap/extension-bubble-menu';

export const getExtensions = ({
  document: yDoc,
  inlineMenuElement,
  disableTrailingNode,
}: {
  document?: Y.Doc;
  inlineMenuElement?: HTMLElement;
  disableTrailingNode?: boolean;
}) =>
  [
    StarterKit.configure({ codeBlock: false, code: false, history: false }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'paragraph') return 'Start typing...';
        return '';
      },
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-node-empty',
    }),
    Markdown.configure({
      html: false,
      tightLists: true,
      linkify: true,
      breaks: true,
      transformPastedText: true,
      transformCopiedText: false,
    }),
    Link.configure({
      protocols: ['http', 'https', 'mailto'],
      openOnClick: true,
      linkOnPaste: true,
      HTMLAttributes: { class: 'text-violet-900 underline' },
    }),
    disableTrailingNode || TrailingNode,
    inlineMenuElement &&
      BubbleMenu.configure({
        element: inlineMenuElement,
        shouldShow: ({ editor, state }) => {
          if (!editor.isActive('paragraph')) return false;
          const isTextSelected = state.selection.from !== state.selection.to;
          return isTextSelected;
        },
      }),

    GlobalNodeId,
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

    yDoc && Collaboration.configure({ document: yDoc }),
  ].filter(Boolean) as Extension[];
