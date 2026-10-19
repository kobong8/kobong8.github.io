// Restore before CSS paints; share the template's preference on the same origin.
(() => {
  const root = document.documentElement;
  const key = 'kobong-theme';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  root.dataset.theme = saved === 'dark' ? 'dark' : 'light';

  function sync() {
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(dark));
      button.textContent = dark ? '☀ 라이트 모드' : '☾ 다크 모드';
    });
  }
  function toggle() {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, root.dataset.theme); } catch {}
    sync();
  }
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', toggle);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || document.querySelector('dialog[open]')) return;
    if (event.key.toLowerCase() === 't') { event.preventDefault(); toggle(); }
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    root.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
    sync();
  });
})();
