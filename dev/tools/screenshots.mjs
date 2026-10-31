#!/usr/bin/env node
// Capturas para o pedido de instalação do navegador (manifest → screenshots): 412×915 a 2x = 824×1830 (narrow).
// Telas do próprio app, num aparelho simulado e com progresso de demonstração criado só neste perfil temporário.
// Uso (depois de tools/build-app.mjs): node tools/screenshots.mjs
import { chromium } from 'playwright';
import { mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { serve } from '../tests/e2e/serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');
const OUT = join(APP, 'screenshots');
mkdirSync(OUT, { recursive: true });
const PORT = 8796;
const server = await serve(APP, PORT);
const profile = mkdtempSync(join(tmpdir(), 'drg-shots-'));
const ctx = await chromium.launchPersistentContext(profile, { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' });
const page = ctx.pages()[0] || await ctx.newPage();
const go = async (hash) => { await page.goto(`http://localhost:${PORT}/${hash}`); await page.waitForTimeout(900); };
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) }); // só a área visível (proporção do celular)

await go('#/');
await page.evaluate(async () => { const A = window.DRG_APP; A.state.settings.characterChosen = true; A.state.welcomed = true; await A.setJourney('cp'); });
await go('#/module/CP01');
await shot('modulo');
await page.evaluate(async () => { await window.DRG_APP.setJourney(null); });
await go('#/words/R02?kind=vocab');
await shot('palavras');
// ouvir e entender: demonstração com as etapas anteriores do CP01 concluídas neste perfil temporário
await page.evaluate(async () => {
  const A = window.DRG_APP; await A.setJourney('cp');
  const st = A.state, t = A.today(), r = A.content.routines[0];
  for (const i of r.items) st.cards[`item:${i}:rec`] = { k: `item:${i}:rec`, box: 1, due: t + 1, reps: 1, lapses: 0, streak: 1, last: t, lastResult: 'good', created: t };
  await A.flush();
});
await go('#/session?routine=CP01&stage=listen');
await shot('ouvir');
await ctx.close();
server.close();
rmSync(profile, { recursive: true, force: true });
console.log('capturas em app/screenshots/');
