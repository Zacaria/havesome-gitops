import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { createServer } from 'node:net';
const socket = createServer(); await new Promise(r => socket.listen(0, '127.0.0.1', r));
const port = socket.address().port; await new Promise(r => socket.close(r));
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', 'dist'], {stdio:'ignore'});
let browser;
try {
  browser = await chromium.launch({executablePath: process.env.CHROMIUM || '/usr/bin/chromium', headless: true, chromiumSandbox: true});
  for (const width of [1280, 390]) for (const reducedMotion of ['reduce', 'no-preference']) {
    const page = await browser.newPage({viewport:{width,height:844},reducedMotion});
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    for (let i=0;i<30;i++) { try { await page.goto(`http://127.0.0.1:${port}/#labo`); break; } catch(e) { if(i===29) throw e; await page.waitForTimeout(100); } }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
    await page.locator('#play').focus(); await page.keyboard.press('Enter');
    if (reducedMotion === 'no-preference') {
      await page.waitForTimeout(80);
      await page.evaluate(() => document.querySelector('#pause').click());
      const visual = () => page.locator('.pr').evaluate(e=>[getComputedStyle(e).transform,getComputedStyle(e).opacity]);
      await page.waitForTimeout(80);
      const atPause = await visual(); await page.waitForTimeout(400);
      assert.deepEqual(await visual(), atPause, 'immediate pause freezes the active animation');
      await page.evaluate(() => document.querySelector('#pause').click());
      await page.waitForTimeout(200);
      assert.notDeepEqual(await visual(), atPause, 'resume continues the active animation');
      await page.evaluate(() => document.querySelector('#reset').click());
      assert.equal(await page.locator('[data-workflow] [style]').evaluateAll(es=>es.filter(e=>e.style.length).length), 0, 'reset restores scene styles');
      await page.locator('#play').click();
    }
    const scene = page.locator('[data-workflow]');
    assert.equal(await page.locator('#desired').textContent(), '3', 'proposal is not yet accepted');
    assert.equal(await page.locator('[data-sync]').textContent(), 'PROPOSITION EN REVUE');
    assert.equal(await page.locator('.slot-4.is-proposed').count(), 1, 'the proposal is drawn as a pending outline');
    assert.equal(await page.locator('[data-act="1"]').getAttribute('aria-current'), 'step');
    const plan = page.locator('.pr');
    const first = await plan.evaluate(e=>getComputedStyle(e).transform); await page.waitForTimeout(250);
    const second = await plan.evaluate(e=>getComputedStyle(e).transform);
    if (reducedMotion === 'reduce') assert.equal(first, second, 'reduced motion stays still');
    else assert.notEqual(first, second, 'Motion animates the plan');
    await page.locator('#pause').click();
    await page.waitForTimeout(80);
    const frozen = await plan.evaluate(e=>[getComputedStyle(e).transform,getComputedStyle(e).opacity]);
    await page.waitForTimeout(400);
    assert.deepEqual(await plan.evaluate(e=>[getComputedStyle(e).transform,getComputedStyle(e).opacity]), frozen, 'pause freezes the active animation');
    await page.waitForTimeout(3300);
    assert.equal(await scene.getAttribute('data-phase'), 'change', 'pause preserves phase');
    await page.locator('#pause').click();
    for (const phase of ['change','validation','converge','drift','repair','rollback','done']) {
      await page.waitForFunction(p=>document.querySelector('[data-workflow]').dataset.phase===p,phase,{timeout:15000});
      if (phase === 'drift') { assert.equal(await page.locator('#desired').textContent(),'4'); assert.equal(await page.locator('#actual').textContent(),'2'); assert.equal(await page.locator('.slot.is-missing').count(), 2, 'drift shows two missing towers'); assert.equal(await page.locator('[data-ctrl-verdict]').textContent(), '≠'); }
      if (phase === 'done') { assert.equal(await page.locator('#desired').textContent(),'3'); assert.equal(await page.locator('#actual').textContent(),'3'); }
    }
    await page.locator('[data-act="4"]').focus(); await page.keyboard.press('Enter');
    assert.equal(await scene.getAttribute('data-phase'), 'drift', 'acts are reachable by keyboard');
    assert.equal(await page.locator('[data-act="4"]').getAttribute('aria-current'), 'step');
    await page.locator('[data-act="1"]').click(); await page.waitForTimeout(3000);
    assert.equal(await page.locator('.slot-4 .ghost').evaluate(e=>getComputedStyle(e).opacity), '1', 'jumping back to the proposal keeps its outline visible');
    await page.locator('[data-act="7"]').click(); await page.locator('[data-act="5"]').click(); await page.waitForTimeout(1500);
    assert.equal(await page.locator('.slot-4 .ghost').evaluate(e=>getComputedStyle(e).opacity), '1', 'jumping from r3 to the repair act shows the fourth requested outline');
    await page.locator('#reset').click();
    await page.waitForTimeout(1800); assert.equal(await scene.getAttribute('data-phase'),'idle');
    assert.deepEqual(errors, [], 'no JavaScript errors');
    await page.locator('#labo').scrollIntoViewIfNeeded();
    if (reducedMotion === 'no-preference') await page.screenshot({path: process.env.TMPDIR + `/gitops-story-${width}.png`});
    await page.close();
  }
  const interrupted = await browser.newPage({reducedMotion:'no-preference'});
  await interrupted.goto(`http://127.0.0.1:${port}/#labo`);
  const styles = () => interrupted.locator('[data-workflow] [style]').evaluateAll(es=>es.filter(e=>e.style.length).map(e=>e.className));
  const clean = [];
  await interrupted.locator('#play').click(); await interrupted.waitForTimeout(80);
  await interrupted.evaluate(()=>document.querySelector('#reset').click());
  assert.deepEqual(await styles(), clean, 'immediate reset restores the plan');
  await interrupted.locator('#play').click();
  await interrupted.waitForFunction(()=>document.querySelector('[data-workflow]').dataset.phase==='converge');
  await interrupted.waitForTimeout(80);
  assert.ok(await interrupted.locator('.tower, .packet, .beam').evaluateAll(es=>es.some(e=>e.getAnimations().some(a=>a.playState==='running'))), 'packet, beam or towers animate during convergence');
  await interrupted.evaluate(()=>document.querySelector('#pause').click());
  await interrupted.waitForTimeout(80);
  const cityVisual = () => interrupted.locator('.packet, .beam, .ring').evaluateAll(es=>es.map(e=>[getComputedStyle(e).transform,getComputedStyle(e).opacity]));
  const cityPaused = await cityVisual(); await interrupted.waitForTimeout(250);
  assert.deepEqual(await cityVisual(), cityPaused, 'pause freezes packets, beam and loop');
  await interrupted.evaluate(()=>document.querySelector('#pause').click());
  await interrupted.waitForTimeout(120);
  assert.notDeepEqual(await cityVisual(), cityPaused, 'packets, beam and loop resume');
  await interrupted.emulateMedia({reducedMotion:'reduce'});
  await interrupted.waitForTimeout(80);
  assert.deepEqual(await styles(), clean, 'enabling reduced motion restores scene styles');
  await interrupted.emulateMedia({reducedMotion:'no-preference'});
  await interrupted.evaluate(()=>document.querySelector('#reset').click());
  await interrupted.locator('#play').click();
  await interrupted.waitForFunction(()=>document.querySelector('[data-workflow]').dataset.phase==='converge');
  await interrupted.waitForTimeout(80);
  await interrupted.evaluate(()=>document.querySelector('#reset').click());
  assert.deepEqual(await styles(), clean, 'reset during convergence restores scene styles');
  await interrupted.waitForTimeout(1500);
  assert.deepEqual(await styles(), clean, 'interrupted animations do not return');
  // Pausing after the act's animations have finished must keep the reached state.
  await interrupted.locator('[data-act="3"]').click(); await interrupted.waitForTimeout(3600);
  const settled = () => interrupted.evaluate(()=>[document.querySelector('.slot-4 .tower'), document.querySelector('.pr')].map(e=>getComputedStyle(e).opacity));
  assert.deepEqual(await settled(), ['1', '0'], 'convergence reaches four towers without the PR card');
  await interrupted.evaluate(()=>document.querySelector('#pause').click()); await interrupted.waitForTimeout(100);
  assert.deepEqual(await settled(), ['1', '0'], 'pausing after finished animations keeps the reached state');
  await interrupted.evaluate(()=>document.querySelector('#pause').click()); await interrupted.waitForTimeout(100);
  assert.deepEqual(await settled(), ['1', '0'], 'resuming does not replay finished animations');
  await interrupted.close();
  const nojs = await browser.newPage({javaScriptEnabled:false}); await nojs.goto(`http://127.0.0.1:${port}/`);
  assert.match(await nojs.locator('noscript').textContent(), /Activez JavaScript/); await nojs.close();
  console.log('PASS desktop/mobile, keyboard, ordered scenario, interruption, reduced motion and no JS');
} finally { if(browser) await browser.close(); server.kill(); }
