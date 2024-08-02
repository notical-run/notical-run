
`state.worldclock = here()`


```
globalThis.timer && clearInterval(globalThis.timer);
globalThis.timer = setInterval(() => refreshClock(), 1000);

const toTimezones = md => md.match(/^-\s+.*$/gm).map(s => s.replace(/^-\s+/, ''))

const getCurrentTime = timeZone =>
  _internals.formatDateTime(new Date(), 'en-US', {
    timeZone,
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

export const refreshClock = () => {
  const tzContent = toTimezones(next.markdown(state.timezones))
    .map(tz => `- ${tz}: **${getCurrentTime(tz)}**`)
    .join('\n')
  show.markdown(state.worldclock, tzContent);
}
```

`state.timezones = here()`
- UTC
- Asia/Kolkata
- America/Chicago
- Europe/London

