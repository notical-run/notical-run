import { useParams } from '@solidjs/router';
import { Editor } from '../components/Editor';
import { useNote, useUpdateNote } from '../api/queries/workspace';
import { Page } from '../components/Page';
import { links } from '../components/Navigation';
import { createEffect, Show } from 'solid-js';
import * as Y from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';

const useDebounced = (func: any, wait: number) => {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

type Params = {
  workspaceSlug: string;
  noteId: string;
};

const WorkspaceNote = () => {
  const { workspaceSlug, noteId } = useParams<Params>();
  const slug = workspaceSlug.replace(/^@/, '');
  const noteResult = useNote(slug, noteId);
  const noteUpdater = useUpdateNote(slug, noteId);

  const document = new Y.Doc();

  const updateNote = useDebounced(() => {
    const content = noteResult.data?.content;
    const update = Y.encodeStateAsUpdateV2(document);
    const b64Update = fromUint8Array(update);
    // TODO: Figure out why this is getting called
    if (content !== b64Update) {
      noteUpdater.mutate({ content: b64Update });
    }
  }, 1000);

  createEffect(() => {
    const content = noteResult.data?.content;
    if (content) {
      Y.applyUpdateV2(document, toUint8Array(content));
    }

    document.on('updateV2', () => {
      updateNote();
    });
  });

  return (
    <Page
      breadcrumbs={[
        {
          text: <>@{slug}</>,
          href: links.workspaceNotes(slug),
        },
        { text: <>{noteResult.data?.name ?? 'Loading...'}</> },
      ]}
    >
      <div class="px-2">
        <div class="mx-auto max-w-4xl">
          <div class="text-right text-sm text-slate-500">
            @{slug}/{noteId} by {noteResult.data?.author.name}
          </div>
          <div class="border border-gray-100">
            <Show when={!!noteResult.data?.id} keyed>
              <Editor document={document} />
            </Show>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default WorkspaceNote;
