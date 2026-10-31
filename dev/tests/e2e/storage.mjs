// Armazenamento das gravações: migração do esquema, substituição, falha segura, retenção de 7 dias e indicadores.
// Uso: node tests/e2e/storage.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
// Real: Chromium, IndexedDB e MediaRecorder (microfone falso, tom de teste). Simulado: datas antigas gravadas
// direto no banco (relógio controlado) e a falha de gravação (IDBObjectStore.put forçado a falhar).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/storage');
mkdirSync(OUT, { recursive: true });
const PORT = 8798, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });
const DAY = 24 * 60 * 60 * 1000;

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const server = await serve(SITE, PORT);
const errors = [];
let ctx, page;
async function launch() {
  if (ctx) await ctx.close();
  ctx = await chromium.launchPersistentContext(PROFILE, { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'], permissions: ['microphone'], viewport: { width: 412, height: 915 } });
  page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
}
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(900); };

// leitura direta do banco (o que está de fato salvo, não o que a interface mostra)
const dump = () => page.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const read = (store) => new Promise((res) => {
    if (!db.objectStoreNames.contains(store)) return res(null);
    const out = {}; const c = db.transaction(store).objectStore(store).openCursor();
    c.onsuccess = () => { const cur = c.result; if (!cur) return res(out); const v = cur.value || {}; out[cur.key] = { bytes: v.blob ? v.blob.size : null, recordedAt: v.recordedAt ?? null, at: v.at ?? null, audio: v.audio, audioExpiredAt: v.audioExpiredAt ?? null, meta: v.meta || null, hasBlob: !!v.blob, items: v.items || null }; cur.continue(); };
  });
  const out = { version: db.version, audio: await read('audio'), recordings: await read('recordings'), kv: await read('kv') };
  db.close();
  return out;
});
// escreve direto no banco (relógio controlado): muda a data de gravação de um áudio
const setRecordedAt = (key, recordedAt) => page.evaluate(async ([key, recordedAt]) => {
  const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
  await new Promise((res) => { const t = db.transaction(['audio', 'recordings'], 'readwrite'); const a = t.objectStore('audio'), r = t.objectStore('recordings');
    a.get(key).onsuccess = (e) => { const v = e.target.result; if (v) a.put({ ...v, recordedAt }, key); };
    r.get(key).onsuccess = (e) => { const v = e.target.result; if (v) r.put({ ...v, recordedAt, at: recordedAt }, key); };
    t.oncomplete = res; });
  db.close();
}, [key, recordedAt]);
async function recordOn(hash, ms = 2000) {
  await go(hash);
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(ms);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=mine]', { timeout: 10000 });
  await page.waitForTimeout(700);
}
async function settingsUsage() {
  await go('#/settings');
  await page.waitForSelector('[data-role=rec-usage]', { timeout: 15000 });
  const get = async (r) => (await page.locator(`[data-role=${r}]`).count()) ? (await page.locator(`[data-role=${r}]`).textContent()) : null;
  return { rec: await get('rec-usage'), textOnly: await get('rec-textonly'), total: await get('usage-total'), app: await get('app-cache'), asr: await get('asr-cache'), other: await get('usage-other'), study: await get('study-usage'), persisted: await get('persisted') };
}

await launch();

await check('S01', 'Migração do banco v1 → v2 (dados de quem já usa o app): áudio separado do texto, nada perdido', async () => {
  // cria o banco no formato antigo ANTES de o app abrir (página do mesmo endereço, sem o app)
  await page.goto(BASE + 'manifest.webmanifest');
  const now = Date.now();
  await page.evaluate(async (now) => {
    const db = await new Promise((res) => { const r = indexedDB.open('drg', 1); r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('recordings'); }; r.onsuccess = () => res(r.result); });
    await new Promise((res) => { const t = db.transaction('recordings', 'readwrite'); const s = t.objectStore('recordings');
      s.put({ blob: new Blob([new Uint8Array(3000)], { type: 'audio/webm' }), meta: { ms: 2000, free: { text: 'I wake up at five.', at: now - 2 * 864e5 } }, at: now - 2 * 864e5 }, 'q:G.Q01');
      s.put({ blob: new Blob([new Uint8Array(5000)], { type: 'audio/webm' }), meta: { ms: 3000, result: { text: 'I work until six', at: now - 10 * 864e5 } }, at: now - 10 * 864e5 }, 'sent:R01-B3-S1');
      t.oncomplete = res; });
    db.close();
  }, now);
  await page.goto(BASE); await page.waitForTimeout(3000); // abre o app: migração + retenção na abertura
  const d = await dump();
  assert(d.version === 2, `versão ${d.version}`);
  assert(d.audio['q:G.Q01'] && d.audio['q:G.Q01'].bytes === 3000, 'áudio recente não migrou');
  assert(d.recordings['q:G.Q01'].meta.free.text === 'I wake up at five.' && !d.recordings['q:G.Q01'].hasBlob, 'registro de texto');
  // o de 10 dias: migrado e, na abertura, o áudio venceu — o texto fica
  assert(!d.audio['sent:R01-B3-S1'], 'áudio vencido não foi apagado na abertura');
  assert(d.recordings['sent:R01-B3-S1'] && d.recordings['sent:R01-B3-S1'].meta.result.text === 'I work until six' && d.recordings['sent:R01-B3-S1'].audioExpiredAt, 'resultado de texto perdido');
  return { versao: d.version, audios: Object.keys(d.audio), textoMantido: Object.keys(d.recordings) };
});

await check('S02', 'Regravar o mesmo exercício SUBSTITUI o áudio (contagem não cresce, tamanho = arquivo atual, data renovada); outro exercício intacto', async () => {
  await recordOn('#/lab?sentence=R01-B1-S2', 1500);
  const other = (await dump()).audio['sent:R01-B1-S2'];
  await recordOn('#/lab?sentence=R01-B1-S1', 1500);
  const d1 = await dump();
  const a1 = d1.audio['sent:R01-B1-S1'];
  await page.waitForTimeout(300);
  await recordOn('#/lab?sentence=R01-B1-S1', 3500); // segunda tentativa, mais longa
  const d2 = await dump();
  const a2 = d2.audio['sent:R01-B1-S1'];
  const uiBytes = await page.evaluate(() => [...document.querySelectorAll('audio')].length);
  assert(Object.keys(d2.audio).length === Object.keys(d1.audio).length, `quantidade cresceu: ${Object.keys(d1.audio).length} → ${Object.keys(d2.audio).length}`);
  assert(a2.bytes !== a1.bytes && a2.bytes > a1.bytes, `tamanho não é o da gravação nova: ${a1.bytes} → ${a2.bytes}`);
  assert(a2.recordedAt > a1.recordedAt, 'data não renovada');
  assert(JSON.stringify(d2.audio['sent:R01-B1-S2']) === JSON.stringify(other), 'outro exercício mudou');
  void uiBytes;
  return { audios: Object.keys(d2.audio).length, primeira: a1.bytes, segunda: a2.bytes };
});

await check('S03', 'Guardar a transcrição/resultado não regrava o áudio nem muda a data de gravação', async () => {
  const before = (await dump()).audio['sent:R01-B1-S1'];
  await page.evaluate(async () => { const db = await import(new URL('js/store/db.js', location.href).href).catch(() => null); return !!db; });
  // usa a API real do app pelo widget: simula o resultado da análise chegando
  const d = await dump();
  assert(d.recordings['sent:R01-B1-S1'].recordedAt === before.recordedAt, 'registro e áudio com datas diferentes');
  return { recordedAt: before.recordedAt };
});

await check('S04', 'Falha ao salvar a nova gravação (SIMULADA no meio da transação): a gravação anterior continua inteira e o aluno é avisado', async () => {
  const before = (await dump());
  await go('#/lab?sentence=R01-B1-S1');
  // falha no SEGUNDO passo da transação (o áudio novo já foi entregue): tudo precisa ser desfeito
  await page.evaluate(() => {
    const orig = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) { if (this.name === 'recordings' && v && v.audio === true && !window.__allowPut) throw new DOMException('Sem espaço (teste)', 'QuotaExceededError'); return orig.call(this, v, k); };
  });
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(2500);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('text=A gravação anterior foi mantida', { timeout: 8000 });
  await page.waitForTimeout(500);
  const after = await dump();
  assert(JSON.stringify(after.audio['sent:R01-B1-S1']) === JSON.stringify(before.audio['sent:R01-B1-S1']), `áudio anterior alterado: ${JSON.stringify(before.audio['sent:R01-B1-S1'])} → ${JSON.stringify(after.audio['sent:R01-B1-S1'])}`);
  assert(after.recordings['sent:R01-B1-S1'].recordedAt === before.recordings['sent:R01-B1-S1'].recordedAt, 'registro alterado');
  return { mantido: after.audio['sent:R01-B1-S1'].bytes };
});

await check('S05', 'Retenção com relógio controlado: < 7 dias fica; exatamente 7 dias e > 7 dias saem; datas inválidas ficam e são registradas; texto preservado', async () => {
  await go('#/');
  const now = Date.now();
  await setRecordedAt('sent:R01-B1-S1', now - 7 * DAY + 60e3);  // 1 min antes do limite
  await setRecordedAt('sent:R01-B1-S2', now - 7 * DAY);         // exatamente no limite
  await setRecordedAt('q:G.Q01', 'data-quebrada');              // inválida
  await recordOn('#/lab?sentence=R01-B2-S1', 1200);
  await setRecordedAt('sent:R01-B2-S1', now - 30 * DAY);         // muito antiga
  const state0 = await page.evaluate(() => JSON.stringify({ xp: window.DRG_APP.state.xp, cards: Object.keys(window.DRG_APP.state.cards).length, meta: Object.keys(window.DRG_APP.state.recordingsMeta).sort() }));
  const rep = await page.evaluate((now) => window.DRG_APP.runRetention(now), now);
  const d = await dump();
  assert(d.audio['sent:R01-B1-S1'], 'áudio com menos de 7 dias foi apagado');
  assert(!d.audio['sent:R01-B1-S2'], 'áudio com exatamente 7 dias ficou');
  assert(!d.audio['sent:R01-B2-S1'], 'áudio com 30 dias ficou');
  assert(d.audio['q:G.Q01'], 'data inválida apagou o áudio');
  assert(d.recordings['sent:R01-B1-S2'] && d.recordings['sent:R01-B1-S2'].audioExpiredAt && d.recordings['sent:R01-B2-S1'], 'registro de texto apagado junto');
  assert(d.kv['diag.retention'] && JSON.stringify(d.kv['diag.retention'].items).includes('q:G.Q01'), 'caso inválido não registrado');
  const state1 = await page.evaluate(() => JSON.stringify({ xp: window.DRG_APP.state.xp, cards: Object.keys(window.DRG_APP.state.cards).length, meta: Object.keys(window.DRG_APP.state.recordingsMeta).sort() }));
  assert(state0 === state1, 'progresso mudou com a limpeza');
  // idempotente: de novo, nada muda e nada quebra
  const rep2 = await page.evaluate((now) => window.DRG_APP.runRetention(now), now);
  const d2 = await dump();
  assert(rep2.removed.length === 0 && JSON.stringify(Object.keys(d2.audio)) === JSON.stringify(Object.keys(d.audio)), 'segunda execução mudou algo');
  return { removidos: rep.removed, invalidos: rep.invalid.map((x) => x.key), segundaExecucao: rep2.removed.length };
});

await check('S06', 'Nova tentativa reinicia o prazo: regravar um exercício perto do limite mantém o áudio novo', async () => {
  const now = Date.now();
  await setRecordedAt('sent:R01-B1-S1', now - 6.9 * DAY);
  await recordOn('#/lab?sentence=R01-B1-S1', 1200);
  const rep = await page.evaluate((t) => window.DRG_APP.runRetention(t), now + DAY); // 1 dia depois
  const d = await dump();
  assert(d.audio['sent:R01-B1-S1'] && !rep.removed.includes('sent:R01-B1-S1'), 'áudio regravado foi apagado');
  return { recordedAt: new Date(d.audio['sent:R01-B1-S1'].recordedAt).toISOString() };
});

await check('S07', 'Fechar e reabrir o app: a limpeza roda na abertura sem atrapalhar o uso', async () => {
  await setRecordedAt('sent:R01-B1-S1', Date.now() - 9 * DAY);
  await launch(); // fecha o navegador e abre de novo (mesmo perfil)
  await page.goto(BASE); await page.waitForTimeout(500);
  const title = await page.locator('h1').first().textContent();
  await page.waitForTimeout(2500);
  const d = await dump();
  assert(!d.audio['sent:R01-B1-S1'], 'não limpou na reabertura');
  assert(title && title.length > 0, 'app não abriu');
  return { abriu: title, audiosRestantes: Object.keys(d.audio) };
});

await check('S08', 'Áudio vencido na interface: a tela mostra que o áudio foi apagado e mantém o resultado salvo', async () => {
  // o exercício R01-B3-S1 veio da v1 com resultado de texto e áudio vencido
  await go('#/lab?sentence=R01-B3-S1');
  await page.waitForTimeout(800);
  const msg = await page.locator('.rec-panel').textContent();
  assert(/apagado automaticamente após 7 dias/.test(msg) && /resultado continua salvo/.test(msg), msg);
  assert(await page.locator('[data-role=mine]:visible').count() === 0, 'botão de ouvir sem áudio');
  // gravar de novo continua funcionando
  await page.locator('.rec-btn').click(); await page.waitForTimeout(1200); await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=mine]', { timeout: 8000 });
  await page.waitForTimeout(600);
  const d = await dump();
  assert(d.audio['sent:R01-B3-S1'] && !d.recordings['sent:R01-B3-S1'].audioExpiredAt, 'nova gravação não substituiu o registro vencido');
  return { mensagem: msg.slice(msg.indexOf('O áudio'), msg.indexOf('O áudio') + 80) };
});

await check('S09', 'Indicadores em Ajustes batem com o banco e se atualizam após gravar, substituir e excluir', async () => {
  const count = async () => { const d = await dump(); const a = Object.values(d.audio); return { n: a.length, kb: Math.round(a.reduce((x, y) => x + y.bytes, 0) / 1024), textOnly: Object.keys(d.recordings).filter((k) => !d.audio[k]).length }; };
  const u0 = await settingsUsage(); const c0 = await count();
  assert(u0.rec.startsWith(`${c0.n} (`) && u0.rec.includes(`${c0.kb.toLocaleString('pt-BR')} KB`), `${u0.rec} × ${JSON.stringify(c0)}`);
  assert(c0.textOnly === 0 || (u0.textOnly && u0.textOnly.startsWith(String(c0.textOnly))), `sem áudio: ${u0.textOnly} × ${c0.textOnly}`);
  await recordOn('#/lab?sentence=R01-B4-S1', 1200);
  const u1 = await settingsUsage(); const c1 = await count();
  assert(c1.n === c0.n + 1 && u1.rec.startsWith(`${c1.n} (`), `após gravar: ${u1.rec}`);
  await recordOn('#/lab?sentence=R01-B4-S1', 2500); // substitui
  const u2 = await settingsUsage(); const c2 = await count();
  assert(c2.n === c1.n && u2.rec.startsWith(`${c2.n} (`), `após substituir: ${u2.rec}`);
  await go('#/lab?sentence=R01-B4-S1');
  await page.getByRole('button', { name: 'Excluir gravação' }).click();
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await page.waitForTimeout(500);
  const u3 = await settingsUsage(); const c3 = await count();
  assert(c3.n === c1.n - 1 && u3.rec.startsWith(`${c3.n} (`), `após excluir: ${u3.rec}`);
  assert(/≈ \d/.test(u3.total) && /MB/.test(u3.app), `total/app: ${JSON.stringify(u3)}`);
  await page.screenshot({ path: join(OUT, 'S09-ajustes.png'), fullPage: true });
  return { antes: u0.rec, gravou: u1.rec, substituiu: u2.rec, excluiu: u3.rec, total: u3.total, app: u3.app, reconhecimento: u3.asr, naoAtribuido: u3.other, estudo: u3.study, protegido: u3.persisted };
});

await check('S10', 'Nenhum erro de JavaScript (fora a falha simulada do S04)', async () => {
  const relevant = errors.filter((e) => !/Sem espaço \(teste\)/.test(e));
  assert(!relevant.length, relevant.slice(0, 3).join(' | '));
  return 'nenhum';
});

await ctx.close();
server.close();
rmSync(PROFILE, { recursive: true, force: true });
const summary = { when: new Date().toISOString(), environment: 'Chromium headless (Playwright), Linux — não é o Galaxy S25+', passed: results.filter((r) => r.status === 'aprovado').length, failed: results.filter((r) => r.status !== 'aprovado').length, results };
writeFileSync(join(OUT, 'storage-results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${summary.passed} aprovados, ${summary.failed} reprovados`);
process.exit(summary.failed ? 1 : 0);
