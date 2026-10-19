"""Render the static hub from editable content using Python's standard library."""
import argparse
from datetime import date
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent


def text(value):
    return escape(str(value), quote=True)


def link(value):
    if value in {'#library', '#updates', '#about', '#main'}:
        return value
    url = urlparse(value)
    if url.scheme != 'https' or not url.netloc or url.username or url.password:
        raise ValueError(f'Expected an HTTPS link: {value}')
    return text(value)


def render(data):
    cards = []
    seen = set()
    for item in data['resources']:
        if not re.fullmatch(r'[a-z0-9-]+', item['id']) or item['id'] in seen:
            raise ValueError('Resource IDs must be unique slugs')
        seen.add(item['id'])
        if item['theme'] not in {'blue', 'teal', 'violet'}:
            raise ValueError('Unknown resource theme')
        tags = ''.join(f'<li>{text(tag)}</li>' for tag in item['tags'])
        date.fromisoformat(item['addedAt'])
        if item.get('updatedAt'):
            date.fromisoformat(item['updatedAt'])
        if not item.get('topics') or not all(isinstance(topic, str) and topic.strip() for topic in item['topics']):
            raise ValueError('At least one topic is required')
        metadata = {key: item.get(key) for key in ['id', 'type', 'title', 'description', 'tags', 'topics', 'addedAt', 'updatedAt']}
        shown_date = item.get('updatedAt') or item['addedAt']
        date_label = '업데이트' if item.get('updatedAt') else '등록'
        cards.append(f'''<article class="resource {item['theme']}" data-resource="{text(json.dumps(metadata, ensure_ascii=False))}" aria-labelledby="title-{item['id']}">
          <div class="card-top"><span>{text(item['type'])}</span><span class="resource-number">{text(' / '.join(item['topics']))}</span></div>
          <h3 id="title-{item['id']}">{text(item['title'])}</h3>
          <p class="card-description">{text(item['description'])}</p><ul class="tags" aria-label="주제">{tags}</ul>
          <p class="resource-date">{date_label} <time datetime="{text(shown_date)}">{text(shown_date.replace('-', '.'))}</time></p>
          <div class="card-bottom"><a class="card-action" href="{link(item['url'])}" aria-label="{text(item['title'])} {text(item['action'])}">{text(item['action'])}<span aria-hidden="true">↗</span></a>
          </div></article>''')
    updates = []
    for item in sorted(data['updates'], key=lambda row: row['date'], reverse=True):
        date.fromisoformat(item['date'])
        updates.append(f'''<li><div class="update-meta"><time datetime="{text(item['date'])}">{text(item['date'].replace('-', '.'))}</time><span>{text(item['label'])}</span></div><a href="{link(item['url'])}"><h3>{text(item['title'])}</h3><span aria-hidden="true">↗</span></a><p>{text(item['text'])}</p></li>''')
    categories = list(dict.fromkeys(item['type'] for item in data['resources']))
    topics = sorted({topic for item in data['resources'] for topic in item['topics']})
    category_buttons = ''.join(f'<button type="button" data-category="{text(category)}" aria-pressed="false">{text(category)} <span>{sum(item["type"] == category for item in data["resources"])}</span></button>' for category in categories)
    topic_options = ''.join(f'<option value="{text(topic)}">{text(topic)}</option>' for topic in topics)
    values = {
        'resource_count': str(len(cards)), 'category_buttons': category_buttons, 'topic_options': topic_options,
        'description': text(data['description']), 'github': link(data['github']),
        'hero_eyebrow': text(data['hero']['eyebrow']),
        'hero_title': '<br>'.join(text(line) for line in data['hero']['title']),
        'hero_text': text(data['hero']['text']), 'resources': '\n'.join(cards),
        'updates': '\n'.join(updates), 'tool_title': text(data['tool']['title']),
        'tool_text': text(data['tool']['text']), 'tool_url': link(data['tool']['url']),
        'about_title': text(data['about']['title']),
        'about_paragraphs': ''.join(f'<p>{text(p)}</p>' for p in data['about']['paragraphs']),
        'interests': ''.join(f'<li>{text(tag)}</li>' for tag in data['about']['interests']),
    }
    template = (ROOT / 'templates/index.html').read_text(encoding='utf-8')
    return re.sub(r'\{\{(\w+)\}\}', lambda match: values[match[1]], template)


def build(check=False):
    content = json.loads((ROOT / 'content/site.json').read_text(encoding='utf-8'))
    html = render(content)
    output = ROOT / 'index.html'
    if check:
        if not output.exists() or output.read_text(encoding='utf-8') != html:
            raise SystemExit('index.html is stale. Run: python build.py')
        print('Static page is current.')
    else:
        output.write_text(html, encoding='utf-8')
        print('Generated index.html')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
