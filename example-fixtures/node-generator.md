## Node generation for testing

```
index = 0;
num = 0;

export const incrementNum = () => num++;

export const addMoreContent = () => {
  index++
  insert.markdown(anchor, `\n\`num * ${index ?? 0}\``)
}
```

`[num, index]`

`anchor = here()`

