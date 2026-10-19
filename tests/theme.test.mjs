import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../assets/theme.js', import.meta.url), 'utf8');
function setup(saved, blocked = false) {
  const events = {};
  const buttons = Array.from({ length: 2 }, () => ({
    hidden: true, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, fn) { this[key] = fn; },
  }));
  const root = { dataset: {} };
  let dialog = false;
  const storage = {
    getItem() { if (blocked) throw Error('Denied'); return saved; },
    setItem(key, value) { if (blocked) throw Error('Denied'); saved = value; },
  };
  vm.runInNewContext(source, {
    document: {
      documentElement: root,
      querySelectorAll: () => buttons,
      querySelector: () => dialog,
      addEventListener: (key, fn) => { events[key] = fn; },
    },
    window: { addEventListener: (key, fn) => { events[key] = fn; } },
    localStorage: storage,
  });
  return { root, buttons, events, storage, openDialog() { dialog = true; } };
}

test('restores before DOM ready; toggles and synchronizes every control', () => {
  const app = setup('dark');
  assert.equal(app.root.dataset.theme, 'dark');
  app.events.DOMContentLoaded();
  assert.equal(app.buttons[0].attributes['aria-pressed'], 'true');
  app.buttons[1].click();
  assert.equal(app.storage.getItem(), 'light');
  for (const button of app.buttons) {
    assert.equal(button.hidden, false);
    assert.equal(button.attributes['aria-pressed'], 'false');
  }
});

test('storage denial still permits toggling; invalid values default to light', () => {
  for (const blocked of [false, true]) {
    const app = setup('invalid', blocked);
    assert.equal(app.root.dataset.theme, 'light');
    app.events.DOMContentLoaded();
    app.buttons[0].click();
    assert.equal(app.root.dataset.theme, 'dark');
  }
});

test('T shortcut respects editing, composition, modifiers and dialogs', () => {
  const app = setup();
  const key = { key: 't', target: { tagName: 'BODY' }, preventDefault() {} };
  for (const extra of [
    { target: { tagName: 'INPUT' } }, { target: { tagName: 'TEXTAREA' } },
    { target: { tagName: 'SELECT' } }, { target: { isContentEditable: true } },
    { isComposing: true }, { repeat: true }, { ctrlKey: true },
    { altKey: true }, { metaKey: true }, { defaultPrevented: true },
  ]) {
    app.events.keydown({ ...key, ...extra });
    assert.equal(app.root.dataset.theme, 'light');
  }
  app.events.keydown(key);
  assert.equal(app.root.dataset.theme, 'dark');
  app.openDialog();
  app.events.keydown(key);
  assert.equal(app.root.dataset.theme, 'dark');
});

test('synchronizes preference changes and deletion across tabs', () => {
  const app = setup();
  app.events.DOMContentLoaded();
  app.events.storage({ key: 'other', newValue: 'dark' });
  assert.equal(app.root.dataset.theme, 'light');
  app.events.storage({ key: 'kobong-theme', newValue: 'dark' });
  assert.equal(app.buttons[1].attributes['aria-pressed'], 'true');
  app.events.storage({ key: 'kobong-theme', newValue: null });
  assert.equal(app.root.dataset.theme, 'light');
  app.events.storage({ key: null, newValue: null });
  assert.equal(app.root.dataset.theme, 'light');
});
