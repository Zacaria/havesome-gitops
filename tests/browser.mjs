import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { createServer } from 'node:net';

const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', 'dist'], { stdio: 'ignore' });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
try {
  await new Promise(resolve => setTimeout(resolve, 500));
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:${port}/#labo`);
    assert.match(await page.title(), /HaveSome GitOps/);
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.chapters [aria-current="location"]').getAttribute('href'), '#labo', 'initial fragment is current');
    const position = await page.locator('.chapters').evaluate(el => getComputedStyle(el).position);
    assert.equal(position, 'sticky', 'navigation stays accessible');
    for (const id of ['modele', 'boucle', 'labo', 'depot', 'livrer', 'securite', 'outils', 'exploiter']) {
      await page.locator(`#${id}`).evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.chapters [aria-current="location"]').getAttribute('href'), `#${id}`, `current chapter ${id}`);
      const visible = await page.locator('.chapters [aria-current="location"]').evaluate(el => {
        const link = el.getBoundingClientRect();
        const nav = el.parentElement.getBoundingClientRect();
        return link.left >= nav.left - 1 && link.right <= nav.right + 1;
      });
      assert.ok(visible, `current chapter ${id} remains visible in navigation`);
    }
    await page.locator('#sources').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.chapters [aria-current="location"]').count(), 0, 'sources is not a chapter');
    const blocks = page.locator('[data-slot="code-block"]');
    assert.equal(await blocks.count(), 2, 'both static examples use the official CodeBlock');
    assert.equal(await blocks.first().locator('[data-slot="code-block-content"]').getAttribute('tabindex'), '0');
    assert.equal(await blocks.nth(1).locator('[data-slot="code-block-content"] span').count() > 0, true, 'YAML coloring remains');
    const inline = await blocks.nth(1).locator('[data-slot="code-block-code"]').evaluate(code => {
      const token = [...code.querySelectorAll('span')].find(el => el.textContent === 'apiVersion:');
      const next = token.nextSibling;
      const range = document.createRange();
      range.setStart(next, 0); range.setEnd(next, 1);
      return { token: token.getBoundingClientRect().top, value: range.getBoundingClientRect().top };
    });
    assert.ok(Math.abs(inline.token - inline.value) < 2, 'YAML keys and values remain on the same line');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    for (const block of await blocks.all()) {
      const text = await block.locator('code').textContent();
      await block.locator('button').click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), text, 'copy retains exact example');
      assert.equal(await block.locator('button').getAttribute('aria-label'), 'Copié');
    }
    await page.locator('#drift').click();
    assert.equal(await page.locator('#actual').textContent(), '2', 'lab drift still works');
    await page.locator('#reconcile').click();
    assert.equal(await page.locator('#actual').textContent(), '3', 'lab reconciliation still works');
    await page.locator('.chapters a[href="#boucle"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    assert.equal(new URL(page.url()).hash, '#boucle', 'keyboard follows anchor');
    assert.equal(await page.locator('.chapters [aria-current="location"]').getAttribute('href'), '#boucle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    for (const direction of [1, -1]) {
      if (direction < 0) await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      for (let i = 0; i < 30; i++) {
        await page.mouse.wheel(0, direction * 430);
        await page.waitForTimeout(35);
        const state = await page.evaluate(() => {
          const nav = document.querySelector('.chapters');
          const line = nav.getBoundingClientRect().height + 48;
          const links = [...nav.querySelectorAll('a')];
          const expected = links.filter(a => document.querySelector(a.hash).getBoundingClientRect().top <= line).at(-1);
          return { expected: document.querySelector('#sources').getBoundingClientRect().top <= line ? null : expected?.hash || null, actual: nav.querySelector('[aria-current]')?.hash || null };
        });
        assert.equal(state.actual, state.expected, 'wheel progress matches reading line');
      }
    }
    await page.goto(`http://127.0.0.1:${port}/fiche.html`);
    assert.equal(await page.locator('.sheet-illustration img').evaluate(img => img.naturalWidth), 1752, 'illustration loads');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'reference does not overflow viewport');
    for (const card of await page.locator('.commands article').all()) {
      const rect = await card.boundingBox();
      assert.ok(rect.x >= 0 && rect.x + rect.width <= viewport.width + 1, 'command card fits viewport');
    }
    await page.close();
    for (const id of ['modele', 'boucle', 'labo', 'depot', 'livrer', 'securite', 'outils', 'exploiter']) {
      const anchored = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      await anchored.goto(`http://127.0.0.1:${port}/#${id}`);
      await anchored.evaluate(() => document.fonts.ready);
      await anchored.waitForTimeout(350);
      assert.equal(await anchored.locator('.chapters [aria-current="location"]').getAttribute('href'), `#${id}`, `direct fragment ${id}`);
      await anchored.close();
    }
  }
  console.log('browser navigation: PASS');
} finally {
  await browser.close();
  server.kill();
}
