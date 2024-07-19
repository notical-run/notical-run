import { useParams } from '@solidjs/router';
import { Editor } from '../../components/Editor';
import { fetchNote, useNote, useUpdateNote } from '../../api/queries/workspace';
import { Page } from '../../components/Page';
import { createEffect, Show } from 'solid-js';
import * as Y from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { useWorkspaceContext } from '@/layouts/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useDebounced } from '@/utils/use-debounced';

const WorkspaceNote = () => {
  const { slug } = useWorkspaceContext();
  const params = useParams<{ noteId: string }>();
  const noteQuery = useNote(slug, () => params.noteId);
  const noteUpdater = useUpdateNote(slug, () => params.noteId);

  const document = new Y.Doc();

  const updateNote = useDebounced(() => {
    if (!noteQuery.data?.permissions.canEdit) return;

    const content = noteQuery.data?.content;
    const update = Y.encodeStateAsUpdateV2(document);
    const b64Update = fromUint8Array(update);
    // TODO: Figure out why this is getting called
    if (content !== b64Update) {
      noteUpdater.mutate({ content: b64Update });
    }
  }, 1000);

  createEffect(() => {
    const content = noteQuery.data?.content;
    if (content) {
      Y.applyUpdateV2(document, toUint8Array(content));
    }

    document.on('updateV2', () => {
      updateNote();
    });
  });

  const importCache = new Map<string, Y.Doc>();

  const moduleLoader = async (modulePath: string) => {
    if (!modulePath) throw new Error('Module path cannot be empty');
    if (importCache.has(modulePath)) return importCache.get(modulePath)!;

    const importMatch = modulePath.match(/^@([a-z0-9-_]+)\/([a-z0-9-_]+)$/i);
    if (!importMatch || importMatch.length < 3) throw new Error('Invalid import path');

    const [_, workspace, noteId] = importMatch;
    const response = await fetchNote(workspace, noteId);
    if (!response) throw new Error('Invalid response for note');

    const yDoc = new Y.Doc();
    Y.applyUpdateV2(yDoc, toUint8Array(response.content ?? ''));

    importCache.set(modulePath, yDoc);

    return yDoc;
  };

  return (
    <Page
      breadcrumbs={[
        { text: <WorkspaceSelector selected={slug()} /> },
        { text: <>{noteQuery.data?.name ?? 'Loading...'}</> },
      ]}
    >
      <div class="px-2">
        <div class="mx-auto max-w-4xl">
          <div class="text-right text-sm text-slate-500">
            @{slug()}/{params.noteId} by {noteQuery.data?.author?.name}
          </div>
          <div class="border border-gray-100">
            <Show when={!!noteQuery.data?.id} keyed>
              <Editor
                editable={noteQuery.data?.permissions.canEdit}
                document={document}
                moduleLoader={moduleLoader}
              />
            </Show>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default WorkspaceNote;
