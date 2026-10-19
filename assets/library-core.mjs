export const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g, ' ').trim();
export function selectResources(resources, { query = '', category = '', topic = '', sort = 'added' } = {}) {
  const tokens = normalize(query).split(' ').filter(Boolean);
  const matching = resources.filter(item => (!category || item.type === category)
    && (!topic || item.topics.includes(topic))
    && tokens.every(token => normalize([item.title, item.description, item.type, ...item.tags, ...item.topics].join(' ')).includes(token)));
  return matching.sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title, 'ko', { numeric: true });
    const field = sort === 'updated' ? 'updatedAt' : 'addedAt';
    return (b[field] || b.addedAt).localeCompare(a[field] || a.addedAt) || a.id.localeCompare(b.id);
  });
}
