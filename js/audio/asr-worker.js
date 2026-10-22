// Worker do reconhecimento de fala LOCAL (modelo Moonshine tiny, MIT; onnxruntime-web, MIT).
// Roda inteiramente no aparelho: recebe o áudio já gravado (16 kHz, mono) e devolve o texto.
// Nada é enviado para fora; o modelo é baixado uma vez do próprio endereço do app e fica no cache.
// Compilado por tools/build-app.mjs para app/asr/worker.js (ESM, worker de módulo).
import MoonshineModel from '../../../vendor/asr/moonshine-js/src/model.ts';
import { Settings } from '../../../vendor/asr/moonshine-js/src/constants.ts';

const BASE = new URL('./', self.location.href).href;
// caminhos locais: nunca a CDN nem o servidor do Moonshine (padrões da biblioteca)
Settings.BASE_ASSET_PATH.MOONSHINE = BASE;
Settings.BASE_ASSET_PATH.ONNX_RUNTIME = BASE;

let model = null;
// a pasta do modelo precisa se chamar "tiny": a biblioteca escolhe as dimensões da rede por esse nome
const getModel = () => (model = model || new MoonshineModel('tiny', 'quantized'));

self.onmessage = async (e) => {
  const { id, type, pcm } = e.data || {};
  try {
    if (type === 'load' || type === 'transcribe') {
      const t0 = performance.now();
      try { await getModel().loadModel(); } catch (err) {
        model = null; // permite nova tentativa de carga
        self.postMessage({ id, ok: false, stage: 'load', error: (err && err.message) || String(err) });
        return;
      }
      if (type === 'load') { self.postMessage({ id, ok: true, ms: Math.round(performance.now() - t0) }); return; }
    }
    if (type === 'transcribe') {
      const t0 = performance.now();
      const text = await model.generate(pcm);
      self.postMessage({ id, ok: true, text: String(text || '').trim(), ms: Math.round(performance.now() - t0) });
    } else {
      self.postMessage({ id, ok: false, error: `mensagem desconhecida: ${type}` });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: (err && err.message) || String(err) });
  }
};
