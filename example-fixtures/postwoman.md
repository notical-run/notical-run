
## HTTP request client

<table style="min-width: 341px">
<colgroup><col style="width: 291px"><col><col></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="291"><p></p></th><th colspan="1" rowspan="1"><p></p></th><th colspan="1" rowspan="1"><p></p></th></tr><tr><td colspan="1" rowspan="1" colwidth="291"><p><code nodeid="c1b9551c-8eb8-4687-8cf2-d05e7ef33c44">`$method = here()`</code></p><pre nodeid="836d4140-950d-4812-9fd5-69d9ebb651e6" collapsed="false"><code class="language-text">POST</code></pre></td><td colspan="1" rowspan="1"><p><code nodeid="f5c803f4-3a3c-4d96-afc7-859395a09774">`$url = here()`</code></p><pre nodeid="c130e2f2-90ff-4c57-aa23-5a5806205845" collapsed="false"><code class="language-text">https://httpbin.org/post</code></pre></td><td colspan="1" rowspan="1"><p></p></td></tr><tr><td colspan="1" rowspan="1" colwidth="291"><p><code nodeid="296fcd7e-4ce2-46e0-8ef2-8b06e5bcf0a9">`$headers = here()`</code></p><pre nodeid="e55b663c-1b91-48de-83dd-3042489215d6" collapsed="false"><code class="language-text">X-Foobar: 123hello
Content-Type: application/json</code></pre></td><td colspan="1" rowspan="1"><p><code nodeid="8687c356-8d0b-4072-b6c6-28c9bf8e5e30">`$body = here()`</code></p><pre nodeid="ccafb17b-865d-4eb1-a828-787a3380a2d3" collapsed="false"><code class="language-text">{
  "a": "b"
}</code></pre></td><td colspan="1" rowspan="1"><p></p></td></tr></tbody>
</table>


```
const getValue = (text) => text.replace(/(^```\w+)|(```$)/g, '')

export const RunRequest = async () => {
  show.markdown($response, 'Running...');
  try {
    const headers = Object.fromEntries(getValue(next.markdown($headers)).trim().split('\n').map(l => l.split(/\s*:\s*/)));
    const resp = await fetchJSON(getValue(next.markdown($url)), {
      method: getValue(next.markdown($method)),
      headers: headers,
      body: getValue(next.markdown($body)),
    });
    show.markdown($response, `
\`\`\`text
${JSON.stringify(resp, null, 2)}
\`\`\`
    `);
  } catch(e) {
    show.markdown($response, `## Error\n\`\`\`text\n ${e}\n\`\`\``)
  }
}
```

`$response = here()`

