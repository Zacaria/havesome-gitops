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
    assert.equal(await page.locator('[data-workflow] [data-node]').count(), 3, 'Git, controller, cluster');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
    await page.locator('#drift').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#actual').textContent(), '2');
    await page.locator('#reconcile').click();
    assert.equal(await page.locator('[data-workflow]').getAttribute('data-phase'), 'read');
    const packet=page.locator('.workflow-packet').first();
    const first=await packet.evaluate(e=>getComputedStyle(e).transform); await page.waitForTimeout(350);
    const second=await packet.evaluate(e=>getComputedStyle(e).transform);
    if(reducedMotion==='reduce') assert.equal(first,second,'reduced motion'); else assert.notEqual(first,second,'Motion packet moves');
    for (const phase of ['compare','apply','done']) await page.waitForFunction(p=>document.querySelector('[data-workflow]').dataset.phase===p,phase);
    assert.equal(await page.locator('#actual').textContent(), '3');
    await page.locator('#drift').click(); await page.locator('#reconcile').click(); await page.locator('#reset').click();
    await page.waitForTimeout(3500); assert.equal(await page.locator('[data-workflow]').getAttribute('data-phase'),'aligned');
    assert.equal(await page.locator('#actual').textContent(),'3');
    assert.deepEqual(errors, [], 'no JavaScript errors');
    if (width === 390 && reducedMotion === 'no-preference') await page.screenshot({path: process.env.TMPDIR + '/gitops-motion-mobile.png'});
    await page.close();
  }
  const nojs = await browser.newPage({javaScriptEnabled:false});
  await nojs.goto(`http://127.0.0.1:${port}/`);
  assert.equal(await nojs.locator('#modele h2').count(), 1, 'guide remains readable without JavaScript');
  assert.match(await nojs.locator('noscript').textContent(), /Activez JavaScript/);
  await nojs.close();
  console.log('PASS desktop/mobile, keyboard, phases, interrupt, motion and reduced motion');
} finally { if(browser) await browser.close(); server.kill(); }
