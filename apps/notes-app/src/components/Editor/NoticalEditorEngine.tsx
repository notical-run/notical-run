import { fetchViaProxyApi } from '@/api/queries/proxy-api';
import { ConfirmModal } from '@/components/Editor/components/ConfirmModal';
import { PromptModal } from '@/components/Editor/components/PromptModal';
import { useEditorContext } from '@/components/Editor/context';
import { evaluateImport } from '@/components/Editor/headless-note';
import { createEvalEngine } from '@/engine';
import { createSignal, Match, onCleanup, onMount, Switch } from 'solid-js';
import toast from 'solid-toast';

type UIModal =
  | null
  | { kind: 'prompt'; message: string; onValue: (value: string | null) => void }
  | { kind: 'confirm'; message: string; onConfirm: () => void; onCancel: () => void };

export const NoticalEditorEngine = () => {
  const [currentModal, setCurrentModal] = createSignal<UIModal>();
  const { editor, evalEngine, setEvalEngine, moduleDocumentLoader } = useEditorContext();

  onMount(async () => {
    const engine = await createEvalEngine({
      withEditor: fn => fn(editor()!),
      moduleLoader: async modulePath => {
        const moduleDoc = await moduleDocumentLoader(modulePath);
        const module = await evaluateImport({ doc: moduleDoc, engine });
        engine.importedEditorInstances.set(modulePath, module.editor);
        return module.moduleCode;
      },
      apiHelpers: {
        alert: opts => toast.success(opts.message || 'Alert'),
        confirm: opts => setCurrentModal({ kind: 'confirm', ...opts }),
        prompt: opts => setCurrentModal({ kind: 'prompt', ...opts }),
        fetch: fetchViaProxyApi,
      },
    });

    setEvalEngine(engine);
  });

  onCleanup(() => {
    evalEngine()?.destroy();
    setEvalEngine(undefined);
  });

  return (
    <Switch>
      <Match when={currentModal()?.kind === 'prompt'}>
        <PromptModal
          title={currentModal()?.message || 'Prompt'}
          onSubmit={value => {
            setCurrentModal(null);
            (currentModal() as any)?.onValue(value);
          }}
        />
      </Match>
      <Match when={currentModal()?.kind === 'confirm'}>
        <ConfirmModal
          title={currentModal()?.message || 'Confirm'}
          onConfirm={() => {
            setCurrentModal(null);
            (currentModal() as any)?.onConfirm();
          }}
          onCancel={() => {
            setCurrentModal(null);
            (currentModal() as any)?.onCancel();
          }}
        />
      </Match>
    </Switch>
  );
};
