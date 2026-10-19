import { selectResources } from './library-core.mjs';

const grid = document.querySelector('#resource-grid');
const cards = [...grid.querySelectorAll('[data-resource]')];
const resources = cards.map(card => JSON.parse(card.dataset.resource));
const nodes = new Map(resources.map((resource, index) => [resource.id, cards[index]]));
const controls = document.querySelector('.library-controls');
const query = document.querySelector('#library-query');
const topic = document.querySelector('#library-topic');
const sort = document.querySelector('#library-sort');
const categories = [...document.querySelectorAll('[data-category]')];
const status = document.querySelector('#library-status');
const empty = document.querySelector('.library-empty');
let category = '', composing = false, pending;

function syncURL() {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({ q: query.value.trim(), category, topic: topic.value, sort: sort.value === 'added' ? '' : sort.value })) {
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  }
  // Retain anchors and unrelated parameters, and avoid an entry per keystroke.
  try { history.replaceState(null, '', url); } catch { /* Filtering also works without history access. */ }
}
function apply(updateURL = true) {
  const selected = selectResources(resources, { query: query.value, category, topic: topic.value, sort: sort.value });
  const visible = new Set(selected.map(item => item.id));
  for (const item of resources) nodes.get(item.id).hidden = !visible.has(item.id);
  for (const item of selected) grid.append(nodes.get(item.id));
  categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  status.textContent = `${category || '전체'} · ${selected.length}개 표시 / 전체 ${resources.length}개 자료`;
  empty.hidden = selected.length !== 0;
  if (updateURL) syncURL();
}
function restore() {
  const params = new URL(location.href).searchParams;
  query.value = (params.get('q') || '').slice(0, 200);
  category = categories.some(button => button.dataset.category === params.get('category')) ? params.get('category') : '';
  topic.value = [...topic.options].some(option => option.value === params.get('topic')) ? params.get('topic') : '';
  sort.value = ['added', 'updated', 'title'].includes(params.get('sort')) ? params.get('sort') : 'added';
  apply(false);
}
query.addEventListener('compositionstart', () => { composing = true; clearTimeout(pending); });
query.addEventListener('compositionend', () => { composing = false; apply(); });
query.addEventListener('input', () => {
  clearTimeout(pending);
  if (!composing) pending = setTimeout(apply, 120);
});
query.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.isComposing && !composing) { event.preventDefault(); clearTimeout(pending); apply(); }
});
categories.forEach(button => button.addEventListener('click', () => { category = button.dataset.category; apply(); }));
topic.addEventListener('change', () => apply());
sort.addEventListener('change', () => apply());
document.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => {
  clearTimeout(pending); query.value = ''; category = ''; topic.value = ''; sort.value = 'added'; apply(); query.focus();
}));
window.addEventListener('popstate', restore);
restore();
controls.hidden = false;
