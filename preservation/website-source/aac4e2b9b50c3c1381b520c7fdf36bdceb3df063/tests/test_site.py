import unittest
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = set(); self.fragments = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('href', '').startswith('#'): self.fragments.append(attrs['href'][1:])

class SiteTest(unittest.TestCase):
    def test_navigation_points_to_existing_sections(self):
        page = Page()
        path = ROOT / 'index.html'
        self.assertTrue(path.exists(), 'le guide doit exister')
        page.feed(path.read_text())
        self.assertGreaterEqual(len(page.fragments), 6)
        self.assertFalse(set(page.fragments) - page.ids)

if __name__ == '__main__': unittest.main()
