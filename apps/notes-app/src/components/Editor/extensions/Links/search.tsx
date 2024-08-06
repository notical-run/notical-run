import { fetchWorkspaceNotes } from '@/api/queries/workspace';
import { SuggestionsExtension } from '@/components/Editor/suggestions';

export const LinkSearchExtension = SuggestionsExtension.extend({
  name: 'linkSearch',

  addOptions() {
    return {
      suggestion: {
        char: '@',
        allowSpaces: false,

        allow: ({ state, range }) => {
          const resolvedPos = state.doc.resolve(range.from);
          if (resolvedPos.node().type.name !== 'paragraph') return false;
          const noteIdRegex = /^@([a-z0-9-_]+)\/([a-z0-9-_]*)$/i;
          const noteIdMatch = state.doc.textBetween(range.from, range.to).trim().match(noteIdRegex);
          return !!noteIdMatch;
        },

        items: async ({ query }) => {
          const matches = query.trim().split('/');
          if (matches.length < 2) return [];
          const [workspaceSlug, noteSearch] = matches;

          const notes = await fetchWorkspaceNotes(workspaceSlug);
          return notes.map(note => ({
            id: note.id,
            label: `@${note.workspace.slug}/${note.name}`,
            command: ({ editor, range }) => {
              editor.chain().focus().insertNoteLink(note.workspace.slug, note.name, range).run();
            },
          }));
        },
      },
    };
  },
});
