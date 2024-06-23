import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";
import { GlobalNodeId } from "./GlobalNodeId";

const EvalCodeBlock = CodeBlockLowlight

export const getExtensions = () => [
  StarterKit.configure({ codeBlock: false, code: false }),
  Markdown.configure({
    html: false,
    tightLists: true,
    linkify: true,
    breaks: true,
    transformPastedText: true,
    transformCopiedText: true,
  }),
  Link.configure({
    protocols: ['http', 'https', 'mailto'],
    openOnClick: true,
    linkOnPaste: true,
    // validate: (url) => true,
    HTMLAttributes: { class: 'text-violet-900 underline' },
  }),

  GlobalNodeId,
  Code.configure({
    HTMLAttributes: {
      class: 'bg-slate-800 text-violet-300',
    },
  }),
  EvalCodeBlock.configure({
    defaultLanguage: 'javascript',
    lowlight: createLowlight(common),
    exitOnTripleEnter: false,
    HTMLAttributes: {
      class: 'hljs',
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
