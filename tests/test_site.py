import copy
from html.parser import HTMLParser
import json
from pathlib import Path
import unittest

from build import link, render

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.ids = []
        self.links = []
        self.assets = []
        self.h1 = 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs['href'])
        if tag == 'link':
            self.assets.append(attrs['href'])
        if tag == 'script' and 'src' in attrs:
            self.assets.append(attrs['src'])
        if tag == 'h1':
            self.h1 += 1


class SiteTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT / 'content/site.json').read_text(encoding='utf-8'))

    def test_generated_page_matches_source(self):
        self.assertEqual(render(self.data), (ROOT / 'index.html').read_text(encoding='utf-8'))

    def test_navigation_assets_and_resource_targets(self):
        page = Document(render(self.data))
        self.assertEqual(page.h1, 1)
        self.assertEqual(len(page.ids), len(set(page.ids)))
        for href in page.links:
            if href.startswith('#'):
                self.assertIn(href[1:], page.ids)
        for asset in page.assets:
            self.assertTrue((ROOT / asset).is_file())
        for item in self.data['resources']:
            self.assertIn(item['url'], page.links)
        self.assertIn('https://kobong8.github.io/introduction-to-opencode/', page.links)

    def test_content_is_escaped_and_bad_links_rejected(self):
        data = copy.deepcopy(self.data)
        data['about']['title'] = '<script>alert("x")</script>'
        html = render(data)
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
        for url in ['javascript:alert(1)', '//example.com', 'http://example.com', 'https://user:password@example.com']:
            with self.assertRaises(ValueError):
                link(url)

    def test_invalid_content_fails_before_publication(self):
        data = copy.deepcopy(self.data)
        data['resources'][1]['id'] = data['resources'][0]['id']
        with self.assertRaises(ValueError):
            render(data)

    def test_library_expands_without_template_edits(self):
        data = copy.deepcopy(self.data)
        item = copy.deepcopy(data['resources'][0])
        item.update(id='new-course', title='새로운 강의', type='새 분류', topics=['새 주제'])
        data['resources'].append(item)
        html = render(data)
        self.assertIn('data-category="새 분류"', html)
        self.assertIn('<option value="새 주제">새 주제</option>', html)
        self.assertIn('title-new-course', html)
        self.assertIn('전체 4개 자료', html)
        self.assertNotIn('강의 정리', html)
        self.assertIn('data-category="발표 정리"', html)

    def test_library_dates_and_topics_are_validated(self):
        for field, invalid in [('addedAt', 'not-a-date'), ('updatedAt', '2026-99-99'), ('topics', [])]:
            data = copy.deepcopy(self.data)
            data['resources'][0][field] = invalid
            with self.subTest(field=field), self.assertRaises(ValueError):
                render(data)
        data = copy.deepcopy(self.data)
        data['updates'][0]['date'] = '2026-13-45'
        with self.assertRaises(ValueError):
            render(data)


if __name__ == '__main__':
    unittest.main()
