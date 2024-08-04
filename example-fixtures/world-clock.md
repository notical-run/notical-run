## World clock

`worldclock = here()`


```
globalThis.timer && clearInterval(globalThis.timer);
globalThis.timer = setInterval(() => refreshClock(), 1000);

const toTimezones = md => md.match(/^-\s+.*$/gm).map(s => s.replace(/^-\s+/, ''))

const getCurrentTime = timeZone => {
  const date = new Date();
  const currentTimeText = next.markdown(currentTime).trim().replace(/(^```\w+\s*)|(```$)/g, '');
  const [hours, minutes, seconds] = currentTimeText.split(':').map(s => parseInt(s))
  if (currentTimeText) {
    date.setHours(hours ?? 0);
    date.setMinutes(minutes ?? 0);
    date.setSeconds(minutes ?? 0);
  }
  return _internals.formatDateTime(date, 'en-US', {
    timeZone,
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const refreshClock = () => {
  const tzContent = toTimezones(next.markdown(timezones))
    .map(tz => `- ${tz}: **${getCurrentTime(tz)}**`)
    .join('\n')
  show.markdown(worldclock, tzContent);
}
```


`currentTime = here()`
```text
```


`timezones = here()`
- UTC
- Asia/Kolkata
- America/Chicago
- Europe/London

