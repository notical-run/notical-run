import { useWorkspaceNotes } from '@/api/queries/workspace';
import { links } from '@/components/Navigation';
import { useWorkspaceContext } from '@/layouts/workspace';
import { A } from '@solidjs/router';
import { AiOutlineLock } from 'solid-icons/ai';
import { BiSolidNote } from 'solid-icons/bi';
import { For } from 'solid-js';

export const NoteSidebar = () => {
  const { slug } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug);

  return (
    <div>
      <div class="text-slate-400 text-xs uppercase">Notes</div>
      <div class="flex flex-col mt-1">
        <For each={notesQuery.data ?? []}>
          {note => (
            <A
              href={links.workspaceNote(slug(), note.name)}
              class="flex items-center gap-2 px-2 text-sm py-1"
              activeClass="text-slate-400 cursor-default"
              inactiveClass="text-slate-600 hover:text-slate-900"
            >
              {note.access === 'private' ? (
                <AiOutlineLock size={14} class="text-yellow-700" />
              ) : (
                <BiSolidNote size={14} />
              )}
              {note.name}
            </A>
          )}
        </For>
      </div>
    </div>
  );
};
