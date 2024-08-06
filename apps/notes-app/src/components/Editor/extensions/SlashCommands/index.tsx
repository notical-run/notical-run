import { slashCommands } from '@/components/Editor/extensions/SlashCommands/commands';
import { SuggestionsExtension } from '@/components/Editor/suggestions';

export const SlashCommandsExtension = SuggestionsExtension.extend({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        // startOfLine: true,

        allow: ({ state, range }) => {
          const resolvedPos = state.doc.resolve(range.from);
          return resolvedPos.node().type.name === 'paragraph';
        },

        items: ({ query }) => {
          if (!query.trim()) return slashCommands;
          return slashCommands.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          );
        },
      },
    };
  },
});
