// Production DevTools & Inspection Protection
export function disableDevTools() {
  if (!import.meta.env.PROD) return; // Keep enabled in local dev

  // 1. Disable React DevTools Hook
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }

  // 2. Silence production console logs
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;

  // 3. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, false);

  // 4. Block DevTools & Source Inspection Shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    const ctrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+Shift+I / J / C (DevTools & Console)
    if (ctrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View Page Source)
    if (ctrlOrMeta && ['U', 'u'].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Save Page)
    if (ctrlOrMeta && ['S', 's'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  }, false);
}
