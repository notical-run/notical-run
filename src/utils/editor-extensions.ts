import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";

export const getExtensions = () => [
  StarterKit.configure({
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class: 'bg-slate-800 text-white'
      }
    }
  }),
  Markdown.configure({
    html: false,
    tightLists: true,
    linkify: true,
    breaks: true,
    transformPastedText: true,
    transformCopiedText: true,
  }),
  CodeBlockLowlight.configure({
    defaultLanguage: 'javascript',
    lowlight: createLowlight(common),
    exitOnTripleEnter: false,
    HTMLAttributes: {
      class: 'hljs',
    }
  }),
  Link.configure({
    HTMLAttributes: {
      class: 'text-violet-900 underline',
    }
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'flex items-start justify-start gap-3 [&_p]:my-0',
    }
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: 'list-none pl-1',
    }
  }),
];
