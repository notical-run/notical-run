## Node generation for testing

```
export default () => state.index = 0;

export const incrementNum = () => state.num++;

export const addMoreContent = () => {
  state.index = (state.index ?? 0) + 1
  insert.markdown(state.hook, `\n\`state.num * ${state.index ?? 0}\``)
}
```

`[state.num, state.index]`

`state.hook = here()`

