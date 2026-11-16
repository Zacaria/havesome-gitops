import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { createServer } from 'node:net';
const socket = createServer(); await new Promise(r => socket.listen(0, '127.0.0.1', r));
const port = socket.address().port; await new Promise(r => socket.close(r));
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', 'dist'], {stdio:'ignore'});
let browser;
try {
  browser = await chromium.launch({executablePath: process.env.CHROMIUM || '/usr/bin/chromium', headless: true});
  for (const width of [1280, 390]) for (const reducedMotion of ['reduce', 'no-preference']) {
    const page = await browser.newPage({viewport:{width,height:844},reducedMotion});
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    for (let i=0;i<30;i++) { try { await page.goto(`http://127.0.0.1:${port}/#labo`); break; } catch(e) { if(i===29) throw e; await page.waitForTimeout(100); } }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
    await page.locator('#play').focus(); await page.keyboard.press('Enter');
    const scene = page.locator('[data-workflow]');
    assert.equal(await page.locator('#desired').textContent(), '3', 'proposal is not yet accepted');
    assert.equal(await page.locator('[data-plan-number]').textContent(), '4');
    const plan = page.locator('.plan-sheet');
    const first = await plan.evaluate(e=>getComputedStyle(e).transform); await page.waitForTimeout(250);
    const second = await plan.evaluate(e=>getComputedStyle(e).transform);
    if (reducedMotion === 'reduce') assert.equal(first, second, 'reduced motion stays still');
    else assert.notEqual(first, second, 'Motion animates the plan');
    await page.locator('#pause').click(); await page.waitForTimeout(3700);
    assert.equal(await scene.getAttribute('data-phase'), 'change', 'pause preserves phase');
    await page.locator('#pause').click();
    for (const phase of ['change','validation','converge','drift','repair','rollback','done']) {
      await page.waitForFunction(p=>document.querySelector('[data-workflow]').dataset.phase===p,phase,{timeout:15000});
      if (phase === 'drift') { assert.equal(await page.locator('#desired').textContent(),'4'); assert.equal(await page.locator('#actual').textContent(),'2'); }
      if (phase === 'done') { assert.equal(await page.locator('#desired').textContent(),'3'); assert.equal(await page.locator('#actual').textContent(),'3'); }
    }
    await page.locator('#play').click(); await page.locator('#reset').click();
    await page.waitForTimeout(1800); assert.equal(await scene.getAttribute('data-phase'),'idle');
    assert.deepEqual(errors, [], 'no JavaScript errors');
    await page.locator('#labo').scrollIntoViewIfNeeded();
    if (reducedMotion === 'no-preference') await page.screenshot({path: process.env.TMPDIR + `/gitops-story-${width}.png`});
    await page.close();
  }
  const nojs = await browser.newPage({javaScriptEnabled:false}); await nojs.goto(`http://127.0.0.1:${port}/`);
  assert.match(await nojs.locator('noscript').textContent(), /Activez JavaScript/); await nojs.close();
  console.log('PASS desktop/mobile, keyboard, ordered scenario, interruption, reduced motion and no JS');
} finally { if(browser) await browser.close(); server.kill(); }
