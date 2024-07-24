import { createSignal, onCleanup } from 'solid-js';

export const breakpoints = {
  sm: '(min-width: 700px)',
  md: '(min-width: 800px)',
  lg: '(min-width: 1000px)',
} as const;

type Breakpoint = keyof typeof breakpoints;

export const useBreakpoint = (breakpoint: Breakpoint) => {
  const matchMedia = window.matchMedia(breakpoints[breakpoint]);
  const [matches, setMatches] = createSignal(matchMedia.matches);
  const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

  matchMedia.addEventListener('change', onChange);
  onCleanup(() => {
    matchMedia.removeEventListener('change', onChange);
  });

  return matches;
};
