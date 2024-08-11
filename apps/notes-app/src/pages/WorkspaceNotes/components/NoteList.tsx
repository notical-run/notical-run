import { List } from '@/components/_base/ListItems';
import { links } from '@/components/Navigation';
import { NoteActionsDropdown } from '@/components/Note/NoteDropdown';
import { useWorkspaceContext } from '@/context/workspace';
import { A } from '@solidjs/router';
import { AiOutlineLock } from 'solid-icons/ai';
import { For, JSX } from 'solid-js';
import { FiArchive } from 'solid-icons/fi';
import { WorkspaceNotesQueryResult } from '@/api/queries/workspace';

export const NoteList = (props: { notes: WorkspaceNotesQueryResult; fallback?: JSX.Element }) => {
  const { slug } = useWorkspaceContext();
  return (
    <List>
      <For each={props.notes} fallback={props.fallback}>
        {note => (
          <List.Item class="flex items-center px-2" aria-label={`@${slug()}/${note.name}`}>
            <A href={links.workspaceNote(slug(), note.name)} class="block px-2 py-3 flex-1">
              <div class="flex items-center">
                <span class="text-slate-500 text-xs">@{slug()}</span>
                <span class="text-slate-500 text-md">/</span>
                <span class="text-slate-900 font-bold">{note.name}</span>
                {note.access === 'private' && <AiOutlineLock class="ml-2 text-yellow-700" />}
                {note.archivedAt && <FiArchive class="ml-2 text-red-800" />}
              </div>
            </A>

            <NoteActionsDropdown workspaceSlug={slug()} noteId={note.name} />
          </List.Item>
        )}
      </For>
    </List>
  );
};
