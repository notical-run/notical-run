import { NoteQueryResult, useUpdateNote } from '@/api/queries/workspace';
import { useWorkspaceContext } from '@/context/workspace';
import { useDebounced } from '@/utils/use-debounced';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { onCleanup, onMount } from 'solid-js';
import * as Y from 'yjs';
import { NoticalEditor } from '@/components/Editor/NoticalEditor';

export type NoteEditorProps = {
  note: NoteQueryResult;
};

export const NoteEditor = (props: NoteEditorProps) => {
  const { slug } = useWorkspaceContext();
  const noteUpdater = useUpdateNote(slug(), props.note.name);

  const yDoc = new Y.Doc();

  const updateNote = useDebounced(() => {
    if (!props.note?.permissions.canEdit) return;

    const content = props.note?.content;
    const update = Y.encodeStateAsUpdateV2(yDoc);
    const b64Update = fromUint8Array(update);
    if (content !== b64Update) {
      noteUpdater.mutate({ content: b64Update });
    }
  }, 800);

  onMount(() => {
    const content = props.note?.content;
    if (content) {
      Y.applyUpdateV2(yDoc, toUint8Array(content));
    }

    yDoc.on('updateV2', updateNote);
  });

  onCleanup(() => {
    yDoc.off('updateV2', updateNote);
    yDoc.destroy();
  });

  return (
    <>
      <NoticalEditor.Content
        editable={props.note?.permissions.canEdit}
        document={yDoc}
        defaultContent={props.note?.content === null ? props.note.defaultMarkdownContent : null}
      />
      <NoticalEditor.Engine />
    </>
  );
};
