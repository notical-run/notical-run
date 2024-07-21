import { fetchNote, useUpdateNote } from '@/api/queries/workspace';
import { Editor } from '@/components/Editor';
import { useWorkspaceContext } from '@/layouts/workspace';
import { useDebounced } from '@/utils/use-debounced';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { createEffect } from 'solid-js';
import * as Y from 'yjs';

export type NoteEditorProps = {
  note: Awaited<ReturnType<typeof fetchNote>>;
};

export const NoteEditor = (props: NoteEditorProps) => {
  const { slug } = useWorkspaceContext();
  const importCache = new Map<string, Y.Doc>();
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

  createEffect(() => {
    const content = props.note?.content;
    if (content) {
      Y.applyUpdateV2(yDoc, toUint8Array(content));
    }

    yDoc.on('updateV2', () => {
      updateNote();
    });
  });

  const moduleLoader = async (modulePath: string) => {
    if (!modulePath) throw new Error('Module path cannot be empty');
    if (importCache.has(modulePath)) return importCache.get(modulePath)!;

    const importMatch = modulePath.match(/^@([a-z0-9-_]+)\/([a-z0-9-_]+)$/i);
    if (!importMatch || importMatch.length < 3) throw new Error('Invalid import path');

    const [_, workspace, noteId] = importMatch;
    const response = await fetchNote(workspace, noteId);
    if (!response) throw new Error('Invalid response for note');

    const moduleYDoc = new Y.Doc();
    Y.applyUpdateV2(moduleYDoc, toUint8Array(response.content ?? ''));

    importCache.set(modulePath, moduleYDoc);

    return moduleYDoc;
  };

  return (
    <Editor
      editable={props.note?.permissions.canEdit}
      document={yDoc}
      moduleLoader={moduleLoader}
    />
  );
};
