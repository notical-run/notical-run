`state.num`

```
const content = '## Heading\n- [ ] hello\n- [ ] world\n';

export const incr = () => state.num++;
export const decr = () => state.num--;

globalThis.getItemsList = () => `## Total: ${state.num}\n\n ${Array.from({ length: state.num }, (_, i) => `- Item ${i}`).join('\n')}`;
```

`show.markdown(here(), globalThis.getItemsList())`
