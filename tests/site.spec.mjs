import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/usluge/', '/projekti/', '/o-nama/', '/kontakt/', '/web-stranice-za-poduzeca/', '/privatnost/', '/missing-page/'];
const viewports = [
  [320, 812], [375, 812], [414, 896], [768, 900], [960, 900],
  [1280, 800], [1440, 900], [1920, 1080], [320, 568], [667, 375],
];

async function visualErrors(page) {
  return page.evaluate(() => {
    const rootWidth = document.documentElement.scrollWidth;
    const overflow = [...document.querySelectorAll('main *, header *, footer *, aside *')]
      .filter((element) => (
        element.clientWidth > 0
        && element.scrollWidth > element.clientWidth + 2
        && !element.closest('.sr-only,.field--hidden,.chat-suggestions')
        && getComputedStyle(element).overflowX !== 'auto'
      ))
      .map((element) => `${element.tagName}.${element.className}: ${element.scrollWidth}/${element.clientWidth}`);

    const affordances = [...new Set(document.querySelectorAll('button, summary, nav a, .action, .type-link, .type-action, .skip-link'))];
    const wrapped = affordances
      .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
      .filter((element) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const tops = [];
        let node = walker.nextNode();
        while (node) {
          if (node.textContent.trim() && !node.parentElement.closest('.sr-only')) {
            const range = document.createRange();
            range.selectNodeContents(node);
            tops.push(...[...range.getClientRects()].filter((rect) => rect.width > 1).map((rect) => Math.round(rect.top)));
          }
          node = walker.nextNode();
        }
        if (getComputedStyle(element).whiteSpace === 'nowrap') return false;
        if (tops.length < 2) return false;
        return Math.max(...tops) - Math.min(...tops) > Number.parseFloat(getComputedStyle(element).lineHeight) * 0.6;
      })
      .map((element) => `${element.tagName}.${element.className}: ${element.textContent.trim()}`);

    const smallTargets = innerWidth <= 768
      ? [...document.querySelectorAll('a, button, summary')]
        .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        })
        .map((element) => `${element.tagName}.${element.className}: ${Math.round(element.getBoundingClientRect().width)}×${Math.round(element.getBoundingClientRect().height)}`)
      : [];

    return { rootWidth, overflow, wrapped, smallTargets };
  });
}

async function assertChatDoesNotCollide(page, route, width, height) {
  // Rub na kojem tab stoji je dio dizajna: max() s nulom bez jedinice ga je znao odbaciti ulijevo.
  // Tab stoji tik izvan stupca sadržaja, nikad u lijevom žlijebu.
  const edge = await page.evaluate(() => {
    const tab = document.querySelector('.chat-edge-tab');
    if (!tab || !tab.getClientRects().length) return null;
    const shell = document.querySelector('.page-shell');
    return {
      tabRight: tab.getBoundingClientRect().right,
      shellRight: shell ? shell.getBoundingClientRect().right : 0,
      viewport: innerWidth,
    };
  });
  if (edge) {
    // Tolerancija od 1px: preglednici zaokružuju subpiksele različito.
    const where = `${route} at ${width}×${height}`;
    expect(edge.tabRight, `${where}: chat tab mora stajati desno od stupca sadržaja`)
      .toBeGreaterThanOrEqual(edge.shellRight - 1);
    expect(edge.tabRight, `${where}: chat tab ne smije izaći iz viewporta`)
      .toBeLessThanOrEqual(edge.viewport + 1);
  }

  const collisions = await page.evaluate(() => {
    const tab = document.querySelector('.chat-edge-tab');
    if (!tab || !tab.getClientRects().length) return [];
    const tabRect = tab.getBoundingClientRect();
    return [...document.querySelectorAll('main a, main button, main input, main select, main textarea, footer a, footer button')]
      .filter((element) => element.getClientRects().length && !element.closest('[data-chat-dialog]'))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return tabRect.left < rect.right && tabRect.right > rect.left && tabRect.top < rect.bottom && tabRect.bottom > rect.top;
      })
      .map((element) => `${element.tagName}.${element.className}`);
  });
  expect(collisions, `${route} chat collision at ${width}×${height}`).toEqual([]);
}

for (const route of routes) {
  test(`responsive layout and accessibility: ${route}`, async ({ page }, info) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    const response = await page.goto(route);
    expect(response.status()).toBe(route.includes('missing') ? 404 : 200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    expect(await page.locator('body').innerText()).not.toMatch(/--|\.\.\./);
    await expect(page.locator('.eyebrow,[data-reveal],.frame__dots')).toHaveCount(0);
    await expect(page.locator('dialog[data-chat-dialog]')).toHaveCount(1);

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      const result = await visualErrors(page);
      expect(result.rootWidth, `${route} root width at ${width}×${height}`).toBeLessThanOrEqual(width);
      expect(result.overflow, `${route} overflow at ${width}×${height}`).toEqual([]);
      expect(result.wrapped, `${route} wrapped click labels at ${width}×${height}`).toEqual([]);
      expect(result.smallTargets, `${route} small targets at ${width}×${height}`).toEqual([]);
      for (const scrollY of [0, Math.max(0, (await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)) / 2), await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight))]) {
        await page.evaluate((value) => scrollTo(0, value), scrollY);
        await assertChatDoesNotCollide(page, route, width, height);
      }
    }

    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.evaluate(async () => {
        for (const image of document.images) image.loading = 'eager';
        await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
      });
      await page.screenshot({ path: info.outputPath(`page-${width}.png`), fullPage: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(axe.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([]);
    }
    expect(runtimeErrors).toEqual([]);
  });
}

test('masthead menu handles short screens, focus loop, Escape and resize', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');
  const summary = page.locator('.menu-toggle');
  await summary.click();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  const last = page.locator('.mast-menu__actions [data-chat-open]');
  await last.focus();
  await expect(last).toBeInViewport();
  await page.keyboard.press('Tab');
  await expect(summary).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(summary).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await summary.click();
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('[data-mobile-disclosure]')).not.toHaveAttribute('open', '');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});

test('homepage service map, active navigation and primary action follow the blueprint', async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator('.hero-map');
  await expect(hero.locator('.hero-map__nodes li')).toHaveCount(4);
  await expect(hero.locator('.hero-map__result .action')).toHaveCount(1);
  expect(await page.locator('.hero-map h1').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(68);
  expect(await hero.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(800);
  await expect(page.locator('.home-intro .action')).toHaveCount(1);
  expect(await page.locator('.mast-nav__link[aria-current="page"]').textContent()).toBe('Početna');
  await hero.screenshot({ path: info.outputPath('service-map-1280x800.png') });
});

test('skip link and attribution retain native fragment navigation', async ({ page, browserName }) => {
  await page.goto('/?utm_source=email&utm_medium=outreach&utm_campaign=test&utm_content=one');
  if (browserName === 'webkit') await page.locator('.skip-link').focus();
  else await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('main')).toBeFocused();
  const href = await page.locator('.masthead-action').getAttribute('href');
  expect(href).toContain('/kontakt/?');
  expect(href).toContain('utm_source=email');
  await page.goto(href);
  await expect(page.locator('[name=utm_campaign]')).toHaveValue('test');
  await expect(page.locator('.masthead-action')).toHaveAttribute('href', /\/kontakt\/\?.*#analiza$/);
  await page.goto('/web-stranice-za-poduzeca/?utm_source=email');
  await expect(page.locator('.masthead-action')).toHaveAttribute('href', /\/web-stranice-za-poduzeca\/\?.*#analiza$/);
});

test('mobile viewport uses device width', async ({ browser, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox does not support mobile emulation.');
  const context = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:4174${route}`);
    expect(await page.evaluate(() => innerWidth)).toBe(375);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    await expect(page.locator('.chat-edge-tab')).toBeHidden();
  }
  await context.close();
});

for (const route of ['/kontakt/', '/web-stranice-za-poduzeca/']) {
  test(`form touched validation and delivery states: ${route}`, async ({ page }) => {
    let behavior = 'success';
    let calls = 0;
    let payload = '';
    await page.route('https://formspree.io/**', async (intercepted) => {
      calls += 1;
      payload = intercepted.request().postData() || '';
      if (behavior === 'offline') return intercepted.abort('internetdisconnected');
      return intercepted.fulfill({ status: behavior === 'success' ? 200 : behavior === 'rate' ? 429 : 500, contentType: 'application/json', body: behavior === 'success' ? '{"ok":true}' : '{}' });
    });
    await page.goto(route);
    const submit = page.locator('[data-contact-form] button[type=submit]');
    const email = page.locator('[name=email]');
    await email.focus();
    await email.blur();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await email.fill('invalid');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await submit.click();
    await expect(page.locator('[name=name]')).toBeFocused();
    await expect(page.locator('[aria-invalid=true]')).toHaveCount(4);
    expect(calls).toBe(0);
    await page.locator('[name=name]').fill('Test enquiry');
    await email.fill('test@example.com');
    await page.locator('[name=websiteStatus]').selectOption('no-website');
    await page.locator('[name=primaryGoal]').fill('Test only — never sent to the service.');
    await page.locator('[name=websiteUrl]').fill('javascript:alert(1)');
    await submit.click();
    await expect(page.locator('[name=websiteUrl]')).toHaveAttribute('aria-invalid', 'true');
    await page.locator('[name=websiteUrl]').fill('example.com');
    for (const state of ['offline', 'service', 'rate']) {
      behavior = state;
      await submit.click();
      await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'error');
      await expect(page.locator('[name=name]')).toHaveValue('Test enquiry');
      await expect(page.locator('[data-form-fallback]')).toBeVisible();
      await expect(submit).toBeEnabled();
    }
    behavior = 'success';
    await submit.click();
    await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'success');
    expect(payload).toContain('https://example.com/');
    await expect(page.locator('[name=name]')).toHaveValue('');
    await expect(page.locator('[data-form-status]')).toBeFocused();
    await page.locator('.form-details summary').click();
    await expect(page.locator('[name=message]')).toBeVisible();
  });
}

test('request timeout restores the form and blocks duplicate submission', async ({ page }) => {
  let calls = 0;
  await page.route('https://formspree.io/**', async (route) => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 22000));
    await route.abort().catch(() => {});
  });
  await page.goto('/kontakt/');
  await page.locator('[name=name]').fill('Test');
  await page.locator('[name=email]').fill('test@example.com');
  await page.locator('[name=websiteStatus]').selectOption('existing');
  await page.locator('[name=primaryGoal]').fill('A test that is never delivered.');
  await page.locator('[data-contact-form] button[type=submit]').click();
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-contact-form] button[type=submit]')).toBeDisabled();
  await page.locator('[data-contact-form]').evaluate((form) => form.dispatchEvent(new Event('submit', { cancelable: true })));
  await expect(page.locator('[data-form-status]')).toContainText('Slanje traje predugo', { timeout: 25000 });
  expect(calls).toBe(1);
  await expect(page.locator('[data-contact-form] button[type=submit]')).toBeEnabled();
  await expect(page.locator('[name=name]')).toHaveValue('Test');
});

test('navigation and safe POST form work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/kontakt/');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.mast-menu__link').first()).toBeVisible();
  await page.locator('.menu-toggle').click();
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('method', 'post');
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('action', 'https://formspree.io/f/xeaqovbe');
  await expect(page.locator('[data-contact-form]')).not.toHaveAttribute('novalidate', '');
  await page.locator('[data-contact-form] button[type=submit]').click();
  await expect(page).toHaveURL('http://127.0.0.1:4174/kontakt/');
  await expect(page.locator('[name=name]')).toBeFocused();
  await context.close();
});

async function mockChat(page, reply = 'Mi smo OSIRIS iz Zagreba. Javite se putem obrasca za besplatnu analizu.') {
  await page.route('**/api/chat', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply }) }));
}

test('native chat dialog fits mobile, traps focus and returns it', async ({ page }) => {
  await mockChat(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const dialog = page.locator('[data-chat-dialog]');
  await page.locator('.menu-toggle').click();
  const trigger = page.locator('.mast-menu [data-chat-open]');
  await trigger.click();
  await expect(dialog).toHaveAttribute('open', '');
  await expect(page.locator('[data-site-header]')).toHaveAttribute('inert', '');
  for (const [width, height] of [[320, 568], [390, 844], [667, 375]]) {
    await page.setViewportSize({ width, height });
    expect(await dialog.evaluate((element) => element.scrollHeight <= element.clientHeight), `dialog clipped at ${width}×${height}`).toBe(true);
    await expect(page.locator('.chat-dialog__foot .type-link')).toBeInViewport();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('#osiris-chat-title').evaluate((element) => element.getClientRects().length)).toBe(1);
  await page.locator('.chat-dialog__foot .type-link').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-chat-close]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(page.locator('.menu-toggle')).toBeFocused();
  await expect(page.locator('[data-site-header]')).not.toHaveAttribute('inert', '');
});

test('chat conversation survives navigation and resets on request', async ({ page }) => {
  await mockChat(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.locator('.chat-edge-tab').click();
  await expect(page.locator('[data-chat-reset]')).toBeDisabled();
  await page.locator('[data-chat-suggestion]').first().click();
  await expect(page.locator('.osiris-chat__bubble--assistant')).toHaveCount(1);
  await expect(page.locator('[data-chat-suggestions]')).toBeHidden();
  await page.goto('/usluge/');
  await expect(page.locator('[data-chat-dialog]')).toHaveAttribute('open', '');
  await expect(page.locator('.osiris-chat__bubble--user')).toHaveCount(1);
  await expect(page.locator('.osiris-chat__bubble--assistant')).toHaveCount(1);
  await page.locator('[data-chat-reset]').click();
  await expect(page.locator('.osiris-chat__bubble')).toHaveCount(0);
  await expect(page.locator('[data-chat-suggestions]')).toBeVisible();
  await expect(page.locator('[data-chat-reset]')).toBeDisabled();
  await page.goto('/');
  await expect(page.locator('[data-chat-dialog]')).not.toHaveAttribute('open', '');
});

test('chat exposes loading, failure, retry and success states', async ({ page }) => {
  let fail = true;
  await page.route('**/api/chat', (route) => fail
    ? route.fulfill({ status: 502, contentType: 'application/json', body: '{}' })
    : route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Mi smo OSIRIS.' }) }));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.locator('.chat-edge-tab').click();
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

test('reduced motion, controlled surface and text enlargement stay stable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');

  // Ploha je odabrana, ne naslijeđena: cijeli Night Workshop ostaje taman,
  // bez obzira na to što sustav traži.
  for (const scheme of ['dark', 'light']) {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: scheme });
    await page.goto('/kontakt/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('dark');
    await page.goto('/projekti/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('dark');
    expect(await page.locator('.page--projects').evaluate((element) => getComputedStyle(element).colorScheme)).toBe('dark');
  }
  await page.goto('/kontakt/');
  await page.addStyleTag({ content: 'html {font-size:200%}' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addStyleTag({ content: 'html {font-size:100%}' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
