import { Editor as TiptapEditor } from '@tiptap/core';
import { HiOutlineArchiveBoxXMark } from 'solid-icons/hi';
import { BsThreeDotsVertical } from 'solid-icons/bs';
import { NoteArchiveConfirm } from '@/components/Note/NoteArchiveConfirm';
import { Dialog } from '@/components/_base/Dialog';
import { Match, Show, Switch } from 'solid-js';
import { FaBrandsMarkdown } from 'solid-icons/fa';
import toast from 'solid-toast';
import { Authorize, useAuthorizationRules } from '@/components/Auth/Session';
import { useNote } from '@/api/queries/workspace';
import { AiOutlineLock, AiOutlineUnlock } from 'solid-icons/ai';
import { NoteAccessChangeConfirm } from '@/components/Note/NoteAccessChangeConfirm';
import { DropdownMenu } from '@/components/_base/DropdownMenu';

type NoteDropdownProps = {
  workspaceSlug: string;
  noteId: string;
  editor?: TiptapEditor;
  onArchive?: () => void;
};

export const NoteActionsDropdown = (props: NoteDropdownProps) => {
  const noteQuery = useNote(
    () => props.workspaceSlug,
    () => props.noteId,
  );
  const authorizationRules = useAuthorizationRules();

  const copyAsMarkdown = async () => {
    const markdown = props.editor!.storage.markdown.getMarkdown() ?? '';
    await navigator.clipboard.writeText(markdown);
    toast.success('Copied markdown to clipboard');
  };

  const canManageWorkspace = authorizationRules.workspace.manage();

  return (
    <>
      <DropdownMenu>
        <Show when={canManageWorkspace || props.editor}>
          <DropdownMenu.Trigger class="flex items-center justify-center size-8 mx-0 rounded-full hover:bg-slate-200">
            <BsThreeDotsVertical />
          </DropdownMenu.Trigger>
        </Show>

        <DropdownMenu.Items>
          <Show when={props.editor}>
            <DropdownMenu.Item onClick={copyAsMarkdown}>
              <FaBrandsMarkdown />
              Copy as markdown
            </DropdownMenu.Item>
          </Show>

          <Authorize user="logged_in" workspace="manage">
            <Show when={noteQuery.data?.id}>
              <NoteAccessChangeConfirm
                workspaceSlug={props.workspaceSlug}
                noteId={noteQuery.data!.name!}
                noteAccess={noteQuery.data!.access === 'private' ? 'public' : 'private'}
              >
                <Dialog.Trigger as={DropdownMenu.Item}>
                  {noteQuery.data!.access === 'private' ? (
                    <>
                      <AiOutlineUnlock class="text-green-600" />
                      Make the note public
                    </>
                  ) : (
                    <>
                      <AiOutlineLock class="text-yellow-700" />
                      Make the note private
                    </>
                  )}
                </Dialog.Trigger>
              </NoteAccessChangeConfirm>
            </Show>
          </Authorize>

          <Authorize user="logged_in" workspace="manage">
            <Switch>
              <Match when={noteQuery.data?.archivedAt}>
                <NoteArchiveConfirm
                  unarchive
                  workspaceSlug={props.workspaceSlug}
                  noteId={props.noteId}
                  onArchive={props.onArchive}
                >
                  <Dialog.Trigger as={DropdownMenu.Item}>
                    <HiOutlineArchiveBoxXMark />
                    Restore
                  </Dialog.Trigger>
                </NoteArchiveConfirm>
              </Match>

              <Match when={noteQuery.data?.archivedAt === null}>
                <NoteArchiveConfirm
                  workspaceSlug={props.workspaceSlug}
                  noteId={props.noteId}
                  onArchive={props.onArchive}
                >
                  <Dialog.Trigger as={DropdownMenu.Item}>
                    <HiOutlineArchiveBoxXMark />
                    Archive
                  </Dialog.Trigger>
                </NoteArchiveConfirm>
              </Match>
            </Switch>
          </Authorize>
        </DropdownMenu.Items>
      </DropdownMenu>
    </>
  );
};
