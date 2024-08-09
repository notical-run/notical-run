
`$url = here()`

```text
https://httpbin.org/post
```

`$headers = here()`

```text
X-Foobar: 123hello
Content-Type: application/json
```

`$body = here()`

```text
{
  a: 'b',
}
```

`$response = here()`

```

const getValue = (text) => text.replace(/(^```\w+)|(```$)/g, '')

export const run = async () => {
  const headers = Object.fromEntries(getValue(next.markdown($headers)).trim().split('\n').map(l => l.split(/\s*:\s*/)));
  const resp = await fetchJSON(getValue(next.markdown($url)), {
    method: 'POST',
    headers: headers,
    body: getValue(next.markdown($body)),
  });
  console.log(resp);
  show.markdown($response, `
${JSON.stringify(resp, null, 2)}
  `);
}
```
