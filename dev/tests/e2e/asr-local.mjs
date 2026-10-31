// Testes de ponta a ponta do reconhecimento de fala LOCAL (modelo Moonshine tiny no próprio navegador).
// Uso: node tests/e2e/asr-local.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
//   ex.: node tests/e2e/asr-local.mjs app /            ou   node tests/e2e/asr-local.mjs <site> /daily-routine-english/
//
// O que é REAL aqui: o modelo, o download, o cache offline, a gravação (MediaRecorder) e a transcrição no Chromium.
// O que é SIMULADO: a “voz” vem de arquivos WAV sintéticos (tests/fixtures, Kokoro) injetados como microfone falso;
// L03 simula queda de rede no download; L07 simula uma falha do worker. Nada disto valida o reconhecimento no Galaxy S25+ nem com sotaque brasileiro real.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/asr-local');
const FIX = join(ROOT, 'tests/fixtures');
mkdirSync(OUT, { recursive: true });
const PORT = 8797;
const ORIGIN = `http://localhost:${PORT}`;
const BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const results = [];
const record = (id, name, status, evidence) => { results.push({ id, name, status, evidence }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

let failAsr = false; // simula queda de rede só para os arquivos do modelo
const serverHits = []; // pedidos que chegaram de fato ao servidor (não atendidos pelo cache do aparelho)
const intercept = (req, res) => { if (req.url.includes('/asr/')) serverHits.push(req.url); if (failAsr && req.url.includes('/asr/tiny/')) { req.socket.destroy(); return true; } return false; };
let server = await serve(SITE, PORT, { intercept });
const external = [], asrRequests = [], pageErrors = [];
let ctx, page;

async function launch(micFile) {
  if (ctx) await ctx.close();
  ctx = await chromium.launchPersistentContext(PROFILE, {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${join(FIX, micFile)}%noloop`, '--autoplay-policy=no-user-gesture-required'],
    viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, permissions: ['microphone'],
  });
  // sonda de áudio: registra o que tocou (para verificar referências e “Ouvir minha resposta”)
  await ctx.addInitScript(`window.__plays = []; const __op = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__plays.push((this.currentSrc || this.src || '').replace(location.origin, '')); return __op.call(this); };`);
  page = ctx.pages()[0] || await ctx.newPage();
  ctx.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u);
    if (u.includes('/asr/')) asrRequests.push(u.replace(ORIGIN, ''));
  });
  page.on('pageerror', (e) => pageErrors.push(e.message));
}
// sempre recarrega (ir para a mesma URL com o mesmo hash não recarregaria a página)
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(800); };
const words = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.target-wrap .w')].map((s) => [s.textContent, s.dataset.state || 'none'])));
const fbState = () => page.evaluate(() => (document.querySelector('.fb') || {}).dataset?.state || null);
const heardText = () => page.locator('.fb-details').textContent().then((t) => (t.match(/Transcrição: “([^”]*)”/) || [])[1] ?? null).catch(() => null);
const chips = () => page.locator('.pchip').allTextContents().then((a) => a.map((x) => x.trim()));
async function recordFor(ms) {
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(ms);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=mine]', { timeout: 10000 });
}
// espera o fim da análise automática (sem nenhum clique além de parar a gravação)
const waitFinal = () => page.waitForFunction(() => ['result', 'inconclusive', 'error'].includes((document.querySelector('.fb') || {}).dataset?.state), null, { timeout: 90000 });
const S1 = '#/lab?sentence=R01-B1-S1';

// ---------- 1ª execução: microfone com a frase lida corretamente ----------
await launch('bm_george-R01-B1-S1.wav');

await check('L01', 'Primeira entrada em Falar: convite “Avalie sua pronúncia” com tamanho real; nada é baixado sem consentimento', async () => {
  await go('#/lab');
  await page.waitForTimeout(1500); // dá tempo ao service worker de instalar
  const home = await page.locator('[data-role=asr-setup]').textContent();
  await go(S1);
  const card = await page.locator('.fb [data-role=asr-setup]').textContent();
  const sizeMB = await page.evaluate(() => Math.round(window.DRG_APP.asr.local.totalBytes() / 1048576));
  assert(/Avalie sua pronúncia/.test(home) && new RegExp(`${sizeMB} MB`).test(card), card);
  assert(await page.getByRole('button', { name: 'Avaliar minha gravação' }).count() === 0, 'botão manual ainda existe');
  assert(asrRequests.length === 0, `baixou sem pedir: ${asrRequests.join(', ')}`);
  await page.screenshot({ path: join(OUT, 'L01-convite.png') });
  return { tamanho: `${sizeMB} MB`, requisicoesAoModelo: 0 };
});

await check('L02', '“Agora não”: gravar, ouvir a própria voz e A/B continuam; análise informada como indisponível; nenhuma nota inventada', async () => {
  await page.getByRole('button', { name: 'Agora não' }).click();
  await recordFor(2000);
  await page.waitForTimeout(800);
  const off = await page.locator('[data-role=asr-off]').textContent();
  await page.locator('[data-role=mine]').click();
  await page.waitForTimeout(300);
  const playing = await page.locator('[data-role=mine]').getAttribute('aria-pressed');
  await page.locator('[data-role=mine]').click();
  assert(/Análise automática desligada/.test(off) && playing === 'true', `${off} · tocando=${playing}`);
  assert(await page.locator('.score-num').count() === 0 && await page.locator('.pchip').count() === 0, 'nota ou lista sem reconhecimento');
  assert(await page.getByRole('button', { name: 'Comparar A/B' }).count() === 1, 'A/B indisponível');
  return { aviso: off.trim().slice(0, 60), minhaVoz: 'tocou' };
});

await check('L03', 'Download interrompido (rede cortada, simulada): mensagem clara e “Tentar de novo” conclui a instalação com progresso real', async () => {
  await page.getByRole('button', { name: 'Instalar' }).click();
  failAsr = true;
  await page.getByRole('button', { name: 'Baixar reconhecimento' }).click();
  await page.waitForSelector('.setup-error', { timeout: 30000 });
  const err = await page.locator('.setup-error').textContent();
  const st = await page.evaluate(() => window.DRG_APP.asr.local.status());
  failAsr = false;
  assert(st === 'not-installed' && /Não foi possível baixar agora/.test(err), `${st} · ${err}`);
  // registra cada valor da barra de progresso dentro da página (o download local leva ~1 s)
  await page.evaluate(() => {
    window.__prog = [];
    new MutationObserver((ms) => { for (const m of ms) if (m.attributeName === 'aria-valuenow') window.__prog.push(Number(m.target.getAttribute('aria-valuenow'))); })
      .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-valuenow'] });
  });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  // instalado: a gravação feita antes é analisada automaticamente
  await waitFinal();
  const progress = await page.evaluate(() => window.__prog);
  const v = await page.evaluate(() => window.DRG_APP.asr.local.verify());
  assert(v.ok, JSON.stringify(v));
  assert(new Set(progress).size >= 3 && Math.max(...progress) === 100, `progresso ${JSON.stringify(progress.slice(0, 8))}`);
  const steps = [...new Set(progress)];
  return { erro: err.slice(0, 40), progresso: `${steps.length} valores, ${steps[0]}% → ${steps.at(-1)}%`, estadoFinal: await fbState() };
});

await check('L04', 'Análise automática REAL ao parar a gravação (fala sintética correta): “Analisando…”, resultado sem clique extra, lista vazia', async () => {
  await go(S1);
  assert(await page.locator('[data-role=asr-setup]').count() === 0, 'convite reapareceu com o modelo instalado');
  const t0 = Date.now();
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(7200);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('.fb[data-state="analysing"]', { timeout: 5000 });
  await waitFinal();
  const ms = Date.now() - t0;
  const ws = await words();
  await page.screenshot({ path: join(OUT, 'L04-real-correta.png'), fullPage: true });
  assert(await fbState() === 'result', await fbState());
  assert(Object.values(ws).every((v) => v !== 'needs_practice'), `falso erro: ${JSON.stringify(ws)}`);
  assert(await page.locator('[data-role=practice-ok]').count() === 1, 'faltou o estado positivo de lista vazia');
  const score = await page.locator('.score-num').textContent();
  await page.locator('[data-role=mine]').click(); // a gravação continua tocável depois da análise
  await page.waitForTimeout(300);
  const playing = await page.locator('[data-role=mine]').getAttribute('aria-pressed');
  await page.locator('[data-role=mine]').click();
  assert(playing === 'true', 'a própria voz não tocou');
  return { ouvido: await heardText(), ms, nota: score };
});

await check('L09', 'Recursos: sair do Speaking Lab encerra o worker do modelo (memória liberada)', async () => {
  const before = page.workers().length;
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(600);
  const after = page.workers().length;
  assert(before >= 1 && after === 0, `workers antes=${before} depois=${after}`);
  return { workersAntes: before, workersDepois: after };
});

// ---------- 2ª execução: microfone com troca de palavra (“teeth” → “tits”) ----------
await launch('bm_george-R01-B1-S1-sub.wav');

await check('L05', 'Transcrição REAL com troca de palavra: “Vamos praticar” lista só “teeth”; tocar reproduz o áudio da palavra', async () => {
  await go(S1);
  await recordFor(6200);
  await waitFinal();
  const list = await chips();
  const ws = await words();
  assert(JSON.stringify(list) === '["teeth"]', `lista ${JSON.stringify(list)} · ouvido ${await heardText()}`);
  assert(Object.entries(ws).filter(([k, v]) => k !== 'teeth' && v === 'needs_practice').length === 0, JSON.stringify(ws));
  await page.locator('.pchip').first().click();
  await page.waitForTimeout(400);
  const panel = await page.locator('.practice-panel').textContent();
  assert(/o app ouviu “/.test(panel), panel);
  await page.screenshot({ path: join(OUT, 'L05-real-troca.png'), fullPage: true });
  return { lista: list, ouvido: await heardText(), resumo: await page.locator('.score-summary').textContent() };
});

await check('L12', 'Resultado guardado com a gravação: ao voltar à tela, a lista reaparece sem reanalisar (sem carregar o modelo)', async () => {
  await go('#/');
  await go(S1);
  await page.waitForSelector('.fb[data-state="result"]', { timeout: 10000 });
  const list = await chips();
  assert(JSON.stringify(list) === '["teeth"]', JSON.stringify(list));
  assert(page.workers().length === 0, 'reanalisou ao revisitar');
  return { lista: list, workers: 0 };
});

await check('L07', 'Falha do worker (SIMULADA): estado de erro recuperável, nenhuma nota; “Tentar de novo” analisa a mesma gravação', async () => {
  await go(S1);
  await page.evaluate(() => { window.__RealWorker = window.Worker; window.Worker = function () { throw new Error('worker bloqueado (teste)'); }; });
  await recordFor(6200);
  await waitFinal();
  const st = await fbState();
  const text = await page.locator('.fb').textContent();
  const states = [...new Set(Object.values(await words()))];
  assert(st === 'error' && /Nenhuma nota foi gerada/.test(text) && await page.locator('.score-num').count() === 0, `${st} · ${text.slice(0, 120)}`);
  assert(states.length === 1 && states[0] === 'none', `cores sem análise: ${JSON.stringify(states)}`);
  await page.evaluate(() => { window.Worker = window.__RealWorker; });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await waitFinal();
  assert(await fbState() === 'result' && JSON.stringify(await chips()) === '["teeth"]', `após tentar de novo: ${await fbState()}`);
  return { erro: text.slice(0, 60), recuperado: 'resultado após “Tentar de novo”' };
});

await check('L08', 'Offline: servidor desligado e rede cortada — o modelo em cache continua analisando', async () => {
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await go(S1);
  await recordFor(6200);
  await waitFinal();
  const list = await chips();
  await ctx.setOffline(false);
  server = await serve(SITE, PORT, { intercept });
  assert(JSON.stringify(list) === '["teeth"]', JSON.stringify(list));
  return { offline: true, lista: list };
});

// ---------- 3ª execução: microfone com a leitura correta (regravação) ----------
await launch('bm_george-R01-B1-S1.wav');

await check('L13', 'Regravar: a nova tentativa invalida a anterior e reconstrói a lista (“teeth” sai quando passa a ser reconhecida)', async () => {
  await go(S1);
  await page.waitForSelector('.fb[data-state="result"]', { timeout: 10000 }); // resultado salvo da tentativa anterior
  const before = await chips();
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(300);
  const during = { chips: await page.locator('.pchip').count(), colored: await page.locator('.w[data-state]').count() };
  await page.waitForTimeout(6900);
  await page.locator('.rec-btn').click();
  await waitFinal();
  const after = await chips();
  assert(JSON.stringify(before) === '["teeth"]' && during.chips === 0 && during.colored === 0, JSON.stringify({ before, during }));
  assert(after.length === 0 && await page.locator('[data-role=practice-ok]').count() === 1, `depois: ${JSON.stringify(after)} · ${await heardText()}`);
  return { antes: before, durante: during, depois: after };
});

await check('L11', 'Resultado atrasado não sobrescreve: nova gravação iniciada durante a análise cancela a anterior', async () => {
  await go(S1);
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(7200);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('.fb[data-state="analysing"]', { timeout: 5000 });
  await page.locator('.rec-btn').click(); // nova gravação durante a análise
  await page.waitForTimeout(2000);
  await page.locator('.rec-btn').click();
  await waitFinal();
  const first = { state: await fbState(), heard: await heardText() };
  await page.waitForTimeout(8000); // tempo de sobra para a análise antiga terminar, se não tivesse sido cancelada
  const later = { state: await fbState(), heard: await heardText() };
  assert(JSON.stringify(first) === JSON.stringify(later), `mudou depois: ${JSON.stringify({ first, later })}`);
  assert(!(later.heard || '').includes('brush'), `mostrou a transcrição da gravação antiga: ${later.heard}`);
  return { resultadoFinal: later };
});

await check('L14', 'Modelo instalado mas corrompido (SIMULADO): falha ao carregar → “Verificar instalação” → novo download só com o toque do aluno', async () => {
  await go(S1);
  await page.evaluate(async () => {
    const k = (await caches.keys()).find((x) => x.startsWith('asr-local-'));
    const c = await caches.open(k);
    const url = (await c.keys()).map((r) => r.url).find((u) => u.includes('decoder_model_merged'));
    await c.put(url, new Response(new Blob([new Uint8Array(1024)]), { headers: { 'X-DRG-Size': '1024' } }));
  });
  await go(S1); // nova página: o worker carrega o arquivo corrompido
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(7200);
  await page.locator('.rec-btn').click();
  await waitFinal();
  const st = await fbState();
  const text = await page.locator('.fb').textContent();
  assert(st === 'error' && /não carregou/.test(text) && await page.locator('.score-num').count() === 0, `${st} · ${text.slice(0, 120)}`);
  const before = asrRequests.filter((u) => u.includes('decoder_model_merged')).length;
  await page.getByRole('button', { name: 'Verificar instalação' }).click();
  await page.waitForSelector('text=Arquivos do reconhecimento incompletos', { timeout: 10000 });
  await page.waitForTimeout(500);
  const silent = asrRequests.filter((u) => u.includes('decoder_model_merged')).length - before;
  assert(silent === 0, 'baixou de novo sem o toque do aluno');
  await page.getByRole('button', { name: 'Baixar de novo' }).click();
  await waitFinal();
  await page.waitForFunction(() => document.querySelector('.fb').dataset.state === 'result', null, { timeout: 90000 });
  const v = await page.evaluate(() => window.DRG_APP.asr.local.verify());
  assert(v.ok, JSON.stringify(v));
  return { erro: text.slice(0, 50), downloadsSemToque: silent, depois: 'reinstalado e analisado' };
});

await check('L15', 'Atualização do app com o modelo já instalado (versão anterior, SIMULADA): reaproveita os arquivos idênticos e baixa só o que mudou', async () => {
  await go(S1);
  await page.evaluate(async () => {
    const cur = (await caches.keys()).find((x) => x.startsWith('asr-local-'));
    const from = await caches.open(cur);
    const old = await caches.open('asr-local-000000000000'); // como uma instalação da versão anterior (sem cabeçalhos de integridade)
    for (const req of await from.keys()) {
      const body = req.url.endsWith('worker.js') ? new Blob(['// worker da versão anterior']) : await (await from.match(req)).blob();
      await old.put(req.url, new Response(body, { headers: { 'Content-Type': 'application/octet-stream' } }));
    }
    await caches.delete(cur);
  });
  serverHits.length = 0;
  await go(S1);
  const card = await page.locator('.fb [data-role=asr-setup]').textContent();
  const label = card.match(/(\d+) MB de download/);
  assert(label && Number(label[1]) <= 1, `tamanho mostrado: ${card.slice(0, 160)}`);
  await page.getByRole('button', { name: 'Baixar reconhecimento' }).click();
  await page.waitForSelector('.setup-done, .fb[data-state="result"], .fb[data-state="analysing"]', { timeout: 60000 });
  const hits = [...serverHits];
  const v = await page.evaluate(() => window.DRG_APP.asr.local.verify());
  const oldLeft = await page.evaluate(async () => (await caches.keys()).filter((k) => k === 'asr-local-000000000000').length);
  assert(v.ok && oldLeft === 0, JSON.stringify({ v, oldLeft }));
  assert(hits.length === 1 && hits[0].endsWith('/asr/worker.js'), `baixou: ${JSON.stringify(hits)}`);
  // o modelo migrado precisa de fato funcionar (tipos dos arquivos, módulos .mjs, wasm)
  await go(S1);
  await recordFor(7200);
  await waitFinal();
  assert(await fbState() === 'result', `análise após a atualização: ${await fbState()} · ${(await page.locator('.fb').textContent()).slice(0, 160)}`);
  return { tamanhoMostrado: `${label[1]} MB`, baixados: hits.map((u) => u.split('/asr/')[1]), analiseDepois: 'ok' };
});


// ---------- respostas LIVRES (missões e perguntas): fala sintética espontânea, diferente do exemplo ----------
const freeState = () => page.evaluate(() => document.querySelector('[data-role=free-feedback]')?.dataset.state || null);
const waitFree = () => page.waitForFunction(() => ['result', 'inconclusive', 'error'].includes(document.querySelector('[data-role=free-feedback]')?.dataset.state), null, { timeout: 180000 });
const freeTranscript = () => page.locator('[data-role=free-feedback] .fa-text').textContent().catch(() => '');
async function goToQuestion(qid) {
  await go('#/session?routine=R01&mode=present');
  for (let i = 0; i < 25; i++) {
    const cur = await page.evaluate(() => { const e = window.DRG_APP.debugExercise; return e && e.q ? e.q.id : e && e.type; });
    if (cur === qid) return;
    const bar = page.locator('.actionbar');
    await bar.getByRole('button', { name: 'Ver modelo e avaliar' }).click();
    await page.getByRole('button', { name: 'Consegui', exact: true }).click();
    await page.waitForTimeout(150);
  }
  throw new Error(`não cheguei a ${qid}`);
}

await launch('free-routine.wav');

await check('F01', 'Missão “Could you tell me about your daily routine?”: ao parar, transcrição REAL + avaliação contextual automática; vocabulário diferente do exemplo aceito; XP intacto', async () => {
  await goToQuestion('G.Q01');
  const xp0 = (await page.evaluate(() => window.DRG_APP.state.xp));
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(12000);
  await page.locator('.rec-btn').click();
  await page.waitForFunction(() => document.querySelector('[data-role=free-feedback]')?.dataset.state === 'analysing', null, { timeout: 8000 });
  const analysingText = await page.locator('[data-role=free-feedback]').textContent();
  const xpAfterRec = await page.evaluate(() => window.DRG_APP.state.xp);
  await waitFree();
  const st = await freeState();
  const fb = await page.locator('[data-role=free-feedback]').textContent();
  const transcript = await freeTranscript();
  const xpAfterAnalysis = await page.evaluate(() => window.DRG_APP.state.xp);
  await page.screenshot({ path: join(OUT, 'F01-missao-livre.png'), fullPage: true });
  assert(/Analisando sua resposta/.test(analysingText), analysingText);
  assert(st === 'result' && /Responde à pergunta/.test(fb), `${st} · ${fb.slice(0, 160)}`);
  assert(/breakfast/i.test(transcript) && /bus/i.test(transcript) && /English/i.test(transcript), `transcrição: ${transcript}`);
  assert(!/bank|Uber/i.test(transcript), 'a transcrição não pode ser o exemplo da teacher');
  assert(await page.locator('[data-role=free-feedback] .pchip').count() === 0, 'marcou palavras numa resposta correta');
  assert(await page.locator('.score-num').count() === 0, 'nota numérica inventada');
  assert(/Pronúncia: Não avaliada/.test(fb) && /Velocidade estimada: ~\d+ palavras\/min/.test(fb), 'métricas/pronúncia');
  assert(xpAfterAnalysis === xpAfterRec, `a análise mudou o XP: ${xpAfterRec} → ${xpAfterAnalysis}`);
  // a missão segue: modelo e autoavaliação como antes
  await page.locator('.actionbar').getByRole('button', { name: 'Ver modelo e avaliar' }).click();
  await page.getByRole('button', { name: 'Consegui', exact: true }).click();
  await page.waitForTimeout(300);
  const card = await page.evaluate(() => window.DRG_APP.state.cards['q:G.Q01:conv']);
  assert(card && card.reps >= 1, 'pergunta não registrada');
  return { transcricao: transcript, xp: `${xp0} → ${xpAfterRec} (gravação) → ${xpAfterAnalysis} (análise)`, apos: (await page.evaluate(() => window.DRG_APP.state.xp)) };
});

await check('F02', 'Pergunta livre: sair da tela durante a análise cancela (worker encerrado); ao voltar, a gravação salva é analisada', async () => {
  await go('#/lab?q=G.Q01');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(12000);
  await page.locator('.rec-btn').click();
  await page.waitForFunction(() => document.querySelector('[data-role=free-feedback]')?.dataset.state === 'analysing', null, { timeout: 8000 });
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(600);
  const workers = page.workers().length;
  await go('#/lab?q=G.Q01');
  await waitFree();
  const st = await freeState();
  assert(workers === 0, `worker ativo após sair: ${workers}`);
  assert(st === 'result' && /breakfast/i.test(await freeTranscript()), st);
  return { workersAoSair: workers, aoVoltar: st };
});

await check('F03', 'Nova gravação durante a análise: o resultado atrasado da anterior é descartado', async () => {
  await go('#/lab?q=G.Q01');
  await waitFree(); // resultado salvo da tentativa anterior
  // o microfone falso recomeça o arquivo a cada gravação: 2,5 s captam só o começo da fala (sem “English”, do fim)
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(2500);
  await page.locator('.rec-btn').click();
  await waitFree();
  const first = { st: await freeState(), t: await freeTranscript() };
  await page.waitForTimeout(6000);
  const later = { st: await freeState(), t: await freeTranscript() };
  assert(JSON.stringify(first) === JSON.stringify(later), JSON.stringify({ first, later }));
  assert(!/English/i.test(later.t), `mostrou a transcrição da gravação anterior: ${JSON.stringify(later)}`);
  return { resultadoFinal: later.st };
});

await check('F04', 'Falha do worker na resposta livre (SIMULADA): erro recuperável, sem avaliação; “Tentar de novo” recupera', async () => {
  await launch('free-routine.wav');
  await go('#/lab?q=G.Q01');
  await page.evaluate(() => { window.__RealWorker = window.Worker; window.Worker = function () { throw new Error('worker bloqueado (teste)'); }; });
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(12000);
  await page.locator('.rec-btn').click();
  await waitFree();
  const st = await freeState();
  const fb = await page.locator('[data-role=free-feedback]').textContent();
  assert(st === 'error' && /Nenhuma avaliação foi gerada/.test(fb) && /missão pode seguir/.test(fb), `${st} ${fb.slice(0, 120)}`);
  await page.evaluate(() => { window.Worker = window.__RealWorker; });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await waitFree();
  assert(await freeState() === 'result', await freeState());
  return { erro: 'recuperável', depois: 'resultado' };
});

await launch('free-lunch-chest.wav');

await check('F05', 'Divergência do reconhecedor (“chest” na pergunta sobre chess): marcada para revisar com a palavra provável; tocar toca a referência e a própria resposta', async () => {
  await go('#/lab?q=R01.Q4');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(7500);
  await page.locator('.rec-btn').click();
  await waitFree();
  const chips = (await page.locator('[data-role=free-feedback] .pchip').allTextContents()).map((x) => x.trim());
  const transcript = await freeTranscript();
  assert(JSON.stringify(chips) === '["chest"]', `marcadas ${JSON.stringify(chips)} · ${transcript}`);
  await page.evaluate(() => { window.__plays.length = 0; });
  await page.locator('[data-role=free-feedback] .pchip').first().click();
  await page.waitForTimeout(400);
  const panel = await page.locator('[data-role=free-feedback] .practice-panel').textContent();
  assert(/O app ouviu “chest”/.test(panel) && /se disse “chest”, está tudo certo/.test(panel), panel);
  const key = await page.evaluate(() => { let h = 0x811c9dc5; for (const c of 'chess') { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); });
  await page.getByRole('button', { name: 'Ouvir minha resposta' }).first().click();
  await page.waitForTimeout(300);
  const plays = await page.evaluate(() => window.__plays);
  assert(plays.some((u) => u.startsWith('blob:')), `não tocou a gravação: ${JSON.stringify(plays)}`);
  assert(plays.some((u) => u.includes(`/audio/${key}`)), `não tocou a referência de “chess” (${key}): ${JSON.stringify(plays)}`);
  await page.screenshot({ path: join(OUT, 'F05-divergencia.png'), fullPage: true });
  return { transcricao: transcript, marcadas: chips, tocou: plays.map((u) => u.split('/').pop().slice(0, 12)), chaveChess: key };
});

await launch('free-long.wav');

await check('F06', 'Resposta longa (65 s): transcrita em partes, por inteiro (início e fim), sem corte silencioso', async () => {
  await go('#/lab?q=G.Q01');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(66000);
  await page.locator('.rec-btn').click();
  const parts = [];
  const poll = setInterval(async () => { const t = await page.locator('.fb-analysing').textContent().catch(() => ''); const m = t.match(/parte (\d+) de (\d+)/); if (m) parts.push(m[0]); }, 200);
  await waitFree();
  clearInterval(poll);
  const t = await freeTranscript();
  const st = await freeState();
  assert(st === 'result', st);
  assert(/early/i.test(t) && /(eleven|11)/i.test(t) && /restaurant/i.test(t), `transcrição incompleta: ${t}`);
  assert(parts.length > 0 && /de [2-9]/.test(parts.at(-1)), `sem progresso por partes: ${JSON.stringify(parts)}`);
  return { partes: parts.at(-1), palavras: t.split(/\s+/).length, inicio: t.slice(0, 40), fim: t.slice(-40) };
});

await check('F07', 'Resposta acima do limite (3 min): recusada com motivo e duração, sem cortar nem avaliar parte dela', async () => {
  const r = await page.evaluate(async () => {
    // WAV de 181 s (8 kHz, 16 bits, silêncio): só a duração importa aqui
    const sr = 8000, n = sr * 181, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, str) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    try { await window.DRG_APP.asr.local.transcribe(new Blob([buf], { type: 'audio/wav' }), { long: true }); return { ok: true }; } catch (e) { return { code: e.code, secs: Math.round(e.secs), max: e.max, msg: e.message }; }
  });
  assert(r.code === 'too-long' && r.secs === 181 && r.max === 180, JSON.stringify(r));
  return r;
});

// ---------- 4ª execução: silêncio ----------
await launch('silence.wav');

await check('L06', 'Gravação sem voz: inconclusivo (orientação, sem nota, sem lista) e o modelo nem é chamado', async () => {
  await go(S1);
  await recordFor(3000);
  await waitFinal();
  const st = await fbState();
  const text = await page.locator('.fb').textContent();
  assert(st === 'inconclusive' && /Quase não captei voz/.test(text), `${st} · ${text.slice(0, 100)}`);
  assert(await page.locator('.score-num').count() === 0 && await page.locator('.pchip').count() === 0, 'nota/lista sem evidência');
  assert(page.workers().length === 0, 'o modelo foi carregado para uma gravação sem voz');
  return { estado: st, orientacao: text.slice(0, 70) };
});

await check('L10', 'Nenhuma requisição externa e nenhum erro de JavaScript', async () => {
  assert(external.length === 0, external.slice(0, 3).join(', '));
  const relevant = pageErrors.filter((e) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED|net::/.test(e));
  assert(relevant.length === 0, relevant.slice(0, 3).join(' | '));
  return { externas: 0, requisicoesAoModelo: [...new Set(asrRequests)].length };
});

await ctx.close();
server.close();
rmSync(PROFILE, { recursive: true, force: true });
const summary = { when: new Date().toISOString(), environment: 'Chromium (Playwright) headless, Linux — microfone falso com fala SINTÉTICA; não é o Galaxy S25+', passed: results.filter((r) => r.status === 'aprovado').length, failed: results.filter((r) => r.status !== 'aprovado').length, results };
writeFileSync(join(OUT, 'asr-local-results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${summary.passed} aprovados, ${summary.failed} reprovados`);
process.exit(summary.failed ? 1 : 0);
