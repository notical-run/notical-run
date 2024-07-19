export const useDebounced = (func: any, wait: number) => {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
