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
    def test_lab_distinguishes_spec_drift_from_ready_pods(self):
        content = (ROOT / 'index.html').read_text()
        self.assertIn('spec.replicas', content)
        self.assertIn('pas le nombre de pods prêts', content)
        self.assertNotIn('Deux réplicas observés.', content)

    def test_tool_logos_are_local_accessible_and_present(self):
        class Images(HTMLParser):
            def __init__(self):
                super().__init__(); self.images = []
            def handle_starttag(self, tag, attrs):
                if tag == 'img': self.images.append(dict(attrs))
        page = Images()
        page.feed((ROOT / 'index.html').read_text())
        for name in ('argo', 'flux', 'kubernetes', 'helm'):
            with self.subTest(name=name):
                image = next((img for img in page.images if img.get('src') == f'assets/{name}.svg'), None)
                self.assertIsNotNone(image, f'{name} logo missing')
                if image is None:
                    continue
                self.assertTrue(image.get('alt'), f'{name} logo needs an accessible name')
                self.assertTrue((ROOT / image['src']).is_file())

    def test_reference_is_linked_at_both_ends_and_readable_without_js(self):
        content = (ROOT / 'index.html').read_text()
        header = content.split('</header>')[0]
        footer = content.split('<footer>')[1]
        for area in (header, footer):
            self.assertIn('href="fiche.html"', area)
            self.assertIn('href="https://github.com/Zacaria/havesome-gitops"', area)
        reference = ROOT / 'fiche.html'
        self.assertTrue(reference.exists(), 'la fiche doit être accessible')
        text = reference.read_text()
        self.assertIn('kubectl config current-context', text)
        self.assertIn('argocd app get', text)
        self.assertIn('flux get kustomizations', text)
        self.assertIn('https://opengitops.dev/', text)

    def test_built_reference_includes_illustration(self):
        page = (ROOT / 'dist' / 'fiche.html').read_text()
        self.assertIn('assets/gitops-visual.png', page)
        self.assertTrue((ROOT / 'dist' / 'assets/gitops-visual.png').is_file())
        self.assertTrue((ROOT / 'dist' / 'fiche.css').is_file())

    def test_navigation_points_to_existing_sections(self):
        page = Page()
        path = ROOT / 'index.html'
        self.assertTrue(path.exists(), 'le guide doit exister')
        page.feed(path.read_text())
        self.assertGreaterEqual(len(page.fragments), 6)
        self.assertFalse(set(page.fragments) - page.ids)

if __name__ == '__main__': unittest.main()
