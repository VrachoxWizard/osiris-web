import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/usluge/', '/projekti/', '/o-nama/', '/kontakt/', '/web-stranice-za-poduzeca/', '/privatnost/', '/missing-page/'];
const widths = [320,375,430,639,640,641,768,959,960,961,1024,1199,1200,1201,1280,1440,1920];
for (const route of routes) {
  test(`responsive layout and accessibility: ${route}`, async ({page}, info) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response.status()).toBe(route.includes('missing') ? 404 : 200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    expect(await page.locator('body').innerText()).not.toMatch(/[-–—]/);
    for (const width of widths) {
      await page.setViewportSize({width,height:width<640?812:900});
      const overflow = await page.evaluate(() => [...document.querySelectorAll('main *, header *, footer *')].filter(el => el.clientWidth>0 && el.scrollWidth>el.clientWidth+2 && !el.closest('.sr-only,.field--hidden') && getComputedStyle(el).overflowX !== 'auto').map(el => `${el.tagName}.${el.className}: ${el.scrollWidth}/${el.clientWidth}`));
      expect(overflow, `${route} at ${width}px`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    for (const width of [375,1440]) {
      await page.setViewportSize({width,height:width===375?812:900});
      // Trigger native lazy loading before capturing the entire page.
      await page.evaluate(async () => { for (const image of document.images) { image.loading='eager'; } await Promise.all([...document.images].map(img => img.decode().catch(()=>{}))); });
      await page.screenshot({path:info.outputPath(`page-${width}.png`),fullPage:true});
      const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(result.violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('short-screen mobile menu, focus loop, Escape and resize', async ({page}) => {
  await page.setViewportSize({width:667,height:375});
  await page.goto('/');
  const summary=page.locator('.menu-toggle');
  await summary.click();
  await expect(page.locator('main')).toHaveAttribute('inert','');
  const last=page.locator('.mobile-nav-footer a');
  await last.focus();
  await expect(last).toBeInViewport();
  await page.keyboard.press('Tab');
  await expect(summary).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(summary).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await summary.click();
  await page.setViewportSize({width:1280,height:720});
  await expect(page.locator('[data-mobile-disclosure]')).not.toHaveAttribute('open','');
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
});

test('skip link and attribution retain native fragment navigation', async ({page,browserName}) => {
  await page.goto('/?utm_source=email&utm_medium=outreach&utm_campaign=test&utm_content=one');
  // WebKit's default platform preference excludes links from plain Tab navigation.
  if (browserName === 'webkit') await page.locator('.skip-link').focus();
  else await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('main')).toBeFocused();
  const href=await page.locator('.header-cta').getAttribute('href');
  expect(href).toContain('/kontakt/?');
  expect(href).toContain('utm_source=email');
  await page.goto(href);
  await expect(page.locator('[name=utm_campaign]')).toHaveValue('test');
  await expect(page.locator('.header-cta')).toHaveAttribute('href', /\/kontakt\/\?.*#analiza$/);
  await page.goto('/web-stranice-za-poduzeca/?utm_source=email');
  await expect(page.locator('.header-cta')).toHaveAttribute('href', /\/web-stranice-za-poduzeca\/\?.*#analiza$/);
});

test('mobile viewport uses device width', async ({browser,browserName}) => {
  test.skip(browserName === 'firefox', 'Firefox does not support mobile emulation.');
  const context=await browser.newContext({isMobile:true,hasTouch:true,viewport:{width:375,height:812}});
  const page=await context.newPage();
  for(const route of routes){
    await page.goto('http://127.0.0.1:4174'+route);
    expect(await page.evaluate(()=>innerWidth)).toBe(375);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(375);
  }
  await context.close();
});

for (const route of ['/kontakt/','/web-stranice-za-poduzeca/']) {
  test(`form validation and mocked delivery states: ${route}`, async ({page}) => {
    let behavior='success', calls=0, payload='';
    await page.route('https://formspree.io/**', async intercepted => {
      calls++; payload=intercepted.request().postData() || '';
      if (behavior==='offline') return intercepted.abort('internetdisconnected');
      return intercepted.fulfill({status:behavior==='success'?200:behavior==='rate'?429:500,contentType:'application/json',body:behavior==='success'?'{"ok":true}':'{}'});
    });
    await page.goto(route);
    const submit=page.locator('[data-contact-form] button');
    await submit.click();
    await expect(page.locator('[name=name]')).toBeFocused();
    await expect(page.locator('[aria-invalid=true]')).toHaveCount(4);
    expect(calls).toBe(0);
    await page.locator('[name=name]').fill('Test enquiry');
    await page.locator('[name=email]').fill('invalid');
    await page.locator('[name=websiteStatus]').selectOption('no-website');
    await page.locator('[name=primaryGoal]').fill('Test only — never sent to the service.');
    await submit.click();
    await expect(page.locator('[name=email]')).toBeFocused();
    await page.locator('[name=email]').fill('test@example.com');
    await page.locator('[name=websiteUrl]').fill('javascript:alert(1)');
    await submit.click();
    await expect(page.locator('[name=websiteUrl]')).toHaveAttribute('aria-invalid','true');
    await page.locator('[name=websiteUrl]').fill('example.com');
    for (const state of ['offline','service','rate']) {
      behavior=state; await submit.click();
      await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state','error');
      await expect(page.locator('[name=name]')).toHaveValue('Test enquiry');
      await expect(page.locator('[data-form-fallback]')).toBeVisible();
      await expect(submit).toBeEnabled();
    }
    behavior='success'; await submit.click();
    await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state','success');
    expect(payload).toContain('https://example.com/');
    await expect(page.locator('[name=name]')).toHaveValue('');
    await expect(page.locator('[data-form-status]')).toBeFocused();
    await page.locator('.form-details summary').click();
    await expect(page.locator('[name=message]')).toBeVisible();
  });
}

test('request timeout restores the form and blocks duplicate submission', async ({page}) => {
  let calls=0;
  await page.route('https://formspree.io/**', async route => { calls++; await new Promise(resolve=>setTimeout(resolve,22000)); await route.abort().catch(()=>{}); });
  await page.goto('/kontakt/');
  await page.locator('[name=name]').fill('Test');
  await page.locator('[name=email]').fill('test@example.com');
  await page.locator('[name=websiteStatus]').selectOption('existing');
  await page.locator('[name=primaryGoal]').fill('A test that is never delivered.');
  await page.locator('[data-contact-form] button').click();
  await expect(page.locator('[data-contact-form] button')).toBeDisabled();
  await page.locator('[data-contact-form]').evaluate(form=>form.dispatchEvent(new Event('submit',{cancelable:true})));
  await expect(page.locator('[data-form-status]')).toContainText('Slanje traje predugo',{timeout:25000});
  expect(calls).toBe(1);
  await expect(page.locator('[data-contact-form] button')).toBeEnabled();
  await expect(page.locator('[name=name]')).toHaveValue('Test');
});

test('navigation and safe POST form without JavaScript', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4174/kontakt/');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.mobile-nav a').first()).toBeVisible();
  await page.locator('.menu-toggle').click();
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('method','post');
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('action','https://formspree.io/f/xeaqovbe');
  await expect(page.locator('[data-contact-form]')).not.toHaveAttribute('novalidate','');
  await page.locator('[data-contact-form] button').click();
  await expect(page).toHaveURL('http://127.0.0.1:4174/kontakt/');
  await expect(page.locator('[name=name]')).toBeFocused();
  await context.close();
});

async function mockChat(page, reply='Mi smo OSIRIS iz Zagreba. Javite se putem obrasca za besplatnu analizu.') {
  await page.route('**/api/chat', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply})}));
}

test('chat sheet fits the mobile viewport and traps focus', async ({page}) => {
  await mockChat(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const panel = page.locator('[data-chat-panel]');
  await expect(panel).toBeHidden();
  await page.locator('[data-chat-launcher]').click();
  await expect(panel).toHaveAttribute('aria-modal','true');
  await expect(page.locator('[data-chat-scrim]')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('inert','');
  // The composer and the analysis link must stay inside the panel at every small viewport.
  for (const [width,height] of [[320,568],[390,844],[667,375]]) {
    await page.setViewportSize({width,height});
    expect(await panel.evaluate(el => el.scrollHeight <= el.clientHeight), `panel clipped at ${width}x${height}`).toBe(true);
    await expect(page.locator('.osiris-chat__cta')).toBeInViewport();
  }
  await page.setViewportSize({width:390,height:844});
  // Title stays on one line rather than breaking after OSIRIS.
  expect(await page.locator('.osiris-chat__title').evaluate(el => el.getClientRects().length)).toBe(1);
  // Tab from the last control wraps to the first enabled one, skipping the disabled reset button.
  await page.locator('.osiris-chat__cta').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-chat-close]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-chat-launcher]')).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
});

test('chat conversation survives navigation and resets on request', async ({page}) => {
  await mockChat(page);
  await page.goto('/');
  await page.locator('[data-chat-launcher]').click();
  await expect(page.locator('[data-chat-reset]')).toBeDisabled();
  await page.locator('[data-chat-suggestion]').first().click();
  await expect(page.locator('.osiris-chat__bubble--assistant')).toHaveCount(1);
  await expect(page.locator('[data-chat-suggestions]')).toBeHidden();
  await page.goto('/usluge/');
  await expect(page.locator('[data-chat-panel]')).toBeVisible();
  await expect(page.locator('.osiris-chat__bubble--user')).toHaveCount(1);
  await expect(page.locator('.osiris-chat__bubble--assistant')).toHaveCount(1);
  await page.locator('[data-chat-reset]').click();
  await expect(page.locator('.osiris-chat__bubble')).toHaveCount(0);
  await expect(page.locator('[data-chat-suggestions]')).toBeVisible();
  await expect(page.locator('[data-chat-reset]')).toBeDisabled();
  await page.goto('/');
  await expect(page.locator('[data-chat-panel]')).toBeHidden();
});

test('chat surfaces a retry after a failed request', async ({page}) => {
  let fail = true;
  await page.route('**/api/chat', route => fail
    ? route.fulfill({status:502,contentType:'application/json',body:'{}'})
    : route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'Mi smo OSIRIS.'})}));
  await page.goto('/');
  await page.locator('[data-chat-launcher]').click();
  await page.locator('[data-chat-input]').fill('Trebamo redizajn.');
  await page.locator('[data-chat-send]').click();
  const retry = page.locator('[data-chat-status] button');
  await expect(retry).toBeVisible();
  await expect(page.locator('[data-chat-status]')).toHaveClass(/is-error/);
  await expect(page.locator('.osiris-chat__bubble--user')).toHaveCount(1);
  fail = false;
  await retry.click();
  await expect(page.locator('.osiris-chat__bubble--assistant')).toHaveCount(1);
  await expect(page.locator('.osiris-chat__bubble--user')).toHaveCount(1);
  await expect(retry).toHaveCount(0);
});

test('reduced motion, dark preference, text enlargement and hero CTA', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
  await page.setViewportSize({width:1280,height:720});
  await page.goto('/');
  await expect(page.locator('.home-hero__actions .button')).toBeInViewport();
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.goto('/kontakt/');
  expect(await page.locator('input[name=name]').evaluate(el=>getComputedStyle(el).colorScheme)).toBe('light');
  await page.addStyleTag({content:'html {font-size:200%}'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.setViewportSize({width:320,height:568});
  await page.addStyleTag({content:'html {font-size:100%}'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
