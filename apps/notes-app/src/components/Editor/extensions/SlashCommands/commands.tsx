import { SlashCommand } from '@/components/Editor/extensions/SlashCommands/view';
import { ChainedCommands } from '@tiptap/core';
import { FaSolidCode, FaSolidHeading } from 'solid-icons/fa';

const slashCommand =
  (
    fn: (chain: ChainedCommands, opts: Parameters<SlashCommand['command']>[0]) => ChainedCommands,
  ): SlashCommand['command'] =>
  opts => {
    const { editor, range } = opts;
    const chain = editor.chain().focus().deleteRange(range);
    fn(chain, opts).run();
  };

export const slashCommands: SlashCommand[] = [
  {
    id: 'code_block',
    icon: () => <FaSolidCode />,
    label: 'Code block',
    command: slashCommand(chain => chain.setCodeBlock()),
  },

  {
    id: 'heading_1',
    icon: () => (
      <span class="flex justify-start items-end">
        <FaSolidHeading />
        <sub>1</sub>
      </span>
    ),
    label: 'Heading 1',
    command: slashCommand(chain => chain.setHeading({ level: 1 })),
  },

  {
    id: 'heading_2',
    icon: () => (
      <span class="flex justify-start items-end">
        <FaSolidHeading />
        <sub>2</sub>
      </span>
    ),
    label: 'Heading 2',
    command: slashCommand(chain => chain.setHeading({ level: 2 })),
  },

  {
    id: 'heading_3',
    icon: () => (
      <span class="flex justify-start items-end">
        <FaSolidHeading />
        <sub>3</sub>
      </span>
    ),
    label: 'Heading 3',
    command: slashCommand(chain => chain.setHeading({ level: 3 })),
  },

  // {
  //   id: 'raw_text',
  //   icon: <BsCardText />,
  //   label: 'Raw text block',
  //   command: slashCommand(chain => chain.setCodeBlock({ language: 'text' })),
  // },
];
