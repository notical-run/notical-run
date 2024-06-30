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

export const getExtensions = () => [
  StarterKit.configure({ codeBlock: false, code: false }),
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
  TrailingNode,

  GlobalNodeId,
  InlineCode,
  CodeBlock.configure({
    lowlight: createLowlight({ javascript }),
    HTMLAttributes: { class: 'hljs' },
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
];
