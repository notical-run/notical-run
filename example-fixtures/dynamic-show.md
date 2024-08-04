`num`

```
const content = '## Heading\n- [ ] hello\n- [ ] world\n';

global.num = 0

export const incr = () => global.num++;
export const decr = () => global.num--;

globalThis.getItemsList = () => `## Total: ${num}\n\n ${Array.from({ length: num }, (_, i) => `- Item ${i}`).join('\n')}`;
```

`show.markdown(here(), globalThis.getItemsList())`
