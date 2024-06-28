import './styles/app.css';
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app')!,
});

export default app;

/**
// Node on update
evaluateJS(id, {
  code: node.textContent,
  onResult: (value, error) => {
    // Set self property
  },
})
*/
