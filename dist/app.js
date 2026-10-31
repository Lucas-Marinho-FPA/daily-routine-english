// Daily Routine English Game — bundle gerado por tools/build-app.mjs a partir de app/js (fonte legível).
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // <define:__ASR_MANIFEST__>
  var define_ASR_MANIFEST_default = { version: "5ec6dd843fca", files: [{ path: "asr/worker.js", size: 747168, sha: "a3f0df6dbb127d67" }, { path: "asr/ort-wasm-simd-threaded.mjs", size: 20856, sha: "30dd851d9c006229" }, { path: "asr/ort-wasm-simd-threaded.wasm", size: 11210254, sha: "71aef04959c5c1b6" }, { path: "asr/tiny/quantized/encoder_model.onnx", size: 7937661, sha: "c6fc4b7bc5af75c0" }, { path: "asr/tiny/quantized/decoder_model_merged.onnx", size: 20243286, sha: "eed87831c3a61035" }] };

  // app/js/ui/dom.js
  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === void 0 || v === null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style" && typeof v === "object") for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith("--")) el.style.setProperty(sk, sv);
        else el.style[sk] = sv;
      }
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
    append(el, children);
    return el;
  }
  function append(el, children) {
    for (const c of children.flat(Infinity)) {
      if (c === null || c === void 0 || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  var clear = (el) => {
    while (el.firstChild) el.firstChild.remove();
    return { el, append: (...children) => append(el, children) };
  };
  var PATHS = {
    home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
    book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7",
    mic: "M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
    play: "M7 4l13 8-13 8z",
    stop: "M6 6h12v12H6z",
    pause: "M7 5h4v14H7zM13 5h4v14h-4z",
    speaker: "M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13",
    back: "M15 18l-6-6 6-6",
    next: "M9 6l6 6-6 6",
    close: "M6 6l12 12M18 6L6 18",
    check: "M5 12l5 5 9-10",
    x: "M6 6l12 12M18 6L6 18",
    bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z",
    record: "M12 12m-6 0a6 6 0 1012 0 6 6 0 10-12 0",
    refresh: "M4 4v6h6M20 20v-6h-6M5 15a8 8 0 0014 3M19 9A8 8 0 005 6",
    ab: "M4 18l4-12 4 12M5.5 14h5M15 6h3a3 3 0 010 6h-3zM15 12h4a3 3 0 010 6h-4z",
    flame: "M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-3 2-4 2-7 2 1 3 3 3 5 1-1 1-3 0-8z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
    download: "M12 3v12M7 10l5 5 5-5M5 21h14",
    upload: "M12 21V9M7 14l5-5 5 5M5 3h14",
    target: "M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 12m-5 0a5 5 0 1010 0 5 5 0 10-10 0M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0",
    timer: "M12 8v5l3 2M9 2h6M12 22a8 8 0 100-16 8 8 0 000 16z",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
    slow: "M12 8v4l2 2M12 21a9 9 0 100-18 9 9 0 000 18z",
    lock: "M6 11h12v10H6zM8 11V7a4 4 0 018 0v4",
    star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z",
    chat: "M4 5h16v11H9l-5 4z"
  };
  function icon(name, extra = "") {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", name === "play" || name === "stop" || name === "record" ? "currentColor" : "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    if (extra) svg.setAttribute("class", extra);
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", PATHS[name] || "");
    svg.append(p);
    return svg;
  }
  function toast(msg, ms = 2600) {
    const t = h("div", { class: "toast", role: "status", text: msg });
    document.body.append(t);
    setTimeout(() => t.remove(), ms);
  }
  function sheet(content, { onClose, label = "Detalhes" } = {}) {
    const prevFocus = document.activeElement;
    const box2 = h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": label }, h("div", { class: "grip" }), content);
    const back = h("div", { class: "sheet-backdrop" }, box2);
    const close = () => {
      back.remove();
      document.removeEventListener("keydown", esc);
      onClose && onClose();
      prevFocus && prevFocus.focus && prevFocus.focus();
    };
    const esc = (e) => {
      if (e.key === "Escape") close();
    };
    back.addEventListener("click", (e) => {
      if (e.target === back) close();
    });
    document.addEventListener("keydown", esc);
    document.body.append(back);
    const first = box2.querySelector("button, [href], input, textarea");
    if (first) first.focus({ preventScroll: true });
    return { close, el: box2 };
  }
  function confirmSheet(title, text, { ok = "Confirmar", danger = false } = {}) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (v) => {
        if (!settled) {
          settled = true;
          resolve(v);
        }
      };
      let s;
      const body = h(
        "div",
        {},
        h("h3", { text: title }),
        h("p", { class: "muted", text }),
        h(
          "div",
          { class: "row", style: { marginTop: "16px" } },
          h("button", { class: "btn", onclick: () => {
            finish(false);
            s.close();
          } }, "Cancelar"),
          h("button", { class: `btn ${danger ? "danger" : "primary"}`, onclick: () => {
            finish(true);
            s.close();
          } }, ok)
        )
      );
      s = sheet(body, { onClose: () => finish(false), label: title });
    });
  }
  function bar(ratio, cls = "") {
    return h(
      "div",
      { class: `bar ${cls}`, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(ratio * 100) },
      h("i", { style: { width: `${Math.max(0, Math.min(100, ratio * 100))}%` } })
    );
  }
  function fmtDate(ts) {
    try {
      return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    } catch (e) {
      return "";
    }
  }

  // app/js/engine/text.js
  var IRREGULAR = {
    get: ["gets", "got", "getting"],
    go: ["goes", "went", "going", "gone"],
    do: ["does", "did", "doing", "done"],
    have: ["has", "had", "having"],
    take: ["takes", "took", "taking", "taken"],
    make: ["makes", "made", "making"],
    sit: ["sits", "sat", "sitting"],
    put: ["puts", "putting"],
    run: ["runs", "ran", "running"],
    set: ["sets", "setting"],
    shut: ["shuts", "shutting"],
    spend: ["spends", "spent", "spending"],
    leave: ["leaves", "left", "leaving"],
    drive: ["drives", "drove", "driving", "driven"],
    say: ["says", "said", "saying"],
    eat: ["eats", "ate", "eating", "eaten"],
    feel: ["feels", "felt", "feeling"],
    grab: ["grabs", "grabbed", "grabbing"],
    skip: ["skips", "skipped", "skipping"],
    hit: ["hits", "hitting"],
    send: ["sends", "sent", "sending"],
    wind: ["winds", "wound", "winding"],
    wake: ["wakes", "woke", "waking", "woken"],
    begin: ["begins", "began", "beginning"],
    swim: ["swims", "swimming"],
    stop: ["stops", "stopped", "stopping"],
    plan: ["plans", "planned", "planning"],
    shop: ["shops", "shopped", "shopping"],
    dry: ["dries", "dried", "drying"],
    tidy: ["tidies", "tidied", "tidying"],
    study: ["studies", "studied", "studying"],
    try: ["tries", "tried", "trying"],
    is: ["are", "am", "be", "was", "were"],
    be: ["is", "are", "am", "was", "were", "being", "been"]
  };
  function inflections(token) {
    const out = /* @__PURE__ */ new Set([token]);
    if (IRREGULAR[token]) IRREGULAR[token].forEach((f) => out.add(f));
    if (token.length < 3) return out;
    out.add(token + "s");
    out.add(token + "es");
    out.add(token + "ed");
    out.add(token + "d");
    out.add(token + "ing");
    if (token.endsWith("e")) out.add(token.slice(0, -1) + "ing");
    if (token.endsWith("y")) {
      out.add(token.slice(0, -1) + "ies");
      out.add(token.slice(0, -1) + "ied");
    }
    if (token.endsWith("s")) out.add(token.slice(0, -1));
    return out;
  }
  function basicNormalise(s) {
    return String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, " ").replace(/…/g, " ").replace(/\s+/g, " ").trim();
  }
  function wordTokens(s) {
    return basicNormalise(s).replace(/(\d)[.:](\d\d)/g, "$1:$2").replace(/\b([ap])\.\s?m\.?/g, "$1m").replace(/-/g, " ").replace(/[^a-z0-9à-öø-ÿ':]+/g, " ").replace(/(^|\s)'+|'+(\s|$)/g, " ").replace(/:(?!\d)/g, " ").split(" ").filter(Boolean);
  }
  var POSSESSIVES = /* @__PURE__ */ new Set(["my", "our", "his", "her", "their", "the", "a", "an", "your"]);
  function findPattern(patternText, tokens, { separable = false } = {}) {
    const pat = wordTokens(patternText.replace(/\*/g, " qqanyqq ").replace(/\bsomeone\b/g, " qqanyqq "));
    const sets = pat.map((t) => t === "qqanyqq" ? null : t === "my" ? POSSESSIVES : inflections(t));
    const maxGapBeforeLast = separable && pat.length === 2 ? 3 : 0;
    const matchFrom = (pi, ti) => {
      if (pi === pat.length) return ti;
      if (sets[pi] === null) {
        for (let k = 1; k <= 3 && ti + k <= tokens.length; k++) {
          const end = matchFrom(pi + 1, ti + k);
          if (end !== -1) return end;
        }
        return -1;
      }
      const gap = pi === pat.length - 1 && pi > 0 ? maxGapBeforeLast : 0;
      for (let g = 0; g <= gap && ti + g < tokens.length; g++) {
        if (sets[pi].has(tokens[ti + g])) {
          const end = matchFrom(pi + 1, ti + g + 1);
          if (end !== -1) return end;
        }
      }
      return -1;
    };
    for (let i = 0; i < tokens.length; i++) {
      if (sets[0] !== null && !sets[0].has(tokens[i])) continue;
      const end = matchFrom(0, i);
      if (end !== -1) return [i, end];
    }
    return null;
  }
  function fnv1a(str) {
    let h2 = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h2 ^= str.charCodeAt(i);
      h2 = Math.imul(h2, 16777619) >>> 0;
    }
    return h2.toString(16).padStart(8, "0");
  }
  function audioKey(text) {
    return fnv1a(String(text).replace(/\s+/g, " ").trim());
  }
  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[m][n];
  }
  function lcsAlign(a, b, eq = (x, y) => x === y) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
    for (let i2 = m - 1; i2 >= 0; i2--) {
      for (let j2 = n - 1; j2 >= 0; j2--) {
        dp[i2][j2] = eq(a[i2], b[j2]) ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
      }
    }
    const pairs = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (eq(a[i], b[j])) {
        pairs.push([i, j]);
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return pairs;
  }
  function shuffle(list, rand = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function tokenSpans(text) {
    const rx = /\d{1,2}[.:]\d\d|\b[aApP]\.\s?[mM]\.?|[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g;
    const spans = [];
    let m;
    while (m = rx.exec(text)) spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    return spans;
  }

  // app/js/engine/checker.js
  var ACCEPTED = /* @__PURE__ */ new Set(["correct", "accepted_variant", "variant_ame", "spelling"]);
  var TIME_PREP = /* @__PURE__ */ new Set(["at", "until", "by", "around", "about", "from", "till", "before", "after", "between"]);
  var PRACTICE_SUBJ = /* @__PURE__ */ new Set(["i", "we", "you", "they", "to", "not", "and", "also", "usually", "often", "always", "sometimes"]);
  function createChecker(lang, { userVariants = {} } = {}) {
    const contractions = lang.contractions || {};
    const ame = Object.fromEntries(Object.entries(lang.spellingAmE || {}).filter(([k]) => !k.startsWith("_")));
    const numberWords = lang.numberWords || {};
    const stop2 = new Set(lang.stopwords || []);
    const determiners = new Set(lang.determiners || []);
    const synonymGroups = (lang.synonyms || []).map((g) => g.map((p) => wordTokens(p)));
    const rules = (lang.errors || []).map((e) => ({ ...e, rx: new RegExp(e.re, "i") }));
    const tok = (t, src) => ({ t, src });
    const srcUnion = (list) => [...new Set(list.flatMap((o) => o.src))].sort((a, b) => a - b);
    function srcTokens(text) {
      const spans = tokenSpans(text);
      const toks = [];
      spans.forEach((sp, k) => {
        for (const w of wordTokens(sp.text)) toks.push(tok(w, [k]));
      });
      return { spans, toks };
    }
    function expandContractionsS(toks) {
      const out = [];
      for (const o of toks) {
        if (contractions[o.t]) out.push(...contractions[o.t].split(" ").map((w) => tok(w, o.src)));
        else if (/^\w+'s$/.test(o.t)) out.push(tok(o.t.replace(/'s$/, ""), o.src));
        else out.push(o);
      }
      return out;
    }
    function canonTimesS(toks, style = []) {
      const tk = toks.map((o) => o.t);
      const out = [];
      const num = (t) => /^\d{1,2}$/.test(t) ? Number(t) : numberWords[t];
      const minutesAt = (j) => {
        if (/^\d{2}$/.test(tk[j] || "") && +tk[j] < 60) return { m: +tk[j], n: 1 };
        const a = numberWords[tk[j]];
        if (a === void 0) return null;
        const b = numberWords[tk[j + 1]];
        if ([20, 30, 40, 50].includes(a) && b >= 1 && b <= 9) return { m: a + b, n: 2 };
        if (a >= 10 && a < 60 && a !== 12) return { m: a, n: 1 };
        return null;
      };
      for (let i = 0; i < toks.length; i++) {
        const t = tk[i];
        let h2 = null, m = 0, consumed = 0, unnatural = false;
        let match;
        if (match = /^(\d{1,2}):(\d{2})$/.exec(t)) {
          h2 = +match[1];
          m = +match[2];
          consumed = 1;
        } else if (match = /^(\d{1,2})h(\d{2})?$/.exec(t)) {
          h2 = +match[1];
          m = match[2] ? +match[2] : 0;
          consumed = 1;
        } else if (match = /^(\d{1,2}(?::\d{2})?)(am|pm)$/.exec(t)) {
          const [hh, mm] = match[1].split(":");
          out.push(tok(`@${+hh}:${mm || "00"}${match[2]}`, toks[i].src));
          continue;
        } else if (t === "midnight") {
          out.push(tok("@12:00am", toks[i].src));
          continue;
        } else if (t === "noon" || t === "midday") {
          out.push(tok("@12:00pm", toks[i].src));
          continue;
        } else if (t === "half" && tk[i + 1] === "past" && num(tk[i + 2]) <= 12) {
          h2 = num(tk[i + 2]);
          m = 30;
          consumed = 3;
        } else if (t === "quarter" && tk[i + 1] === "past" && num(tk[i + 2]) <= 12) {
          h2 = num(tk[i + 2]);
          m = 15;
          consumed = 3;
          if (out.length && out[out.length - 1].t === "a") out.pop();
        } else if (t === "quarter" && tk[i + 1] === "to" && num(tk[i + 2]) <= 12) {
          h2 = num(tk[i + 2]) - 1 || 12;
          m = 45;
          consumed = 3;
          if (out.length && out[out.length - 1].t === "a") out.pop();
        } else if (num(t) !== void 0 && num(t) >= 1 && num(t) <= 12) {
          const isTimeContext = ["am", "pm", "o'clock", "oclock", "sharp"].includes(tk[i + 1]) || TIME_PREP.has(tk[i - 1]) || tk[i + 1] === "in" && tk[i + 2] === "the" && ["morning", "afternoon", "evening"].includes(tk[i + 3]);
          if (isTimeContext) {
            h2 = num(t);
            consumed = 1;
            const mm = minutesAt(i + 1);
            if (mm) {
              m = mm.m;
              consumed = 1 + mm.n;
            } else if (tk[i + 1] === "and") {
              const m2 = minutesAt(i + 2);
              if (m2) {
                m = m2.m;
                consumed = 2 + m2.n;
                unnatural = true;
              }
            }
          }
        }
        if (h2 === null) {
          out.push(toks[i]);
          continue;
        }
        const parts = toks.slice(i, i + consumed);
        i += consumed - 1;
        let mer = "";
        if (tk[i + 1] === "o'clock" || tk[i + 1] === "oclock") {
          parts.push(toks[++i]);
        }
        if (tk[i + 1] === "am" || tk[i + 1] === "pm") {
          mer = tk[i + 1];
          parts.push(toks[++i]);
        } else if (tk[i + 1] === "in" && tk[i + 2] === "the" && tk[i + 3] === "morning") {
          mer = "am";
          parts.push(...toks.slice(i + 1, i + 4));
          i += 3;
        } else if (tk[i + 1] === "in" && tk[i + 2] === "the" && ["afternoon", "evening"].includes(tk[i + 3])) {
          mer = "pm";
          parts.push(...toks.slice(i + 1, i + 4));
          i += 3;
        } else if (tk[i + 1] === "at" && tk[i + 2] === "night") {
          mer = "pm";
          parts.push(...toks.slice(i + 1, i + 3));
          i += 2;
        }
        if (h2 > 12 && h2 < 24) {
          h2 -= 12;
          mer = "pm";
        }
        const src = srcUnion(parts);
        if (unnatural) style.push({ kind: "time-and", src, h: h2, m, mer });
        out.push(tok(`@${h2}:${String(m).padStart(2, "0")}${mer}`, src));
      }
      return out;
    }
    const numbersToDigitsS = (toks) => toks.map((o) => numberWords[o.t] !== void 0 && !/^@/.test(o.t) ? tok(String(numberWords[o.t]), o.src) : o);
    function applyAmES(toks) {
      let changed = false;
      const out = toks.map((o, i) => {
        const prev = toks[i - 1] && toks[i - 1].t;
        if (ame[o.t]) {
          changed = true;
          return tok(ame[o.t], o.src);
        }
        if (o.t === "practice" && PRACTICE_SUBJ.has(prev)) {
          changed = true;
          return tok("practise", o.src);
        }
        if (o.t === "practices" && ["my", "wife", "he", "she", "son"].includes(prev)) {
          changed = true;
          return tok("practises", o.src);
        }
        return o;
      });
      return { tokens: out, changed };
    }
    function applySynonymsS(toks) {
      let changed = false;
      let out = toks.slice();
      for (const group of synonymGroups) {
        const canon = group[0];
        for (const alt of group.slice(1)) {
          for (let i = 0; i + alt.length <= out.length; i++) {
            if (alt.every((t, k) => out[i + k].t === t)) {
              const src = srcUnion(out.slice(i, i + alt.length));
              out = [...out.slice(0, i), ...canon.map((t) => tok(t, src)), ...out.slice(i + alt.length)];
              changed = true;
            }
          }
        }
      }
      return { tokens: out, changed };
    }
    const plain = (fn) => (tokens) => fn(tokens.map((t) => tok(t, []))).map((o) => o.t);
    const expandContractions = plain(expandContractionsS);
    const canonTimes = plain((x) => canonTimesS(x));
    const numbersToDigits = plain(numbersToDigitsS);
    const applyAmE = (tokens) => {
      const r = applyAmES(tokens.map((t) => tok(t, [])));
      return { tokens: r.tokens.map((o) => o.t), changed: r.changed };
    };
    const applySynonyms = (tokens) => {
      const r = applySynonymsS(tokens.map((t) => tok(t, [])));
      return { tokens: r.tokens.map((o) => o.t), changed: r.changed };
    };
    function prepare(text) {
      const { spans, toks } = srcTokens(text);
      const style = [];
      const baseS = numbersToDigitsS(canonTimesS(expandContractionsS(toks), style));
      const a = applyAmES(baseS);
      const s = applySynonymsS(a.tokens);
      const strs = (l) => l.map((o) => o.t);
      return { base: strs(baseS), bre: strs(a.tokens), full: strs(s.tokens), baseS, breS: a.tokens, fullS: s.tokens, spans, style, ame: a.changed, syn: s.changed };
    }
    const timeEq = (x, y) => {
      if (x[0] !== "@" || y[0] !== "@") return false;
      const cx = x.replace(/(am|pm)$/, ""), cy = y.replace(/(am|pm)$/, "");
      const merX = (x.match(/(am|pm)$/) || [])[1], merY = (y.match(/(am|pm)$/) || [])[1];
      return cx === cy && (!merX || !merY || merX === merY);
    };
    const same = (a, b) => a.length === b.length && a.every((t, i) => t === b[i] || timeEq(t, b[i]));
    const spellEq = (x, y) => {
      if (x === y || timeEq(x, y)) return true;
      if (x[0] === "@" || y[0] === "@" || /^\d+$/.test(x) || /^\d+$/.test(y)) return false;
      const L = Math.max(x.length, y.length);
      const d = levenshtein(x, y);
      return L >= 4 && d <= 1 || L >= 8 && d <= 2;
    };
    function ruleHits(text, targetText) {
      const a = basicNormalise(text).replace(/[.,!?;]/g, " ").replace(/\s+/g, " ").trim();
      const t = basicNormalise(targetText || "").replace(/[.,!?;]/g, " ");
      return rules.filter((r) => r.rx.test(a) && !r.rx.test(t));
    }
    const spanText = (P, srcs) => {
      if (!srcs.length) return "";
      const a = Math.min(...srcs), b = Math.max(...srcs);
      return P.text.slice(P.spans[a].start, P.spans[b].end);
    };
    const srcOf2 = (list) => [...new Set(list.flatMap((o) => o.src))];
    function buildDiff(A, P, pairs) {
      const aState = A.spans.map(() => "ok"), pState = P.spans.map(() => "ok");
      const RANK = { ok: 0, equiv: 1, style: 2, typo: 3, extra: 4, miss: 4 };
      const set2 = (st, srcs, v) => srcs.forEach((k) => {
        if (RANK[v] > RANK[st[k]]) st[k] = v;
      });
      const swaps = [];
      const anchors = [[-1, -1], ...pairs, [A.fullS.length, P.fullS.length]];
      for (let g = 0; g < anchors.length - 1; g++) {
        const [i0, j0] = anchors[g], [i1, j1] = anchors[g + 1];
        const aG = A.fullS.slice(i0 + 1, i1), pG = P.fullS.slice(j0 + 1, j1);
        if (aG.length && pG.length && aG.every((o) => determiners.has(o.t)) && pG.every((o) => determiners.has(o.t))) {
          set2(aState, srcOf2(aG), "style");
          set2(pState, srcOf2(pG), "style");
          swaps.push({ a: srcOf2(aG), p: srcOf2(pG), nextA: i1 < A.fullS.length ? A.fullS[i1].src : [], nextP: j1 < P.fullS.length ? P.fullS[j1].src : [] });
          continue;
        }
        set2(aState, srcOf2(aG), "extra");
        set2(pState, srcOf2(pG), "miss");
      }
      for (const [i, j] of pairs) {
        const a = A.fullS[i], b = P.fullS[j];
        if (a.t !== b.t && !timeEq(a.t, b.t)) {
          set2(aState, a.src, "typo");
          continue;
        }
        const sa = wordTokens(spanText(A, a.src)).join(" "), sb = wordTokens(spanText(P, b.src)).join(" ");
        if (sa !== sb && a.t[0] === "@") {
          set2(aState, a.src, "equiv");
          set2(pState, b.src, "equiv");
        }
      }
      const view = (X, st) => X.spans.map((sp, k) => ({ start: sp.start, end: sp.end, state: st[k] }));
      return { answerSpans: view(A, aState), targetSpans: view(P, pState), swaps };
    }
    function naturalnessNotes(A) {
      return A.style.map((st) => {
        if (st.kind !== "time-and") return null;
        const k0 = Math.min(...st.src);
        const prev = k0 > 0 && TIME_PREP.has(wordTokens(A.spans[k0 - 1].text)[0]) ? [k0 - 1] : [];
        const surface2 = spanText(A, [...prev, ...st.src]);
        const better = surface2.replace(/\s+and\s+/i, " ");
        return `Seu significado est\xE1 claro (${st.h}:${String(st.m).padStart(2, "0")}). Uma forma mais natural \xE9: \u201C${better.charAt(0).toUpperCase()}${better.slice(1)}\u201D.`;
      }).filter(Boolean);
    }
    function check(answer, targets, opts = {}) {
      const raw = String(answer || "").trim();
      const model = targets[0];
      const result = (cls, extra2 = {}) => ({ cls, accepted: ACCEPTED.has(cls), model, answer: raw, notes: [], diff: null, ...extra2 });
      if (!raw) return result("empty");
      const A = { text: raw, ...prepare(raw) };
      const allTargets = [...targets, ...opts.itemId && userVariants[opts.itemId] || []];
      const prepared = allTargets.map((t) => ({ text: t, ...prepare(t) }));
      const P0 = prepared[0];
      const natural = naturalnessNotes(A);
      if (same(A.base, P0.base)) return natural.length ? result("accepted_variant", { notes: natural }) : result("correct");
      if (A.ame && same(A.bre, P0.bre)) return result("variant_ame", { notes: ["Grafia americana aceita. No ingl\xEAs brit\xE2nico: " + P0.text, ...natural] });
      const soft = ruleHits(raw, model).filter((h2) => h2.soft).map((h2) => h2.msg);
      for (let i = 0; i < prepared.length; i++) {
        const P2 = prepared[i];
        if (same(A.full, P2.full) || same(A.bre, P2.bre)) {
          const fromUser = i >= targets.length;
          const note = i === 0 ? "Variante equivalente aceita." : fromUser ? "Aceita por voc\xEA anteriormente (variante pessoal)." : `Variante aceita: \u201C${P2.text}\u201D.`;
          return result("accepted_variant", { notes: [note, ...A.ame ? ["Grafia americana: no BrE use a forma brit\xE2nica."] : [], ...natural, ...soft] });
        }
      }
      let best = null;
      for (const P2 of prepared) {
        const pairs2 = lcsAlign(A.full, P2.full, spellEq);
        const score = pairs2.length / Math.max(P2.full.length, A.full.length, 1);
        if (!best || score > best.score) best = { P: P2, pairs: pairs2, score };
      }
      const { P, pairs } = best;
      const matchedA = new Set(pairs.map(([i]) => i));
      const matchedT = new Set(pairs.map(([, j]) => j));
      const extra = A.full.filter((_, i) => !matchedA.has(i));
      const missing = P.full.filter((_, j) => !matchedT.has(j));
      const typos = pairs.filter(([i, j]) => A.full[i] !== P.full[j] && !timeEq(A.full[i], P.full[j])).map(([i, j]) => [A.full[i], P.full[j]]);
      const view = buildDiff(A, P, pairs);
      const diff = {
        target: P.full.map((t, j) => ({ t, ok: matchedT.has(j) })),
        answer: A.full.map((t, i) => ({ t, ok: matchedA.has(i) })),
        missing,
        extra,
        typos,
        targetText: P.text,
        answerText: raw,
        targetSpans: view.targetSpans,
        answerSpans: view.answerSpans
      };
      const listSpans = (X, spans, st) => {
        const out = [];
        let cur = null;
        spans.forEach((sp, k) => {
          if (sp.state === st) {
            if (cur && cur.end === k - 1) cur.end = k;
            else out.push(cur = { start: k, end: k });
          }
        });
        return out.map((r) => `\u201C${X.slice(spans[r.start].start, spans[r.end].end)}\u201D`);
      };
      const missingSurf = listSpans(P.text, view.targetSpans, "miss");
      const extraSurf = listSpans(raw, view.answerSpans, "extra");
      const swapNotes = view.swaps.map((sw) => {
        const a = spanText(A, [...sw.a, ...sw.nextA]), b = spanText(P, [...sw.p, ...sw.nextP]);
        return `\u201C${a}\u201D tamb\xE9m est\xE1 correto aqui; o modelo usa \u201C${b}\u201D.`;
      });
      const hits = ruleHits(raw, P.text);
      const hard = hits.filter((h2) => !h2.soft);
      const contentT0 = P.full.filter((t) => !stop2.has(t) && !determiners.has(t));
      const related = !contentT0.length || P.full.some((t, j) => matchedT.has(j) && !stop2.has(t) && !determiners.has(t));
      if (hard.length && related) {
        return result("grammar", { diff, notes: [...hard.map((h2) => h2.msg), ...natural], rules: hard.map((h2) => h2.id) });
      }
      const softNotes = [...hits.filter((h2) => h2.soft).map((h2) => h2.msg), ...natural];
      const SUBJ2 = /* @__PURE__ */ new Set(["i", "you", "we", "they", "he", "she", "it"]);
      const formSwaps = pairs.filter(([i, j]) => A.full[i] !== P.full[j] && SUBJ2.has(A.full[i - 1]) && SUBJ2.has(P.full[j - 1]) && ([...inflections(A.full[i])].includes(P.full[j]) || [...inflections(P.full[j])].includes(A.full[i]))).map(([i, j]) => [A.full[i], P.full[j]]);
      if (!missing.length && !extra.length && formSwaps.length && related) {
        return result("grammar", { diff, rules: ["E_FORM"], notes: [`Forma da palavra: ${formSwaps.map(([a, b]) => `voc\xEA escreveu \u201C${a}\u201D, o modelo usa \u201C${b}\u201D`).join("; ")}.${formSwaps.some(([a, b]) => a === b + "s" || a === b + "es") ? " Com I/you/we/they o verbo no presente fica sem -s." : ""}`, ...swapNotes, ...softNotes] });
      }
      if (!missing.length && !extra.length && typos.length) {
        return result("spelling", { diff, notes: [`Pequeno erro de digita\xE7\xE3o: ${typos.map(([a, b]) => `\u201C${a}\u201D \u2192 \u201C${b}\u201D`).join(", ")}.`, ...swapNotes, ...softNotes] });
      }
      const agreement = missing.filter((m) => extra.some((x) => [...inflections(x)].includes(m) && m !== x && /s$/.test(m)));
      if (agreement.length && missing.length === agreement.length && extra.length === agreement.length) {
        return result("grammar", { diff, notes: [`Concord\xE2ncia: o modelo usa \u201C${agreement.join("\u201D, \u201C")}\u201D. Na 3\xAA pessoa (he/she/it, my wife, the laptop) o verbo leva -s.`, ...softNotes], rules: ["E_AGREEMENT"] });
      }
      const missingContent = missing.filter((t) => !determiners.has(t));
      const extraContent = extra.filter((t) => !determiners.has(t));
      if (!missingContent.length && !extraContent.length) {
        if (missingSurf.length) return result("grammar", { diff, notes: [`Falta o artigo/determinante ${missingSurf.join(", ")}. Ex.: ${P.text}`, ...swapNotes, ...softNotes], rules: ["E_ARTICLE"] });
        if (view.swaps.length) return result("accepted_variant", { diff, notes: [`Aceito. ${swapNotes.join(" ")}`, ...softNotes] });
        return result("accepted_variant", { diff, notes: [`Aceito, com palavra a mais: ${extraSurf.join(", ")}.`, ...softNotes] });
      }
      const contentT = P.full.filter((t) => !stop2.has(t) && !determiners.has(t));
      const contentFound = P.full.filter((t, j) => matchedT.has(j) && !stop2.has(t) && !determiners.has(t));
      const coverage2 = contentT.length ? contentFound.length / contentT.length : pairs.length / Math.max(P.full.length, 1);
      const overlap = pairs.length;
      if (overlap === 0 || coverage2 < 0.5) {
        return result("meaning", { diff, coverage: coverage2, notes: [`A resposta n\xE3o cont\xE9m o essencial: ${missingSurf.slice(0, 4).join(", ") || "conte\xFAdo esperado"}.`, ...hard.map((h2) => "Al\xE9m disso: " + h2.msg), ...softNotes] });
      }
      return result("inconclusive", {
        diff,
        coverage: coverage2,
        notes: [`Diferen\xE7a em rela\xE7\xE3o ao modelo: ${missingSurf.length ? "o modelo tem " + missingSurf.join(", ") : ""}${missingSurf.length && extraSurf.length ? "; " : ""}${extraSurf.length ? "voc\xEA usou " + extraSurf.join(", ") : ""}. Se tiver certeza de que \xE9 equivalente, marque \u201CEu estava certo\u201D.`, ...swapNotes, ...softNotes]
      });
    }
    function coverage(answer, { keywords = [], items = [] } = {}) {
      const plain2 = numbersToDigits(expandContractions(wordTokens(answer)));
      const tokens = numbersToDigits(canonTimes(expandContractions(wordTokens(answer))));
      const bre = applyAmE(tokens).tokens;
      const syn = applySynonyms(bre).tokens;
      const has = (raw) => {
        const phrase = numbersToDigits(expandContractions(wordTokens(raw))).join(" ");
        return [bre, plain2, syn].some((t) => !!findPattern(phrase, t, { separable: true })) || !!findPattern(applySynonyms(wordTokens(phrase)).tokens.join(" "), syn, { separable: true });
      };
      const kw = keywords.map((group) => ({ group, ok: group.some((p) => has(String(p))) }));
      const it = items.map((x) => ({ id: x.id, en: x.en, ok: has((x.match || x.en).split(" / ")[0].replace(/…$/, "")) || (x.v || []).some((v) => has(v)) }));
      const all = [...kw.map((k) => k.ok), ...it.map((k) => k.ok)];
      const ratio = all.length ? all.filter(Boolean).length / all.length : 0;
      const hits = ruleHits(answer, "");
      return { keywords: kw, items: it, ratio, grammar: hits.map((h2) => ({ id: h2.id, msg: h2.msg, soft: !!h2.soft })), words: tokens.length };
    }
    const naturalness = (text) => naturalnessNotes({ text, ...prepare(text) });
    return { check, coverage, prepare, naturalness, isAccepted: (cls) => ACCEPTED.has(cls) };
  }

  // app/js/engine/scheduler.js
  var INTERVALS = [0, 1, 3, 7, 16, 35, 90];
  var MASTERED_BOX = 3;
  var DAY_MS = 864e5;
  function dayNumber(ts = Date.now()) {
    const d = new Date(ts);
    return Math.floor((ts - d.getTimezoneOffset() * 6e4) / DAY_MS);
  }
  var cardKey = (unit, id, skill) => `${unit}:${id}:${skill}`;
  function newCard(k, today) {
    return { k, box: 0, due: today, reps: 0, lapses: 0, streak: 0, last: null, lastResult: null, created: today };
  }
  function grade(card, outcome, today) {
    const c = { ...card, reps: card.reps + 1, last: today, lastResult: outcome };
    if (outcome === "good") {
      c.box = Math.min(INTERVALS.length - 1, card.box + 1);
      c.streak = card.streak + 1;
      c.due = today + INTERVALS[c.box];
    } else if (outcome === "ok") {
      c.box = Math.max(1, card.box);
      c.streak = 0;
      c.due = today + 1;
    } else {
      c.box = 0;
      c.streak = 0;
      c.lapses = card.lapses + 1;
      c.due = today;
    }
    return c;
  }
  var box = (cards, k) => cards[k] ? cards[k].box : -1;
  function unlockedNew(content, cards, focus) {
    const out = [];
    const inFocus = focusFilter(content, focus);
    const itemsOrdered = orderedItems(content, inFocus);
    for (const it of itemsOrdered) {
      const rec = cardKey("item", it.id, "rec");
      if (!cards[rec]) {
        out.push({ k: rec, unit: "item", id: it.id, skill: "rec", isNewItem: true });
        continue;
      }
      const rcl = cardKey("item", it.id, "rcl");
      if (!cards[rcl] && box(cards, rec) >= 2) out.push({ k: rcl, unit: "item", id: it.id, skill: "rcl" });
      const bld = cardKey("item", it.id, "bld");
      if (!cards[bld] && box(cards, rcl) >= 1 && it.sentences.length && ["collocation", "phrasal", "time", "professional"].includes(it.c)) out.push({ k: bld, unit: "item", id: it.id, skill: "bld" });
      const nat = cardKey("item", it.id, "nat");
      if (it.plain && it.sentences.length && !cards[nat] && box(cards, rec) >= 1) out.push({ k: nat, unit: "item", id: it.id, skill: "nat" });
    }
    for (const s of orderedSentences(content, inFocus)) {
      const ord = cardKey("sent", s.id, "ord");
      const itemsSeen = s.items.filter((i) => box(cards, cardKey("item", i, "rec")) >= 1).length;
      const ready = !s.items.length || itemsSeen / s.items.length >= 0.5;
      if (!cards[ord] && ready) out.push({ k: ord, unit: "sent", id: s.id, skill: "ord" });
      const wrt = cardKey("sent", s.id, "wrt");
      if (!cards[wrt] && box(cards, ord) >= 2) out.push({ k: wrt, unit: "sent", id: s.id, skill: "wrt" });
    }
    for (const b of Object.values(content.blocks).filter((b2) => inFocus.blocks.has(b2.id))) {
      const seq2 = cardKey("block", b.id, "seq");
      const allOrd = b.sentences.every((sid) => cards[cardKey("sent", sid, "ord")] && cards[cardKey("sent", sid, "ord")].reps > 0);
      if (!cards[seq2] && b.sentences.length > 1 && allOrd) out.push({ k: seq2, unit: "block", id: b.id, skill: "seq" });
      const tell = cardKey("block", b.id, "tell");
      const seqOk = b.sentences.length > 1 ? !!cards[seq2] && cards[seq2].reps > 0 : allOrd;
      if (!cards[tell] && seqOk) out.push({ k: tell, unit: "block", id: b.id, skill: "tell" });
    }
    for (const r of content.routines.filter((r2) => inFocus.routines.has(r2.id))) {
      const k = cardKey("routine", r.id, "retell");
      if (!cards[k] && r.blocks.every((b) => cards[cardKey("block", b, "tell")] && cards[cardKey("block", b, "tell")].reps > 0)) out.push({ k, unit: "routine", id: r.id, skill: "retell" });
    }
    for (const q of Object.values(content.questions).filter((q2) => inFocus.questions.has(q2.id))) {
      const k = cardKey("q", q.id, "conv");
      const routineStarted = !q.routine || content.routines.find((r) => r.id === q.routine).items.some((i) => cards[cardKey("item", i, "rec")]);
      if (!cards[k] && routineStarted) out.push({ k, unit: "q", id: q.id, skill: "conv" });
    }
    for (const l of Object.values(content.listening || {}).filter((x) => inFocus.routines.has(x.routine))) {
      const k = cardKey("lq", l.id, "lis");
      const started = content.routines.find((r) => r.id === l.routine).items.some((i) => cards[cardKey("item", i, "rec")]);
      if (!cards[k] && started) out.push({ k, unit: "lq", id: l.id, skill: "lis" });
    }
    for (const x of Object.values(content.reading || {}).filter((y) => inFocus.routines.has(y.routine))) {
      const k = cardKey("rq", x.id, "rdq");
      const r = content.routines.find((y) => y.id === x.routine);
      const listened = !(r.listening || []).length || r.listening.some((l) => cards[cardKey("lq", l, "lis")] && cards[cardKey("lq", l, "lis")].reps > 0);
      if (!cards[k] && listened) out.push({ k, unit: "rq", id: x.id, skill: "rdq" });
    }
    if (focus.stage === "listen") {
      for (const r of content.routines.filter((x) => inFocus.routines.has(x.id) && !(x.listening || []).length)) {
        const sids = r.blocks.flatMap((b) => content.blocks[b].sentences);
        if (sids.length < 2) continue;
        for (const sid of sids) {
          const k = cardKey("sent", sid, "lis");
          if (!cards[k]) out.push({ k, unit: "sent", id: sid, skill: "lis" });
        }
      }
    }
    if (inFocus.verbs) {
      for (const v of content.verbs) {
        const k = cardKey("verb", v.id, "vb3");
        if (!cards[k] && Object.keys(cards).length > 20) out.push({ k, unit: "verb", id: v.id, skill: "vb3" });
      }
    }
    return out;
  }
  function focusFilter(content, focus = {}) {
    const routines = /* @__PURE__ */ new Set();
    const blocks = /* @__PURE__ */ new Set();
    const items = /* @__PURE__ */ new Set();
    const questions = /* @__PURE__ */ new Set();
    const all = !focus.routine && !focus.context && !focus.category;
    const routineList2 = content.routines;
    if (focus.routine) routines.add(focus.routine);
    if (all) routineList2.forEach((r) => routines.add(r.id));
    for (const b of Object.values(content.blocks)) {
      if (routines.has(b.routine) || focus.context && b.ctx.includes(focus.context)) blocks.add(b.id);
    }
    for (const it of Object.values(content.items)) {
      if (it.tags.includes("grammar-model")) continue;
      const inCat = focus.category && it.c === focus.category;
      const inCtx = focus.context && it.ctx.includes(focus.context);
      const inRoutine = focus.routine && it.routines.includes(focus.routine);
      if (all || inCat || inCtx || inRoutine) items.add(it.id);
    }
    for (const q of Object.values(content.questions)) {
      if (q.openPersonal && !all && !focus.category && !content.journey && focus.stage !== "apply") continue;
      if (all || focus.routine && q.routine === focus.routine || focus.category === "qa" || focus.context && q.routine && content.routines.find((r) => r.id === q.routine).blocks.some((b) => content.blocks[b].ctx.includes(focus.context))) {
        questions.add(q.id);
      }
    }
    if (focus.category && !["qa", "sentence", "text"].includes(focus.category)) {
      blocks.clear();
      questions.clear();
    }
    if (focus.category === "qa") items.clear();
    if (focus.category === "sentence" || focus.category === "text") routineList2.forEach((r) => {
      routines.add(r.id);
      r.blocks.forEach((b) => blocks.add(b));
    });
    return { routines, blocks, items, questions, verbs: all || focus.category === "verb" };
  }
  function orderedItems(content, inFocus) {
    const order = /* @__PURE__ */ new Map();
    let n = 0;
    for (const r of content.routines) for (const b of r.blocks) for (const sid of content.blocks[b].sentences) {
      for (const i of content.sentences[sid].items) if (!order.has(i)) order.set(i, n++);
    }
    return [...inFocus.items].map((id) => content.items[id]).sort((a, b) => (order.get(a.id) ?? 1e6 + a.lvl * 1e3) - (order.get(b.id) ?? 1e6 + b.lvl * 1e3));
  }
  function orderedSentences(content, inFocus) {
    const out = [];
    for (const r of content.routines) for (const b of r.blocks) if (inFocus.blocks.has(b)) out.push(...content.blocks[b].sentences.map((s) => content.sentences[s]));
    return out;
  }
  function cardInContent(content, k) {
    const [unit, id] = k.split(":");
    return unit === "item" ? !!content.items[id] : unit === "sent" ? !!content.sentences[id] : unit === "block" ? !!content.blocks[id] : unit === "routine" ? content.routines.some((r) => r.id === id) : unit === "q" ? !!content.questions[id] : unit === "lq" ? !!(content.listening && content.listening[id]) : unit === "rq" ? !!(content.reading && content.reading[id]) : content.verbs.some((v) => v.id === id);
  }
  function buildSession(content, cards, { focus = {}, size = 12, maxNewItems = 4, today = dayNumber(), rand = Math.random, filter = null } = {}) {
    if (focus.stage && filter) return stageSession(content, cards, { focus, size, maxNewItems: Math.max(maxNewItems, 6), today, rand, filter });
    const inFocus = focusFilter(content, focus);
    const unitInFocus = (k) => {
      const [unit, id] = k.split(":");
      if (unit === "item") return inFocus.items.has(id);
      if (unit === "sent") return inFocus.blocks.has(content.sentences[id]?.block);
      if (unit === "block") return inFocus.blocks.has(id);
      if (unit === "routine") return inFocus.routines.has(id);
      if (unit === "q") return inFocus.questions.has(id);
      if (unit === "lq") return inFocus.routines.has(content.listening[id].routine);
      if (unit === "rq") return inFocus.routines.has(content.reading[id].routine);
      return inFocus.verbs;
    };
    const exists = (k) => cardInContent(content, k);
    const graduated = (k) => {
      const [unit, id, skill] = k.split(":");
      const up = { "item:rec": "rcl", "sent:ord": "wrt", "block:seq": "tell" }[`${unit}:${skill}`];
      return !!up && box(cards, cardKey(unit, id, up)) >= 2;
    };
    const toEntry = (c) => {
      const [unit, id, skill] = c.k.split(":");
      return { k: c.k, unit, id, skill, review: true };
    };
    const due = Object.values(cards).filter((c) => c.due <= today && exists(c.k) && !graduated(c.k)).sort((a, b) => unitInFocus(b.k) - unitInFocus(a.k) || a.due - b.due || a.box - b.box || rand() - 0.5).map(toEntry);
    const fresh = unlockedNew(content, cards, focus);
    const newItems = fresh.filter((f) => f.isNewItem).map((f) => ({ ...f, learn: true }));
    const higher = roundRobin(fresh.filter((f) => !f.isNewItem && f.skill !== "conv"), (f) => f.skill, ["lis", "retell", "tell", "rdq", "seq", "wrt", "ord", "nat", "rcl", "bld", "vb3"]);
    const conv = fresh.filter((f) => f.skill === "conv");
    const queue = [];
    const take = (list, n) => {
      const out = list.splice(0, Math.max(0, n));
      queue.push(...out);
      return out.length;
    };
    const reviewQuota = Math.round(size * (due.length > 30 ? 0.7 : 0.5));
    const higherQuota = Math.round(size * 0.25);
    const freed = reviewQuota - take(due, reviewQuota);
    take(higher, higherQuota + freed);
    const backlog = due.length;
    const newQuota = Math.min(backlog > 20 ? 1 : backlog > 8 ? 2 : maxNewItems + (queue.length <= 2 ? 2 : 0), size - queue.length - (conv.length && !queue.some((q) => q.skill === "conv") ? 1 : 0));
    take(newItems, newQuota);
    if (!queue.some((q) => q.skill === "conv")) take(conv, 1);
    take(due, size - queue.length);
    take(higher, size - queue.length);
    take(newItems, Math.min(size - queue.length, Math.max(0, maxNewItems + 2 - queue.filter((q) => q.learn).length)));
    return interleave(queue, rand);
  }
  function stageSession(content, cards, { focus, size, maxNewItems, today, rand, filter }) {
    const exists = (k) => cardInContent(content, k);
    const due = Object.values(cards).filter((c) => c.due <= today && exists(c.k)).map((c) => {
      const [unit, id, skill] = c.k.split(":");
      return { k: c.k, unit, id, skill, review: true, due: c.due, box: c.box };
    }).filter(filter).sort((a, b) => a.due - b.due || a.box - b.box || rand() - 0.5);
    const fresh = unlockedNew(content, cards, focus).filter(filter);
    const newItems = fresh.filter((f) => f.isNewItem).map((f) => ({ ...f, learn: true }));
    const higher = roundRobin(fresh.filter((f) => !f.isNewItem), (f) => f.skill, ["lis", "rdq", "conv", "ord", "wrt", "seq", "tell", "retell", "nat", "rcl", "bld"]);
    const queue = [];
    const take = (list, n) => queue.push(...list.splice(0, Math.max(0, n)));
    take(due, Math.round(size / 2));
    take(higher, size - queue.length - Math.min(newItems.length, maxNewItems + 2));
    take(newItems, Math.min(maxNewItems + 2, size - queue.length));
    take(due, size - queue.length);
    take(higher, size - queue.length);
    return interleave(queue.map(({ due: _d, box: _b, ...e }) => e), rand);
  }
  function roundRobin(list, keyFn, priority = []) {
    const groups = /* @__PURE__ */ new Map();
    for (const x of list) {
      const k = keyFn(x);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(x);
    }
    const out = [];
    const rank = (k) => priority.includes(k) ? priority.indexOf(k) : priority.length;
    const lists = [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([, g]) => g);
    for (let i = 0; out.length < list.length; i++) for (const g of lists) if (g[i]) out.push(g[i]);
    return out;
  }
  function interleave(queue, rand) {
    let order = 0;
    const weight = (q) => (q.learn ? order++ * 0.01 : ["rec"].includes(q.skill) ? 1 : ["rcl", "vb3"].includes(q.skill) ? 2 : ["bld", "ord", "lis"].includes(q.skill) ? 3 : ["wrt", "seq", "rdq"].includes(q.skill) ? 4 : 5) + rand() * 1.5;
    return queue.map((q) => [weight(q), q]).sort((a, b) => a[0] - b[0]).map(([, q]) => q);
  }
  function mastery(cards, keys) {
    if (!keys.length) return { seen: 0, mastered: 0, total: 0, ratio: 0 };
    let seen = 0, mastered = 0;
    for (const k of keys) {
      const c = cards[k];
      if (c) {
        seen++;
        if (c.box >= MASTERED_BOX) mastered++;
      }
    }
    return { seen, mastered, total: keys.length, ratio: (seen * 0.3 + mastered * 0.7) / keys.length };
  }

  // app/js/engine/profiles.js
  var PROGRESS_KEYS = ["cards", "log", "days", "xp", "achievements", "myAnswers", "pending", "recordingsMeta", "checklist", "difficultWords", "favorites", "firstDay"];
  var OBJ = ["cards", "days", "achievements", "myAnswers", "recordingsMeta", "checklist", "difficultWords", "favorites"];
  var ARR = ["log", "pending"];
  var journeyProfile = (journeyId) => `journey:${journeyId}`;
  var profileIdFor = (characterId, journeyId) => journeyId ? journeyProfile(journeyId) : characterId || "lucas";
  function emptyProgress(today) {
    return { cards: {}, log: [], days: {}, xp: 0, achievements: {}, myAnswers: {}, pending: [], recordingsMeta: {}, checklist: {}, difficultWords: {}, favorites: {}, firstDay: today };
  }
  function cleanProgress(p, today, repairs = []) {
    const out = { ...emptyProgress(today), ...p && typeof p === "object" ? p : {} };
    for (const k of OBJ) if (!out[k] || typeof out[k] !== "object" || Array.isArray(out[k])) {
      repairs.push(k);
      out[k] = {};
    }
    for (const k of ARR) if (!Array.isArray(out[k])) {
      repairs.push(k);
      out[k] = [];
    }
    if (typeof out.xp !== "number" || !isFinite(out.xp) || out.xp < 0) {
      repairs.push("xp");
      out.xp = Object.values(out.days).reduce((n, d) => n + (d && d.xp || 0), 0);
    }
    if (typeof out.firstDay !== "number") out.firstDay = today;
    for (const [k, c] of Object.entries(out.cards)) {
      if (!c || typeof c.box !== "number" || typeof c.due !== "number") {
        delete out.cards[k];
        repairs.push("card");
      } else c.k = k;
    }
    return out;
  }
  function syncActive(state) {
    const id = state.activeProfile;
    if (!id) return state;
    const p = state.profiles[id] || (state.profiles[id] = {});
    for (const k of PROGRESS_KEYS) if (k in state) p[k] = state[k];
    return state;
  }
  function activate(state, id, today) {
    syncActive(state);
    if (!state.profiles[id]) state.profiles[id] = emptyProgress(today ?? state.firstDay ?? 0);
    const p = state.profiles[id];
    for (const k of PROGRESS_KEYS) state[k] = p[k];
    state.activeProfile = id;
    return state;
  }
  function progressOf(state, id) {
    if (id === state.activeProfile) return Object.fromEntries(PROGRESS_KEYS.map((k) => [k, state[k]]));
    return state.profiles[id] || null;
  }
  function toStored(state) {
    syncActive(state);
    const out = {};
    for (const [k, v] of Object.entries(state)) if (!PROGRESS_KEYS.includes(k)) out[k] = v;
    return out;
  }
  function splitLegacy(raw, { ownerOf = () => "lucas", today = 0 } = {}) {
    const repairs = [];
    const legacy = cleanProgress(Object.fromEntries(PROGRESS_KEYS.filter((k) => k in raw).map((k) => [k, raw[k]])), raw.firstDay ?? today, repairs);
    const profiles = { lucas: { ...legacy, cards: {}, log: [], myAnswers: {}, recordingsMeta: {}, pending: [], favorites: {} } };
    const get = (id) => profiles[id] || (profiles[id] = emptyProgress(legacy.firstDay));
    const idOf = (key) => {
      const parts = String(key).split(":");
      return parts.length >= 2 ? parts[1] : parts[0];
    };
    for (const [k, c] of Object.entries(legacy.cards)) get(ownerOf(k, idOf(k)) || "lucas").cards[k] = c;
    for (const e of legacy.log) get(e && e.k && ownerOf(e.k, idOf(e.k)) || "lucas").log.push(e);
    for (const [qid, a] of Object.entries(legacy.myAnswers)) get(ownerOf(`q:${qid}:conv`, qid) || "lucas").myAnswers[qid] = a;
    for (const [t, m] of Object.entries(legacy.recordingsMeta)) get(ownerOf(t, idOf(t)) || "lucas").recordingsMeta[t] = m;
    for (const p of legacy.pending) get(p && p.key && ownerOf(p.key, idOf(p.key)) || "lucas").pending.push(p);
    return { profiles, repairs };
  }
  var UNIT_FIELD = { item: "items", sent: "sentences", block: "blocks", q: "questions", lq: "listening", rq: "reading" };
  function makeOwnerOf(views3) {
    return (key, id) => {
      const unit = String(key).split(":")[0];
      for (const { profile, content } of views3) {
        if (!content) continue;
        if (unit === "routine" ? (content.routines || []).some((r) => r.id === id) : UNIT_FIELD[unit] && content[UNIT_FIELD[unit]] && content[UNIT_FIELD[unit]][id]) return profile;
      }
      return "lucas";
    };
  }

  // app/js/engine/progress.js
  var SCHEMA = 2;
  var SKILL_XP = { rec: 6, rcl: 10, bld: 10, ord: 8, wrt: 14, seq: 10, tell: 20, retell: 35, conv: 18, vb3: 6, learn: 2 };
  var MAX_REWARDS_PER_CARD_DAY = 2;
  var RECORDING_XP = 5;
  var RECORDING_DAILY_CAP = 50;
  var SESSION_XP = 20;
  var SESSION_BONUS_PER_DAY = 3;
  function freshState(contentVersion) {
    const today = dayNumber();
    const state = {
      schema: SCHEMA,
      contentVersion,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userVariants: {},
      lastBackupAt: null,
      profiles: { lucas: emptyProgress(today) },
      activeProfile: null,
      settings: { audioSource: "embedded", voiceURI: "", rate: 1, autoplay: true, fontScale: 1, theme: "auto", reduceMotion: false, dailyGoal: 12, character: "lucas", characterChosen: false, journey: null }
    };
    return activate(state, "lucas", today);
  }
  function day(state, today) {
    if (!state.days[today]) state.days[today] = { xp: 0, ex: 0, good: 0, bad: 0, sessions: 0, rec: 0, recXp: 0, rewarded: {}, effort: {} };
    return state.days[today];
  }
  var levelForXp = (xp) => {
    let n = 1;
    while (xp >= 50 * n * (n + 1)) n++;
    return { level: n, from: 50 * n * (n - 1), to: 50 * n * (n + 1) };
  };
  function recordAnswer(state, k, outcome, opts = {}) {
    const today = opts.today ?? dayNumber();
    const d = day(state, today);
    const prev = state.cards[k] || newCard(k, today);
    const card = grade(prev, outcome, today);
    state.cards[k] = card;
    d.ex++;
    if (outcome === "bad") d.bad++;
    else d.good++;
    const skill = k.split(":")[2];
    let xp = 0;
    const rewardedTimes = d.rewarded[k] || 0;
    if (outcome !== "bad" && rewardedTimes < MAX_REWARDS_PER_CARD_DAY) {
      xp = SKILL_XP[skill] || 6;
      if (outcome === "ok") xp = Math.round(xp * 0.6);
      if (opts.hintUsed) xp = Math.round(xp * 0.7);
      if (rewardedTimes === 1) xp = Math.round(xp * 0.5);
      d.rewarded[k] = rewardedTimes + 1;
      if (prev.box < MASTERED_BOX && card.box >= MASTERED_BOX) xp += 15;
    } else if (outcome === "bad" && !d.effort[k]) {
      xp = 2;
      d.effort[k] = 1;
    }
    d.xp += xp;
    state.xp += xp;
    state.log.push({ t: Date.now(), k, o: outcome, c: opts.cls || null, a: opts.answer ? String(opts.answer).slice(0, 300) : void 0, h: opts.hintUsed ? 1 : void 0 });
    if (state.log.length > 3e3) state.log.splice(0, state.log.length - 3e3);
    state.updatedAt = Date.now();
    return { xp, card, events: checkAchievements(state, today) };
  }
  function recordLearn(state, itemId, today = dayNumber()) {
    const d = day(state, today);
    const key = `learn:${itemId}`;
    if (d.rewarded[key] || state.cards[`item:${itemId}:rec`]) return 0;
    d.rewarded[key] = 1;
    d.xp += SKILL_XP.learn;
    state.xp += SKILL_XP.learn;
    return SKILL_XP.learn;
  }
  function recordSession(state, summary, today = dayNumber()) {
    const d = day(state, today);
    d.sessions++;
    let xp = 0;
    if (d.sessions <= SESSION_BONUS_PER_DAY && summary.count >= 5) xp = SESSION_XP;
    d.xp += xp;
    state.xp += xp;
    state.updatedAt = Date.now();
    return { xp, events: checkAchievements(state, today, summary) };
  }
  function recordRecording(state, targetId, meta, today = dayNumber()) {
    const d = day(state, today);
    d.rec++;
    state.recordingsMeta[targetId] = { ...meta, at: Date.now(), count: ((state.recordingsMeta[targetId] || {}).count || 0) + 1 };
    let xp = 0;
    const key = `recxp:${targetId}`;
    if (!d.rewarded[key] && d.recXp < RECORDING_DAILY_CAP) {
      xp = RECORDING_XP;
      d.rewarded[key] = 1;
      d.recXp += xp;
    }
    d.xp += xp;
    state.xp += xp;
    state.updatedAt = Date.now();
    return { xp, events: checkAchievements(state, today) };
  }
  function forgetRecording(state, targetId) {
    delete state.recordingsMeta[targetId];
    state.updatedAt = Date.now();
  }
  function updatePracticeWords(state, targetId, attempt) {
    if (!attempt || !attempt.conclusive) return;
    const dw = state.difficultWords = state.difficultWords || {};
    for (const x of attempt.list) {
      const cur = dw[x.key];
      dw[x.key] = { ...cur || {}, at: Date.now(), from: cur && cur.from || targetId, auto: cur ? !!cur.auto : true, misses: (cur && cur.misses || 0) + 1, okStreak: 0 };
    }
    for (const k of attempt.goodKeys) {
      const cur = dw[k];
      if (!cur || !cur.auto) continue;
      cur.okStreak = (cur.okStreak || 0) + 1;
      if (cur.okStreak >= 2) delete dw[k];
    }
    state.updatedAt = Date.now();
  }
  function streak(state, today = dayNumber()) {
    const active2 = (n2) => !!state.days[n2] && (state.days[n2].sessions > 0 || state.days[n2].ex >= 5);
    let n = active2(today) ? today : today - 1;
    let count = 0;
    let lastSkip = Infinity;
    while (n >= state.firstDay) {
      if (active2(n)) {
        count++;
        n--;
        continue;
      }
      if (lastSkip - n >= 7 && active2(n - 1)) {
        lastSkip = n;
        n--;
        continue;
      }
      break;
    }
    return { days: count, today: active2(today) };
  }
  var ACHIEVEMENTS = [
    { id: "first-session", icon: "\u{1F331}", title: "Primeira sess\xE3o", desc: "Concluiu a primeira sess\xE3o." },
    { id: "items-10", icon: "\u{1F9E9}", title: "10 itens dominados", desc: "10 itens na caixa 3 ou mais." },
    { id: "items-50", icon: "\u{1F3D7}\uFE0F", title: "50 itens dominados", desc: "Repert\xF3rio em constru\xE7\xE3o." },
    { id: "items-100", icon: "\u{1F3DB}\uFE0F", title: "100 itens dominados", desc: "Repert\xF3rio s\xF3lido." },
    { id: "streak-3", icon: "\u{1F525}", title: "3 dias seguidos", desc: "Consist\xEAncia come\xE7a aqui." },
    { id: "streak-7", icon: "\u{1F4C5}", title: "Uma semana", desc: "7 dias de estudo." },
    { id: "streak-30", icon: "\u{1F3C6}", title: "Um m\xEAs", desc: "30 dias de estudo." },
    { id: "first-recording", icon: "\u{1F399}\uFE0F", title: "Primeira grava\xE7\xE3o", desc: "Ouviu a pr\xF3pria voz." },
    { id: "recordings-25", icon: "\u{1F3A7}", title: "25 grava\xE7\xF5es", desc: "Pr\xE1tica oral frequente." },
    { id: "first-block", icon: "\u{1F9F1}", title: "Primeiro bloco", desc: "Contou um bloco do dia sem o texto." },
    { id: "routine1-blocks", icon: "\u2B50", title: "Rotina 1 em blocos", desc: "Contou todos os blocos da Rotina 1." },
    { id: "first-retell", icon: "\u{1F5E3}\uFE0F", title: "Rotina completa", desc: "Contou uma rotina inteira." },
    { id: "teacher-10", icon: "\u{1F469}\u200D\u{1F3EB}", title: "10 perguntas", desc: "Respondeu 10 perguntas da teacher." },
    { id: "xp-1000", icon: "\u{1F48E}", title: "1.000 XP", desc: "Muito treino acumulado." },
    { id: "perfect", icon: "\u{1F3AF}", title: "Sess\xE3o impec\xE1vel", desc: "Sess\xE3o com 10+ exerc\xEDcios sem erro." }
  ];
  function checkAchievements(state, today, summary) {
    const got = [];
    const unlock = (id) => {
      if (!state.achievements[id]) {
        state.achievements[id] = Date.now();
        got.push(ACHIEVEMENTS.find((a) => a.id === id));
      }
    };
    const cards = Object.values(state.cards);
    const masteredItems = cards.filter((c) => c.k.startsWith("item:") && c.box >= MASTERED_BOX).length;
    if (Object.values(state.days).some((d) => d.sessions > 0)) unlock("first-session");
    if (masteredItems >= 10) unlock("items-10");
    if (masteredItems >= 50) unlock("items-50");
    if (masteredItems >= 100) unlock("items-100");
    const s = streak(state, today).days;
    if (s >= 3) unlock("streak-3");
    if (s >= 7) unlock("streak-7");
    if (s >= 30) unlock("streak-30");
    const recs = Object.values(state.days).reduce((n, d) => n + d.rec, 0);
    if (recs >= 1) unlock("first-recording");
    if (recs >= 25) unlock("recordings-25");
    const told = cards.filter((c) => c.k.endsWith(":tell") && c.reps > 0 && c.lastResult !== "bad");
    if (told.length) unlock("first-block");
    const r1 = ["R01-B1", "R01-B2", "R01-B3", "R01-B4", "R01-B5", "R01-B6", "R01-B7"];
    if (r1.every((b) => state.cards[`block:${b}:tell`] && state.cards[`block:${b}:tell`].box >= 1)) unlock("routine1-blocks");
    if (cards.some((c) => c.k.endsWith(":retell") && c.box >= 1)) unlock("first-retell");
    if (cards.filter((c) => c.k.endsWith(":conv") && c.reps > 0).length >= 10) unlock("teacher-10");
    if (state.xp >= 1e3) unlock("xp-1000");
    if (summary && summary.count >= 10 && summary.bad === 0) unlock("perfect");
    return got.filter(Boolean);
  }
  function migrate(raw, contentVersion, { ownerOf } = {}) {
    if (!raw || typeof raw !== "object") throw new Error("Estado ausente ou inv\xE1lido");
    if (typeof raw.schema !== "number") throw new Error("Arquivo sem vers\xE3o de esquema");
    if (raw.schema > SCHEMA) throw new Error(`Backup de uma vers\xE3o mais nova do app (esquema ${raw.schema})`);
    const today = dayNumber();
    const base = freshState(contentVersion);
    const rawSettings = raw.settings && typeof raw.settings === "object" && !Array.isArray(raw.settings) ? raw.settings : {};
    const repairs = [];
    if ("settings" in raw && rawSettings !== raw.settings) repairs.push("settings");
    const s = {
      schema: SCHEMA,
      contentVersion,
      createdAt: raw.createdAt || base.createdAt,
      updatedAt: raw.updatedAt || base.updatedAt,
      userVariants: raw.userVariants,
      lastBackupAt: raw.lastBackupAt ?? null,
      settings: { ...base.settings, ...rawSettings }
    };
    for (const [k, v] of Object.entries(raw)) if (!(k in s) && !["profiles", "activeProfile"].includes(k) && !PROGRESS_KEYS.includes(k)) s[k] = v;
    if (typeof rawSettings.characterChosen !== "boolean") s.settings.characterChosen = true;
    if (typeof s.settings.character !== "string") s.settings.character = "lucas";
    if (!s.userVariants || typeof s.userVariants !== "object" || Array.isArray(s.userVariants)) {
      if ("userVariants" in raw) repairs.push("userVariants");
      s.userVariants = {};
    }
    if (raw.schema === 1) {
      const split = splitLegacy(raw, { ownerOf, today });
      repairs.push(...split.repairs);
      s.profiles = split.profiles;
      s.migratedFrom = 1;
    } else {
      let ps = raw.profiles && typeof raw.profiles === "object" && !Array.isArray(raw.profiles) ? raw.profiles : null;
      if (!ps) repairs.push("profiles");
      const live2 = PROGRESS_KEYS.filter((k) => k in raw);
      if (live2.length && typeof raw.activeProfile === "string") {
        ps = { ...ps || {}, [raw.activeProfile]: { ...(ps || {})[raw.activeProfile] || {}, ...Object.fromEntries(live2.map((k) => [k, raw[k]])) } };
      }
      s.profiles = {};
      for (const [id, p] of Object.entries(ps || {})) s.profiles[id] = cleanProgress(p, today, repairs);
      if (!s.profiles.lucas) s.profiles.lucas = emptyProgress(today);
    }
    s.activeProfile = null;
    activate(s, profileIdFor(s.settings.character, s.settings.journey), today);
    if (repairs.length) Object.defineProperty(s, "_repairs", { value: [...new Set(repairs)], enumerable: false });
    return s;
  }

  // app/js/engine/retention.js
  var RETENTION_DAYS = 7;
  var RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1e3;
  var FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1e3;
  function retentionStatus(recordedAt, now = Date.now()) {
    if (typeof recordedAt !== "number" || !Number.isFinite(recordedAt) || recordedAt <= 0) return "invalid";
    if (recordedAt > now + FUTURE_TOLERANCE_MS) return "invalid";
    return now - recordedAt >= RETENTION_MS ? "expire" : "keep";
  }

  // app/js/store/db.js
  var DB_NAME = "drg";
  var DB_VERSION = 2;
  var LS_KEY = "drg.state";
  var dbPromise = null;
  var backend = "none";
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in globalThis)) return reject(new Error("IndexedDB indispon\xEDvel"));
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (ev) => {
        const db = req.result;
        if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
        if (!db.objectStoreNames.contains("recordings")) db.createObjectStore("recordings");
        if (!db.objectStoreNames.contains("audio")) db.createObjectStore("audio");
        if (ev.oldVersion >= 1 && ev.oldVersion < 2) {
          const t = req.transaction;
          const recs = t.objectStore("recordings"), audio = t.objectStore("audio");
          recs.openCursor().onsuccess = (e) => {
            const cur = e.target.result;
            if (!cur) return;
            const v = cur.value || {};
            if (v.blob instanceof Blob) {
              const recordedAt = typeof v.at === "number" ? v.at : null;
              audio.put({ blob: v.blob, bytes: v.blob.size, type: v.blob.type, recordedAt }, cur.key);
              cur.update({ meta: v.meta || null, recordedAt, at: v.at || null, audio: true, migratedFrom: 1 });
            }
            cur.continue();
          };
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("IndexedDB bloqueado"));
    });
    return dbPromise;
  }
  function tx(store, mode, fn) {
    return openDb().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      let out;
      Promise.resolve(fn(t.objectStore(store))).then((r) => {
        out = r;
      });
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error("transa\xE7\xE3o abortada"));
    }));
  }
  var reqP = (r) => new Promise((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  async function loadState(contentVersion, opts = {}) {
    let raw = null;
    let problem = null;
    try {
      raw = await tx("kv", "readonly", (s) => reqP(s.get("state")));
      backend = "indexeddb";
    } catch (e) {
      backend = "localstorage";
      try {
        raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      } catch (e2) {
        problem = "N\xE3o foi poss\xEDvel ler o progresso salvo.";
      }
    }
    if (!raw) return { state: freshState(contentVersion), isNew: true, problem };
    try {
      const state = migrate(raw, contentVersion, opts);
      if (raw.contentVersion !== contentVersion || raw.schema !== state.schema) await saveCopy("state.prev", raw);
      if (state._repairs) {
        await saveCopy("state.corrupt", raw);
        problem = `Parte do progresso salvo estava danificada (${state._repairs.join(", ")}) e foi reparada; uma c\xF3pia do original foi guardada. Se tiver backup recente, voc\xEA pode import\xE1-lo em Ajustes.`;
      }
      return { state, isNew: false, problem };
    } catch (e) {
      await saveCopy("state.corrupt", raw);
      return { state: freshState(contentVersion), isNew: true, problem: "O progresso salvo estava inv\xE1lido e foi guardado \xE0 parte; um novo progresso foi iniciado. Se tiver backup, importe-o em Ajustes." };
    }
  }
  async function saveCopy(key, value) {
    try {
      await tx("kv", "readwrite", (s) => s.put(value, key));
    } catch (e) {
    }
  }
  var pending = null;
  var saving = Promise.resolve();
  function saveState(state) {
    state.updatedAt = Date.now();
    const snapshot = JSON.parse(JSON.stringify(toStored(state)));
    saving = saving.then(async () => {
      if (backend === "indexeddb") {
        try {
          await tx("kv", "readwrite", (s) => s.put(snapshot, "state"));
          return;
        } catch (e) {
          backend = "localstorage";
        }
      }
      localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    }).catch((e) => {
      console.error("Falha ao salvar", e);
      throw e;
    });
    return saving;
  }
  function saveSoon(state) {
    clearTimeout(pending);
    pending = setTimeout(() => saveState(state), 400);
  }
  function flush(state) {
    clearTimeout(pending);
    return saveState(state);
  }
  async function wipeState() {
    try {
      await tx("kv", "readwrite", (s) => {
        s.delete("state");
      });
    } catch (e) {
    }
    try {
      await txs(["audio", "recordings"], "readwrite", (a, r) => {
        a.clear();
        r.clear();
      });
    } catch (e) {
    }
    try {
      localStorage.removeItem(LS_KEY);
    } catch (e) {
    }
  }
  var txs = (stores, mode, fn) => openDb().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(stores, mode);
    let out;
    let ret;
    try {
      ret = fn(...stores.map((n) => t.objectStore(n)));
    } catch (e) {
      try {
        t.abort();
      } catch (e2) {
      }
      reject(e);
      return;
    }
    Promise.resolve(ret).then((r) => {
      out = r;
    });
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error("transa\xE7\xE3o abortada"));
  }));
  async function putRecording(id, blob, meta, { now = Date.now() } = {}) {
    if (backend !== "indexeddb") throw new Error("Grava\xE7\xF5es n\xE3o podem ser salvas neste modo de execu\xE7\xE3o");
    return txs(["audio", "recordings"], "readwrite", (audio, recs) => {
      audio.put({ blob, bytes: blob.size, type: blob.type, recordedAt: now }, id);
      recs.put({ meta: meta || null, recordedAt: now, at: now, audio: true }, id);
    });
  }
  async function updateRecordingMeta(id, patch) {
    if (backend !== "indexeddb") return;
    return txs(["recordings"], "readwrite", (recs) => new Promise((res) => {
      const r = recs.get(id);
      r.onsuccess = () => {
        if (r.result) recs.put({ ...r.result, meta: { ...r.result.meta || {}, ...patch } }, id);
        res();
      };
      r.onerror = () => res();
    }));
  }
  async function getRecording(id) {
    try {
      return await txs(["audio", "recordings"], "readonly", (audio, recs) => Promise.all([reqP(audio.get(id)), reqP(recs.get(id))]).then(([a, r]) => {
        if (!r && !a) return null;
        return { blob: a ? a.blob : null, meta: r ? r.meta : null, at: a && a.recordedAt || r && r.recordedAt || null, recordedAt: a && a.recordedAt || r && r.recordedAt || null, audioExpiredAt: r && r.audioExpiredAt ? r.audioExpiredAt : null };
      }));
    } catch (e) {
      return null;
    }
  }
  async function deleteRecording(id) {
    try {
      await txs(["audio", "recordings"], "readwrite", (audio, recs) => {
        audio.delete(id);
        recs.delete(id);
      });
    } catch (e) {
    }
  }
  async function recordingsUsage() {
    try {
      return await txs(["audio", "recordings"], "readonly", (audio, recs) => Promise.all([reqP(audio.getAll()), reqP(audio.getAllKeys()), reqP(recs.getAllKeys())]).then(([all, aKeys, rKeys]) => {
        const withAudio = new Set(aKeys);
        return { count: all.length, bytes: all.reduce((n, a) => n + (a && a.blob ? a.blob.size : 0), 0), textOnly: rKeys.filter((k) => !withAudio.has(k)).length };
      }));
    } catch (e) {
      return { count: 0, bytes: 0, textOnly: 0 };
    }
  }
  async function pruneRecordings({ now = Date.now() } = {}) {
    const report = { checked: 0, removed: [], invalid: [], bytesFreed: 0 };
    if (backend !== "indexeddb") return report;
    try {
      await txs(["audio", "recordings", "kv"], "readwrite", (audio, recs, kv) => new Promise((res) => {
        const cur = audio.openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (!c) {
            if (report.invalid.length) kv.put({ at: now, items: report.invalid }, "diag.retention");
            return res();
          }
          report.checked++;
          const v = c.value || {};
          const st = retentionStatus(v.recordedAt, now);
          if (st === "expire") {
            report.removed.push(c.key);
            report.bytesFreed += v.blob ? v.blob.size : 0;
            const key = c.key;
            c.delete();
            const g = recs.get(key);
            g.onsuccess = () => {
              const r = g.result || { meta: null, recordedAt: v.recordedAt, at: v.recordedAt };
              recs.put({ ...r, audio: false, audioExpiredAt: now }, key);
            };
          } else if (st === "invalid") {
            report.invalid.push({ key: c.key, recordedAt: v.recordedAt === void 0 ? null : v.recordedAt });
          }
          c.continue();
        };
        cur.onerror = () => res();
      }));
    } catch (e) {
      report.error = e.message;
    }
    return report;
  }
  async function kvUsage() {
    try {
      return await txs(["kv"], "readonly", (kv) => Promise.all([reqP(kv.getAllKeys()), reqP(kv.getAll())]).then(([keys, vals]) => keys.map((k, i) => ({ key: k, bytes: new Blob([JSON.stringify(vals[i])]).size }))));
    } catch (e) {
      return [];
    }
  }
  function exportBackup(state) {
    const data = { app: "daily-routine-english-game", schema: state.schema, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), state: toStored(state) };
    return new Blob([JSON.stringify(data)], { type: "application/json" });
  }
  async function parseBackup(file, contentVersion, opts = {}) {
    const text = await file.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("O arquivo n\xE3o \xE9 um JSON v\xE1lido.");
    }
    if (data.app !== "daily-routine-english-game" || !data.state) throw new Error("Este arquivo n\xE3o \xE9 um backup deste app.");
    return migrate(data.state, contentVersion, opts);
  }
  async function keepPrevious(state) {
    await saveCopy("state.beforeImport", JSON.parse(JSON.stringify(toStored(state))));
  }
  async function requestPersistence() {
    try {
      if (navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()) return true;
      if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
    } catch (e) {
    }
    return false;
  }

  // app/js/audio/player.js
  var files = () => globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.files || {};
  var settings = { audioSource: "embedded", voiceURI: "", rate: 1 };
  var current = null;
  var gen = 0;
  var voices = [];
  var listeners = /* @__PURE__ */ new Set();
  function configure(s) {
    settings = { ...settings, ...s };
  }
  var hasEmbedded = (key) => !!key && key in files();
  var embeddedCount = () => Object.keys(files()).length;
  var emit = (st) => listeners.forEach((fn) => fn(st));
  function loadVoices() {
    if (!("speechSynthesis" in globalThis)) return Promise.resolve([]);
    return new Promise((resolve) => {
      const done = () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      };
      const v = speechSynthesis.getVoices();
      if (v.length) {
        voices = v;
        return resolve(v);
      }
      speechSynthesis.addEventListener("voiceschanged", done, { once: true });
      setTimeout(done, 2e3);
    });
  }
  var englishVoices = () => voices.filter((v) => /^en[-_]/i.test(v.lang)).sort((a, b) => /GB/i.test(b.lang) - /GB/i.test(a.lang) || b.localService - a.localService || a.name.localeCompare(b.name));
  function pickVoice() {
    const en = englishVoices();
    return en.find((v) => v.voiceURI === settings.voiceURI) || en.find((v) => /GB/i.test(v.lang) && v.localService) || en.find((v) => /GB/i.test(v.lang)) || en[0] || null;
  }
  function stop() {
    gen++;
    if (current) {
      const c = current;
      current = null;
      c.cancel();
    }
    if ("speechSynthesis" in globalThis) speechSynthesis.cancel();
    emit({ playing: false });
  }
  var generation = () => gen;
  function release(a) {
    try {
      a.pause();
      a.removeAttribute("src");
      a.load();
    } catch (e) {
    }
  }
  function playFile(key, rate) {
    return new Promise((resolve) => {
      const a = new Audio(`audio/${key}.ogg`);
      a.playbackRate = rate;
      a.preservesPitch = true;
      let settled = false;
      const finish = (ok, reason) => {
        if (!settled) {
          settled = true;
          resolve({ ok, reason });
        }
      };
      a.onended = () => {
        if (current && current.audio === a) current = null;
        release(a);
        finish(true);
      };
      a.onerror = () => {
        if (current && current.audio === a) current = null;
        finish(false, "arquivo");
      };
      current = { kind: "file", audio: a, cancel: () => {
        a.onended = a.onerror = null;
        release(a);
        finish(true, "cancel");
      } };
      a.play().catch((e) => finish(false, e.name));
    });
  }
  function speak(text, rate) {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in globalThis)) return resolve({ ok: false, reason: "sem-tts" });
      const u = new SpeechSynthesisUtterance(text.replace(/…/g, ""));
      const v = pickVoice();
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      } else u.lang = "en-GB";
      u.rate = rate;
      let settled = false;
      const finish = (ok, reason) => {
        if (current && current.u === u) current = null;
        if (!settled) {
          settled = true;
          resolve({ ok, reason });
        }
      };
      u.onend = () => finish(true);
      u.onerror = (e) => finish(e.error === "interrupted" || e.error === "canceled", e.error);
      current = { kind: "speech", u, cancel: () => finish(true, "cancel") };
      speechSynthesis.speak(u);
    });
  }
  async function play(clip, { rate } = {}) {
    stop();
    const my = gen;
    const r = rate || settings.rate || 1;
    emit({ playing: true, clip });
    let res = { ok: false };
    if (settings.audioSource !== "system" && hasEmbedded(clip.key)) {
      res = await playFile(clip.key, r);
      if (res.ok) {
        emit({ playing: false });
        return { ok: true, via: "embedded" };
      }
    }
    if (my !== gen) return { ok: false, reason: "cancel" };
    if (clip.text) {
      if (!voices.length) await loadVoices();
      if (my !== gen) return { ok: false, reason: "cancel" };
      res = await speak(clip.text, r);
      if (res.ok) {
        emit({ playing: false });
        return { ok: true, via: "system" };
      }
    }
    emit({ playing: false });
    return { ok: false, reason: res.reason || "indispon\xEDvel" };
  }
  var seqId = 0;
  async function playSequence(clips, { rate, onIndex, gapMs = 250 } = {}) {
    const id = ++seqId;
    let completed = true;
    for (let i = 0; i < clips.length; i++) {
      if (id !== seqId) {
        completed = false;
        break;
      }
      onIndex && onIndex(i);
      const res = await play(clips[i], { rate });
      if (id !== seqId || !res.ok || res.reason === "cancel") {
        completed = false;
        break;
      }
      await new Promise((r) => setTimeout(r, gapMs));
    }
    if (onIndex) onIndex(-1);
    return completed;
  }
  function stopAll() {
    seqId++;
    stop();
  }
  function playSoon(clip, ms = 250, opts) {
    const my = gen;
    const t = setTimeout(() => {
      if (my === gen) play(clip, opts);
    }, ms);
    return () => clearTimeout(t);
  }
  function playElement(audio, { restart = false } = {}) {
    stopAll();
    if (restart || audio.ended) audio.currentTime = 0;
    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok, reason) => {
        if (settled) return;
        settled = true;
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("pause", onPause);
        if (current && current.audio === audio) {
          current = null;
          emit({ playing: false });
        }
        resolve({ ok, reason });
      };
      const onEnded = () => finish(true, "ended");
      const onPause = () => finish(true, "pause");
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("pause", onPause);
      current = { kind: "element", audio, cancel: () => {
        finish(true, "cancel");
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch (e) {
        }
      } };
      emit({ playing: true, element: audio });
      audio.play().catch((e) => finish(false, e.name));
    });
  }
  function releaseElement(audio) {
    if (current && current.audio === audio) stop();
    release(audio);
  }
  async function diagnose() {
    await loadVoices();
    const en = englishVoices();
    return {
      embedded: embeddedCount(),
      embeddedVoice: globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.voice || null,
      systemTts: "speechSynthesis" in globalThis,
      englishVoices: en.map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang, local: v.localService }))
    };
  }

  // app/js/audio/localasr.js
  var localasr_exports = {};
  __export(localasr_exports, {
    MAX_FREE_SECONDS: () => MAX_FREE_SECONDS,
    MAX_SECONDS: () => MAX_SECONDS,
    busy: () => busy,
    downloadBytes: () => downloadBytes,
    install: () => install,
    release: () => release2,
    remove: () => remove,
    sizeLabel: () => sizeLabel,
    status: () => status,
    toPcm16k: () => toPcm16k,
    totalBytes: () => totalBytes,
    transcribe: () => transcribe,
    unsupportedReason: () => unsupportedReason,
    verify: () => verify
  });

  // app/js/audio/segment.js
  function splitForAsr(pcm, sr = 16e3, { maxSeg = 24, minSeg = 12 } = {}) {
    const n = pcm.length;
    if (n <= maxSeg * sr) return [{ start: 0, end: n }];
    const hop = Math.round(sr * 0.02);
    const frames = Math.ceil(n / hop);
    const rms = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      let s = 0, c = 0;
      for (let i = f * hop; i < Math.min(n, (f + 1) * hop); i++) {
        s += pcm[i] * pcm[i];
        c++;
      }
      rms[f] = c ? Math.sqrt(s / c) : 0;
    }
    const win = 15;
    const smooth = new Float32Array(frames);
    let acc = 0;
    for (let f = 0; f < frames; f++) {
      acc += rms[f];
      if (f >= win) acc -= rms[f - win];
      smooth[f] = acc / Math.min(f + 1, win);
    }
    const segs = [];
    let start2 = 0;
    while (n - start2 > maxSeg * sr) {
      const a = Math.floor((start2 + minSeg * sr) / hop), b = Math.floor((start2 + maxSeg * sr) / hop);
      let best = b, bestV = Infinity;
      for (let f = a; f <= b && f < frames; f++) if (smooth[f] < bestV) {
        bestV = smooth[f];
        best = f;
      }
      const cut = Math.min(n, Math.max(start2 + sr, (best - Math.floor(win / 2)) * hop));
      segs.push({ start: start2, end: cut });
      start2 = cut;
    }
    segs.push({ start: start2, end: n });
    return segs;
  }
  function voiceProfile(pcm, sr = 16e3) {
    const hop = Math.round(sr * 0.02);
    const frames = Math.floor(pcm.length / hop);
    const voiced = new Uint8Array(frames);
    if (!frames) return { hop, voiced, sr };
    const rms = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      let s = 0;
      for (let i = f * hop; i < (f + 1) * hop; i++) s += pcm[i] * pcm[i];
      rms[f] = Math.sqrt(s / hop);
    }
    const sorted = [...rms].sort((a, b) => a - b);
    const noise = sorted[Math.floor(frames * 0.15)] || 0, peak = sorted[Math.floor(frames * 0.98)] || 0;
    const thr = Math.max(8e-3, noise * 2.5, peak * 0.12);
    for (let f = 0; f < frames; f++) voiced[f] = rms[f] > thr ? 1 : 0;
    return { hop, voiced, sr };
  }
  function voicedSeconds(profile, start2, end) {
    let n = 0;
    for (let f = Math.floor(start2 / profile.hop); f < Math.min(profile.voiced.length, Math.ceil(end / profile.hop)); f++) n += profile.voiced[f];
    return Math.round(n * 0.02 * 100) / 100;
  }
  function inSpeechAt(profile, idx) {
    const f = Math.floor(idx / profile.hop);
    const v = (k) => profile.voiced[k] === 1;
    return (v(f - 1) || v(f - 2)) && (v(f) || v(f + 1));
  }
  function speechBounds(pcm, sr = 16e3, { pad = 0.15, minSec = 0 } = {}) {
    const prof = voiceProfile(pcm, sr);
    const { hop, voiced } = prof;
    let first = -1, last = -1;
    for (let f = 0; f < voiced.length; f++) if (voiced[f]) {
      if (first < 0) first = f;
      last = f;
    }
    if (first < 0) return { start: 0, end: pcm.length };
    const p = Math.round(pad * sr);
    let start2 = Math.max(0, first * hop - p), end = Math.min(pcm.length, (last + 1) * hop + p);
    const min = Math.min(pcm.length, Math.round(minSec * sr));
    if (end - start2 < min) {
      const grow = min - (end - start2);
      start2 = Math.max(0, start2 - Math.ceil(grow / 2));
      end = Math.min(pcm.length, start2 + min);
      start2 = Math.max(0, end - min);
    }
    return { start: start2, end };
  }

  // app/js/audio/localasr.js
  var MANIFEST = typeof define_ASR_MANIFEST_default !== "undefined" ? define_ASR_MANIFEST_default : null;
  var PREFIX = "asr-local-";
  var cacheName = () => PREFIX + MANIFEST.version;
  var MAX_SECONDS = 30;
  var totalBytes = () => MANIFEST ? MANIFEST.files.reduce((n, f) => n + f.size, 0) : 0;
  var missingBytes = null;
  var downloadBytes = () => missingBytes === null ? totalBytes() : missingBytes;
  var sizeLabel = () => `${Math.max(1, Math.round(downloadBytes() / 1048576))} MB`;
  function unsupportedReason() {
    if (!MANIFEST) return "pacote de reconhecimento ausente nesta vers\xE3o";
    if (!/^https?:$/.test(globalThis.location ? location.protocol : "")) return "precisa abrir o app pelo endere\xE7o (n\xE3o como arquivo)";
    if (!("caches" in globalThis)) return "armazenamento offline (Cache) indispon\xEDvel";
    if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") return "WebAssembly/Worker indispon\xEDvel";
    if (typeof OfflineAudioContext === "undefined" && typeof webkitOfflineAudioContext === "undefined") return "decodifica\xE7\xE3o de \xE1udio indispon\xEDvel";
    return "";
  }
  async function status() {
    if (unsupportedReason()) return "unsupported";
    try {
      const cache = await caches.open(cacheName());
      let missing = 0;
      for (const f of MANIFEST.files) {
        const url = new URL(f.path, location.href).href;
        if (await cache.match(url)) continue;
        if (await migrate2(cache, f, url)) continue;
        missing += f.size;
      }
      missingBytes = missing;
      if (missing) return "not-installed";
      await dropOldCaches();
      return "installed";
    } catch (e) {
      return "not-installed";
    }
  }
  async function migrate2(cache, f, url) {
    for (const k of await caches.keys()) {
      if (!k.startsWith(PREFIX) || k === cacheName()) continue;
      const old = await caches.open(k);
      const hit = await old.match(url);
      if (!hit) continue;
      const sha = hit.headers.get("X-DRG-Sha");
      if (sha ? sha !== f.sha : await cachedSize(hit.clone()) !== f.size) continue;
      const body = await hit.blob();
      await cache.put(url, new Response(body, { headers: { "Content-Type": typeFor(f.path), "X-DRG-Size": String(body.size), "X-DRG-Sha": f.sha } }));
      return true;
    }
    return false;
  }
  var typeFor = (path) => /\.m?js$/.test(path) ? "text/javascript" : /\.wasm$/.test(path) ? "application/wasm" : "application/octet-stream";
  async function dropOldCaches() {
    for (const k of await caches.keys()) if (k.startsWith(PREFIX) && k !== cacheName()) await caches.delete(k);
  }
  async function cachedSize(hit) {
    const h2 = hit.headers.get("X-DRG-Size");
    return h2 ? Number(h2) : (await hit.blob()).size;
  }
  async function verify() {
    if (unsupportedReason()) return { ok: false, missing: [], damaged: [], unsupported: true };
    const cache = await caches.open(cacheName());
    const missing = [], damaged = [];
    for (const f of MANIFEST.files) {
      const hit = await cache.match(new URL(f.path, location.href).href);
      if (!hit) missing.push(f.path);
      else if (await cachedSize(hit) !== f.size) damaged.push(f.path);
    }
    return { ok: !missing.length && !damaged.length, missing, damaged };
  }
  async function install({ onProgress } = {}) {
    const why = unsupportedReason();
    if (why) throw new Error(why);
    release2();
    const cache = await caches.open(cacheName());
    const todo = [];
    for (const f of MANIFEST.files) {
      const url = new URL(f.path, location.href).href;
      const hit = await cache.match(url);
      if (hit && await cachedSize(hit) === f.size) continue;
      if (hit) await cache.delete(url);
      if (await migrate2(cache, f, url)) continue;
      todo.push(f);
    }
    const total = todo.reduce((n, f) => n + f.size, 0) || 1;
    let done = 0;
    const report = () => onProgress && onProgress(Math.min(1, done / total), done, total);
    report();
    for (const f of todo) {
      const url = new URL(f.path, location.href).href;
      const res = await fetch(url, { cache: "no-store", headers: { "X-DRG-Download": "1" } });
      if (!res.ok) throw new Error(`falha ao baixar ${f.path} (${res.status})`);
      const reader = res.body.getReader();
      const parts = [];
      for (; ; ) {
        const { done: end, value } = await reader.read();
        if (end) break;
        parts.push(value);
        done += value.byteLength;
        report();
      }
      const type = typeFor(f.path);
      const body = new Blob(parts, { type });
      if (body.size !== f.size) throw new Error(`arquivo incompleto: ${f.path}`);
      await cache.put(url, new Response(body, { headers: { "Content-Type": type, "X-DRG-Size": String(body.size), "X-DRG-Sha": f.sha } }));
    }
    missingBytes = 0;
    await dropOldCaches();
    return true;
  }
  async function remove() {
    release2();
    for (const k of await caches.keys()) if (k.startsWith(PREFIX)) await caches.delete(k);
  }
  var worker = null;
  var seq = 0;
  var epoch = 0;
  var pending2 = /* @__PURE__ */ new Map();
  function getWorker() {
    if (worker) return worker;
    try {
      worker = new Worker(new URL("asr/worker.js", location.href).href, { type: "module" });
    } catch (e) {
      throw asrError(`o reconhecimento local n\xE3o p\xF4de ser iniciado (${e.message})`, "load");
    }
    worker.onmessage = (e) => {
      const p = pending2.get(e.data.id);
      if (!p) return;
      pending2.delete(e.data.id);
      clearTimeout(p.timer);
      if (e.data.ok) p.resolve(e.data);
      else p.reject(asrError(e.data.error || "falha no reconhecimento", e.data.stage === "load" ? "load" : "run"));
    };
    worker.onerror = (e) => {
      e.preventDefault && e.preventDefault();
      failAll(asrError("o reconhecimento local n\xE3o p\xF4de ser iniciado", "load"));
      release2();
    };
    return worker;
  }
  function asrError(message, code) {
    const e = new Error(message);
    e.code = code;
    return e;
  }
  function failAll(err) {
    for (const [, p] of pending2) {
      clearTimeout(p.timer);
      p.reject(err);
    }
    pending2.clear();
  }
  function call(msg, transfer, timeoutMs) {
    const w = getWorker();
    const id = ++seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending2.delete(id);
        reject(asrError("tempo esgotado", "timeout"));
        release2();
      }, timeoutMs);
      pending2.set(id, { resolve, reject, timer });
      w.postMessage({ ...msg, id }, transfer || []);
    });
  }
  var active = 0;
  var busy = () => active > 0 || pending2.size > 0;
  function release2() {
    epoch++;
    if (worker) {
      worker.terminate();
      worker = null;
    }
    failAll(asrError("cancelado", "cancelled"));
  }
  async function toPcm16k(blob) {
    const Ctx = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
    const data = await blob.arrayBuffer();
    const probe = new Ctx(1, 1, 16e3);
    const decoded = await probe.decodeAudioData(data);
    const n = decoded.length;
    if (decoded.numberOfChannels === 1) return decoded.getChannelData(0).slice();
    const out = new Float32Array(n);
    for (let c = 0; c < decoded.numberOfChannels; c++) {
      const ch = decoded.getChannelData(c);
      for (let i = 0; i < n; i++) out[i] += ch[i] / decoded.numberOfChannels;
    }
    return out;
  }
  var MAX_FREE_SECONDS = 180;
  async function transcribe(blob, { long = false, onProgress, word = false } = {}) {
    active++;
    try {
      return await run(blob, long, onProgress, word);
    } finally {
      active--;
    }
  }
  async function run(blob, long, onProgress, word) {
    const mine = epoch;
    const cancelled = () => {
      if (mine !== epoch) throw asrError("cancelado", "cancelled");
    };
    let pcm;
    try {
      pcm = await toPcm16k(blob);
    } catch (e) {
      throw asrError("n\xE3o foi poss\xEDvel ler o \xE1udio gravado", "decode");
    }
    if (word) {
      const b = speechBounds(pcm, 16e3, { minSec: 1 });
      pcm = pcm.slice(b.start, b.end);
    }
    cancelled();
    const secs = pcm.length / 16e3;
    const max = long ? MAX_FREE_SECONDS : MAX_SECONDS;
    if (secs > max) {
      const e = asrError(`grava\xE7\xE3o longa demais para a an\xE1lise (m\xE1x. ${max} s)`, "too-long");
      e.secs = secs;
      e.max = max;
      throw e;
    }
    const segs = long ? splitForAsr(pcm, 16e3) : [{ start: 0, end: pcm.length }];
    const texts = [];
    const prof = voiceProfile(pcm, 16e3);
    const info = segs.map((sg, i) => ({ secs: Math.round((sg.end - sg.start) / 16e3 * 100) / 100, voicedSec: voicedSeconds(prof, sg.start, sg.end), cutInSpeech: i < segs.length - 1 && inSpeechAt(prof, sg.end) }));
    let ms = 0;
    for (let i = 0; i < segs.length; i++) {
      cancelled();
      onProgress && onProgress(i + 1, segs.length);
      const part = segs.length === 1 ? pcm : pcm.slice(segs[i].start, segs[i].end);
      const partSecs = part.length / 16e3;
      const res = await call({ type: "transcribe", pcm: part }, [part.buffer], 6e4 + partSecs * 4e3);
      texts.push(res.text);
      info[i].text = res.text;
      ms += res.ms;
    }
    return { text: texts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim(), confidence: 0, engine: "local-model", ms, secs, parts: segs.length, segments: info };
  }

  // app/js/engine/characters.js
  var STATES = ["idle", "thinking", "correct", "wrong", "celebrate", "levelup"];
  var DEFAULT_CHARACTER = "lucas";
  var FALLBACK = { version: 1, states: STATES, characters: [{ id: "lucas", name: "Lucas", status: "active", content: "base", profile: {}, visual: { states: {} } }] };
  var registry = (reg = globalThis.DRG_CHARACTERS) => reg && Array.isArray(reg.characters) && reg.characters.length ? reg : FALLBACK;
  function characterById(id, reg) {
    const list = registry(reg).characters;
    return list.find((c) => c.id === id) || list.find((c) => c.id === DEFAULT_CHARACTER) || list[0];
  }
  function assetFor(character, state) {
    const v = character && character.visual;
    const s = v && v.states && (v.states[state] || v.states.idle);
    if (!s || s.status !== "ready") return null;
    return `${v.dir}/${s.file}.${v.ext || "png"}`;
  }
  var isPlanned = (character) => !!character && character.status === "planned";
  function visualStatus(character) {
    const st = character && character.visual && character.visual.states || {};
    return { ready: STATES.filter((s) => st[s] && st[s].status === "ready"), pending: STATES.filter((s) => !st[s] || st[s].status !== "ready") };
  }
  var views = /* @__PURE__ */ new WeakMap();
  function contentFor(base, id, reg) {
    const ch = characterById(id, reg);
    if (!ch || ch.content === "base") return base;
    if (!views.has(base)) views.set(base, /* @__PURE__ */ new Map());
    const cache = views.get(base);
    if (cache.has(ch.id)) return cache.get(ch.id);
    if (!ch.content) {
      const empty = {
        ...base,
        character: ch.id,
        planned: true,
        meta: { ...base.meta, intro: [] },
        routines: [],
        blocks: {},
        sentences: {},
        questions: {},
        items: {},
        verbs: [],
        drills: [],
        checklist: [],
        review: { ...base.review, rev: [], gap: [] }
      };
      cache.set(ch.id, empty);
      return empty;
    }
    const pack = ch.content;
    const items = { ...pack.items };
    for (const [iid, ref] of Object.entries(pack.sharedItems || {})) {
      const it = base.items[iid];
      if (it) items[iid] = { ...it, ex: ref.ex, routines: ref.routines, blocks: ref.blocks, sentences: ref.sentences };
    }
    const view = {
      ...base,
      character: ch.id,
      meta: { ...base.meta, intro: [ch.profile && ch.profile.summary].filter(Boolean) },
      dayTypes: { club: "Dia no clube", short: "Dia mais curto", variation: "Varia\xE7\xE3o", episode: "Epis\xF3dio", session: "Sess\xE3o de pr\xE1tica", ...base.dayTypes },
      routines: pack.routines,
      blocks: pack.blocks,
      sentences: pack.sentences,
      questions: pack.questions,
      items,
      verbs: [],
      drills: [],
      checklist: [],
      review: { ...base.review, rev: [], gap: [] }
    };
    cache.set(ch.id, view);
    return view;
  }

  // app/js/engine/journeys.js
  var journeyRegistry = (reg = globalThis.DRG_JOURNEYS) => reg && Array.isArray(reg.journeys) ? reg.journeys : [];
  var journeyById = (id, reg) => journeyRegistry(reg).find((j) => j.id === id) || null;
  var views2 = /* @__PURE__ */ new WeakMap();
  function journeyView(base, id, reg) {
    const j = journeyById(id, reg);
    if (!j) return null;
    if (!views2.has(base)) views2.set(base, /* @__PURE__ */ new Map());
    const cache = views2.get(base);
    if (cache.has(j.id)) return cache.get(j.id);
    const c = j.content;
    const view = {
      ...base,
      journey: j.id,
      meta: { ...base.meta, intro: [j.name] },
      dayTypes: { ...base.dayTypes, conversation: "Conversa" },
      routines: c.routines,
      blocks: c.blocks,
      sentences: c.sentences,
      questions: c.questions,
      items: c.items,
      listening: c.listening || {},
      reading: c.reading || {},
      verbs: [],
      drills: [],
      checklist: [],
      review: { ...base.review, rev: [], gap: [] }
    };
    cache.set(j.id, view);
    return view;
  }

  // app/js/engine/modules.js
  var STAGES = [
    { id: "vocab", n: 1, title: "Palavras-chave", en: "Vocabulary", icon: "book" },
    { id: "expr", n: 2, title: "Express\xF5es pr\xE1ticas", en: "Phrasal verbs & expressions", icon: "chat" },
    { id: "listen", n: 3, title: "Ouvir e entender", en: "Listening", icon: "speaker" },
    { id: "speak", n: 4, title: "Falar na pr\xE1tica", en: "Speaking Lab", icon: "mic" },
    { id: "apply", n: 5, title: "Aplicar e conversar", en: "Conversation practice", icon: "target" }
  ];
  var stageById = (id) => STAGES.find((s) => s.id === id) || null;
  var VOCAB_CATS = /* @__PURE__ */ new Set(["word", "verb", "professional"]);
  var RATIO = 0.8;
  var LISTEN_MIN = 6;
  var SPEAK_MIN = 3;
  var WRITE_MAX = 6;
  var everRight = (c) => !!c && c.reps > c.lapses;
  var answered = (c) => !!c && c.reps > 0;
  var moduleOf = (view, id) => view.routines.find((r) => r.id === id) || null;
  var moduleSentences = (view, r) => r.blocks.flatMap((b) => view.blocks[b] ? view.blocks[b].sentences : []);
  function moduleItems(view, r, kind) {
    if (r.session && r.session.vocabIds) {
      return r.session.vocabIds.map((i) => view.items[i]).filter(Boolean).filter((it) => kind === "vocab" ? it.c !== "phrasal" : it.c === "phrasal");
    }
    const ids = r.items && r.items.length ? r.items : [...new Set(moduleSentences(view, r).flatMap((s) => view.sentences[s] ? view.sentences[s].items : []))];
    return ids.map((i) => view.items[i]).filter((it) => it && !(it.tags || []).includes("grammar-model")).filter((it) => kind === "vocab" ? VOCAB_CATS.has(it.c) : !VOCAB_CATS.has(it.c));
  }
  var hasListening = (r) => !!(r.listening && r.listening.length);
  function stageKeys(view, r) {
    const sents = moduleSentences(view, r);
    const qs = (r.questions || []).map((id) => view.questions[id]).filter(Boolean);
    return {
      vocab: moduleItems(view, r, "vocab").map((it) => cardKey("item", it.id, "rec")),
      expr: moduleItems(view, r, "expr").map((it) => cardKey("item", it.id, "rec")),
      listen: hasListening(r) ? r.listening.map((id) => cardKey("lq", id, "lis")) : sents.map((s) => cardKey("sent", s, "lis")),
      speak: [...sents.map((s) => `sent:${s}`), ...r.blocks.map((b) => `block:${b}`), `routine:${r.id}`, ...qs.map((q) => `q:${q.id}`)],
      questions: qs.filter((q) => q.kind !== "transfer" && !q.openPersonal).map((q) => cardKey("q", q.id, "conv")),
      transfer: qs.filter((q) => q.kind === "transfer" || q.openPersonal).map((q) => cardKey("q", q.id, "conv")),
      reading: (r.reading || []).map((id) => cardKey("rq", id, "rdq")),
      writing: sents
    };
  }
  function moduleStatus(view, moduleId, progress) {
    const r = moduleOf(view, moduleId);
    if (!r) return null;
    const cards = progress && progress.cards || {};
    const recs = progress && progress.recordingsMeta || {};
    const K = stageKeys(view, r);
    const count = (keys, f) => keys.filter((k) => f(cards[k])).length;
    const st = {};
    const ratio = (keys) => ({ done: count(keys, everRight), total: keys.length, need: Math.ceil(keys.length * RATIO) });
    st.vocab = ratio(K.vocab);
    st.expr = ratio(K.expr);
    st.listen = hasListening(r) ? { done: count(K.listen, everRight), total: K.listen.length, need: Math.ceil(K.listen.length * 0.75) } : { done: count(K.listen, everRight), total: K.listen.length, need: Math.min(K.listen.length, LISTEN_MIN) };
    st.speak = { done: K.speak.filter((t) => recs[t]).length, total: K.speak.length, need: Math.min(SPEAK_MIN, K.speak.length) };
    const written = K.writing.filter((s) => answered(cards[cardKey("sent", s, "ord")]) || answered(cards[cardKey("sent", s, "wrt")])).length;
    const parts = [
      { id: "questions", label: "Responder \xE0s perguntas", done: count(K.questions, answered), total: K.questions.length, need: K.questions.length },
      { id: "reading", label: "Ler e responder", done: count(K.reading, everRight), total: K.reading.length, need: K.reading.length },
      { id: "writing", label: "Montar ou escrever falas", done: written, total: K.writing.length, need: hasListening(r) ? Math.ceil(K.writing.length / 2) : Math.min(WRITE_MAX, Math.ceil(K.writing.length / 2)) },
      { id: "transfer", label: "Falar de voc\xEA (situa\xE7\xE3o nova)", done: count(K.transfer, answered), total: K.transfer.length, need: Math.min(1, K.transfer.length) }
    ].filter((p) => p.total > 0);
    st.apply = { done: parts.reduce((n, p) => n + Math.min(p.done, p.need), 0), need: parts.reduce((n, p) => n + p.need, 0), total: parts.reduce((n, p) => n + p.total, 0), parts };
    let open = true;
    const stages = STAGES.map((s) => {
      const x = st[s.id];
      const complete = x.done >= x.need;
      const state = !open ? "locked" : complete ? "done" : "open";
      if (!complete) open = false;
      return { ...s, ...x, complete, state };
    });
    const next = stages.find((s) => s.state === "open") || null;
    return { id: r.id, stages, complete: stages.every((s) => s.complete), next, doneCount: stages.filter((s) => s.complete).length };
  }
  function trackStatus(view, progress) {
    const mods = view.routines.map((r) => moduleStatus(view, r.id, progress));
    const total = mods.length * STAGES.length;
    const done = mods.reduce((n, m) => n + m.doneCount, 0);
    const current2 = mods.find((m) => !m.complete) || null;
    return { modules: mods, done, total, ratio: total ? done / total : 0, current: current2, next: current2 ? current2.next : null };
  }
  function stageOpen(view, moduleId, stageId, progress) {
    const m = moduleStatus(view, moduleId, progress);
    const s = m && m.stages.find((x) => x.id === stageId);
    return !!s && s.state !== "locked";
  }
  function stageFilter(view, moduleId, stageId) {
    const r = moduleOf(view, moduleId);
    if (!r) return () => false;
    const ids = (kind) => new Set(moduleItems(view, r, kind).map((it) => it.id));
    const sents = new Set(moduleSentences(view, r));
    if (stageId === "vocab" || stageId === "expr") {
      const set2 = ids(stageId);
      const skills = stageId === "vocab" ? ["rec", "rcl", "nat"] : ["rec", "rcl", "bld", "nat"];
      return (e) => e.unit === "item" && set2.has(e.id) && skills.includes(e.skill);
    }
    if (stageId === "listen") {
      const lq = new Set(r.listening || []);
      return hasListening(r) ? (e) => e.unit === "lq" && lq.has(e.id) : (e) => e.unit === "sent" && e.skill === "lis" && sents.has(e.id);
    }
    if (stageId === "apply") {
      const qs = new Set(r.questions || []), rq = new Set(r.reading || []), blocks = new Set(r.blocks);
      return (e) => e.unit === "q" && qs.has(e.id) || e.unit === "rq" && rq.has(e.id) || e.unit === "sent" && ["ord", "wrt"].includes(e.skill) && sents.has(e.id) || e.unit === "block" && blocks.has(e.id) || e.unit === "routine" && e.id === r.id;
    }
    return () => false;
  }

  // app/js/ui/character.js
  var STATE_LABEL = { idle: "em espera", thinking: "pensando", correct: "acertou", wrong: "errou", celebrate: "comemorando", levelup: "subiu de n\xEDvel" };
  function characterImage(ch, state, { size = 56 } = {}) {
    if (!ch || !STATES.includes(state)) return null;
    const src = assetFor(ch, state);
    if (!src) return null;
    return h("img", { class: `char-img char-${state}`, src, width: size, height: size, alt: `${ch.name} ${STATE_LABEL[state]}`, "data-character": ch.id, "data-state": state, decoding: "async" });
  }
  function characterBadge(ch, state = "idle", { size = 44 } = {}) {
    const img = characterImage(ch, state, { size });
    if (img) return img;
    return h("span", { class: "char-ph", role: "img", "aria-label": `${ch.name} (imagem pendente)`, "data-character": ch.id, "data-state": state, style: { width: `${size}px`, height: `${size}px` }, text: ch.name[0] });
  }
  function choiceSub(c) {
    const occ = c.profile && c.profile.occupation ? c.profile.occupation.pt : c.profile && c.profile.summary || "";
    if (c.status === "planned") return "Jornada em prepara\xE7\xE3o \xB7 progresso pr\xF3prio desde j\xE1";
    return `${occ.charAt(0).toUpperCase()}${occ.slice(1)}${c.status === "preview" ? " \xB7 em prepara\xE7\xE3o" : ""}`;
  }
  function characterChoices({ selected, current: current2 = null, onSelect, role = "character-choices" }) {
    const box2 = h("div", { class: "char-choices", role: "radiogroup", "aria-label": "Personagem", "data-role": role });
    const draw = (sel) => clear(box2).append(...registry().characters.map((c) => {
      const on = c.id === sel;
      return h(
        "button",
        {
          type: "button",
          class: "char-choice",
          role: "radio",
          "aria-checked": String(on),
          "data-character": c.id,
          onclick: () => {
            draw(c.id);
            onSelect(c.id);
          }
        },
        h("span", { class: "char-name", text: c.name }),
        c.id === current2 ? h("span", { class: "chip accent", text: "atual" }) : null,
        h("span", { class: "char-sub small muted", text: choiceSub(c) })
      );
    }));
    draw(selected);
    return box2;
  }
  function renderCharacterPick(App2) {
    const view = App2.layout("Daily Routine English", { nav: false });
    let pick = App2.character.id;
    const go = h("button", { class: "btn primary block lg", "data-role": "confirm-character", onclick: async () => {
      go.disabled = true;
      await App2.chooseCharacter(pick);
      App2.go("#/");
    } });
    const label = () => {
      go.textContent = `Continuar com ${registry().characters.find((c) => c.id === pick).name}`;
    };
    view.append(h(
      "section",
      { class: "char-pick", "data-role": "character-pick" },
      h("h2", { text: "Quem vai acompanhar voc\xEA?" }),
      h("p", { class: "small muted", text: "Cada personagem tem a pr\xF3pria rotina para voc\xEA praticar. D\xE1 para trocar depois, na tela inicial, sem perder o progresso." }),
      characterChoices({ selected: pick, onSelect: (id) => {
        pick = id;
        label();
      } }),
      go
    ));
    label();
  }
  function characterSwitcher(App2) {
    const wrap = h("section", { class: "card char-switch", "data-role": "active-character" });
    const closed = () => clear(wrap).append(h(
      "div",
      { class: "row nowrap" },
      h("div", { class: "grow" }, h("span", { class: "small muted", text: "Personagem atual: " }), h("b", { "data-role": "active-name", text: App2.character.name })),
      h("button", { class: "btn small", "aria-expanded": "false", "data-role": "switch-character", onclick: open, text: "Trocar personagem" })
    ));
    function open() {
      let pick = App2.character.id;
      const ok = h("button", { class: "btn primary", "data-role": "confirm-character", disabled: true, onclick: async () => {
        ok.disabled = true;
        const name = registry().characters.find((c) => c.id === pick).name;
        await App2.chooseCharacter(pick);
        toast(`Agora com ${name}. O progresso com cada personagem continua salvo.`);
        App2.go("#/");
      } }, "Confirmar");
      clear(wrap).append(
        h("div", { class: "small muted", text: "Escolha quem vai acompanhar voc\xEA:" }),
        characterChoices({ selected: pick, current: App2.character.id, onSelect: (id) => {
          pick = id;
          ok.disabled = id === App2.character.id;
          ok.textContent = id === App2.character.id ? "Confirmar" : `Usar ${registry().characters.find((c) => c.id === id).name}`;
        } }),
        h(
          "div",
          { class: "row nowrap", style: { justifyContent: "flex-end", gap: "8px" } },
          h("button", { class: "btn ghost", "data-role": "cancel-character", onclick: closed, text: "Cancelar" }),
          ok
        )
      );
      const first = wrap.querySelector("[aria-checked=true]");
      if (first) first.focus();
    }
    closed();
    return wrap;
  }

  // app/js/engine/exercises.js
  var CAT_LABEL = {
    word: "palavra",
    verb: "verbo",
    collocation: "collocation",
    phrasal: "phrasal verb",
    professional: "profissional",
    time: "tempo e frequ\xEAncia",
    connector: "conector / estrutura",
    sentence: "frase",
    qa: "pergunta",
    text: "texto"
  };
  var categoryLabel = (c) => CAT_LABEL[c] || c;
  function locate(item, text) {
    const pattern = (item.match || item.en).split(" / ")[0].replace(/…$/, "");
    const spans = tokenSpans(text);
    const hit = findPattern(pattern, wordTokens(text), { separable: item.c === "phrasal" });
    if (!hit) return null;
    const start2 = spans[hit[0]].start, end = spans[hit[1] - 1].end;
    return { before: text.slice(0, start2), target: text.slice(start2, end), after: text.slice(end) };
  }
  var itemTargets = (item) => [item.en, ...item.v].map((t) => t.replace(/…$/, "").trim());
  function distractors(content, item, n, rand) {
    const pool = Object.values(content.items).filter((x) => x.id !== item.id && x.pt && x.pt !== item.pt && !x.tags.includes("grammar-model"));
    const sameCat = pool.filter((x) => x.c === item.c);
    const sameCtx = sameCat.filter((x) => x.ctx.some((c) => item.ctx.includes(c)));
    const picked = [];
    for (const group of [shuffle(sameCtx, rand), shuffle(sameCat, rand), shuffle(pool, rand)]) {
      for (const x of group) {
        if (picked.length >= n) break;
        if (!picked.some((p) => p.pt === x.pt)) picked.push(x);
      }
    }
    return picked;
  }
  function orderPieces(text) {
    const words2 = text.split(/\s+/).filter(Boolean);
    if (words2.length <= 9) return words2;
    const pieces = [];
    let cur = [];
    for (const w of words2) {
      cur.push(w);
      const size = words2.length > 18 ? 3 : 2;
      if (/[,;]$/.test(w) || cur.length >= size) {
        pieces.push(cur.join(" "));
        cur = [];
      }
    }
    if (cur.length) pieces.push(cur.join(" "));
    return pieces;
  }
  function hint(text, level) {
    return text.split(" ").map((w) => {
      const letters = w.replace(/[^A-Za-zÀ-ÿ]/g, "");
      if (!letters) return w;
      const keep = level >= 2 ? Math.ceil(letters.length / 2) : 1;
      return w.slice(0, keep) + w.slice(keep).replace(/[A-Za-zÀ-ÿ]/g, "_");
    }).join(" ");
  }
  function makeExercise(content, entry, rand = Math.random) {
    const { unit, id, skill } = entry;
    if (unit === "item") {
      const item = content.items[id];
      if (skill === "rec") {
        const options = shuffle([{ pt: item.pt, correct: true }, ...distractors(content, item, 3, rand).map((x) => ({ pt: x.pt, correct: false }))], rand);
        const ex = item.ex.find((x) => x.src && /^[A-Z]\d\d-B\d+-S\d+$/.test(x.src));
        const inContext = ex && rand() < 0.4 ? locate(item, ex.en) : null;
        return { type: "mc", entry, item, options, context: inContext ? { ...inContext, au: ex.au } : null };
      }
      if (skill === "rcl") {
        const ex = item.ex.find((x) => x.pt);
        return { type: "recall", entry, item, targets: itemTargets(item), cue: ex ? ex.pt : null, label: categoryLabel(item.c) };
      }
      if (skill === "nat") {
        const s = content.sentences[item.sentences[0]];
        const loc = s ? locate(item, s.en) : null;
        if (!loc || !item.plain) return makeExercise(content, { ...entry, skill: "rec" }, rand);
        const pool = Object.values(content.items).filter((x) => x.id !== item.id && x.en !== item.en && x.routines.some((r) => item.routines.includes(r)) && ["phrasal", "collocation", "time", "connector"].includes(x.c));
        const others = shuffle(pool, rand).slice(0, 3);
        const options = shuffle([{ text: item.en, correct: true }, ...others.map((x) => ({ text: x.en, correct: false }))], rand);
        return {
          type: "nat",
          entry,
          item: { ...item, q: `Qual express\xE3o diz \u201C${item.plain}\u201D de um jeito mais natural?`, explain: `\u201C${item.en}\u201D = ${item.pt}.${item.explain ? " " + item.explain : ""}` },
          sentence: s,
          before: loc.before,
          plain: item.plain,
          after: loc.after,
          options
        };
      }
      if (skill === "bld") {
        const sid = item.sentences[Math.floor(rand() * item.sentences.length)];
        const s = content.sentences[sid];
        const loc = locate(item, s.en);
        if (!loc) return makeExercise(content, { ...entry, skill: "rcl" }, rand);
        return { type: "cloze", entry, item, sentence: s, ...loc, targets: [loc.target] };
      }
    }
    if (unit === "sent") {
      const s = content.sentences[id];
      if (skill === "ord") {
        const pieces = orderPieces(s.en);
        let shuffled = shuffle(pieces, rand);
        for (let i = 0; i < 5 && shuffled.join(" ") === pieces.join(" ") && pieces.length > 1; i++) shuffled = shuffle(pieces, rand);
        return { type: "order", entry, sentence: s, pieces, shuffled };
      }
      if (skill === "lis") {
        const r = content.routines.find((x) => x.id === s.routine);
        const pool = (r ? r.blocks.flatMap((b) => content.blocks[b].sentences) : []).filter((x) => x !== s.id).map((x) => content.sentences[x]).filter((x) => x.en !== s.en);
        const others = shuffle(pool, rand).slice(0, 3);
        const options = shuffle([{ text: s.en, correct: true }, ...others.map((x) => ({ text: x.en, correct: false }))], rand);
        return { type: "listen", entry, item: { q: "Qual destas frases voc\xEA ouviu?", explain: s.pt }, options, clips: [{ key: s.au, text: s.en, speaker: s.speaker || null, sid: s.id }] };
      }
      if (skill === "wrt") {
        const items = s.items.map((i) => content.items[i]).filter((it) => it.c !== "connector").slice(0, 4);
        return { type: "write", entry, sentence: s, targets: [s.en], hints: items.map((it) => ({ en: it.en, pt: it.pt })) };
      }
    }
    if (unit === "block") {
      const b = content.blocks[id];
      const sents = b.sentences.map((sid) => content.sentences[sid]);
      if (skill === "seq") {
        let shuffled = shuffle(sents, rand);
        for (let i = 0; i < 5 && shuffled.every((x, k) => x.id === sents[k].id); i++) shuffled = shuffle(sents, rand);
        return { type: "seq", entry, block: b, sentences: sents, shuffled };
      }
      if (skill === "tell") {
        const items = [...new Set(sents.flatMap((s) => s.items))].map((i) => content.items[i]).filter((it) => !["connector"].includes(it.c)).sort((a, b2) => b2.lvl - a.lvl).slice(0, 8);
        return { type: "tell", entry, block: b, sentences: sents, items, routine: content.routines.find((r) => r.id === b.routine) };
      }
    }
    if (unit === "routine") {
      const r = content.routines.find((x) => x.id === id);
      const blocks = r.blocks.map((bid) => {
        const b = content.blocks[bid];
        const items = [...new Set(b.sentences.flatMap((sid) => content.sentences[sid].items))].map((i) => content.items[i]).filter((it) => it.c !== "connector").sort((a, b2) => b2.lvl - a.lvl).slice(0, 3);
        return { block: b, items };
      });
      return { type: "retell", entry, routine: r, blocks, items: blocks.flatMap((b) => b.items) };
    }
    if (unit === "q") {
      const q = content.questions[id];
      return { type: "conv", entry, q, items: q.items.map((i) => content.items[i]).filter(Boolean) };
    }
    if (unit === "lq") {
      const l = content.listening[id];
      const options = shuffle(l.options.map((t, i) => ({ text: t, correct: i === l.answer })), rand);
      const clips = l.sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en, speaker: content.sentences[sid].speaker || null, sid }));
      return { type: "listen", entry, item: l, options, clips };
    }
    if (unit === "rq") {
      const x = content.reading[id];
      const options = shuffle(x.options.map((t, i) => ({ text: t, correct: i === x.answer })), rand);
      const passage = content.blocks[x.block].sentences.map((sid) => ({ ...content.sentences[sid], focus: sid === x.sentence }));
      return { type: "read", entry, item: x, options, passage };
    }
    if (unit === "verb") {
      const v = content.verbs.find((x) => x.id === id);
      return { type: "vb3", entry, verb: v, targets: [v.third] };
    }
    throw new Error("Entrada desconhecida: " + entry.k);
  }
  function maybePairs(queue, content, rand = Math.random) {
    const recs = queue.filter((q) => q.unit === "item" && q.skill === "rec" && q.review);
    if (recs.length < 4 || rand() < 0.5) return queue;
    const group = recs.slice(0, 4);
    const items = group.map((g) => content.items[g.id]);
    if (new Set(items.map((i) => i.pt)).size < 4) return queue;
    const pairs = { k: "pairs:" + group.map((g) => g.id).join(","), unit: "pairs", group, review: true };
    const rest = queue.filter((q) => !group.includes(q));
    rest.splice(Math.min(2, rest.length), 0, pairs);
    return rest;
  }
  function makePairs(content, entry, rand = Math.random) {
    const items = entry.group.map((g) => content.items[g.id]);
    return { type: "pairs", entry, items, left: shuffle(items, rand), right: shuffle(items, rand) };
  }

  // app/js/ui/common.js
  function speakerButton(clip, { label = "Ouvir", cls = "icon-btn accent", rate } = {}) {
    const btn = h("button", { class: cls, "aria-label": label, type: "button" }, icon("speaker"));
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      btn.classList.add("playing");
      const res = await play(clip, { rate });
      btn.classList.remove("playing");
      if (!res.ok) toast("\xC1udio indispon\xEDvel. Veja Ajustes \u2192 \xC1udio.");
    });
    return btn;
  }
  var SOURCE_LABEL = {
    word: ["Word", "chip"],
    "word-table-only": ["Word (tabela)", "chip"],
    derived: ["Do texto \xB7 glosa nova", "chip warn"],
    new: ["Conte\xFAdo novo", "chip warn"]
  };
  function sourceChip(source) {
    const [t, c] = SOURCE_LABEL[source] || [source, "chip"];
    return h("span", { class: c, title: "Origem do conte\xFAdo" }, t);
  }
  function itemStatus(state, itemId) {
    const c = state.cards[cardKey("item", itemId, "rec")];
    if (!c) return "new";
    const r = state.cards[cardKey("item", itemId, "rcl")];
    return r && r.box >= MASTERED_BOX ? "mastered" : "seen";
  }
  function statusDot(state, itemId) {
    const s = itemStatus(state, itemId);
    return h("span", { class: `dot ${s === "new" ? "" : s}`, title: s === "new" ? "Novo" : s === "seen" ? "Em estudo" : "Dominado", "aria-hidden": "true" });
  }
  function openItem(App2, item) {
    const exs = item.ex.slice(0, 3);
    const body = h(
      "div",
      {},
      h(
        "div",
        { class: "row nowrap" },
        h(
          "div",
          { class: "grow", style: { flex: 1, minWidth: 0 } },
          h("div", { class: "big-en", text: item.en }),
          item.ipa ? h("div", { class: "muted en", text: item.ipa }) : null
        ),
        speakerButton({ key: item.au, text: item.en })
      ),
      h("p", { class: "pt", style: { fontSize: "1.05rem" }, text: [item.pt, ...item.ptAlt].join(" \xB7 ") }),
      h(
        "div",
        { class: "chips", style: { margin: "8px 0" } },
        h("span", { class: "chip accent", text: categoryLabel(item.c) }),
        sourceChip(item.source),
        ...item.tags.filter((t) => ["bre", "idiom", "uber", "no-to"].includes(t)).map((t) => h("span", { class: "chip", text: { bre: "British English", idiom: "idiom\xE1tica", uber: "Uber", "no-to": "sem \u201Cto\u201D" }[t] })),
        ...item.routines.slice(0, 5).map((r) => h("span", { class: "chip", text: r }))
      ),
      item.tip ? h("div", { class: "notice", style: { margin: "8px 0" } }, "\u{1F4A1} ", item.tip) : null,
      item.notes.length ? h("div", {}, h("h3", { text: "Notas do Word" }), ...item.notes.map((n) => h("p", { class: "small" }, n.text, h("span", { class: "muted tiny", text: `  (${n.src})` })))) : null,
      exs.length ? h("div", {}, h("h3", { text: "Exemplos" }), ...exs.map((x) => h(
        "div",
        { class: "card flat", style: { padding: "12px" } },
        h("div", { class: "row nowrap" }, h("div", { class: "en", style: { flex: 1 }, text: x.en }), x.au ? speakerButton({ key: x.au, text: x.en }, { cls: "icon-btn ghost" }) : null),
        x.pt ? h("div", { class: "pt small", text: x.pt }) : null,
        h("div", { class: "tiny muted", text: x.src === "new" ? "Exemplo novo (n\xE3o est\xE1 no Word)" : `Fonte: ${x.src}` })
      ))) : null,
      item.v.length ? h("p", { class: "small" }, h("b", { text: "Tamb\xE9m aceito: " }), item.v.join(" \xB7 ")) : null
    );
    sheet(body, { label: item.en, onClose: () => stopAll() });
  }
  function focusTitle(App2, focus) {
    if (focus.routine && focus.stage) {
      const st = { vocab: "Palavras-chave", expr: "Express\xF5es pr\xE1ticas", listen: "Ouvir e entender", apply: "Aplicar e conversar" }[focus.stage];
      return `${focus.routine} \xB7 ${st || focus.stage}`;
    }
    if (focus.routine && !focus.mode) {
      const r = App2.content.routines.find((x) => x.id === focus.routine);
      return r ? `${r.id} \xB7 ${r.pt}` : focus.routine;
    }
    if (focus.context) {
      const c = App2.content.contexts.find((x) => x.id === focus.context);
      return c ? c.pt : focus.context;
    }
    if (focus.category) {
      const c = App2.content.categories.find((x) => x.id === focus.category);
      return c ? c.pt : focus.category;
    }
    if (focus.mode === "present") return `Treino para a aula \xB7 ${focus.routine}`;
    if (focus.mode === "review") return "Revis\xE3o";
    if (focus.mode === "difficult") return "Dificuldades";
    return "Sess\xE3o do dia";
  }
  function sessionHref(focus) {
    const q = new URLSearchParams(Object.entries(focus).filter(([, v]) => v)).toString();
    return `#/session${q ? "?" + q : ""}`;
  }

  // app/js/ui/modules.js
  var STATE_LABEL2 = { done: "conclu\xEDda", open: "dispon\xEDvel", locked: "bloqueada" };
  var trackName = (App2) => App2.journey ? App2.journey.name : `Daily Routine \xB7 ${App2.character.short || App2.character.name}`;
  function stageHref(moduleId, stageId) {
    if (stageId === "vocab" || stageId === "expr") return `#/words/${moduleId}?kind=${stageId}`;
    if (stageId === "speak") return `#/lab?routine=${moduleId}&module=1`;
    return sessionHref({ routine: moduleId, stage: stageId });
  }
  var moduleTitle = (r) => r.title && r.title !== r.pt ? r.title : r.pt;
  function stageDots(m) {
    return h(
      "div",
      { class: "stage-dots", "aria-label": `${m.doneCount} de ${STAGES.length} etapas conclu\xEDdas` },
      m.stages.map((s) => h(
        "span",
        { class: `sdot ${s.state}`, title: `${s.n}. ${s.title} \u2014 ${STATE_LABEL2[s.state]}`, "aria-hidden": "true" },
        s.state === "locked" ? icon("lock") : s.state === "done" ? icon("check") : String(s.n)
      ))
    );
  }
  function renderModules(App2) {
    const { content, state } = App2;
    const view = App2.layout(trackName(App2), { back: "#/" });
    if (!App2.journey && isPlanned(App2.character)) {
      view.append(plannedNotice(App2));
      return;
    }
    const tr = trackStatus(content, state);
    view.append(h(
      "section",
      { class: "card track-head", "data-role": App2.journey ? "journey-bar" : "track-bar" },
      h(
        "div",
        { class: "row nowrap" },
        h(
          "div",
          { class: "grow" },
          h("div", { class: "small muted", text: App2.journey ? "Jornada comunicativa \xB7 progresso pr\xF3prio" : `Jornada pessoal de ${App2.character.short || App2.character.name}` }),
          h("b", { text: `${tr.done} de ${tr.total} etapas conclu\xEDdas` })
        ),
        App2.journey ? h("button", { class: "btn small", "data-role": "leave-journey", onclick: async () => {
          await App2.setJourney(null);
          App2.go("#/modules");
        } }, `Daily Routine (${App2.character.short || App2.character.name})`) : null
      ),
      h("div", { style: { marginTop: "8px" } }, bar(tr.ratio))
    ));
    if (App2.journey) view.append(h("p", { class: "small muted", style: { marginTop: "10px" }, text: "Di\xE1logos originais do app em situa\xE7\xF5es do dia a dia: voc\xEA aprende as palavras e express\xF5es, ouve, fala e depois usa tudo numa conversa." }));
    for (const m of tr.modules) {
      const r = moduleOf(content, m.id);
      const isNext = tr.current && tr.current.id === m.id;
      view.append(h(
        "a",
        { class: `card link module-card${isNext ? " current" : ""}`, href: `#/module/${r.id}`, "data-role": App2.journey ? "journey-unit" : "module-card", "data-unit": r.id, "data-complete": String(m.complete) },
        h(
          "div",
          { class: "row nowrap" },
          h(
            "div",
            { class: "grow" },
            h("div", { class: "chips" }, h("span", { class: "chip", text: r.id }), m.complete ? h("span", { class: "chip ok", text: "Conclu\xEDdo \u2713" }) : isNext ? h("span", { class: "chip accent", text: "Continue aqui" }) : null),
            h("h3", { style: { marginTop: "6px" }, text: moduleTitle(r) }),
            r.title && r.title !== r.pt ? h("div", { class: "small muted", text: r.pt }) : null
          ),
          icon("next")
        ),
        stageDots(m)
      ));
    }
    if (!App2.journey) view.append(h("a", { class: "btn block ghost", href: "#/explore", style: { marginTop: "12px" } }, icon("list"), "Explorar por momento do dia ou categoria"));
  }
  function renderModule(App2, { arg }) {
    const { content, state } = App2;
    const r = moduleOf(content, arg);
    if (!r) {
      App2.go("#/modules");
      return;
    }
    const m = moduleStatus(content, r.id, state);
    const view = App2.layout(`${r.id} \xB7 ${moduleTitle(r)}`, { back: "#/modules" });
    view.append(h(
      "section",
      { class: "card module-head" },
      h("div", { class: "small muted", text: trackName(App2) }),
      h("h2", { style: { margin: "4px 0" }, text: moduleTitle(r) }),
      r.title && r.title !== r.pt ? h("div", { class: "small", text: r.pt }) : null,
      r.goal ? h("p", { class: "small", style: { marginTop: "6px" } }, h("b", { text: "Objetivo: " }), r.goal) : null,
      h("div", { class: "row nowrap", style: { marginTop: "8px" } }, h("div", { class: "grow" }, bar(m.doneCount / STAGES.length)), h("span", { class: "small muted", text: `${m.doneCount}/${STAGES.length}` }))
    ));
    if (r.session) {
      view.append(h(
        "a",
        { class: "card link session-text", href: `#/routine/${r.id}`, "data-role": "session-text" },
        h(
          "div",
          { class: "row nowrap" },
          h("span", { class: "stage-mark open", "aria-hidden": "true" }, icon("book")),
          h(
            "div",
            { class: "grow" },
            h("b", { text: "Texto da sess\xE3o e express\xF5es" }),
            h("div", { class: "small muted", text: `${r.session.level} \xB7 ${r.session.focus}` }),
            h("div", { class: "small", text: "Leia, ou\xE7a, veja a tradu\xE7\xE3o e toque nas express\xF5es destacadas." })
          ),
          icon("next")
        )
      ));
    }
    const list = h("ol", { class: "stages", "data-role": "stages" });
    for (const s of m.stages) list.append(stageRow(App2, r, s));
    view.append(list);
    if (r.session) {
    } else if (m.stages.find((s) => s.id === "listen").complete) {
      view.append(h("a", { class: "btn block", "data-role": "module-text", href: `#/routine/${r.id}`, style: { marginTop: "12px" } }, icon("book"), App2.journey ? "Ver o di\xE1logo completo" : "Ver o texto completo"));
    } else {
      view.append(h("p", { class: "tiny muted", style: { marginTop: "12px" }, text: "O texto completo fica dispon\xEDvel depois de \u201COuvir e entender\u201D, para voc\xEA treinar o ouvido antes de ler." }));
    }
    view.append(h("p", { class: "tiny muted", text: "Uma etapa abre quando a anterior \xE9 conclu\xEDda: basta acertar a maior parte ao menos uma vez \u2014 o que voc\xEA errar volta na revis\xE3o. Abrir uma etapa n\xE3o a conclui." }));
  }
  function stageRow(App2, r, s) {
    const locked = s.state === "locked";
    const counter = s.total === 0 ? "sem itens neste m\xF3dulo" : s.id === "speak" ? `${Math.min(s.done, s.need)}/${s.need} grava\xE7\xF5es` : `${Math.min(s.done, s.need)}/${s.need}`;
    const mark = h("span", { class: `stage-mark ${s.state}`, "aria-hidden": "true" }, locked ? icon("lock") : s.state === "done" ? icon("check") : String(s.n));
    const body = h(
      "div",
      { class: "grow" },
      h("div", { class: "stage-title" }, h("b", { text: `${String(s.n).padStart(2, "0")}. ${s.title}` }), h("span", { class: "small muted", text: ` \xB7 ${s.en}` })),
      h("div", { class: "small muted", text: locked ? "Bloqueada \u2014 conclua a etapa anterior" : `${STATE_LABEL2[s.state][0].toUpperCase()}${STATE_LABEL2[s.state].slice(1)} \xB7 ${counter}` }),
      s.parts && !locked ? h("ul", { class: "tiny muted parts" }, s.parts.map((p) => h("li", { text: `${p.done >= p.need ? "\u2713" : "\u25CB"} ${p.label}: ${Math.min(p.done, p.need)}/${p.need}` }))) : null
    );
    const attrs = { class: `stage ${s.state}`, "data-role": "stage", "data-stage": s.id, "data-state": s.state };
    if (locked) return h("li", attrs, h("div", { class: "stage-row", "aria-disabled": "true" }, mark, body, icon("lock")));
    return h("li", attrs, h("a", { class: "stage-row", href: stageHref(r.id, s.id), "aria-label": `${s.title}: ${STATE_LABEL2[s.state]}` }, mark, body, icon("next")));
  }
  function renderWords(App2, { arg, params }) {
    const { content, state } = App2;
    const r = moduleOf(content, arg);
    const kind = params.kind === "expr" ? "expr" : "vocab";
    if (!r) {
      App2.go("#/modules");
      return;
    }
    const stage = moduleStatus(content, r.id, state).stages.find((s) => s.id === kind);
    if (stage.state === "locked") {
      App2.go(`#/module/${r.id}`);
      return;
    }
    const view = App2.layout(kind === "vocab" ? "Palavras-chave" : "Express\xF5es pr\xE1ticas", { back: `#/module/${r.id}` });
    const items = moduleItems(content, r, kind);
    const today = App2.today();
    const favs = state.favorites || (state.favorites = {});
    let onlyMarked = false;
    view.append(
      h("p", { class: "small muted", text: kind === "vocab" ? `Palavras de que voc\xEA precisa em \u201C${moduleTitle(r)}\u201D. Ou\xE7a, veja o exemplo e pratique.` : `Phrasal verbs, collocations e express\xF5es naturais de \u201C${moduleTitle(r)}\u201D, sempre num exemplo da situa\xE7\xE3o.` }),
      h(
        "div",
        { class: "row", style: { margin: "8px 0 12px" } },
        h("a", { class: "btn primary", "data-role": "stage-practice", href: sessionHref({ routine: r.id, stage: kind }) }, icon("play"), "Praticar"),
        h("span", { class: "small muted", text: `${Math.min(stage.done, stage.need)}/${stage.need} para concluir` })
      )
    );
    const list = h("div", { class: "stack", "data-role": "word-list" });
    const filterBtn = h("button", { class: "chip", "aria-pressed": "false", onclick: () => {
      onlyMarked = !onlyMarked;
      filterBtn.setAttribute("aria-pressed", String(onlyMarked));
      draw();
    } }, icon("star"), " S\xF3 as marcadas");
    view.append(h("div", { class: "row" }, filterBtn), list);
    const draw = () => {
      list.replaceChildren(...items.filter((it) => !onlyMarked || favs[it.id]).map((it) => wordCard(App2, r, it, today)));
      if (!list.children.length) list.append(h("p", { class: "small muted", text: "Nenhuma marcada ainda: toque na estrela de um item para marc\xE1-lo para revis\xE3o." }));
    };
    draw();
  }
  function itemLearnState(cards, itemId, today) {
    const c = cards[cardKey("item", itemId, "rec")];
    if (!c || !c.reps) return "new";
    if (c.lastResult === "bad" || c.due <= today) return "review";
    return "learned";
  }
  var LEARN_LABEL = { new: ["Novo", "chip"], learned: ["Aprendido", "chip ok"], review: ["Para revisar", "chip warn"] };
  var noteOf = (it) => {
    const n = Array.isArray(it.notes) ? it.notes[0] : it.notes;
    return String((n && typeof n === "object" ? n.text : n) || "").trim();
  };
  function wordCard(App2, r, it, today) {
    const { content, state } = App2;
    const sents = new Set(moduleSentences(content, r));
    const ex = (it.ex || []).find((x) => x.src && sents.has(x.src)) || (it.ex || [])[0] || null;
    const sid = ex && ex.src && content.sentences[ex.src] ? ex.src : (it.sentences || []).find((s) => sents.has(s));
    const ls = itemLearnState(state.cards, it.id, today);
    const [lab, cls] = LEARN_LABEL[ls];
    const marked = () => !!state.favorites[it.id];
    const star = h("button", {
      class: `icon-btn ghost star${marked() ? " on" : ""}`,
      "aria-pressed": String(marked()),
      "aria-label": "Marcar para revis\xE3o",
      "data-role": "mark",
      onclick: () => {
        if (marked()) delete state.favorites[it.id];
        else state.favorites[it.id] = Date.now();
        star.classList.toggle("on", marked());
        star.setAttribute("aria-pressed", String(marked()));
        App2.save();
        toast(marked() ? "Marcado para revis\xE3o." : "Marca\xE7\xE3o removida.");
      }
    }, icon("star"));
    const loc = ex ? locate(it, ex.en) : null;
    return h(
      "article",
      { class: "card word", "data-role": "word", "data-item": it.id, "data-state": ls },
      h(
        "div",
        { class: "row nowrap" },
        h(
          "div",
          { class: "grow" },
          h("div", { class: "word-en en", text: it.en }),
          h("div", { class: "small muted" }, h("span", { text: categoryLabel(it.c) }), " \xB7 ", h("span", { class: "word-pt", text: it.pt }))
        ),
        it.au ? speakerButton({ key: it.au, text: it.en.replace(/…$/, "") }, { label: `Ouvir \u201C${it.en}\u201D` }) : null,
        star
      ),
      ex ? h("p", { class: "small en ex", style: { margin: "8px 0 2px" } }, ...loc ? [loc.before, h("b", { text: loc.target }), loc.after] : [ex.en]) : null,
      ex && ex.pt ? h("div", { class: "tiny muted", text: ex.pt }) : null,
      noteOf(it) ? h("div", { class: "tiny", style: { marginTop: "4px" }, text: `Uso: ${noteOf(it)}` }) : null,
      it.explain ? h("div", { class: "small", style: { marginTop: "4px" }, "data-role": "explain", text: it.explain }) : null,
      it.extra ? h(
        "div",
        { class: "row nowrap", style: { marginTop: "6px", alignItems: "flex-start" }, "data-role": "extra" },
        h("div", { class: "grow" }, h("div", { class: "small en", text: it.extra.en }), h("div", { class: "tiny muted", text: it.extra.pt })),
        speakerButton({ key: it.extra.au, text: it.extra.en }, { label: "Ouvir o outro exemplo", cls: "icon-btn ghost" })
      ) : null,
      it.tip ? h("div", { class: "tiny muted", text: `Dica: ${it.tip}` }) : null,
      h(
        "div",
        { class: "row", style: { marginTop: "8px" } },
        h("span", { class: cls, text: lab }),
        sid ? h("a", { class: "btn small ghost", href: `#/lab?sentence=${sid}` }, icon("mic"), "Falar no exemplo") : null
      )
    );
  }
  function plannedNotice(App2) {
    return h(
      "section",
      { class: "card", "data-role": "planned" },
      h("h3", { text: `Jornada de ${App2.character.name} em prepara\xE7\xE3o` }),
      h("p", { class: "small", text: "As rotinas desta persona ainda n\xE3o foram criadas. O progresso dela j\xE1 \xE9 separado: quando o conte\xFAdo chegar, come\xE7a do zero, sem misturar com as outras personas." }),
      h("a", { class: "btn primary block", href: "#/", "data-role": "planned-home" }, icon("home"), "Voltar ao In\xEDcio")
    );
  }

  // app/js/ui/pwa.js
  var CHECK_EVERY_MS = 15 * 60 * 1e3;
  var RETRY_AFTER_MS = 60 * 1e3;
  var NO_BANNER = ["session"];
  var LS_INSTALLED = "drg.installed";
  var LS_VERSION = "drg.version";
  var listeners2 = /* @__PURE__ */ new Set();
  var notify = () => listeners2.forEach((fn) => {
    try {
      fn();
    } catch (e) {
    }
  });
  var lsGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  };
  var lsSet = (k, v) => {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch (e) {
    }
  };
  var early = { deferred: null, installed: false, app: null };
  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      early.deferred = e;
      lsSet(LS_INSTALLED, null);
      if (early.app) early.app();
    });
    window.addEventListener("appinstalled", () => {
      early.deferred = null;
      early.installed = true;
      lsSet(LS_INSTALLED, "1");
      if (early.app) early.app("installed");
    });
  }
  function isStandalone() {
    try {
      return ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].some((m) => matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
    } catch (e) {
      return false;
    }
  }
  function initPwa(App2) {
    const pwa = App2.pwa = { install: "manual", update: null, deferred: early.deferred, reg: null, version: null, lastCheck: 0, lastAttempt: 0, postponed: false };
    const refreshInstall = () => {
      pwa.install = isStandalone() ? "standalone" : pwa.deferred ? "available" : lsGet(LS_INSTALLED) ? "installed-elsewhere" : "manual";
    };
    refreshInstall();
    early.app = (what) => {
      pwa.deferred = early.deferred;
      refreshInstall();
      notify();
      if (what === "installed") {
        requestPersistence().catch(() => {
        });
        toast("Aplicativo instalado. Abra pelo \xEDcone \u201CDaily English\u201D na tela inicial ou na gaveta de aplicativos.", 6e3);
      }
    };
    try {
      matchMedia("(display-mode: standalone)").addEventListener("change", () => {
        refreshInstall();
        notify();
      });
    } catch (e) {
    }
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) {
      pwa.install = isStandalone() ? "standalone" : "unsupported";
      pwa.noSwReason = !("serviceWorker" in navigator) ? "este navegador n\xE3o oferece service worker (o recurso que guarda o app no aparelho)" : `o endere\xE7o foi aberto como ${location.protocol.replace(":", "")}, e o modo offline s\xF3 funciona em https`;
      return pwa;
    }
    const sw = navigator.serviceWorker;
    const firstInstall = !sw.controller;
    let reloading = false;
    sw.addEventListener("controllerchange", () => {
      if (pwa.update === "applying") {
        if (!reloading) {
          reloading = true;
          location.reload();
        }
        return;
      }
      if (firstInstall) toast("Pronto para uso offline: todo o conte\xFAdo e o \xE1udio est\xE3o salvos no aparelho.", 5e3);
    });
    const watched = /* @__PURE__ */ new WeakSet();
    const watch = (worker2) => {
      if (!worker2) return;
      if (sw.controller && pwa.update !== "ready" && pwa.update !== "applying") {
        pwa.update = "downloading";
        notify();
      }
      if (watched.has(worker2)) return;
      watched.add(worker2);
      worker2.addEventListener("statechange", () => {
        if (worker2.state === "installed" && sw.controller) {
          pwa.update = "ready";
          notify();
        }
        if (worker2.state === "redundant" && pwa.update === "downloading") {
          pwa.update = "failed";
          notify();
        }
      });
    };
    let checking = null;
    const check = ({ opening = false, manual = false } = {}) => {
      const reg = pwa.reg;
      if (!reg) return Promise.resolve("no-reg");
      if (reg.installing) {
        watch(reg.installing);
        return Promise.resolve("downloading");
      }
      if (reg.waiting && sw.controller) {
        if (pwa.update !== "applying") {
          pwa.update = "ready";
          notify();
        }
        return Promise.resolve("ready");
      }
      if (checking) return checking;
      const now = Date.now();
      if (!manual && document.visibilityState !== "visible") return Promise.resolve("skipped");
      if (!manual && !opening && now - pwa.lastCheck < CHECK_EVERY_MS) return Promise.resolve("skipped");
      if (!manual && now - pwa.lastAttempt < RETRY_AFTER_MS) return Promise.resolve("skipped");
      pwa.lastAttempt = now;
      if (pwa.update === "failed") pwa.update = null;
      if (manual) pwa.update = "checking";
      notify();
      checking = reg.update().then(() => {
        pwa.lastCheck = Date.now();
        return reg.installing ? "downloading" : reg.waiting ? "ready" : "checked";
      }).catch(() => "error").finally(() => {
        checking = null;
        if (pwa.update === "checking") {
          pwa.update = null;
          notify();
        }
      });
      return checking;
    };
    pwa.check = check;
    let opened = false;
    const attach = (reg) => {
      if (!reg) return;
      if (pwa.reg !== reg) {
        pwa.reg = reg;
        reg.addEventListener("updatefound", () => watch(reg.installing));
      }
      if (reg.waiting && sw.controller && pwa.update !== "applying") {
        pwa.update = "ready";
        notify();
      }
      if (reg.installing) watch(reg.installing);
      if (!opened && sw.controller) {
        opened = true;
        check({ opening: true });
      }
      notify();
    };
    pwa.attach = () => sw.getRegistration().then((reg) => {
      attach(reg);
      return reg || null;
    }, () => null);
    pwa.attach();
    sw.register("sw.js").then(attach).catch((e) => {
      pwa.regError = e && e.message || String(e);
      console.warn("SW n\xE3o registrado", e);
      notify();
    });
    document.addEventListener("visibilitychange", () => check());
    window.addEventListener("focus", () => check());
    return pwa;
  }
  function confirmBoot(App2) {
    const ctrl = "serviceWorker" in navigator && navigator.serviceWorker.controller;
    if (!ctrl) return;
    const ask = (type) => new Promise((resolve) => {
      const ch = new MessageChannel();
      const t = setTimeout(() => resolve(null), 5e3);
      ch.port1.onmessage = (e) => {
        clearTimeout(t);
        resolve(e.data);
      };
      ctrl.postMessage({ type }, [ch.port2]);
    });
    ask("CLEANUP").then((r) => {
      if (!r || !App2.pwa) return;
      const before = lsGet(LS_VERSION);
      App2.pwa.version = r.version;
      App2.pwa.cleaned = r.removed;
      if (before && before !== r.version || r.removed && r.removed.length) {
        App2.pwa.updatedTo = r.version;
        toast(`Aplicativo atualizado (vers\xE3o ${r.version}). Seu progresso foi mantido.`, 6e3);
      }
      lsSet(LS_VERSION, r.version);
      notify();
    });
  }
  async function applyUpdate(App2) {
    const pwa = App2.pwa;
    const waiting = pwa && pwa.reg && pwa.reg.waiting;
    if (!waiting) {
      pwa.update = null;
      notify();
      return false;
    }
    try {
      await App2.flush();
    } catch (e) {
      toast("N\xE3o foi poss\xEDvel gravar o progresso agora. A atualiza\xE7\xE3o foi adiada.", 6e3);
      return false;
    }
    pwa.update = "applying";
    notify();
    waiting.postMessage({ type: "SKIP_WAITING" });
    setTimeout(() => {
      if (pwa.update === "applying") {
        pwa.update = "ready";
        notify();
        toast("A atualiza\xE7\xE3o n\xE3o foi conclu\xEDda. Seu progresso est\xE1 salvo; tente de novo.", 6e3);
      }
    }, 1e4);
    return true;
  }
  var currentRoute = () => location.hash.replace(/^#\/?/, "").split(/[/?]/)[0] || "";
  function updateBanner(App2) {
    const pwa = App2.pwa;
    if (!pwa || NO_BANNER.includes(currentRoute())) return null;
    const st = pwa.update;
    if (st === "downloading") {
      return h(
        "div",
        { class: "update-bar", role: "status", "aria-live": "polite", "data-role": "update-downloading" },
        icon("download"),
        h("span", { class: "grow", text: "Baixando uma nova vers\xE3o do aplicativo\u2026" })
      );
    }
    if (st === "failed") {
      return h(
        "div",
        { class: "update-bar warn", role: "status", "data-role": "update-failed" },
        h("span", { class: "grow", text: "N\xE3o foi poss\xEDvel baixar a nova vers\xE3o agora. O app continua funcionando; tentaremos de novo mais tarde." }),
        h("button", { class: "btn small ghost", onclick: () => {
          pwa.update = null;
          notify();
        } }, "OK")
      );
    }
    if (st !== "ready" && st !== "applying" || pwa.postponed) return null;
    const now = h("button", { class: "btn small primary", "data-role": "update-now", disabled: st === "applying", onclick: () => applyUpdate(App2) }, st === "applying" ? "Atualizando\u2026" : "Atualizar agora");
    return h(
      "div",
      { class: "update-bar", role: "status", "data-role": "update-banner" },
      icon("refresh"),
      h("span", { class: "grow", text: "Nova vers\xE3o dispon\xEDvel. Seu progresso fica salvo." }),
      h("button", { class: "btn small ghost", "data-role": "update-later", onclick: () => {
        pwa.postponed = true;
        notify();
      } }, "Depois"),
      now
    );
  }
  function live(render) {
    const slot = h("div", { class: "pwa-slot" });
    const draw = () => {
      if (!slot.isConnected && slot.dataset.drawn) {
        listeners2.delete(draw);
        return;
      }
      slot.dataset.drawn = "1";
      slot.replaceChildren(...[render()].filter(Boolean));
    };
    listeners2.add(draw);
    draw();
    return slot;
  }
  function manualSteps() {
    return h(
      "div",
      { class: "small", "data-role": "install-manual" },
      h("p", { style: { margin: "6px 0 4px" } }, h("b", { text: "No Google Chrome: " }), "toque em \u22EE (canto superior direito) \u2192 \u201CInstalar app\u201D (ou \u201CAdicionar \xE0 tela inicial\u201D \u2192 \u201CInstalar\u201D)."),
      h("p", { style: { margin: "4px 0" } }, h("b", { text: "No Samsung Internet: " }), "toque em \u2261 (canto inferior direito) \u2192 \u201CAdicionar p\xE1gina a\u201D \u2192 \u201CTela inicial\u201D."),
      h("p", { class: "muted", style: { margin: "4px 0 0" }, text: "Depois, abra o Daily English pelo \xEDcone. Instale pelo mesmo navegador que voc\xEA j\xE1 usa: cada navegador guarda o seu pr\xF3prio progresso." })
    );
  }
  function installCard(App2, { compact = false } = {}) {
    return live(() => {
      const pwa = App2.pwa || { install: "unsupported" };
      const st = pwa.install;
      if (st === "standalone") return compact ? null : h("div", { class: "card flat small", "data-role": "install-status", "data-state": st }, "\u2713 Aberto como aplicativo instalado.");
      if (st === "installed-elsewhere") {
        return h(
          "div",
          { class: "card flat small", "data-role": "install-status", "data-state": st },
          "O aplicativo j\xE1 est\xE1 instalado neste aparelho. Abra pelo \xEDcone \u201CDaily English\u201D."
        );
      }
      if (st === "available") {
        const btn = h("button", { class: "btn primary block", "data-role": "install-app", onclick: async () => {
          const ev = pwa.deferred;
          if (!ev) return;
          btn.disabled = true;
          try {
            await ev.prompt();
            const choice = await ev.userChoice;
            pwa.deferred = null;
            early.deferred = null;
            if (choice && choice.outcome === "accepted") {
              pwa.install = "installed-elsewhere";
              lsSet(LS_INSTALLED, "1");
            } else {
              pwa.install = "manual";
              toast("Instala\xE7\xE3o cancelada. Voc\xEA pode instalar depois pelo menu do navegador.", 5e3);
            }
          } catch (e) {
            pwa.deferred = null;
            early.deferred = null;
            pwa.install = "manual";
          }
          notify();
        } }, icon("download"), "Instalar aplicativo");
        return h(
          "section",
          { class: "card install-card", "data-role": "install-card", "data-state": st },
          h("b", { text: "Instale o Daily English" }),
          h("p", { class: "small muted", style: { margin: "4px 0 10px" }, text: "Fica na gaveta de aplicativos, abre em janela pr\xF3pria e funciona sem internet." }),
          btn
        );
      }
      if (st === "unsupported") return compact ? null : h("div", { class: "card flat small", "data-role": "install-status", "data-state": st }, "Este modo de abertura n\xE3o permite instalar. Abra o endere\xE7o do app no Chrome do celular.");
      if (compact) {
        return h(
          "details",
          { class: "card flat install-card", "data-role": "install-card", "data-state": st },
          h("summary", { class: "small" }, h("b", { text: "Instalar como aplicativo" })),
          manualSteps(),
          h("a", { class: "small", href: "install.html", text: "P\xE1gina de instala\xE7\xE3o" })
        );
      }
      return h(
        "section",
        { class: "card install-card", "data-role": "install-card", "data-state": st },
        h("b", { text: "Instalar como aplicativo" }),
        manualSteps(),
        h("a", { class: "btn small", href: "install.html", style: { marginTop: "8px" } }, "P\xE1gina de instala\xE7\xE3o")
      );
    });
  }
  function updateStatus(App2) {
    return live(() => {
      const pwa = App2.pwa || {};
      const ver = pwa.version ? `Vers\xE3o ${pwa.version}` : "Vers\xE3o em uso";
      const st = pwa.update;
      const action = st === "ready" || st === "applying" ? h("button", { class: "btn small primary", "data-role": "update-now", disabled: st === "applying", onclick: () => applyUpdate(App2) }, st === "applying" ? "Atualizando\u2026" : "Atualizar agora") : h("button", { class: "btn small", "data-role": "update-check", disabled: st === "checking", onclick: async () => {
        if (!pwa.reg && pwa.attach) await pwa.attach();
        if (!pwa.reg) {
          const why = pwa.noSwReason || (pwa.regError ? `o navegador recusou o registro do modo offline (${pwa.regError})` : "o modo offline ainda n\xE3o foi registrado nesta abertura \u2014 abra o app com internet e tente de novo");
          toast(`N\xE3o foi poss\xEDvel procurar atualiza\xE7\xE3o: ${why}.`, 7e3);
          return;
        }
        const res = await pwa.check({ manual: true });
        toast(res === "downloading" ? "Baixando a nova vers\xE3o\u2026 o aviso aparece quando ela estiver pronta." : res === "ready" ? "Nova vers\xE3o pronta: toque em \u201CAtualizar agora\u201D." : res === "error" ? "Sem conex\xE3o: n\xE3o foi poss\xEDvel procurar atualiza\xE7\xF5es agora." : "Voc\xEA j\xE1 est\xE1 na vers\xE3o mais recente.", 5e3);
      } }, "Procurar atualiza\xE7\xE3o");
      const text = st === "checking" ? "Verificando atualiza\xE7\xE3o\u2026" : st === "ready" ? "Nova vers\xE3o pronta para instalar." : st === "downloading" ? "Baixando a nova vers\xE3o em segundo plano\u2026" : st === "failed" ? "O \xFAltimo download da atualiza\xE7\xE3o falhou; o app tentar\xE1 de novo." : pwa.updatedTo ? "Aplicativo atualizado. O app procura atualiza\xE7\xF5es ao ser aberto e ao voltar para ele." : "O app procura atualiza\xE7\xF5es ao ser aberto e ao voltar para ele.";
      return h(
        "div",
        { class: "card flat small", "data-role": "update-status", "data-state": st || "idle" },
        h("div", { class: "row nowrap" }, h("div", { class: "grow" }, h("b", { text: ver }), h("div", { class: "muted", text })), action),
        h("div", { class: "tiny muted", style: { marginTop: "6px" }, text: "Atualizar n\xE3o apaga seu progresso. O reconhecimento de fala baixado continua guardado." })
      );
    });
  }

  // app/js/ui/home.js
  var EMPTY = { cards: {}, recordingsMeta: {}, xp: 0, days: {}, firstDay: 0 };
  function renderHome(App2) {
    const { state } = App2;
    const view = App2.layout("Daily Routine English", {
      actions: [h("a", { class: "icon-btn ghost", href: "#/settings", "aria-label": "Ajustes" }, icon("gear"))]
    });
    const today = App2.today();
    const ch = App2.character;
    const name = ch.short || ch.name;
    const planned = isPlanned(ch);
    const drView = contentFor(App2.baseContent, ch.id);
    const drProg = progressOf(state, ch.id) || EMPTY;
    const dr = planned ? null : trackStatus(drView, drProg);
    const j = journeyRegistry()[0] || null;
    const cpView = j ? journeyView(App2.baseContent, j.id) : null;
    const cpProg = j ? progressOf(state, journeyProfile(j.id)) || EMPTY : EMPTY;
    const cp = j ? trackStatus(cpView, cpProg) : null;
    if (App2.isNew && !state.welcomed) view.append(welcome(App2));
    const lvl = levelForXp(drProg.xp || 0);
    const st = streak({ days: drProg.days || {}, firstDay: drProg.firstDay ?? today }, today);
    const resume = App2.journey && cp ? { track: "journey", t: cp } : dr && dr.next ? { track: "dr", t: dr } : cp ? { track: "journey", t: cp } : null;
    const resumeHref = resume && resume.t.current && resume.t.next ? stageHref(resume.t.current.id, resume.t.next.id) : null;
    const resumeLabel = resumeHref ? `${resume.track === "journey" ? j.name : "Daily Routine"} \xB7 ${resume.t.current.id} \xB7 ${resume.t.next.title}` : "";
    const continueBtn = h("button", {
      class: "btn primary block lg",
      "data-role": "continue",
      disabled: !resumeHref,
      onclick: async () => {
        await App2.setJourney(resume.track === "journey" ? j.id : null);
        App2.go(resumeHref);
      }
    }, icon("play"), "Continuar de onde parou");
    view.append(h(
      "section",
      { class: "hero persona", "data-role": "persona", "data-character": ch.id },
      h(
        "div",
        { class: "row nowrap" },
        characterBadge(ch, "idle", { size: 56 }),
        h(
          "div",
          { class: "grow", style: { minWidth: 0 } },
          h("div", { class: "small muted", text: greeting() }),
          h("div", { class: "persona-name", text: name }),
          h("div", { class: "small muted", "data-role": "persona-stats", text: planned ? "Jornada em prepara\xE7\xE3o" : `N\xEDvel ${lvl.level} \xB7 ${drProg.xp || 0} XP \xB7 ${st.days} ${st.days === 1 ? "dia seguido" : "dias seguidos"}` })
        )
      ),
      dr ? h(
        "div",
        { style: { marginTop: "12px" } },
        h("div", { class: "row nowrap small" }, h("span", { class: "grow", text: "Progresso da Daily Routine" }), h("b", { text: `${Math.round(dr.ratio * 100)}%` })),
        bar(dr.ratio)
      ) : null,
      h("div", { style: { marginTop: "14px" } }, continueBtn),
      resumeLabel ? h("div", { class: "small muted center", style: { marginTop: "6px" }, "data-role": "continue-where", text: resumeLabel }) : null
    ));
    if (registry().characters.length > 1) view.append(characterSwitcher(App2));
    view.append(h("h2", { text: "Minhas jornadas" }));
    view.append(trackCard({
      role: "track-dr",
      title: `Daily Routine \xB7 ${name}`,
      desc: planned ? "As rotinas desta persona ainda est\xE3o em prepara\xE7\xE3o. O progresso dela j\xE1 \xE9 separado." : "A rotina da persona em m\xF3dulos: palavras, express\xF5es, ouvir, falar e conversar.",
      t: dr,
      view: drView,
      planned,
      onOpen: async () => {
        await App2.setJourney(null);
        App2.go("#/modules");
      }
    }));
    if (j) {
      view.append(trackCard({
        role: "journey-entry",
        title: j.name,
        desc: "Jornada comunicativa: entender e participar de conversas reais, com progresso pr\xF3prio (o mesmo para todas as personas).",
        t: cp,
        view: cpView,
        button: "open-journey",
        onOpen: async () => {
          await App2.setJourney(j.id);
          App2.go("#/modules");
        }
      }));
    }
    const due = Object.values(state.cards).filter((c) => c.due <= today && cardInContent(App2.content, c.k)).length;
    if (due) view.append(h(
      "a",
      { class: "card link flat", href: "#/review", style: { marginTop: "12px" }, "data-role": "due" },
      h(
        "div",
        { class: "row nowrap" },
        h("span", { class: "icon-btn accent" }, icon("refresh")),
        h("div", { class: "grow" }, h("b", { text: `${due} para revisar` }), h("div", { class: "small muted", text: App2.journey ? j.name : `Daily Routine \xB7 ${name}` })),
        icon("next")
      )
    ));
    const allCards = Object.values(state.profiles).reduce((n, p) => n + Object.keys(p && p.cards || {}).length, 0);
    if (state.lastBackupAt === null && allCards > 30) {
      view.append(h("div", { class: "notice warn", style: { marginTop: "16px" } }, "Seu progresso fica s\xF3 neste aparelho. ", h("a", { href: "#/settings", text: "Fa\xE7a um backup" }), " de vez em quando."));
    }
    view.append(h("div", { style: { marginTop: "16px" } }, installCard(App2, { compact: true })));
  }
  function trackCard({ role, title, desc, t, view, planned = false, onOpen, button = "open-track" }) {
    const next = t && t.current && t.next ? `${t.current.id} \xB7 ${moduleTitleOf(view, t.current.id)} \u2014 ${t.next.title}` : t && t.total ? "Todas as etapas conclu\xEDdas \u{1F389}" : null;
    return h(
      "section",
      { class: "card track", "data-role": role },
      h("h3", { text: title }),
      h("p", { class: "small muted", style: { margin: "2px 0 8px" }, text: desc }),
      t && t.total ? h("div", {}, h("div", { class: "row nowrap small" }, h("span", { class: "grow", text: `${t.done} de ${t.total} etapas` }), h("b", { text: `${Math.round(t.ratio * 100)}%` })), bar(t.ratio)) : null,
      next ? h("div", { class: "small", style: { marginTop: "6px" }, "data-role": "next-step" }, h("span", { class: "muted", text: "Pr\xF3xima etapa: " }), next) : null,
      h(
        "button",
        { class: `btn block${planned ? "" : " primary"}`, "data-role": button, style: { marginTop: "10px" }, disabled: planned, onclick: onOpen },
        icon(planned ? "lock" : "play"),
        planned ? "Em prepara\xE7\xE3o" : t && t.done ? "Continuar" : "Come\xE7ar"
      )
    );
  }
  function moduleTitleOf(view, id) {
    const r = moduleOf(view, id);
    return r ? r.title && r.title !== r.pt ? r.title : r.pt : id;
  }
  function greeting() {
    const hr = (/* @__PURE__ */ new Date()).getHours();
    return hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  }
  function welcome(App2) {
    const box2 = h(
      "section",
      { class: "card", style: { marginTop: "8px" } },
      h("h3", { text: "Bem-vindo! Como funciona" }),
      h(
        "ul",
        { class: "small", style: { paddingLeft: "18px", margin: "6px 0 10px" } },
        h("li", { text: "Cada jornada \xE9 feita de m\xF3dulos com cinco etapas: palavras, express\xF5es, ouvir, falar e conversar." }),
        h("li", { text: "Uma etapa abre quando a anterior \xE9 conclu\xEDda. Erros voltam para revis\xE3o; n\xE3o \xE9 preciso acertar tudo." }),
        h("li", { text: "Cada persona e o Conversation Practice t\xEAm progresso pr\xF3prio." }),
        h("li", { text: "Tudo funciona sem internet e fica s\xF3 neste aparelho." })
      ),
      h("button", { class: "btn primary block", onclick: async () => {
        App2.state.welcomed = true;
        App2.save();
        await requestPersistence();
        box2.remove();
      } }, "Entendi")
    );
    return box2;
  }

  // app/js/ui/expression.js
  var hasExpressionCard = (it) => !!(it && it.explain && it.extra);
  var play2 = async (clip) => {
    const r = await play(clip);
    if (!r.ok) toast("\xC1udio indispon\xEDvel neste aparelho.");
  };
  function openExpression(it, { sentence = null } = {}) {
    const say = it.en.replace(/\.\.\.$|…$/, "");
    return sheet(
      h(
        "div",
        { class: "expr-card", "data-role": "expression", "data-item": it.id },
        h(
          "div",
          { class: "row nowrap" },
          h("div", { class: "grow" }, h("div", { class: "word-en en", text: it.en }), h("div", { class: "small muted", text: categoryLabel(it.c) })),
          h("button", { class: "icon-btn accent", "aria-label": `Ouvir \u201C${say}\u201D`, "data-role": "expr-audio", onclick: () => play2({ key: it.au, text: say }) }, icon("speaker"))
        ),
        h("p", { style: { margin: "10px 0 4px" } }, h("b", { text: "Significado: " }), it.pt),
        h("p", { class: "small", style: { margin: "4px 0 10px" }, text: it.explain }),
        sentence ? h("div", { class: "small muted", style: { marginBottom: "8px" } }, "No texto: ", h("span", { class: "en", text: sentence.en })) : null,
        h(
          "div",
          { class: "card flat" },
          h("div", { class: "tiny muted", text: "Outro exemplo" }),
          h("p", { class: "en", style: { margin: "2px 0" }, text: it.extra.en }),
          h("p", { class: "small muted", style: { margin: 0 }, text: it.extra.pt }),
          h("button", { class: "btn small", style: { marginTop: "6px" }, "data-role": "expr-example-audio", onclick: () => play2({ key: it.extra.au, text: it.extra.en }) }, icon("speaker"), "Ouvir o exemplo")
        )
      ),
      { label: `Express\xE3o: ${it.en}` }
    );
  }
  function highlightedSentence(content, s, { onSentence } = {}) {
    const hits = [];
    for (const id of s.items) {
      const it = content.items[id];
      if (!hasExpressionCard(it)) continue;
      const loc = locate(it, s.en);
      if (!loc) continue;
      const start2 = loc.before.length, end = start2 + loc.target.length;
      if (hits.some((x) => start2 < x.end && end > x.start)) continue;
      hits.push({ start: start2, end, it });
    }
    hits.sort((a, b) => a.start - b.start);
    const el = h("span", { class: "sent", role: "button", tabindex: "0", "aria-label": `Ouvir: ${s.en}` });
    let pos = 0;
    for (const x of hits) {
      el.append(s.en.slice(pos, x.start));
      const b = h("button", { type: "button", class: "hl-expr", "data-role": "hl", "data-item": x.it.id, "aria-label": `${x.it.en}: ver significado` }, s.en.slice(x.start, x.end));
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        openExpression(x.it, { sentence: s });
      });
      el.append(b);
      pos = x.end;
    }
    el.append(s.en.slice(pos));
    if (onSentence) {
      el.addEventListener("click", () => onSentence(s.id));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target === el) onSentence(s.id);
      });
    }
    return el;
  }

  // app/js/ui/explore.js
  var exploreTab = "routines";
  function renderExplore(App2) {
    const view = App2.layout("Estudar");
    const tabs = [["routines", "Rotinas"], ["contexts", "Momentos"], ["categories", "Categorias"]];
    const seg = h("div", { class: "seg", role: "group", "aria-label": "Organizar por" });
    const body = h("div", { style: { marginTop: "12px" } });
    const draw = () => {
      clear(seg).append(...tabs.map(([id, label]) => h("button", { "aria-pressed": String(exploreTab === id), onclick: () => {
        exploreTab = id;
        draw();
      } }, label)));
      clear(body);
      if (exploreTab === "routines") body.append(routineList(App2));
      if (exploreTab === "contexts") body.append(contextList(App2));
      if (exploreTab === "categories") body.append(categoryList(App2));
    };
    draw();
    view.append(seg, body);
  }
  function routineList(App2) {
    const { content, state } = App2;
    return h("div", {}, content.routines.map((r) => {
      const m = mastery(state.cards, r.items.map((i) => cardKey("item", i, "rec")));
      return h(
        "a",
        { class: "card link", href: `#/routine/${r.id}` },
        h(
          "div",
          { class: "chips" },
          h("span", { class: "chip", text: r.id }),
          r.priority ? h("span", { class: "chip accent", text: "Priorit\xE1ria" }) : null,
          h("span", { class: "chip", text: content.dayTypes[r.dayType] })
        ),
        h("h3", { style: { margin: "8px 0 2px" }, text: r.pt }),
        h("div", { class: "small muted en", text: r.title }),
        h("div", { style: { marginTop: "10px" } }, bar(m.ratio))
      );
    }));
  }
  function contextList(App2) {
    const { content, state } = App2;
    return h("div", {}, content.contexts.map((c) => {
      const ids = Object.values(content.items).filter((it) => it.ctx.includes(c.id) && !it.tags.includes("grammar-model")).map((it) => it.id);
      const m = mastery(state.cards, ids.map((i) => cardKey("item", i, "rec")));
      return h(
        "a",
        { class: "card link", href: `#/context/${c.id}` },
        h(
          "div",
          { class: "row nowrap" },
          h("span", { style: { fontSize: "1.6rem" }, text: c.icon }),
          h("div", { style: { flex: 1, minWidth: 0 } }, h("h3", { style: { margin: 0 }, text: c.pt }), h("div", { class: "small muted en", text: `${c.en} \xB7 ${ids.length} itens` }))
        ),
        h("div", { style: { marginTop: "10px" } }, bar(m.ratio))
      );
    }));
  }
  function categoryList(App2) {
    const { content, state } = App2;
    return h("ul", { class: "list card" }, content.categories.map((c) => {
      const ids = categoryItems(content, c.id);
      const m = mastery(state.cards, ids.map((i) => cardKey("item", i, "rec")));
      const count = c.id === "qa" ? Object.keys(content.questions).length : c.id === "text" ? content.routines.length : c.id === "verb" ? content.verbs.length + ids.length : ids.length;
      return h("li", {}, h(
        "a",
        { class: "list-btn", href: `#/category/${c.id}` },
        h("div", { class: "grow" }, h("div", { class: "title", text: c.pt }), h("div", { class: "small muted", text: `${count} ${c.id === "qa" ? "perguntas" : c.id === "text" ? "textos" : "itens"}` })),
        ids.length ? h("span", { class: "small muted", text: `${Math.round(m.ratio * 100)}%` }) : null,
        icon("next")
      ));
    }));
  }
  var categoryItems = (content, cat) => Object.values(content.items).filter((it) => it.c === cat).map((it) => it.id);
  function renderRoutine(App2, { arg }) {
    const { content, state } = App2;
    const r = content.routines.find((x) => x.id === arg);
    if (!r) return App2.go("#/explore");
    const view = App2.layout(`${r.id} \xB7 ${r.pt}`, { back: "#/explore" });
    let showPt = false;
    const m = mastery(state.cards, r.items.map((i) => cardKey("item", i, "rec")));
    const revNotes = content.review.rev.filter((x) => x.note && (x.where.startsWith(r.id + "-") || x.where.startsWith(r.id + ".")));
    view.append(...[
      h(
        "div",
        { class: "chips" },
        r.priority ? h("span", { class: "chip accent", text: "Priorit\xE1ria para a aula" }) : null,
        h("span", { class: "chip", text: content.dayTypes[r.dayType] }),
        r.stage ? h("span", { class: "chip", "data-role": "stage", text: `Etapa ${r.stage}` }) : null,
        r.session ? h("span", { class: "chip", "data-role": "level", text: r.session.level }) : h("span", { class: "chip", text: r.kind === "episode" ? "Situa\xE7\xE3o ilustrativa" : r.kind === "unit" ? "Di\xE1logo do Conversation Book + pr\xE1tica" : "Tipo de dia \u2014 n\xE3o \xE9 todo dia" })
      ),
      h("p", { class: "en muted", style: { margin: "8px 0 2px" }, text: r.title }),
      r.session ? h("p", { class: "small", "data-role": "focus", style: { margin: "2px 0" } }, h("b", { text: "Foco: " }), h("span", { class: "en", text: r.session.focus })) : null,
      h("p", { class: "small", text: r.session ? `Objetivo: ${r.goal}` : r.goal }),
      r.grammar ? h("p", { class: "small", "data-role": "grammar" }, h("b", { text: r.session ? "L\xEDngua em contexto: " : "Foco da l\xEDngua: " }), r.grammar) : null,
      r.session ? sessionVocab(content, r) : null,
      bar(m.ratio),
      h(
        "div",
        { class: "row", style: { marginTop: "14px" } },
        h("a", { class: "btn primary", href: sessionHref({ routine: r.id }) }, icon("play"), "Praticar"),
        h("button", { class: "btn", onclick: () => listenAll() }, icon("speaker"), "Ouvir tudo"),
        h("a", { class: "btn", href: `#/lab?routine=${r.id}` }, icon("mic"), "Falar")
      ),
      ...r.kind === "unit" || r.kind === "session" ? [] : [h("a", { class: "btn block", href: sessionHref({ routine: r.id, mode: "present" }), style: { marginTop: "10px" } }, icon("target"), "Treino para a aula: contar blocos + perguntas")]
    ].filter(Boolean));
    const blocksBox = h("div", {});
    const ptToggle = h("button", { class: "btn small", "aria-pressed": "false", onclick: () => {
      showPt = !showPt;
      ptToggle.setAttribute("aria-pressed", String(showPt));
      ptToggle.textContent = showPt ? "Ocultar tradu\xE7\xE3o" : "Mostrar tradu\xE7\xE3o";
      drawBlocks();
    } }, "Mostrar tradu\xE7\xE3o");
    view.append(h("div", { class: "row", style: { marginTop: "22px" } }, h("h2", { style: { margin: 0, flex: 1 }, text: "Texto-modelo" }), ptToggle), blocksBox);
    const sentenceEls = /* @__PURE__ */ new Map();
    function drawBlocks() {
      clear(blocksBox);
      sentenceEls.clear();
      r.blocks.forEach((bid) => {
        const b = content.blocks[bid];
        const told = state.cards[cardKey("block", bid, "tell")];
        const para = h(b.kind === "dialogue" ? "div" : "p", { class: b.kind === "dialogue" ? "para dialogue" : "para" });
        b.sentences.forEach((sid, i) => {
          const s = content.sentences[sid];
          const el = r.session ? highlightedSentence(content, s, { onSentence: playOne }) : h("span", { class: "sent", role: "button", tabindex: "0", "aria-label": `Ouvir: ${s.en}`, text: s.en });
          if (!r.session) {
            el.addEventListener("click", () => playOne(sid));
            el.addEventListener("keydown", (e) => {
              if (e.key === "Enter") playOne(sid);
            });
          }
          sentenceEls.set(sid, el);
          if (b.kind === "dialogue") para.append(h("p", { class: "line" }, h("b", { class: "speaker", text: `${s.speaker}: ` }), el));
          else para.append(el, i < b.sentences.length - 1 ? " " : "");
        });
        blocksBox.append(h(
          "section",
          { class: "card" },
          h(
            "div",
            { class: "row" },
            h("span", { class: "chip", text: `Bloco ${b.index}` }),
            b.title && (r.kind === "episode" || r.kind === "unit") ? h("span", { class: "chip", text: b.title }) : null,
            b.provenance ? h("span", { class: `chip${b.provenance === "original" ? " accent" : ""}`, "data-provenance": b.provenance, text: { original: "Original do livro", adapted: "Adapta\xE7\xE3o did\xE1tica", new: "Conte\xFAdo novo" }[b.provenance] }) : null,
            ...b.ctx.map((c) => h("span", { class: "chip", text: content.contexts.find((x) => x.id === c).pt })),
            h("span", { class: "spacer" }),
            told ? h("span", { class: "chip ok", text: "contado \u2713" }) : null
          ),
          para,
          showPt ? h("p", { class: "para-pt", text: b.pt }) : null,
          h(
            "div",
            { class: "row" },
            h("button", { class: "btn small", onclick: () => listenBlock(b) }, icon("speaker"), "Ouvir bloco"),
            h("a", { class: "btn small", href: `#/lab?block=${bid}` }, icon("mic"), "Gravar")
          )
        ));
      });
    }
    drawBlocks();
    const mark = (sid) => sentenceEls.forEach((el, k) => el.classList.toggle("playing", k === sid));
    async function playOne(sid) {
      stopAll();
      mark(sid);
      const s = content.sentences[sid];
      const res = await play({ key: s.au, text: s.en });
      mark(null);
      if (!res.ok) toast("\xC1udio indispon\xEDvel neste aparelho.");
    }
    function listenBlock(b) {
      stopAll();
      const sids = b.sentences;
      playSequence(sids.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })), { onIndex: (i) => mark(i >= 0 ? sids[i] : null) });
    }
    function listenAll() {
      stopAll();
      const sids = r.blocks.flatMap((b) => content.blocks[b].sentences);
      playSequence(sids.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })), { onIndex: (i) => mark(i >= 0 ? sids[i] : null) });
    }
    const words2 = Object.values(content.items).filter((it) => it.routines.includes(r.id) && !it.tags.includes("grammar-model"));
    view.append(h("h2", { text: `Express\xF5es desta rotina (${words2.length})` }), itemList(App2, words2));
    if (r.usage.length || revNotes.length) {
      view.append(h("h2", { text: "Pontos de uso" }), h(
        "div",
        { class: "card flat" },
        ...r.usage.map((u) => h("p", { class: "small", text: "\u2022 " + u })),
        ...revNotes.map((n) => h("div", { class: "notice warn small", style: { marginTop: "8px" } }, h("b", { text: `Nota de revis\xE3o (${n.id}): ` }), n.note))
      ));
    }
    view.append(h("h2", { text: r.kind === "unit" ? "Perguntas e transfer\xEAncia" : "Perguntas da teacher" }), h("ul", { class: "list card" }, r.questions.map((qid) => {
      const q = content.questions[qid];
      const done = state.cards[cardKey("q", qid, "conv")];
      return h("li", {}, h(
        "a",
        { class: "list-btn", href: `#/lab?q=${qid}` },
        h("div", { class: "grow" }, h("div", { class: "title en", text: q.q }), h("div", { class: "small muted", text: `${QKIND[q.kind] ? QKIND[q.kind] + " \xB7 " : ""}${done ? "praticada" : "ainda n\xE3o praticada"}` })),
        icon("mic")
      ));
    })));
  }
  var QKIND = { comp: "compreens\xE3o da hist\xF3ria", transfer: "responda sobre voc\xEA", review: "revis\xE3o de unidade anterior" };
  function itemList(App2, items) {
    return h("ul", { class: "list card" }, items.map((it) => h(
      "li",
      {},
      h(
        "button",
        { class: "list-btn", onclick: () => openItem(App2, it) },
        statusDot(App2.state, it.id),
        h("div", { class: "grow" }, h("div", { class: "title en", text: it.en }), h("div", { class: "small muted", text: `${it.pt} \xB7 ${categoryLabel(it.c)}` })),
        it.source === "new" ? sourceChip("new") : null
      )
    )));
  }
  function renderContext(App2, { arg }) {
    const c = App2.content.contexts.find((x) => x.id === arg);
    if (!c) return App2.go("#/explore");
    const view = App2.layout(`${c.icon} ${c.pt}`, { back: "#/explore" });
    const items = Object.values(App2.content.items).filter((it) => it.ctx.includes(c.id) && !it.tags.includes("grammar-model")).sort((a, b) => a.lvl - b.lvl);
    view.append(
      h("p", { class: "muted en", text: c.en }),
      h("a", { class: "btn primary block", href: sessionHref({ context: c.id }) }, icon("play"), "Praticar este momento do dia")
    );
    const cats = App2.content.categories.filter((cat) => items.some((it) => it.c === cat.id));
    for (const cat of cats) {
      view.append(h("h2", { text: cat.pt }), itemList(App2, items.filter((it) => it.c === cat.id)));
    }
  }
  function renderCategory(App2, { arg }) {
    const { content } = App2;
    const cat = content.categories.find((x) => x.id === arg);
    if (!cat) return App2.go("#/explore");
    const view = App2.layout(cat.pt, { back: "#/explore" });
    if (cat.id === "qa") {
      view.append(h("a", { class: "btn primary block", href: sessionHref({ category: "qa" }) }, icon("play"), "Praticar perguntas"));
      const groups = [["Das rotinas (Word)", (q) => q.source === "word" && q.routine], ["Gerais (Word)", (q) => q.source === "word" && !q.routine], ["Perguntas inesperadas (novas)", (q) => q.source === "new"]];
      for (const [title, pred] of groups) {
        view.append(h("h2", { text: title }), h("ul", { class: "list card" }, Object.values(content.questions).filter(pred).map((q) => h("li", {}, h("a", { class: "list-btn", href: `#/lab?q=${q.id}` }, h("div", { class: "grow" }, h("div", { class: "title en", text: q.q }), h("div", { class: "small muted", text: q.routine || (q.source === "new" ? "conte\xFAdo novo" : "geral") })), icon("mic"))))));
      }
      return;
    }
    if (cat.id === "text") {
      view.append(h("p", { class: "muted", text: "As dez rotinas completas, para ler, ouvir e recontar." }), routineList(App2));
      return;
    }
    const items = Object.values(content.items).filter((it) => it.c === cat.id).sort((a, b) => a.lvl - b.lvl);
    view.append(h("a", { class: "btn primary block", href: sessionHref({ category: cat.id }) }, icon("play"), "Praticar esta categoria"));
    if (cat.id === "verb") {
      view.append(h("h2", { text: "Simple Present \u2014 3\xAA pessoa" }), h("ul", { class: "list card" }, content.verbs.map((v) => h(
        "li",
        {},
        h(
          "div",
          { class: "list-btn" },
          h("div", { class: "grow" }, h("div", { class: "title en", text: `${v.base} \u2192 ${v.third}` }), h("div", { class: "small muted", text: v.pt })),
          speakerButton({ key: v.au3, text: v.third }, { cls: "icon-btn ghost" })
        )
      ))));
    }
    if (items.length) view.append(h("h2", { text: `Itens (${items.length})` }), itemList(App2, items));
    if (cat.id === "sentence") {
      view.append(h("p", { class: "small muted", style: { marginTop: "10px" }, text: `Al\xE9m destes, as ${Object.keys(content.sentences).length} frases das rotinas s\xE3o praticadas nos exerc\xEDcios de constru\xE7\xE3o.` }));
    }
  }
  function sessionVocab(content, r) {
    return h(
      "div",
      { class: "card flat", "data-role": "session-vocab", style: { marginTop: "8px" } },
      h("div", { class: "small", style: { marginBottom: "6px" } }, h("b", { text: "Vocabul\xE1rio priorit\xE1rio" }), h("span", { class: "muted", text: " \u2014 toque para ver o significado" })),
      h("div", { class: "chips" }, r.session.vocabIds.map((id, i) => {
        const it = content.items[id];
        return h("button", { type: "button", class: "chip hl-chip", "data-item": id, onclick: () => openExpression(it) }, r.session.vocab[i] || it.en);
      }))
    );
  }

  // app/js/audio/recorder.js
  var supported = () => !!(globalThis.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && globalThis.MediaRecorder);
  function pickMime() {
    const opts = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    return opts.find((m) => MediaRecorder.isTypeSupported(m)) || "";
  }
  async function permissionState() {
    try {
      return (await navigator.permissions.query({ name: "microphone" })).state;
    } catch (e) {
      return "unknown";
    }
  }
  async function start({ maxMs = 18e4, onLevel } = {}) {
    if (!supported()) {
      const e = new Error("unsupported");
      e.userMessage = "Este navegador n\xE3o oferece grava\xE7\xE3o de \xE1udio neste modo de execu\xE7\xE3o.";
      throw e;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (err) {
      const e = new Error(err.name);
      e.userMessage = err.name === "NotAllowedError" ? "O microfone foi bloqueado. No Chrome: toque no cadeado ao lado do endere\xE7o \u2192 Permiss\xF5es \u2192 Microfone \u2192 Permitir. Depois tente de novo." : err.name === "NotFoundError" ? "Nenhum microfone encontrado." : `N\xE3o foi poss\xEDvel acessar o microfone (${err.name}).`;
      throw e;
    }
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : void 0);
    const chunks = [];
    rec.ondataavailable = (ev) => {
      if (ev.data.size) chunks.push(ev.data);
    };
    const t0 = performance.now();
    let raf = null, ctx = null;
    if (onLevel && (globalThis.AudioContext || globalThis.webkitAudioContext)) {
      ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      const loop = () => {
        an.getByteTimeDomainData(buf);
        let s = 0;
        for (const v of buf) s += ((v - 128) / 128) ** 2;
        onLevel(Math.min(1, Math.sqrt(s / buf.length) * 4));
        raf = requestAnimationFrame(loop);
      };
      loop();
    }
    const cleanup2 = () => {
      if (raf) cancelAnimationFrame(raf);
      if (ctx) ctx.close().catch(() => {
      });
      stream.getTracks().forEach((t) => t.stop());
    };
    let timer = null;
    const stopped = new Promise((resolve) => {
      rec.onstop = () => {
        cleanup2();
        clearTimeout(timer);
        resolve({ blob: new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" }), ms: Math.round(performance.now() - t0) });
      };
    });
    rec.start(250);
    timer = setTimeout(() => {
      if (rec.state !== "inactive") rec.stop();
    }, maxMs);
    return {
      stop: () => {
        if (rec.state !== "inactive") rec.stop();
        return stopped;
      },
      cancel: () => {
        if (rec.state !== "inactive") rec.stop();
      },
      stopped
    };
  }

  // app/js/audio/analysis.js
  async function analyseBlob(blob, { expectedWords = 0, referenceSec = 0 } = {}) {
    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    try {
      const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
      return analyseSamples(buf.getChannelData(0), buf.sampleRate, { expectedWords, referenceSec });
    } catch (e) {
      return null;
    } finally {
      ctx.close().catch(() => {
      });
    }
  }
  function analyseSamples(data, sampleRate, { expectedWords = 0, referenceSec = 0 } = {}) {
    const win = Math.round(sampleRate * 0.02);
    const rms = [];
    for (let i = 0; i + win <= data.length; i += win) {
      let s = 0;
      for (let j = i; j < i + win; j++) s += data[j] * data[j];
      rms.push(Math.sqrt(s / win));
    }
    if (!rms.length) return null;
    const sorted = [...rms].sort((a, b) => a - b);
    const noise = sorted[Math.floor(sorted.length * 0.15)] || 0;
    const peak = sorted[Math.floor(sorted.length * 0.98)] || 0;
    const thr = Math.max(8e-3, noise * 2.5, peak * 0.12);
    const voiced = rms.map((r) => r > thr);
    const first = voiced.indexOf(true), last = voiced.lastIndexOf(true);
    const totalSec = rms.length * 0.02;
    if (first === -1) return { totalSec, speechSec: 0, voicedSec: 0, pauses: 0, longPauses: 0, wpm: 0, silent: true, envelope: downsample(rms, 120), peak };
    let pauses = 0, longPauses = 0, run2 = 0;
    for (let i = first; i <= last; i++) {
      if (!voiced[i]) run2++;
      else {
        if (run2 >= 15) pauses++;
        if (run2 >= 40) longPauses++;
        run2 = 0;
      }
    }
    const speechSec = (last - first + 1) * 0.02;
    const voicedSec = voiced.filter(Boolean).length * 0.02;
    const wpm = expectedWords && speechSec > 0.5 ? Math.round(expectedWords / speechSec * 60) : 0;
    return {
      totalSec: round(totalSec),
      speechSec: round(speechSec),
      voicedSec: round(voicedSec),
      pauses,
      longPauses,
      wpm,
      paceVsReference: referenceSec ? round(speechSec / referenceSec) : null,
      clipped: peak > 0.98,
      quiet: peak < 0.05,
      silent: false,
      envelope: downsample(rms, 120),
      peak
    };
  }
  var round = (x) => Math.round(x * 10) / 10;
  var fmt = (x) => String(x).replace(".", ",");
  function downsample(arr, n) {
    if (arr.length <= n) return arr;
    const out = [];
    const step = arr.length / n;
    for (let i = 0; i < n; i++) {
      const slice = arr.slice(Math.floor(i * step), Math.floor((i + 1) * step));
      out.push(Math.max(...slice));
    }
    return out;
  }
  function describe(a, { expectedWords = 0 } = {}) {
    if (!a) return { verdict: "inconclusive", lines: ["N\xE3o foi poss\xEDvel analisar o \xE1udio neste aparelho."] };
    if (a.silent || a.speechSec < 0.4) return { verdict: "inconclusive", lines: ["Quase n\xE3o captei voz. Fale mais perto do microfone e tente de novo."] };
    const lines = [];
    if (a.quiet) lines.push("Volume baixo: aproxime o celular da boca.");
    if (a.clipped) lines.push("Volume muito alto (distor\xE7\xE3o): afaste um pouco o celular.");
    lines.push(`Fala: ${fmt(a.speechSec)} s \xB7 ${a.pauses} pausa(s)${a.longPauses ? `, ${a.longPauses} longa(s)` : ""}.`);
    const unreliable = a.wpm && (a.wpm > 260 || a.wpm < 40);
    if (a.paceVsReference && !unreliable) {
      const p = a.paceVsReference;
      lines.push(p > 1.8 ? "Ritmo bem mais lento que a refer\xEAncia \u2014 normal no in\xEDcio; tente ligar as palavras." : p > 1.3 ? "Ritmo um pouco mais lento que a refer\xEAncia." : p < 0.75 ? "Mais r\xE1pido que a refer\xEAncia: confira se n\xE3o \u201Cengoliu\u201D palavras." : "Ritmo pr\xF3ximo ao da refer\xEAncia.");
    }
    if (a.wpm && expectedWords >= 8) {
      if (a.wpm > 260 || a.wpm < 40) lines.push("Ritmo n\xE3o estimado: a grava\xE7\xE3o parece curta demais ou com ru\xEDdo para medir com seguran\xE7a.");
      else lines.push(`\u2248 ${a.wpm} palavras/min (conversa natural: ~120\u2013160).`);
    }
    return { verdict: "ok", lines };
  }

  // app/js/ui/recwidget.js
  var fmtSec = (ms) => String(Math.round(ms / 100) / 10).replace(".", ",");
  var clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function recWidget(App2, opts) {
    const { targetId, reference = [], expectedWords = 0, referenceSec = 0, maxMs = 18e4 } = opts;
    let session = null, blob = null, meta = null, url = null, startedAt = 0, timer = null, destroyed = false;
    const recBtn = h("button", { class: "rec-btn", type: "button", "aria-label": "Gravar minha voz" }, icon("mic"));
    const title = h("div", { class: "rec-title", text: "Gravar minha voz" });
    const time = h("div", { class: "small muted", text: "Toque no microfone para come\xE7ar" });
    const meterFill = h("i");
    const meter = h("div", { class: "meter hidden", "aria-hidden": "true" }, meterFill);
    const after = h("div", { class: "rec-after hidden" });
    const canvas = h("canvas", { class: "wave", width: 600, height: 48, "aria-hidden": "true" });
    const metrics = h("div", { class: "small" });
    const audioEl = h("audio", { preload: "auto" });
    const mineBtn = h("button", { class: "btn small", type: "button", "data-role": "mine" });
    const drawMine = () => {
      const playing = !audioEl.paused && !audioEl.ended;
      clear(mineBtn).append(icon(playing ? "pause" : "play"), playing ? "Pausar minha voz" : "Minha voz");
      mineBtn.setAttribute("aria-pressed", String(playing));
    };
    const MEDIA_EVENTS = ["play", "playing", "pause", "ended", "emptied"];
    MEDIA_EVENTS.forEach((ev) => audioEl.addEventListener(ev, drawMine));
    drawMine();
    mineBtn.addEventListener("click", () => {
      if (!audioEl.paused && !audioEl.ended) audioEl.pause();
      else if (audioEl.src) playElement(audioEl);
    });
    const el = h(
      "div",
      { class: "card rec-panel" },
      h("div", { class: "rec-main" }, recBtn, h("div", { class: "rec-info" }, title, time, meter)),
      after
    );
    recBtn.addEventListener("click", () => session ? stop2() : start2());
    const setIdle = (hasRec) => {
      title.textContent = hasRec ? "Gravar novamente" : "Gravar minha voz";
      recBtn.setAttribute("aria-label", hasRec ? "Gravar novamente" : "Gravar minha voz");
    };
    async function start2() {
      if (session || destroyed) return;
      stopAll();
      try {
        session = await start({ maxMs, onLevel: (v) => {
          meterFill.style.width = `${Math.round(v * 100)}%`;
        } });
      } catch (e) {
        toast(e.userMessage || "N\xE3o foi poss\xEDvel gravar.", 6e3);
        return;
      }
      recBtn.classList.add("on");
      recBtn.setAttribute("aria-label", "Parar grava\xE7\xE3o");
      clear(recBtn).append(icon("stop"));
      meter.classList.remove("hidden");
      el.classList.add("recording");
      startedAt = Date.now();
      title.textContent = "Gravando\u2026 0:00";
      time.textContent = "Toque no bot\xE3o para parar";
      if (opts.onStart) {
        try {
          opts.onStart();
        } catch (e) {
        }
      }
      timer = setInterval(() => {
        title.textContent = `Gravando\u2026 ${clock(Math.round((Date.now() - startedAt) / 1e3))}`;
      }, 250);
      session.stopped.then(onStopped);
    }
    function stop2() {
      if (session) session.stop();
    }
    async function onStopped(res) {
      clearInterval(timer);
      session = null;
      if (destroyed) {
        if (targetId && backend === "indexeddb") {
          try {
            await putRecording(targetId, res.blob, { ms: res.ms });
            recordRecording(App2.state, targetId, { ms: res.ms });
            App2.save();
          } catch (e) {
          }
        }
        return;
      }
      recBtn.classList.remove("on");
      el.classList.remove("recording");
      clear(recBtn).append(icon("mic"));
      meter.classList.add("hidden");
      setIdle(true);
      blob = res.blob;
      meta = { ms: res.ms };
      releaseElement(audioEl);
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      audioEl.src = url;
      time.textContent = `Grava\xE7\xE3o de ${fmtSec(res.ms)} s`;
      const mine = blob;
      const analysis = await analyseBlob(blob, { expectedWords, referenceSec });
      if (destroyed || mine !== blob) return;
      drawWave(canvas, analysis ? analysis.envelope : []);
      showMetrics(analysis);
      showAfter();
      meta = { ...meta, analysis: analysis && { ...analysis, envelope: void 0 } };
      if (targetId) {
        try {
          if (backend === "indexeddb") await putRecording(targetId, blob, meta);
        } catch (e) {
          toast("N\xE3o foi poss\xEDvel salvar esta grava\xE7\xE3o no aparelho (pouco espa\xE7o?). A grava\xE7\xE3o anterior foi mantida.", 6e3);
        }
        const r = recordRecording(App2.state, targetId, { ms: res.ms });
        App2.save();
        if (r.xp) toast(`+${r.xp} XP pela pr\xE1tica oral`);
      }
      opts.onRecorded && opts.onRecorded(blob, analysis);
    }
    function showMetrics(analysis) {
      clear(metrics).append(
        ...describe(analysis, { expectedWords }).lines.map((l) => h("div", { text: "\u2022 " + l })),
        h("div", { class: "tiny muted", style: { marginTop: "4px" }, text: "Medido no aparelho. N\xE3o avalia a pron\xFAncia dos sons." })
      );
    }
    function showAfter() {
      clear(after).append(
        canvas,
        h(
          "div",
          { class: "row rec-actions" },
          mineBtn,
          reference.length ? h("button", { class: "btn small", type: "button", onclick: () => playRef() }, icon("speaker"), "Refer\xEAncia") : null,
          reference.length ? h("button", { class: "btn small", type: "button", onclick: () => ab() }, icon("ab"), "Comparar A/B") : null
        ),
        h(
          "div",
          { class: "rec-secondary" },
          h("details", { class: "more" }, h("summary", { text: "Ritmo e pausas" }), metrics),
          targetId ? h("button", { class: "link-btn danger", type: "button", onclick: () => askDelete() }, icon("trash"), "Excluir grava\xE7\xE3o") : null
        )
      );
      after.classList.remove("hidden");
    }
    const playRef = () => playSequence(reference);
    async function ab() {
      stopAll();
      const done = await playSequence(reference);
      if (!done || destroyed) return;
      const g = generation();
      await new Promise((r) => setTimeout(r, 400));
      if (destroyed || g !== generation()) return;
      playElement(audioEl, { restart: true });
    }
    async function askDelete() {
      if (session || !blob) return;
      const ok = await confirmSheet("Excluir esta grava\xE7\xE3o?", "S\xF3 a grava\xE7\xE3o deste exerc\xEDcio ser\xE1 apagada. Suas outras grava\xE7\xF5es e seu progresso continuam.", { ok: "Excluir", danger: true });
      if (!ok || destroyed) return;
      await remove2();
    }
    async function remove2() {
      releaseElement(audioEl);
      if (url) {
        URL.revokeObjectURL(url);
        url = null;
      }
      blob = null;
      meta = null;
      if (targetId) {
        await deleteRecording(targetId);
        forgetRecording(App2.state, targetId);
        App2.save();
      }
      after.classList.add("hidden");
      clear(after);
      setIdle(false);
      time.textContent = "Grava\xE7\xE3o exclu\xEDda \xB7 toque no microfone para gravar";
      opts.onDeleted && opts.onDeleted();
    }
    async function updateMeta(forBlob, patch) {
      if (destroyed || !targetId || forBlob !== blob) return;
      meta = { ...meta || {}, ...patch };
      try {
        await updateRecordingMeta(targetId, patch);
      } catch (e) {
      }
    }
    if (targetId) {
      getRecording(targetId).then((rec) => {
        if (!rec || blob || destroyed || session) return;
        if (!rec.blob) {
          setIdle(true);
          time.textContent = `O \xE1udio desta grava\xE7\xE3o foi apagado automaticamente ap\xF3s ${RETENTION_DAYS} dias. O resultado continua salvo.`;
          meta = rec.meta || null;
          opts.onLoaded && opts.onLoaded(rec);
          return;
        }
        blob = rec.blob;
        meta = rec.meta || null;
        url = URL.createObjectURL(blob);
        audioEl.src = url;
        setIdle(true);
        time.textContent = `\xDAltima grava\xE7\xE3o salva (${new Date(rec.at).toLocaleDateString("pt-BR")})`;
        showAfter();
        analyseBlob(blob, { expectedWords, referenceSec }).then((a) => {
          if (destroyed || rec.blob !== blob) return;
          drawWave(canvas, a ? a.envelope : []);
          showMetrics(a);
        });
        opts.onLoaded && opts.onLoaded(rec);
      });
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (session) session.cancel();
      clearInterval(timer);
      releaseElement(audioEl);
      MEDIA_EVENTS.forEach((ev) => audioEl.removeEventListener(ev, drawMine));
      if (url) {
        URL.revokeObjectURL(url);
        url = null;
      }
    }
    return { el, start: start2, stop: stop2, getBlob: () => blob, getMeta: () => meta, updateMeta, isRecording: () => !!session, remove: remove2, destroy, audioEl };
  }
  function drawWave(canvas, env) {
    const g = canvas.getContext("2d");
    g.clearRect(0, 0, canvas.width, canvas.height);
    if (!env || !env.length) return;
    const max = Math.max(...env, 1e-4);
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#1d4e89";
    const step = canvas.width / env.length;
    env.forEach((v, i) => {
      const hh = Math.max(2, v / max * canvas.height);
      g.fillRect(i * step, (canvas.height - hh) / 2, Math.max(1, step - 1), hh);
    });
  }

  // app/js/engine/lexicon.js
  var words = null;
  var loading = null;
  function loadLexicon(url = "data/lexicon.txt.gz") {
    if (words) return Promise.resolve(true);
    if (!loading) {
      loading = (async () => {
        try {
          const res = await fetch(url);
          if (!res.ok) return false;
          let buf = new Uint8Array(await res.arrayBuffer());
          if (buf[0] === 31 && buf[1] === 139 && typeof DecompressionStream !== "undefined") {
            buf = new Uint8Array(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
          }
          words = new Set(new TextDecoder().decode(buf).split("\n").filter(Boolean));
          return true;
        } catch (e) {
          return false;
        } finally {
          loading = null;
        }
      })();
    }
    return loading;
  }
  var IRREGULAR2 = { woke: "wake", woken: "wake", got: "get", gotten: "get", went: "go", gone: "go", had: "have", has: "have", ate: "eat", eaten: "eat", drove: "drive", driven: "drive", took: "take", taken: "take", made: "make", came: "come", left: "leave", bought: "buy", brought: "bring", slept: "sleep", did: "do", does: "do", was: "be", were: "be", is: "be", are: "be", am: "be", been: "be", saw: "see", seen: "see", said: "say", spent: "spend", met: "meet", ran: "run", drank: "drink", felt: "feel", kept: "keep", thought: "think", told: "tell", taught: "teach", read: "read", wrote: "write", written: "write", sat: "sit", stood: "stand", began: "begin", found: "find", heard: "hear", paid: "pay", put: "put", set: "set", shut: "shut", children: "child", men: "man", women: "woman", feet: "foot", teeth: "tooth" };
  function lemma(w) {
    let t = String(w).toLowerCase().replace(/[’]/g, "'").replace(/'s$/, "");
    if (IRREGULAR2[t]) return IRREGULAR2[t];
    if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
    if (t.length > 4 && /(ches|shes|sses|xes|zes)$/.test(t)) return t.slice(0, -2);
    if (t.length > 3 && t.endsWith("s") && !/(ss|us|is)$/.test(t)) t = t.slice(0, -1);
    else if (t.length > 5 && t.endsWith("ing")) t = undouble(t.slice(0, -3));
    else if (t.length > 4 && t.endsWith("ied")) t = t.slice(0, -3) + "y";
    else if (t.length > 4 && t.endsWith("ed")) t = undouble(t.slice(0, -2));
    return t;
  }
  function undouble(t) {
    return /([b-df-hj-np-tv-z])\1$/.test(t) && !/(ll|ss|ff|zz)$/.test(t) ? t.slice(0, -1) : t;
  }
  function isKnownWord(w, extra = null) {
    if (!words) return null;
    const t = String(w).toLowerCase().replace(/[’]/g, "'");
    if (words.has(t) || extra && extra.has(t)) return true;
    const base = lemma(t);
    if (words.has(base) || extra && extra.has(base)) return true;
    return words.has(base + "e") || words.has(t.replace(/'s$/, ""));
  }

  // app/js/engine/wordfeedback.js
  var SCORE_WEIGHTS = [
    { id: "intelligibility", label: "Pron\xFAncia e inteligibilidade", weight: 0.6 },
    { id: "fluency", label: "Ritmo e fluidez", weight: 0.2 },
    { id: "prosody", label: "Acentua\xE7\xE3o e entona\xE7\xE3o", weight: 0.15 },
    { id: "duration", label: "Dura\xE7\xE3o e naturalidade", weight: 0.05 }
  ];
  var MIN_CONFIDENCE = 0.5;
  var WEAK = /* @__PURE__ */ new Set(["a", "an", "the", "and", "to", "of", "at", "in", "on", "for", "or", "as", "by", "is", "am", "are", "it", "my", "i", "so", "but", "with", "from", "up", "do"]);
  var NUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50 };
  var AME = { analyze: "analyse", analyzes: "analyses", analyzing: "analysing", practice: "practise", practices: "practises", finalize: "finalise", organize: "organise", neighborhood: "neighbourhood" };
  function segment(text) {
    const segs = [];
    let pos = 0, w = 0;
    for (const s of tokenSpans(text)) {
      if (s.start > pos) segs.push({ text: text.slice(pos, s.start) });
      const norm = wordTokens(s.text).join(" ");
      const before = text.slice(0, s.start).trimEnd();
      const proper = /^[A-Z][a-z]/.test(s.text) && before !== "" && !/[.!?:]$/.test(before);
      segs.push({ text: s.text, w: w++, norm, weak: WEAK.has(norm), proper });
      pos = s.end;
    }
    if (pos < text.length) segs.push({ text: text.slice(pos) });
    return segs;
  }
  var wordsOf = (text) => segment(text).filter((s) => s.w !== void 0);
  function wordAudioText(seg) {
    const t = seg.text.replace(/[’]/g, "'").replace(/[.,!?;:]+$/, "");
    return seg.proper || t === "I" || /^[A-Z]{2,}/.test(t) ? t : t.toLowerCase();
  }
  function forms(t) {
    const out = /* @__PURE__ */ new Set([t]);
    if (AME[t]) out.add(AME[t]);
    if (/iz(e|ed|es|ing|ation)$/.test(t)) out.add(t.replace(/iz(e|ed|es|ing|ation)$/, "is$1"));
    const hm = /^(\d{1,2})(\d\d)$/.exec(t);
    if (hm && +hm[2] < 60) out.add(`${hm[1]}:${hm[2]}`).add(hm[1]);
    if (t in NUM) out.add(String(NUM[t]));
    const m = /^(\d{1,2}):(\d\d)$/.exec(t);
    if (m) {
      out.add(String(+m[1]));
      if (m[2] !== "00") out.add(m[2].replace(/^0/, ""));
    }
    if (/^\d+$/.test(t)) {
      for (const [k, v] of Object.entries(NUM)) if (String(v) === t) out.add(k);
    }
    if (t === "am" || t === "pm") {
      out.add(t[0]);
      out.add(t + ".");
    }
    if (t.endsWith("'s")) out.add(t.slice(0, -2));
    return out;
  }
  function sameWordForm(target, heard) {
    if (target === heard) return true;
    if (target.endsWith("'s") !== heard.endsWith("'s")) return false;
    const b = forms(heard);
    for (const x of forms(target)) if (b.has(x)) return true;
    return false;
  }
  function inflected(target, heard) {
    if (target.length < 3 || !heard.startsWith(target)) return false;
    const rest = heard.slice(target.length);
    return ["s", "es", "d", "ed", target.slice(-1) + "ed"].includes(rest);
  }
  function tokenEq(target, heard) {
    if (target === heard) return true;
    const a = forms(target), b = forms(heard);
    for (const x of a) for (const y of b) if (x === y || inflected(x, y)) return true;
    return target.length >= 6 && heard.length >= 6 && levenshtein(target, heard) <= 1 && isKnownWord(heard) !== true;
  }
  function heardTokens(transcript) {
    const out = [];
    for (const t of wordTokens(String(transcript || ""))) {
      const m = /^(\d{1,4}(?::\d\d)?)(am|pm|a|p)$/.exec(t);
      if (m) out.push(m[1], m[2].length === 1 ? m[2] + "m" : m[2]);
      else if (t === "m" && (out[out.length - 1] === "am" || out[out.length - 1] === "pm")) continue;
      else out.push(t);
    }
    return out;
  }
  function degenerate(heard, expected) {
    let run2 = 1;
    for (let j = 1; j < heard.length; j++) {
      run2 = heard[j] === heard[j - 1] ? run2 + 1 : 1;
      if (run2 >= 4) return true;
    }
    return heard.length > Math.max(8, expected * 1.8);
  }
  function matchCompounds(target, heard) {
    const joined = /* @__PURE__ */ new Map();
    for (let i = 0; i < target.length - 1; i++) joined.set(target[i] + target[i + 1], [target[i], target[i + 1]]);
    const tset = new Set(target);
    const out = [];
    for (let j = 0; j < heard.length; j++) {
      const h2 = heard[j], pair = j + 1 < heard.length ? h2 + heard[j + 1] : null;
      if (!tset.has(h2) && joined.has(h2)) out.push(...joined.get(h2));
      else if (pair && tset.has(pair) && !(tset.has(h2) && tset.has(heard[j + 1]))) {
        out.push(pair);
        j++;
      } else out.push(h2);
    }
    return out;
  }
  function evaluateWords(text, asr, opts = {}) {
    const words2 = wordsOf(text);
    const all = (state, reason, note) => ({ words: words2.map((x) => ({ w: x.w, text: x.text, state, reason })), evaluated: false, note });
    if (opts.insufficient) return all("uncertain", "Grava\xE7\xE3o insuficiente para avaliar esta palavra. Tente gravar novamente, mais perto do microfone.", "Quase n\xE3o captei voz: nada foi avaliado.");
    if (!asr) return all("uncertain", "N\xE3o foi poss\xEDvel avaliar esta palavra: o reconhecimento de fala no aparelho n\xE3o est\xE1 dispon\xEDvel. Compare com a refer\xEAncia (A/B).", "Avalia\xE7\xE3o por palavra indispon\xEDvel neste aparelho.");
    const target = words2.map((x) => x.norm);
    const heard = matchCompounds(target, heardTokens(asr.text));
    if (!heard.length) return all("uncertain", "Nenhuma fala foi reconhecida. Tente gravar novamente.", "O reconhecimento n\xE3o captou fala: resultado inconclusivo.");
    if (degenerate(heard, words2.length)) return all("uncertain", "A transcri\xE7\xE3o saiu corrompida (repeti\xE7\xF5es sem sentido); n\xE3o d\xE1 para avaliar a palavra. Tente gravar de novo.", "Transcri\xE7\xE3o n\xE3o confi\xE1vel (repeti\xE7\xF5es): resultado inconclusivo.");
    if (typeof asr.confidence === "number" && asr.confidence > 0 && asr.confidence < MIN_CONFIDENCE) {
      return all("uncertain", "O reconhecimento teve confian\xE7a baixa nesta grava\xE7\xE3o; n\xE3o d\xE1 para avaliar a palavra com seguran\xE7a. Tente de novo.", "Confian\xE7a baixa do reconhecimento: resultado inconclusivo.");
    }
    const pairs = lcsAlign(target, heard, tokenEq);
    const matchT = new Map(pairs.map(([i, j]) => [i, j]));
    const anchors = [[-1, -1], ...pairs, [target.length, heard.length]];
    const gapHeard = /* @__PURE__ */ new Map();
    for (let k = 0; k < anchors.length - 1; k++) {
      const [ti, hj] = anchors[k], [tn, hn] = anchors[k + 1];
      const tGap = [];
      for (let i = ti + 1; i < tn; i++) tGap.push(i);
      const hGap = heard.slice(hj + 1, hn);
      tGap.forEach((i, idx) => gapHeard.set(i, tGap.length === hGap.length ? [hGap[idx]] : hGap));
    }
    const lastMatched = pairs.length ? pairs[pairs.length - 1][0] : -1;
    const out = words2.map((x, i) => {
      if (matchT.has(i)) return { w: x.w, text: x.text, state: "good", reason: "Reconhecida como esperado. Isso indica que a palavra foi entendida (intelig\xEDvel); n\xE3o \xE9 uma an\xE1lise fon\xE9tica dos sons." };
      const near = (gapHeard.get(i) || []).filter(Boolean);
      if (x.weak) return { w: x.w, text: x.text, state: "uncertain", reason: "Palavra curta e \xE1tona: o reconhecedor costuma omiti-la mesmo quando \xE9 dita. N\xE3o foi avaliada." };
      if (x.proper) return { w: x.w, text: x.text, state: "uncertain", heard: near.length ? near.join(" ") : void 0, reason: `Nome pr\xF3prio: o reconhecedor pode n\xE3o conhec\xEA-lo e escrev\xEA-lo de outro jeito${near.length ? ` (aqui ouviu \u201C${near.join(" ")}\u201D)` : ""}. N\xE3o foi avaliado.` };
      if (opts.tailUnreliable && i > lastMatched) return { w: x.w, text: x.text, state: "uncertain", reason: "A transcri\xE7\xE3o pode ter sido cortada no fim: esta palavra n\xE3o foi avaliada. Grave de novo se quiser conferir." };
      if (near.length) {
        return {
          w: x.w,
          text: x.text,
          state: "needs_practice",
          heard: near.join(" "),
          reason: `N\xE3o foi reconhecida como esperado: o reconhecedor ouviu \u201C${near.join(" ")}\u201D. Pode ser erro do reconhecimento ou da fala: ou\xE7a sua grava\xE7\xE3o e a refer\xEAncia, e repita se soar diferente. (O sistema n\xE3o identifica qual som diferiu.)`
        };
      }
      return { w: x.w, text: x.text, state: "needs_practice", reason: "N\xE3o foi reconhecida: a palavra pode ter sido omitida, dita de forma pouco clara ou perdida pelo reconhecimento. Ou\xE7a sua grava\xE7\xE3o e a refer\xEAncia. (O sistema n\xE3o identifica qual som diferiu.)" };
    });
    return { words: out, evaluated: true, note: "" };
  }
  function scoreAttempt({ evaluation, analysis, expectedWords = 0, recorded = true }) {
    const dims = SCORE_WEIGHTS.map((d) => ({ ...d, score: null, note: "" }));
    const get = (id) => dims.find((d) => d.id === id);
    const insufficient = recorded && (!analysis || analysis.silent || analysis.speechSec < 0.4);
    if (evaluation && evaluation.evaluated) {
      const judged = evaluation.words.filter((x) => x.state === "good" || x.state === "needs_practice");
      if (judged.length >= 2) get("intelligibility").score = Math.round(judged.filter((x) => x.state === "good").length / judged.length * 100);
      else get("intelligibility").note = "Poucas palavras avali\xE1veis.";
    } else get("intelligibility").note = evaluation && evaluation.note ? evaluation.note : "Sem reconhecimento de fala no aparelho.";
    if (analysis && !insufficient && analysis.speechSec >= 1) {
      const words2 = Math.max(1, expectedWords);
      let s = 100 - Math.max(0, analysis.longPauses - (words2 > 20 ? 2 : 0)) * 12 - Math.max(0, analysis.pauses - Math.ceil(words2 / 5)) * 5;
      get("fluency").score = Math.max(30, Math.min(100, Math.round(s)));
    } else get("fluency").note = "Grava\xE7\xE3o curta ou sem voz suficiente.";
    get("prosody").note = "N\xE3o avaliado: o app n\xE3o tem um analisador de acento e entona\xE7\xE3o.";
    const p = analysis && analysis.paceVsReference;
    const plausible = analysis && !(analysis.wpm && (analysis.wpm > 260 || analysis.wpm < 40));
    if (!insufficient && p && plausible) get("duration").score = p > 2.4 ? 60 : p > 1.8 ? 80 : p < 0.6 ? 60 : p < 0.75 ? 80 : 100;
    else get("duration").note = analysis ? "Sem dura\xE7\xE3o de refer\xEAncia confi\xE1vel." : "Sem grava\xE7\xE3o: dura\xE7\xE3o n\xE3o medida.";
    const available = dims.filter((d) => d.score !== null);
    const hasCore = get("intelligibility").score !== null;
    if (insufficient || !hasCore) {
      return {
        overall: null,
        dims,
        partial: true,
        message: insufficient ? "Grava\xE7\xE3o insuficiente: sem nota. Tente novamente." : "Nota geral indispon\xEDvel: falta a medida de inteligibilidade (reconhecimento de fala no aparelho)."
      };
    }
    const wsum = available.reduce((n, d) => n + d.weight, 0);
    const overall = Math.round(available.reduce((n, d) => n + d.score * d.weight, 0) / wsum);
    return {
      overall,
      dims,
      partial: available.length < dims.length,
      message: `Nota estimada com ${available.map((d) => d.label.toLowerCase()).join(", ")}. ${dims.filter((d) => d.score === null).map((d) => d.label).join(", ")}: n\xE3o avaliado.`
    };
  }

  // app/js/engine/practice.js
  function analyseAttempt(evaluation, text) {
    if (!evaluation || !evaluation.evaluated) return { list: [], goodKeys: [], conclusive: false };
    const segs = wordsOf(text);
    const seen = /* @__PURE__ */ new Set();
    const list = [];
    const goodKeys = /* @__PURE__ */ new Set();
    evaluation.words.forEach((r, i) => {
      const seg = segs[i];
      if (!seg || seg.weak) return;
      const audioText = wordAudioText(seg);
      const key = audioText.toLowerCase();
      if (r.state === "good") goodKeys.add(key);
      if (r.state !== "needs_practice" || seen.has(key)) return;
      seen.add(key);
      list.push({ w: i, text: seg.text.replace(/[.,!?;:]+$/, ""), audioText, key, heard: r.heard || null, kind: r.heard ? "substituted" : "missing" });
    });
    for (const x of list) goodKeys.delete(x.key);
    return { list, goodKeys: [...goodKeys], conclusive: true };
  }
  function practiceSummary(list) {
    if (!list.length) return "Nenhuma palavra pendente nesta tentativa.";
    return list.length === 1 ? "Vamos praticar 1 palavra." : `Vamos praticar ${list.length} palavras.`;
  }
  var practiceReason = (x) => x.kind === "substituted" ? `o app ouviu \u201C${x.heard}\u201D` : "n\xE3o foi reconhecida";
  function latestGate() {
    let current2 = 0;
    return {
      next: () => ++current2,
      invalidate: () => {
        current2++;
      },
      isCurrent: (ticket) => ticket === current2
    };
  }
  function matchIsolatedWord(target, transcript) {
    const heard = String(transcript ?? "").trim();
    const T = wordTokens(target);
    const H = wordTokens(heard);
    if (!H.length || !T.length) return { status: "empty", heard };
    const eqAt = (i) => T.every((t, k) => H[i + k] !== void 0 && sameWordForm(t, H[i + k]));
    if (H.length === T.length && eqAt(0) || H.join("") === T.join("")) return { status: "match", heard };
    for (let i = 0; i + T.length <= H.length; i++) if (eqAt(i)) return { status: "extra", heard };
    return { status: "mismatch", heard };
  }
  function wordPracticeSession() {
    const words2 = /* @__PURE__ */ new Map();
    const get = (key) => words2.get(key) || { status: "todo", tries: 0, last: null };
    const set2 = (key, patch) => {
      const v = { ...get(key), ...patch };
      words2.set(key, v);
      return v;
    };
    return {
      get,
      start: (key) => set2(key, { status: "recording", prev: get(key).status }),
      processing: (key) => set2(key, { status: "processing" }),
      /** Gravação cancelada/falhou antes do resultado: volta ao estado anterior, sem contar tentativa. */
      abort: (key) => {
        const v = get(key);
        return set2(key, { status: v.prev && !["recording", "processing"].includes(v.prev) ? v.prev : "todo" });
      },
      result: (key, match) => {
        const v = get(key);
        const done = v.prev === "done" || match.status === "match";
        return set2(key, { status: done ? "done" : "retry", tries: v.tries + 1, last: match, prev: void 0 });
      },
      /** Próxima palavra ainda não concluída depois de `key` (dá a volta na lista); null se todas concluídas. */
      next: (list, key) => {
        const i = list.findIndex((x) => x.key === key);
        for (let k = 1; k <= list.length; k++) {
          const x = list[(i + k) % list.length];
          if (x.key !== key && get(x.key).status !== "done") return x;
        }
        return null;
      },
      allDone: (list) => list.length > 0 && list.every((x) => get(x.key).status === "done"),
      doneCount: (list) => list.filter((x) => get(x.key).status === "done").length
    };
  }

  // app/js/engine/coherence.js
  var set = (s) => new Set(s.split(/\s+/).filter(Boolean));
  var CATEGORIES = {
    food: set(`breakfast lunch dinner supper meal snack food coffee tea juice milk water toast bread egg eggs cereal fruit fruits banana apple
    orange rice beans salad sandwich burger pasta pizza soup chicken meat fish beef pork ham turkey tuna salmon bacon sausage cheese butter
    vegetable vegetables lettuce tomato tomatoes onion onions carrot carrots potato potatoes chips fries crisps oats porridge yogurt yoghurt
    cake biscuit biscuits cookie cookies chocolate sugar honey jam pumpkin corn avocado mushroom mushrooms pepper spinach cucumber grape
    grapes lemon strawberry nuts wrap tortilla noodles steak lamb prawns shrimp mayo mayonnaise ketchup sauce`),
    animal: set("kitten kitty cat cats puppy dog dogs horse mouse mice rat donkey monkey snake frog spider insect bug bird parrot lion tiger rabbit"),
    transport: set("car bus train bike bicycle taxi cab uber subway metro tram motorbike motorcycle scooter van truck lift ride rides"),
    place: set("office home school gym bank street park kitchen cafeteria canteen work room house flat apartment church shop supermarket station garage"),
    device: set("app phone mobile laptop computer tablet email screen"),
    person: set("wife husband son daughter kids children child family mother mum mom father dad friend friends colleague colleagues boss teacher"),
    time: set("morning afternoon evening night noon midnight day days week weekend weekday weekdays today tonight")
  };
  var categoryOf = (t) => {
    const l = lemma(t);
    for (const [k, s] of Object.entries(CATEGORIES)) if (s.has(t) || s.has(l)) return k;
    return null;
  };
  var FUNCTION = set(`a an the my your his her our their this that these those some any to of in on at for from by with into onto and or but
  so then also i you he she it we they me him us them is am are was were be been do does did have has had not up out off over under about
  around after before as if than very just myself yourself himself herself itself ourselves yourselves themselves mine yours hers ours theirs`);
  var QUANT = set("little bit lot lots few couple much many");
  var DET = set("a an the my your his her our their this that some");
  var PREP_ADV = set("over under about after before up out off around through across");
  var isFunctionWord = (t) => FUNCTION.has(t) || QUANT.has(t);
  function phoneKey(word) {
    let w = String(word).toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return { key: "", norm: "", syl: 0 };
    w = w.replace(/^kn/, "n").replace(/^wr/, "r").replace(/^wh/, "w").replace(/mb$/, "m").replace(/gh/g, "");
    w = w.replace(/([^aeiouy])le$/, "$1el");
    w = w.replace(/tch/g, "C").replace(/ch/g, "C").replace(/sh/g, "S").replace(/th/g, "T").replace(/ph/g, "f").replace(/ck/g, "k").replace(/qu/g, "kw").replace(/x/g, "ks").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k").replace(/g(?=[eiy])/g, "j");
    if (w.length > 3 && /[^aeiouy]e$/.test(w) && /[aeiouy]/.test(w.slice(0, -2))) w = w.slice(0, -1);
    w = w.replace(/(.)\1+/g, "$1");
    let key = "";
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      const c = "aeiou".includes(ch) ? "V" : ch === "y" ? i === 0 ? "W" : "V" : "pbtdkgC".includes(ch) ? "P" : "fvszSTjh".includes(ch) ? "F" : "mn".includes(ch) ? "N" : "lr".includes(ch) ? "L" : ch === "w" ? "W" : "";
      if (c && !(c === "V" && key.endsWith("V"))) key += c;
    }
    return { key, norm: w, syl: (key.match(/V/g) || []).length };
  }
  function soundsAlike(a, b) {
    const strip = (s) => wordTokens(s).filter((t) => !DET.has(t)).join("");
    const x = strip(a), y = strip(b);
    if (!x || !y || x === y) return false;
    let suf = 0;
    while (suf < Math.min(x.length, y.length) && x[x.length - 1 - suf] === y[y.length - 1 - suf]) suf++;
    if (suf >= 4 && Math.min(x.length, y.length) >= 5) return true;
    const px = phoneKey(x), py = phoneKey(y);
    if (px.key.length < 4 || py.key.length < 4 || px.key.length !== py.key.length || px.syl !== py.syl) return false;
    if (levenshtein(px.key, py.key) > 1) return false;
    return px.norm[0] === py.norm[0] || px.norm.slice(-2) === py.norm.slice(-2);
  }
  var prepCache = /* @__PURE__ */ new WeakMap();
  function frameRefs(content) {
    if (prepCache.has(content)) return prepCache.get(content);
    const refs = [];
    const add = (text, au) => {
      const r = prepRef(text, au);
      if (r && r.toks.length >= 3) refs.push(r);
    };
    for (const s of Object.values(content.sentences || {})) add(s.en, s.au);
    for (const q of Object.values(content.questions || {})) {
      add(q.a, q.aau);
      (q.altAnswers || []).forEach((a) => add(a));
    }
    for (const it of Object.values(content.items || {})) {
      add(it.en);
      (it.ex || []).forEach((x) => add(x.en, x.au));
    }
    prepCache.set(content, refs);
    return refs;
  }
  function prepRef(text, au = null) {
    if (!text) return null;
    const segs = segment(text).filter((s) => s.w !== void 0 && s.norm);
    const toks = segs.map((s) => s.norm);
    return { text, au, toks, lems: toks.map(lemma), surf: segs.map((s) => s.text.replace(/[.,!?;:]+$/, "")) };
  }
  var tokEq = (a, al, b, bl) => a === b || a.length > 2 && b.length > 2 && al === bl || DET.has(a) && DET.has(b);
  function categoryClash(heardToks, expected, { foodFrame = false, headAnchored = false, nounSlot = false, sound = false } = {}) {
    const content = heardToks.filter((t) => !isFunctionWord(t));
    const ce = categoryOf(expected);
    if (!content.length && nounSlot && headAnchored && heardToks.some((t) => QUANT.has(t) || PREP_ADV.has(t)) && (sound || heardToks.some((t) => QUANT.has(t)))) return "function";
    if (ce === "food" && foodFrame && content.some((t) => ["animal", "transport", "device", "place", "person"].includes(categoryOf(t)))) return "not-food";
    return null;
  }
  function findSlotSuspicions(transcript, refs = []) {
    const segs = segment(String(transcript || "")).filter((s) => s.w !== void 0 && s.norm);
    if (segs.length < 3) return [];
    const T = segs.map((s) => s.norm), TL = T.map(lemma);
    const tLemmas = new Set(TL);
    const found = /* @__PURE__ */ new Map();
    for (const ref of refs) {
      const R = ref.toks, RL = ref.lems;
      for (let j = 0; j < R.length; j++) {
        const e = R[j];
        if (isFunctionWord(e) || e.length < 3 || /\d/.test(e)) continue;
        if (tLemmas.has(RL[j])) continue;
        const slots = [[j, j]];
        if (j > 0 && DET.has(R[j - 1])) slots.push([j - 1, j]);
        for (const [a, b] of slots) {
          for (let i = 0; i < T.length; i++) {
            for (const k of [1, 2]) {
              if (i + k > T.length) continue;
              let left = 0, right = 0, contentAnchor = false, foodFrame = false;
              const anchor = (r) => {
                if (!isFunctionWord(r)) contentAnchor = true;
                if (categoryOf(r) === "food") foodFrame = true;
              };
              while (left < 2 && i - 1 - left >= 0 && a - 1 - left >= 0 && tokEq(T[i - 1 - left], TL[i - 1 - left], R[a - 1 - left], RL[a - 1 - left])) {
                anchor(R[a - 1 - left]);
                left++;
              }
              while (right < 2 && i + k + right < T.length && b + 1 + right < R.length && tokEq(T[i + k + right], TL[i + k + right], R[b + 1 + right], RL[b + 1 + right])) {
                anchor(R[b + 1 + right]);
                right++;
              }
              if (left + right < 2 || !contentAnchor) continue;
              const H = T.slice(i, i + k), HS = segs.slice(i, i + k);
              if (H.join("") === R.slice(a, b + 1).join("")) continue;
              if (HS.some((s) => s.proper)) continue;
              const Hc = H.filter((t) => !isFunctionWord(t));
              if (Hc.some((t) => lemma(t) === RL[j] || sameWordForm(e, t) || sameWordForm(t, e))) continue;
              const ce = categoryOf(e);
              if (ce && Hc.some((t) => categoryOf(t) === ce)) continue;
              const alike = soundsAlike(H.join(" "), R.slice(a, b + 1).join(" ")) || Hc.length > 0 && soundsAlike(Hc.join(" "), e);
              const nounSlot = !!ce || /^[A-Z]/.test(ref.surf[j] || "") && j > 0;
              const clash = categoryClash(H, e, { foodFrame, headAnchored: right > 0, nounSlot, sound: alike });
              const sound = alike && (left > 0 && right > 0 || !!clash);
              if (!clash && !sound) continue;
              const signals = [sound && "sound", clash && "category"].filter(Boolean);
              const cand = {
                src: HS.map((s) => s.w),
                heard: HS.map((s) => s.text.replace(/[.,!?;:]+$/, "")).join(" "),
                expected: ref.surf.slice(a, b + 1).join(" "),
                context: [ref.surf.slice(Math.max(0, a - left), a).join(" "), "___", ref.surf.slice(b + 1, b + 1 + Math.max(right, 1)).join(" ")].filter(Boolean).join(" "),
                ref: { text: ref.text, au: ref.au },
                signals,
                clash,
                strength: signals.length >= 2 ? "likely" : "possible",
                anchors: left + right
              };
              const prev = found.get(i);
              const better = !prev || cand.signals.length > prev.signals.length || cand.signals.length === prev.signals.length && (cand.anchors > prev.anchors || cand.anchors === prev.anchors && cand.src.length < prev.src.length);
              if (better) found.set(i, cand);
            }
          }
        }
      }
    }
    const list = [...found.values()].sort((x, y) => y.signals.length - x.signals.length || y.anchors - x.anchors || x.src.length - y.src.length);
    const used = /* @__PURE__ */ new Set();
    const out = [];
    for (const c of list) {
      if (c.src.some((w) => used.has(w))) continue;
      c.src.forEach((w) => used.add(w));
      const { anchors, ...rest } = c;
      out.push(rest);
    }
    return out.sort((x, y) => x.src[0] - y.src[0]);
  }
  function findOddCombinations(transcript) {
    const segs = segment(String(transcript || "")).filter((s) => s.w !== void 0 && s.norm);
    const out = [];
    for (let i = 0; i + 1 < segs.length; i++) {
      const m = segs[i].norm, hd = segs[i + 1].norm;
      if (categoryOf(hd) === "food" && ["animal", "device", "transport"].includes(categoryOf(m)) && !segs[i].proper) {
        out.push({ src: [segs[i].w], heard: `${segs[i].text} ${segs[i + 1].text}`.replace(/[.,!?;:]+$/, ""), kind: "modifier", clash: "not-food" });
      }
      if (i + 3 < segs.length + 1 && m === "a" && QUANT.has(hd) && segs[i + 2] && segs[i + 2].norm === "and" && segs[i + 3] && categoryOf(segs[i + 3].norm) === "food") {
        out.push({ src: [segs[i].w, segs[i + 1].w], heard: `${segs[i].text} ${segs[i + 1].text}`, kind: "coordination", clash: "function" });
      }
    }
    return out;
  }
  var NEEDS_COMPLEMENT = set("a an the my your at to for with of from about");
  var ARTICLE_LIKE = set("a an the my your");
  var CONJ_PREP = set("and or but at in on to for with of from");
  function findHoles(transcript) {
    const all = segment(String(transcript || ""));
    const segs = all.filter((s) => s.w !== void 0 && s.norm);
    const out = [];
    segs.forEach((s, i) => {
      if (!NEEDS_COMPLEMENT.has(s.norm)) return;
      const next = segs[i + 1];
      const sep = next ? all.slice(all.indexOf(s) + 1, all.indexOf(next)).map((x) => x.text).join("") : "";
      if (next && /-/.test(sep)) return;
      const afterNext = segs[i + 2] && all.slice(all.indexOf(next) + 1, all.indexOf(segs[i + 2])).map((x) => x.text).join("");
      if (next && afterNext && /^-$/.test(afterNext.trim())) return;
      const endsSentence = /[.!?]$/.test(s.text) || !next;
      const coordinated = next && ["and", "or"].includes(next.norm) && segs[i + 2] && CONJ_PREP.has(segs[i + 2].norm) && !["and", "or", "but"].includes(segs[i + 2].norm);
      const bad = next && !coordinated && (ARTICLE_LIKE.has(s.norm) ? ARTICLE_LIKE.has(next.norm) || CONJ_PREP.has(next.norm) : CONJ_PREP.has(next.norm));
      if (endsSentence || bad) {
        out.push({ src: [s.w], after: s.text.replace(/[.,!?;:]+$/, ""), before: next ? next.text : "" });
      }
    });
    return out;
  }
  var ACTIVITY_TIME = /\b(wake up|get up|leave home|leave the house|start work|finish work|have breakfast|have lunch|have dinner|go to bed|go to the gym|arrive)\b[^.!?]{0,30}?\bat (\d{1,2}(?::\d\d)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/g;
  var CONTRAST = /\b(weekend|weekends|weekday|weekdays|saturday|sunday|saturdays|sundays|sometimes|some days|other days|on \w+days|when|if|but|except|holiday|holidays|today|yesterday|tomorrow)\b/;
  function findContradictions(transcript) {
    const text = String(transcript || "").toLowerCase().replace(/(\d)\s?([ap])\.?\s?m\.?/g, "$1$2m");
    const out = [];
    const seen = /* @__PURE__ */ new Map();
    for (const m of text.matchAll(ACTIVITY_TIME)) {
      const act = m[1], t = m[2];
      if (seen.has(act) && seen.get(act).t !== t) {
        const between = text.slice(seen.get(act).end, m.index + m[0].length);
        if (!CONTRAST.test(between)) out.push({ kind: "two-times", activity: act, times: [seen.get(act).t, t] });
      }
      seen.set(act, { t, end: m.index });
    }
    for (const m of text.matchAll(/\b(\d{1,2}(?::\d\d)?)(pm)\b[^.!?]{0,20}\bin the morning\b|\b(\d{1,2}(?::\d\d)?)(am)\b[^.!?]{0,20}\b(in the evening|at night|in the afternoon)\b/g)) {
      out.push({ kind: "period", times: [m[1] ? m[1] + " p.m." : m[3] + " a.m."], period: m[1] ? "in the morning" : m[5] });
    }
    return out;
  }

  // app/js/engine/agreement.js
  var PLURAL_SUBJ = /* @__PURE__ */ new Set(["i", "you", "we", "they"]);
  var THIRD_SUBJ = /* @__PURE__ */ new Set(["he", "she"]);
  var ADVERB = new Set("usually always often sometimes never normally generally rarely also just really still".split(" "));
  var AUX = new Set("do does did don't doesn't didn't can could will would shall should may might must let make makes made help helps 'll".split(" "));
  var VERBS = new Set("get go have do wake eat drink take drive walk work study read watch listen play cook clean shower brush leave arrive start finish spend sleep prepare check meet call help pray relax rest run exercise train pick bring heat review practise practice write open turn switch park return come sit talk chat visit shop buy wash dress commute ride catch teach learn attend answer send plan organise organize try use present focus jog swim cycle feed need want like love enjoy prefer hate live stay leave make".split(" "));
  var IRREGULAR_S = { has: "have", does: "do", goes: "go", is: "am/are" };
  function thirdPersonBase(w) {
    if (IRREGULAR_S[w]) return IRREGULAR_S[w];
    if (!/s$/.test(w) || /ss$/.test(w)) return null;
    const l = lemma(w);
    return l !== w && VERBS.has(l) && (w === l + "s" || w === l + "es" || /y$/.test(l) && w === l.slice(0, -1) + "ies") ? l : null;
  }
  var thirdPerson = (b) => b === "have" ? "has" : b === "do" ? "does" : b === "go" ? "goes" : /(s|sh|ch|x|o)$/.test(b) ? b + "es" : /[^aeiou]y$/.test(b) ? b.slice(0, -1) + "ies" : b + "s";
  function agreementIssues(text) {
    const t = wordTokens(String(text || ""));
    const out = [];
    for (let i = 0; i < t.length; i++) {
      const s = t[i];
      if (!PLURAL_SUBJ.has(s) && !THIRD_SUBJ.has(s)) continue;
      let j = i + 1;
      if (ADVERB.has(t[j])) j++;
      const v = t[j];
      if (!v) continue;
      const span = t.slice(i, j + 1).join(" ");
      if (PLURAL_SUBJ.has(s)) {
        const base = thirdPersonBase(v);
        if (!base) continue;
        if (v === "is" && s !== "i") continue;
        const fix = [...t.slice(i, j), v === "is" ? "am" : base].join(" ");
        const cap = (x) => x.replace(/^i\b/, "I");
        const rule = v === "is" ? "com \u201CI\u201D o verbo \u201Cbe\u201D fica \u201Cam\u201D" : `com \u201C${cap(s)}\u201D o verbo no presente fica sem -s`;
        out.push({ id: "E_AGREEMENT_FREE", heard: cap(span), fix: cap(fix), msg: `Concord\xE2ncia (Present Simple): ${rule} \u2014 \u201C${cap(fix)}\u201D, n\xE3o \u201C${cap(span)}\u201D.` });
      } else {
        if (i > 0 && AUX.has(t[i - 1])) continue;
        if (!VERBS.has(v) || thirdPersonBase(v)) continue;
        const fix = [...t.slice(i, j), thirdPerson(v)].join(" ");
        out.push({ id: "E_AGREEMENT_FREE", heard: span, fix, msg: `Concord\xE2ncia (Present Simple): com \u201C${s}\u201D o verbo no presente leva -s \u2014 \u201C${fix}\u201D, n\xE3o \u201C${span}\u201D.` });
      }
    }
    return out;
  }

  // app/js/engine/integrity.js
  var TOKENS_PER_SECOND = 6;
  function estimateTokens(text) {
    const s = String(text || "");
    const words2 = wordTokens(s);
    let n = 0;
    for (const w of words2) n += /\d/.test(w) ? Math.max(2, w.replace(/\D/g, "").length + 1) : w.length > 7 ? 2 : 1;
    return n + (s.match(/[.,!?;:]/g) || []).length;
  }
  function transcriptIntegrity({ text = "", segments = null, secs = null } = {}) {
    const parts = segments && segments.length ? segments : secs ? [{ secs, text, voicedSec: null }] : null;
    if (!parts) return { checked: false, complete: null, issues: [] };
    const issues = [];
    parts.forEach((p, i) => {
      const label = parts.length > 1 ? ` (trecho ${i + 1} de ${parts.length})` : "";
      const budget = Math.trunc((p.secs || 0) * TOKENS_PER_SECOND);
      const words3 = wordTokens(p.text || "").length;
      if (budget > 0 && words3 > 0 && estimateTokens(p.text) >= budget - 1) {
        issues.push({ code: "possibly-truncated", part: i, msg: `A transcri\xE7\xE3o pode ter sido cortada no fim${label}: o reconhecedor chegou perto do limite de texto para esse tempo de \xE1udio.` });
      }
      if (p.voicedSec != null && p.voicedSec >= 1 && words3 === 0) {
        issues.push({ code: "lost-part", part: i, msg: `Um trecho com voz n\xE3o gerou texto${label}: parte da fala pode ter sido perdida pelo reconhecimento.` });
      }
      if (p.cutInSpeech && i < parts.length - 1) {
        issues.push({ code: "cut-in-speech", part: i, msg: `A divis\xE3o do \xE1udio caiu no meio da fala${label}: uma palavra pode ter sido partida ou repetida na emenda.` });
      }
    });
    const voiced = parts.reduce((n, p) => n + (p.voicedSec || 0), 0);
    const words2 = segments && segments.length ? parts.reduce((n, p) => n + wordTokens(p.text || "").length, 0) : wordTokens(text).length;
    if (voiced >= 4 && words2 / voiced < 0.6) {
      issues.push({ code: "low-density", msg: "H\xE1 bem menos palavras do que o tempo de fala sugere: parte do que voc\xEA disse pode n\xE3o ter sido reconhecida." });
    }
    return { checked: true, complete: issues.length === 0, issues };
  }
  var mayHaveLostSpeech = (integ) => !!integ && integ.issues.some((x) => ["possibly-truncated", "lost-part", "low-density", "cut-in-speech"].includes(x.code));

  // app/js/engine/freeanswer.js
  var STOP = new Set("a an the and or but so if of to in on at for from by with about as into than then also too very really just i me my mine you your yours he him his she her it its we us our they them their this that these those there here be is am are was were been being do does did done have has had having can could will would shall should may might must not no yes oh um uh er ah hmm yeah okay ok well like what when where why how who which some any all every each much many more most lot lots thing things kind sort get got go going gone make made take took say said tell told know think".split(" "));
  var DAILY = "wake sleep bed alarm breakfast lunch dinner supper meal snack coffee tea juice milk water toast bread egg eggs cereal fruit banana apple rice beans salad sandwich pasta pizza soup chicken meat fish vegetable cook cooking kitchen dish dishes shower bath teeth brush dress clothes uniform work job office company boss colleague coworker meeting email computer laptop desk report project task school college university class lesson course study homework teacher student english language book read write news newspaper watch tv television series movie film music song listen podcast radio phone message call chat text drive car bus train subway metro walk bike cycle taxi uber ride traffic commute home house apartment flat room clean cleaning laundry wash shop shopping supermarket market store buy pay gym exercise workout run running jog sport football soccer swim swimming yoga training walk family wife husband son daughter child kid baby parent mother mom mum father dad brother sister friend neighbour neighbor dog cat pet morning afternoon evening night noon midnight early late today weekday weekend monday tuesday wednesday thursday friday saturday sunday day week month year hour minute usually always sometimes often never daily routine schedule busy tired relax rest nap break hobby chess game play pray church eat drink prepare start finish leave arrive return spend stay visit help meet plan organise organize free time fun enjoy love park garden street bank salary shift customer client patient".split(" ");
  var WEAK_TOPIC = new Set("today day time week year good nice great new big small thing people way part place number".split(" "));
  var ACTIVITY = new Set("shut close log wake get have eat drink take go drive walk work study read watch listen play cook clean shower brush leave arrive start finish spend sleep prepare check meet call help pray relax rest run exercise train pick bring heat review practise practice write analyse analyze open turn switch park return come sit talk chat visit shop buy wash dress commute ride catch make do teach learn attend answer send plan organise organize try use present focus run jog swim cycle feed walk".split(" "));
  var NUMBER_WORDS = "one two three four five six seven eight nine ten eleven twelve fifteen twenty thirty forty fifty half quarter".split(" ");
  var RX = {
    time: new RegExp(`\\b(\\d{1,2}(:\\d\\d)?\\s?([ap]\\.?\\s?m\\.?)?|o'?clock|noon|midnight|morning|afternoon|evening|night|early|late|${NUMBER_WORDS.join("|")})\\b`),
    frequency: /\b(every|usually|always|often|sometimes|never|rarely|once|twice|times a|a week|a day|a month|daily|weekly|monthly|each (day|week)|on (mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays|weekdays|weekends))\b/,
    reason: /\b(because|since|so that|in order to|that's why|that is why|so i|so we|due to|as i|the reason)\b|\bto (be|have|get|spend|save|help|keep|relax|rest|study|improve|earn|make|avoid|feel|learn|stay|see)\b/,
    duration: /\b(minutes?|hours?|seconds?|half an hour|an hour|for (about |around )?(a|an|one|two|three|\d+)\b|all day|long|longer|shorter|quick|short)\b/,
    place: /\b(at|in|near|on|inside|outside|next to|close to)\b|\b(home|office|gym|street|park|work|school|bank|car|kitchen|room)\b/,
    meaning: /\b(means?|meaning|it'?s when|it is when|in other words|that is|it'?s like|refers to)\b/,
    like: /\b(like|love|enjoy|prefer|hate|don't|do not|favourite|favorite|fun|interesting|boring)\b/,
    yesno: /\b(yes|yeah|no|not|don't|doesn't|didn't|never|always|sometimes|usually|of course|sure|i do|i am|i did|i would|i'd|i will|i can)\b/,
    sequence: /\b(then|after|afterwards|before|first|next|later|finally|when|while|and then)\b/
  };
  var FOOD = new Set("breakfast lunch dinner food eat drink coffee tea juice milk water toast bread egg cereal fruit banana apple rice beans salad sandwich pasta pizza soup chicken meat fish vegetable oats yogurt yoghurt cheese cake snack meal lunchbox".split(" "));
  var INTENT_LABEL = {
    time: "Diz o hor\xE1rio ou o momento do dia",
    frequency: "Diz com que frequ\xEAncia",
    reason: "Explica o motivo",
    duration: "Diz quanto tempo",
    place: "Diz onde",
    meaning: "Explica o significado",
    food: "Diz o que come ou bebe",
    like: "Diz se gosta (e por qu\xEA)",
    yesno: "Responde sim/n\xE3o ou confirma",
    activities: "Conta o que voc\xEA faz (atividades)",
    info: "D\xE1 uma informa\xE7\xE3o concreta sobre o tema"
  };
  var INTENT_TIP = {
    time: "Diga o hor\xE1rio ou o momento (ex.: \u201Cat seven\u201D, \u201Cin the morning\u201D).",
    frequency: "Diga com que frequ\xEAncia (ex.: \u201Cevery day\u201D, \u201Ctwice a week\u201D).",
    reason: "Explique o motivo (ex.: \u201Cbecause\u2026\u201D, \u201Cso I can\u2026\u201D).",
    duration: "Diga quanto tempo (ex.: \u201Cfor about an hour\u201D).",
    place: "Diga onde (ex.: \u201Cat home\u201D, \u201Cnear the office\u201D).",
    meaning: "Explique com suas palavras (ex.: \u201CIt means\u2026\u201D).",
    food: "Diga o que voc\xEA come ou bebe (ex.: \u201CI have toast and coffee\u201D).",
    like: "Diga se gosta e por qu\xEA (ex.: \u201CI love it because\u2026\u201D).",
    yesno: "Comece respondendo diretamente (ex.: \u201CYes, I do\u201D / \u201CNot always\u201D).",
    activities: "Conte pelo menos duas coisas que voc\xEA faz (ex.: \u201CI wake up\u2026, then I\u2026\u201D).",
    info: "D\xEA um detalhe concreto ligado \xE0 pergunta."
  };
  function questionIntent(question = "", unit = "q") {
    if (unit === "block" || unit === "routine") return "activities";
    const q = question.toLowerCase().replace(/[“”"?]/g, "").trim();
    if (/\bwhat time\b|^when\b|\bwhen do you\b/.test(q)) return "time";
    if (/\bhow often\b/.test(q)) return "frequency";
    if (/^why\b/.test(q)) return "reason";
    if (/\bhow long\b/.test(q)) return "duration";
    if (/^where\b/.test(q)) return "place";
    if (/\bwhat does .* mean\b|\bmean\b$/.test(q)) return "meaning";
    if (/\b(have|eat) for (breakfast|lunch|dinner)\b/.test(q)) return "food";
    if (/^do you like\b|^do you enjoy\b/.test(q)) return "like";
    if (/tell me about (your )?(daily )?(routine|day)|what do you (usually )?do\b|how do you spend|what do you like doing/.test(q)) return "activities";
    if (/^(do|does|did|is|are|was|were|have|has|would|can|could)\b/.test(q) && !/\bor\b/.test(q)) return "yesno";
    return "info";
  }
  function buildVocab(content) {
    const known = /* @__PURE__ */ new Set(), domain = new Set(DAILY.map(lemma));
    const add = (t) => {
      if (!t) return;
      for (const w of wordTokens(t)) {
        known.add(w);
        const l = lemma(w);
        if (!STOP.has(l) && !/\d/.test(l)) domain.add(l);
      }
    };
    for (const s of Object.values(content.sentences || {})) add(s.en);
    for (const b of Object.values(content.blocks || {})) add(b.en);
    for (const it of Object.values(content.items || {})) {
      add(it.en);
      (it.ex || []).forEach((x) => add(x.en));
    }
    for (const q of Object.values(content.questions || {})) {
      add(q.q);
      add(q.a);
      (q.altAnswers || []).forEach(add);
    }
    return { known, domain };
  }
  var sameLemma = (a, b) => a === b || a + "e" === b || b + "e" === a;
  var contentLemmas = (text) => wordTokens(text).map(lemma).filter((l) => l.length > 1 && !STOP.has(l) && !/^\d/.test(l));
  var skeleton = (w) => w.replace(/(?!^)[aeiouy]/g, "").replace(/(.)\1+/g, "$1");
  var soundSkeleton = (w) => skeleton(phoneKey(w).norm);
  function contextualHypothesis(heard, candidates) {
    const h2 = soundSkeleton(heard);
    if (h2.length < 2) return null;
    let best = null, bestD = 2, tie = false;
    for (const c of candidates) {
      const k = soundSkeleton(c);
      if (k.length < 3 || k[0] !== h2[0] || Math.abs(k.length - h2.length) > 1) continue;
      const d = levenshtein(h2, k);
      if (d < bestD) {
        best = c;
        bestD = d;
        tie = false;
      } else if (d === bestD && best && lemma(best) !== lemma(c)) tie = true;
    }
    return best && !tie ? best : null;
  }
  function degenerateFree(tokens) {
    let run2 = 1;
    for (let j = 1; j < tokens.length; j++) {
      run2 = tokens[j] === tokens[j - 1] ? run2 + 1 : 1;
      if (run2 >= 4) return true;
    }
    if (tokens.length >= 10) {
      const freq = {};
      for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
      if (Math.max(...Object.values(freq)) / tokens.length > 0.4) return true;
    }
    return false;
  }
  var insufficientAudio = (analysis) => !analysis || analysis.silent || analysis.speechSec < 0.8;
  function analyseFreeAnswer({ question = "", model = "", alternatives = [], unit = "q", transcript = "", analysis = null, vocab = { known: /* @__PURE__ */ new Set(), domain: /* @__PURE__ */ new Set() }, grammar = [], divergences = [], naturalness = [], frames = null, integrity = null }) {
    const text = String(transcript || "").trim();
    const tokens = wordTokens(text);
    const metrics = measure(analysis, tokens.length);
    const pronunciation = { evaluated: false, note: "N\xE3o avaliada: o app n\xE3o mede os sons (fonemas). As marca\xE7\xF5es na transcri\xE7\xE3o indicam diverg\xEAncias do reconhecimento, n\xE3o erros de pron\xFAncia." };
    const base = { transcript: text, metrics, pronunciation, integrity: integrity || { checked: false, complete: null, issues: [] } };
    const inconclusive = (reason, message2) => ({ ...base, status: "inconclusive", reason, message: message2, words: wordsAll(text, "uncertain"), practice: [], checklist: [], tips: [] });
    if (analysis && insufficientAudio(analysis)) return inconclusive("audio", "Quase n\xE3o captei voz nesta grava\xE7\xE3o. Grave de novo, num lugar silencioso e mais perto do microfone.");
    if (!tokens.length) return inconclusive("empty", "O reconhecimento n\xE3o captou fala nesta grava\xE7\xE3o. Grave de novo, falando um pouco mais alto.");
    if (degenerateFree(tokens)) return inconclusive("degenerate", "A transcri\xE7\xE3o saiu corrompida (repeti\xE7\xF5es sem sentido). Nada foi avaliado: grave de novo.");
    if (tokens.length < 3) return inconclusive("short", "Fala curta demais para avaliar a resposta. Responda com uma ou duas frases completas.");
    const answerLemmas = new Set(contentLemmas(text));
    const alts = (alternatives || []).filter(Boolean);
    const expected = [.../* @__PURE__ */ new Set([...contentLemmas(question), ...contentLemmas(model), ...alts.flatMap(contentLemmas)])].filter((l) => l.length >= 4);
    const missingExpected = expected.filter((l) => !answerLemmas.has(l));
    const exampleWord = /* @__PURE__ */ new Map();
    for (const w of [...wordTokens(model), ...wordTokens(question), ...alts.flatMap(wordTokens)]) if (!exampleWord.has(lemma(w))) exampleWord.set(lemma(w), w);
    const candidates = missingExpected.map((l) => exampleWord.get(l) || l);
    const words2 = [];
    const practice = [];
    const seen = /* @__PURE__ */ new Set();
    const flags = /* @__PURE__ */ new Map();
    const mark = (ws, f) => {
      if (ws.some((k) => flags.has(k))) return;
      ws.forEach((k) => flags.set(k, f));
    };
    const refs = frames ? [...[model, ...alts].filter(Boolean).map(prepRef), ...frames].filter(Boolean) : [];
    for (const d of divergences || []) mark(d.src, { kind: "context", ...d });
    const supported2 = (heard) => {
      const ls = contentLemmas(heard);
      return ls.length > 0 && ls.every((l) => expected.some((e) => sameLemma(l, e)));
    };
    for (const sp of refs.length ? findSlotSuspicions(text, refs) : []) if (!supported2(sp.heard)) mark(sp.src, { kind: "frame", ...sp });
    for (const o of findOddCombinations(text)) mark(o.src, { kind: "odd", ...o });
    const allSegs = segment(text);
    const segs = allSegs.filter((x) => x.w !== void 0);
    const joined = /* @__PURE__ */ new Map();
    for (let k = 1; k + 1 < allSegs.length; k++) {
      const a = allSegs[k - 1], g = allSegs[k], b = allSegs[k + 1];
      if (a.w === void 0 || b.w === void 0 || g.text !== "-" || flags.has(a.w) || flags.has(b.w)) continue;
      const whole = a.norm + b.norm;
      if (/\d/.test(whole) || isKnownWord(whole, vocab.known) !== false) continue;
      const ref = contextualHypothesis(whole, candidates);
      if (ref) {
        const j = { ws: [a.w, b.w], heard: `${a.text}-${b.text}`, ref };
        joined.set(a.w, j);
        joined.set(b.w, j);
      }
    }
    const hypotheses = [];
    const deferred = [];
    for (const seg of segs) {
      const t = seg.norm;
      const f = flags.get(seg.w);
      if (f) {
        const r2 = { w: seg.w, text: seg.text, state: "needs_practice", flag: f.kind, ref: f.expected || null, reason: flagReason(f) };
        const key = "flag:" + f.src.join(",");
        if (!seen.has(key)) {
          seen.add(key);
          practice.push({ w: f.src[0], ws: f.src, text: f.heard, heard: f.heard, ref: f.expected || null, refAu: f.ref ? f.ref.au || null : null, refText: f.ref ? f.ref.text : null, context: f.context || null, flag: f.kind, category: f.expected ? "recognition" : "inconclusive", strength: f.strength || "possible", reason: r2.reason });
        }
        words2.push(r2);
        continue;
      }
      const jn = joined.get(seg.w);
      if (jn) {
        const reason = recognitionReason(jn.heard, jn.ref);
        if (!seen.has("join:" + jn.ws.join(","))) {
          seen.add("join:" + jn.ws.join(","));
          hypotheses.push({ heard: jn.heard, ref: jn.ref });
          practice.push({ w: jn.ws[0], ws: jn.ws, text: jn.heard, heard: jn.heard, ref: jn.ref, flag: "nonword", category: "recognition", reason });
        }
        words2.push({ w: seg.w, text: seg.text, state: "needs_practice", flag: "nonword", ref: jn.ref, reason });
        continue;
      }
      if (!t || /\d/.test(t) || NUMBER_WORDS.includes(t)) {
        words2.push({ w: seg.w, text: seg.text, state: "good", reason: "N\xFAmero ou hor\xE1rio reconhecido." });
        continue;
      }
      if (seg.weak || STOP.has(t) || t.length < 3) {
        deferred.push(words2.length);
        words2.push({ w: seg.w, text: seg.text, state: "uncertain", reason: "" });
        continue;
      }
      const l = lemma(t);
      const inActivity = [...forms(t)].some((f2) => vocab.known.has(f2) || vocab.domain.has(lemma(f2)) || expected.includes(lemma(f2))) || appCompound(t, vocab.known) || !!categoryOf(t);
      if (seg.proper && !inActivity) {
        words2.push({ w: seg.w, text: seg.text, state: "uncertain", reason: "Nome pr\xF3prio ou termo fora do vocabul\xE1rio da atividade: n\xE3o avaliado. O app n\xE3o tenta adivinhar nomes." });
        continue;
      }
      const r = {
        w: seg.w,
        text: seg.text,
        state: inActivity ? "good" : "uncertain",
        reason: inActivity ? "Compat\xEDvel com o vocabul\xE1rio e o tema da atividade, sem sinal de diverg\xEAncia. (N\xE3o \xE9 uma an\xE1lise dos sons.)" : "Palavra do ingl\xEAs fora do vocabul\xE1rio desta atividade: o app n\xE3o tem evid\xEAncia para confirmar se \xE9 o que voc\xEA disse. Se estiver certa, tudo bem."
      };
      if (!t.includes(" ")) {
        const known = isKnownWord(t, vocab.known) ?? null;
        const compound = known === false && splitsInTwo(t, vocab.known);
        if (known === false && !compound) {
          const ref = contextualHypothesis(t, candidates);
          if (ref) hypotheses.push({ heard: seg.text.replace(/[.,!?;:]+$/, ""), ref });
          Object.assign(r, {
            state: "needs_practice",
            flag: "nonword",
            ref,
            category: ref ? "recognition" : "inconclusive",
            reason: ref ? recognitionReason(seg.text.replace(/[.,!?;:]+$/, ""), ref) : `\u201C${seg.text}\u201D n\xE3o parece uma palavra do ingl\xEAs: prov\xE1vel erro do reconhecimento, mas o contexto n\xE3o indica uma palavra prov\xE1vel. Ou\xE7a sua grava\xE7\xE3o; se a palavra estiver clara, est\xE1 tudo certo.`
          });
        } else if (!inActivity) {
          const e = missingExpected.find((x) => x[0] === l[0] && x !== l && Math.abs(x.length - l.length) <= 2 && levenshtein(skeleton(x), skeleton(l)) <= 1 && levenshtein(x, l) <= 2 && commonPrefix(x, l) < 5);
          if (e) {
            const ref = exampleWord.get(e) || e;
            Object.assign(r, { state: "needs_practice", flag: "confusion", ref, category: "recognition", reason: `O app ouviu \u201C${seg.text}\u201D. Se voc\xEA quis dizer \u201C${ref}\u201D, vale praticar essa palavra; se disse \u201C${seg.text}\u201D, est\xE1 tudo certo.` });
          }
        }
      }
      if (r.state === "needs_practice") {
        const key = (r.flag === "nonword" ? "nw:" + t : r.ref || t).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          practice.push({ w: r.w, text: seg.text.replace(/[.,!?;:]+$/, ""), heard: seg.text.replace(/[.,!?;:]+$/, ""), ref: r.ref || null, flag: r.flag, category: r.category, reason: r.reason });
        }
      }
      words2.push(r);
    }
    for (const k of deferred) {
      const near = [1, -1, 2, -2, 3, -3].map((d) => k + d).filter((j) => words2[j] && !deferred.includes(j)).map((j) => words2[j]);
      const touchesFlag = [words2[k - 1], words2[k + 1]].some((x) => x && x.state === "needs_practice");
      const good = !touchesFlag && (!near.length || near.some((x) => x.state === "good"));
      Object.assign(words2[k], { state: good ? "good" : "uncertain", reason: good ? "Palavra curta que acompanha um trecho compat\xEDvel." : "Palavra curta perto de um trecho n\xE3o confirmado: n\xE3o avaliada sozinha." });
    }
    const intent = questionIntent(question, unit);
    const narrative = unit === "block" || unit === "routine" || /tell me about|routine/i.test(question);
    const low = ` ${tokens.join(" ")} `;
    const strongHits = [...answerLemmas].filter((l) => expected.includes(l) || contentLemmas(question).includes(l));
    const domainHits = [...answerLemmas].filter((l) => vocab.domain.has(l) && !WEAK_TOPIC.has(l));
    const activities = new Set(tokens.map(lemma).map((l) => ACTIVITY.has(l + "e") ? l + "e" : l).filter((l) => ACTIVITY.has(l)));
    const satisfied = {
      time: RX.time.test(low),
      frequency: RX.frequency.test(low),
      reason: RX.reason.test(low),
      duration: RX.duration.test(low),
      place: RX.place.test(low) && domainHits.length > 0,
      meaning: RX.meaning.test(low),
      like: RX.like.test(low) || RX.yesno.test(low),
      // relato (rotina, bloco, “tell me about…”): duas atividades; “o que você faz em X”: uma basta
      yesno: RX.yesno.test(low),
      food: tokens.some((t) => FOOD.has(lemma(t)) || FOOD.has(t)),
      activities: activities.size >= (narrative ? 2 : 1),
      info: domainHits.length >= 1 && tokens.length >= 4
    };
    const answersYesNo = (intent === "yesno" || intent === "like") && RX.yesno.test(low);
    const relevance = strongHits.length >= 2 || strongHits.length >= 1 && domainHits.length >= 3 || domainHits.length >= 4 ? "clear" : strongHits.length >= 1 || domainHits.length >= 2 || answersYesNo || domainHits.length >= 1 && satisfied[intent] ? "some" : "none";
    const minWords = unit === "routine" ? 40 : unit === "block" ? 20 : intent === "activities" ? 15 : 8;
    const enough = tokens.length >= minWords;
    const minToAnswer = intent === "activities" ? narrative ? Math.max(8, Math.round(minWords / 2)) : 5 : 3;
    const checklist = [
      { id: "topic", label: "Fala do tema da pergunta", ok: relevance !== "none", required: true },
      { id: intent, label: INTENT_LABEL[intent], ok: !!satisfied[intent], required: true }
    ];
    if (intent === "activities" && narrative) {
      checklist.push({ id: "time", label: "Usa hor\xE1rios ou momentos do dia", ok: satisfied.time, required: false });
      checklist.push({ id: "sequence", label: "Liga as ideias (then, after, before\u2026)", ok: RX.sequence.test(low), required: false });
    }
    checklist.push({ id: "length", label: "Desenvolve a resposta", ok: enough, required: false });
    const holes = findHoles(text);
    const lostSpeech = mayHaveLostSpeech(integrity) || holes.length > 0;
    if (lostSpeech) {
      for (const c of checklist) if (c.required && c.id !== "topic" && !c.ok) {
        c.ok = null;
        c.unconfirmed = true;
      }
    }
    const requiredOk = checklist.filter((c) => c.required).every((c) => c.ok !== false);
    const unconfirmed = checklist.some((c) => c.unconfirmed);
    const misheard = relevance === "none" && hypotheses.length > 0;
    const status3 = misheard ? "unclear" : relevance === "none" ? "off-topic" : requiredOk && tokens.length >= minToAnswer ? unconfirmed ? "unclear" : "answers" : "partial";
    const holeText = holes.length ? ` (por exemplo, depois de \u201C${holes[0].after}\u201D)` : "";
    const message = {
      answers: "Sua resposta responde \xE0 pergunta.",
      partial: "Sua resposta tem rela\xE7\xE3o com a pergunta, mas pode ficar mais completa.",
      unclear: misheard ? `O app pode ter reconhecido errado parte da sua fala (${hypotheses.slice(0, 2).map((x) => `\u201C${x.heard}\u201D \u2014 talvez \u201C${x.ref}\u201D`).join("; ")}). Por isso n\xE3o d\xE1 para confirmar se a resposta trata da pergunta: confira o trecho marcado ouvindo sua grava\xE7\xE3o.` : `Sua resposta tem rela\xE7\xE3o com a pergunta, mas o app pode ter perdido parte da sua fala${holeText}. N\xE3o d\xE1 para afirmar que faltou algo: ou\xE7a sua grava\xE7\xE3o.`,
      "off-topic": "N\xE3o encontrei rela\xE7\xE3o clara com a pergunta. Pode ser erro do reconhecimento: ou\xE7a sua grava\xE7\xE3o. Se voc\xEA falou de outro assunto, tente responder diretamente."
    }[status3];
    const coherence = findContradictions(text).map((c) => c.kind === "two-times" ? { kind: c.kind, msg: `Voc\xEA mencionou dois hor\xE1rios para \u201C${c.activity}\u201D (${c.times.join(" e ")}) sem dizer quando vale cada um (ex.: \u201Con weekends\u201D). Confira na grava\xE7\xE3o: pode ter sido o reconhecimento.` } : { kind: c.kind, msg: `\u201C${c.times[0]}\u201D e \u201C${c.period}\u201D n\xE3o combinam (p.m. \xE9 tarde/noite; a.m. \xE9 manh\xE3). Confira o hor\xE1rio na grava\xE7\xE3o.` });
    const tips = [];
    for (const c of checklist) {
      if (c.ok || c.unconfirmed) continue;
      if (c.id === "topic") continue;
      if (c.id === "length") tips.push(unit === "q" ? "Desenvolva com mais uma ou duas frases (o que, quando, por qu\xEA)." : "Acrescente mais detalhes: o que voc\xEA faz, quando e por qu\xEA.");
      else if (c.id === "sequence") tips.push("Ligue as ideias com \u201Cthen\u201D, \u201Cafter that\u201D, \u201Cbefore\u201D.");
      else if (INTENT_TIP[c.id]) tips.push(INTENT_TIP[c.id]);
    }
    if (practice.length) tips.push(practice.length === 1 ? "Confira o trecho marcado: ou\xE7a sua grava\xE7\xE3o e a refer\xEAncia." : `Confira os ${practice.length} trechos marcados: ou\xE7a sua grava\xE7\xE3o e as refer\xEAncias.`);
    const agreement = agreementIssues(text).filter((a) => !(grammar || []).some((g) => /^E_(THIRD_S|DOESNT_S|DONT_THIRD|AGREEMENT)/.test(g.id || "")));
    const grammarTips = [...(grammar || []).map((g) => g.msg), ...agreement.map((a) => a.msg)].filter(Boolean).slice(0, 2);
    const language = { grammar: grammarTips, naturalness: (naturalness || []).slice(0, 2) };
    return {
      ...base,
      status: status3,
      message,
      intent,
      relevance,
      checklist,
      tips: tips.slice(0, 4),
      grammarTips,
      language,
      words: words2,
      practice,
      coherence,
      holes,
      hypotheses,
      evidence: { strong: strongHits, domain: domainHits.length, activities: activities.size, words: tokens.length, minWords }
    };
  }
  function recognitionReason(heard, ref) {
    return `A palavra destacada pode ter sido reconhecida incorretamente: o app ouviu \u201C${heard}\u201D, que n\xE3o \xE9 uma palavra do ingl\xEAs. Pelo contexto da pergunta, talvez voc\xEA tenha dito \u201C${ref}\u201D (sugest\xE3o, n\xE3o a transcri\xE7\xE3o). Confira se essa sugest\xE3o corresponde ao que voc\xEA disse; se n\xE3o, ignore esta marca.`;
  }
  function flagReason(f) {
    if (f.kind === "context") {
      return `No contexto \u201C${f.context}\u201D, o app ouviu \u201C${f.heard}\u201D; o esperado seria algo como \u201C${f.expected}\u201D (sugest\xE3o, n\xE3o a transcri\xE7\xE3o). Pode ter sido o reconhecimento ou a pron\xFAncia: ou\xE7a sua grava\xE7\xE3o e a refer\xEAncia. Se voc\xEA disse \u201C${f.heard}\u201D mesmo, ignore esta marca.`;
    }
    if (f.kind === "odd") {
      const why2 = f.clash === "not-food" ? `\u201C${f.heard}\u201D junta um animal ou objeto a um prato` : `\u201C${f.heard}\u201D n\xE3o ocupa o lugar de um alimento na lista`;
      return `${why2}: combina\xE7\xE3o incomum. Pode ter sido o reconhecimento ou a pron\xFAncia, ou voc\xEA quis dizer isso mesmo. Ou\xE7a sua grava\xE7\xE3o; o app n\xE3o tem uma sugest\xE3o segura.`;
    }
    const why = [];
    if (f.signals.includes("category")) why.push(f.clash === "not-food" ? `\u201C${f.heard}\u201D n\xE3o \xE9 um alimento, mas o trecho fala de comida` : `\u201C${f.heard}\u201D n\xE3o ocupa o lugar de um nome neste trecho`);
    if (f.signals.includes("sound")) why.push(`soa parecido com \u201C${f.expected}\u201D`);
    const lead = f.strength === "likely" ? "Este trecho provavelmente n\xE3o corresponde ao que voc\xEA quis dizer" : "Este trecho pode n\xE3o corresponder ao que voc\xEA quis dizer";
    return `${lead}: no trecho \u201C${f.context}\u201D o app ouviu \u201C${f.heard}\u201D \u2014 ${why.join(" e ")}. Sugest\xE3o (n\xE3o \xE9 a transcri\xE7\xE3o): \u201C${f.expected}\u201D, como em \u201C${f.ref.text}\u201D. Pode ter sido o reconhecimento ou a pron\xFAncia: ou\xE7a sua grava\xE7\xE3o e a refer\xEAncia. Se voc\xEA disse \u201C${f.heard}\u201D mesmo, ignore esta marca.`;
  }
  function commonPrefix(a, b) {
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    return i;
  }
  function splitsInTwo(t, extra) {
    const ok = (x) => extra && extra.has(x) || x.length >= 4 && isKnownWord(x, extra);
    for (let i = 3; i <= t.length - 3; i++) if (ok(t.slice(0, i)) && ok(t.slice(i))) return true;
    return false;
  }
  function appCompound(t, known) {
    for (let i = 3; i <= t.length - 3; i++) if (known.has(t.slice(0, i)) && known.has(t.slice(i))) return true;
    return false;
  }
  function wordsAll(text, state) {
    return segment(text).filter((s) => s.w !== void 0).map((s) => ({ w: s.w, text: s.text, state, reason: "N\xE3o avaliada nesta tentativa." }));
  }
  function measure(analysis, words2) {
    if (!analysis) return { totalSec: null, speechSec: null, wpm: null, pauses: null, longPauses: null };
    const ok = !analysis.silent;
    let wpm = null;
    if (ok && analysis.speechSec >= 3 && words2 >= 5) {
      const v = Math.round(words2 / analysis.speechSec * 60);
      if (v >= 40 && v <= 260) wpm = v;
    }
    return {
      totalSec: analysis.totalSec != null ? Math.round(analysis.totalSec * 10) / 10 : null,
      speechSec: ok ? Math.round(analysis.speechSec * 10) / 10 : null,
      wpm,
      pauses: ok ? analysis.pauses : null,
      longPauses: ok ? analysis.longPauses : null
    };
  }
  var STATUS_LABEL = { answers: "Responde \xE0 pergunta", partial: "Responde em parte", unclear: "N\xE3o deu para confirmar tudo", "off-topic": "Pouca rela\xE7\xE3o com a pergunta", inconclusive: "Avalia\xE7\xE3o inconclusiva" };

  // app/js/engine/context.js
  var SUBJ = /* @__PURE__ */ new Set(["i", "we", "you", "he", "she", "they", "it"]);
  var CONNECT = /* @__PURE__ */ new Set(["and", "then", "so", "but", "also"]);
  var FUNCTION2 = new Set("a an the my your his her our their this that these those some any to of in on at for from by with into and or but so then also i you he she it we they me him us them is am are was were be been do does did have has had not up out off over about around after before".split(" "));
  var OBJ_VERBS = {
    app: "open check use close download install update start launch turn switch log tap look",
    phone: "check use pick charge turn switch look call take unlock grab put answer",
    laptop: "open switch turn start use close shut log boot charge check put",
    computer: "switch turn start use shut log boot check put",
    car: "drive park get take start wash use leave",
    shower: "take have need",
    teeth: "brush clean wash",
    breakfast: "have eat make prepare cook skip grab take bring heat buy",
    lunch: "have eat make prepare cook skip grab take bring heat buy",
    dinner: "have eat make prepare cook skip grab take bring heat buy",
    destination: "set enter choose type put select change",
    coffee: "drink have make take grab buy",
    bus: "take catch get ride miss wait",
    train: "take catch get ride miss wait",
    email: "check read answer send write reply",
    rides: "accept take give do offer get",
    chess: "play watch learn"
  };
  var VERB_LIKE = new Set("sit stand lie put open check use close take have get set drive park brush eat make go do watch play listen read write send start switch turn shut log pick call accept leave arrive see look buy cook wash clean run walk".split(" "));
  for (const k of Object.keys(OBJ_VERBS)) OBJ_VERBS[k] = new Set(OBJ_VERBS[k].split(" "));
  function soundsLike(a, b) {
    const norm = (x2) => x2.toLowerCase().replace(/[^a-z]/g, "").replace(/th/g, "t").replace(/ph/g, "f").replace(/c(?=[aou])/g, "k").replace(/ck/g, "k");
    const x = norm(a), y = norm(b);
    if (!x || !y || x === y) return false;
    let suf = 0;
    while (suf < Math.min(x.length, y.length) && x[x.length - 1 - suf] === y[y.length - 1 - suf]) suf++;
    if (suf >= 4) return true;
    const sk = (z) => z.replace(/(?!^)[aeiouy]/g, "").replace(/(.)\1+/g, "$1");
    const sx = sk(x), sy = sk(y);
    return Math.max(sx.length, sy.length) >= 3 && levenshtein(sx, sy) / Math.max(sx.length, sy.length) <= 0.34;
  }
  function verbObjectClash(tw, rightWords) {
    if (!rightWords.length || FUNCTION2.has(rightWords[0]) && !["my", "the", "your", "a"].includes(rightWords[0])) return false;
    const obj = rightWords.map((w) => lemma(w)).find((w) => OBJ_VERBS[w] || OBJ_VERBS[w + "s"]);
    if (!obj) return false;
    const ok = OBJ_VERBS[obj] || OBJ_VERBS[obj + "s"];
    const verbs = tw.map((w) => lemma(w)).filter((w) => VERB_LIKE.has(w));
    return verbs.length > 0 && verbs.every((v) => !ok.has(v));
  }
  var poolCache = /* @__PURE__ */ new WeakMap();
  function contextPool(content, checker) {
    let byChecker = poolCache.get(content);
    if (!byChecker) poolCache.set(content, byChecker = /* @__PURE__ */ new WeakMap());
    if (byChecker.has(checker)) return byChecker.get(checker);
    const refs = [];
    const add = (text, au) => {
      if (text && wordTokens(text).length >= 4) refs.push({ text, au: au || null, prep: checker.prepare(text) });
    };
    for (const s of Object.values(content.sentences || {})) add(s.en, s.au);
    for (const q of Object.values(content.questions || {})) {
      add(q.a, q.aau);
      (q.altAnswers || []).forEach((a, i) => add(a, (q.altAu || [])[i]));
    }
    for (const it of Object.values(content.items || {})) (it.ex || []).forEach((x) => add(x.en, x.au));
    for (const r of refs) r.content = new Set(r.prep.full.filter((t) => !FUNCTION2.has(t)));
    byChecker.set(checker, refs);
    return refs;
  }
  var isContent = (t) => !FUNCTION2.has(t);
  var surface = (X, srcs) => {
    if (!srcs.length) return "";
    const a = Math.min(...srcs), b = Math.max(...srcs);
    return X.text.slice(X.prep.spans[a].start, X.prep.spans[b].end);
  };
  var srcOf = (toks) => [...new Set(toks.flatMap((o) => o.src))].sort((a, b) => a - b);
  var punctBefore = (X, k) => {
    const sp = X.prep.spans;
    const from = k > 0 ? sp[k - 1].end : 0;
    return /[.,;:!?]/.test(X.text.slice(from, sp[k] ? sp[k].start : X.text.length));
  };
  function clauseBefore(X, idx, max) {
    const toks = X.prep.fullS;
    const out = [];
    for (let i = idx - 1; i >= 0 && out.length < max + 2; i--) {
      out.unshift(toks[i]);
      const first = Math.min(...toks[i].src);
      if (punctBefore(X, first) || CONNECT.has(toks[i].t) || i === 0) break;
    }
    while (out.length && (SUBJ.has(out[0].t) || CONNECT.has(out[0].t))) out.shift();
    return out.length <= max ? out : null;
  }
  function bestCluster(pairs, Tt, Rt) {
    let best = null, cur = [];
    const flush2 = () => {
      if (!cur.length) return;
      const contentN = cur.filter(([, j]) => isContent(Rt[j])).length;
      if (!best || contentN > best.contentN) best = { pairs: cur, contentN };
      cur = [];
    };
    for (const p of pairs) {
      const last = cur[cur.length - 1];
      if (last && (p[0] - last[0] > 5 || p[1] - last[1] > 5)) flush2();
      cur.push(p);
    }
    flush2();
    return best;
  }
  function findDivergences(transcript, { checker, pool = [], model = "" } = {}) {
    const text = String(transcript || "");
    if (!checker || !text.trim()) return [];
    const T = { text, prep: checker.prepare(text) };
    const Tt = T.prep.full;
    if (Tt.length < 4) return [];
    const tContent = new Set(Tt.filter(isContent));
    const refs = [...model ? [{ text: model, au: null, prep: checker.prepare(model) }] : [], ...pool];
    const eq = (a, b) => a === b || a[0] === "@" && b[0] === "@" && a.replace(/(am|pm)$/, "") === b.replace(/(am|pm)$/, "") || a.length > 3 && b.length > 3 && lemma(a) === lemma(b);
    const out = [];
    const explained = /* @__PURE__ */ new Set();
    const taken = /* @__PURE__ */ new Set();
    for (const ref of refs) {
      const rContent = ref.content || new Set(ref.prep.full.filter(isContent));
      let shared = 0;
      for (const t of rContent) if (tContent.has(t)) shared++;
      if (shared < 3) continue;
      const R = { text: ref.text, prep: ref.prep };
      const Rt = R.prep.full;
      const cl = bestCluster(lcsAlign(Tt, Rt, eq), Tt, Rt);
      if (!cl || cl.contentN < 3) continue;
      const ps = cl.pairs;
      if (!ps.some(([i, j], k) => k > 0 && ps[k - 1][0] === i - 1 && ps[k - 1][1] === j - 1 && isContent(Rt[j]) && isContent(Rt[j - 1]))) continue;
      const j0 = ps[0][1], j1 = ps[ps.length - 1][1];
      const regionContent = Rt.slice(j0, j1 + 1).filter(isContent).length;
      if (cl.contentN / Math.max(1, regionContent) < 0.6) continue;
      for (const [i] of ps) explained.add(i);
      const blocks = [];
      for (let k = 1; k < ps.length; k++) {
        const [ia, ja] = ps[k - 1], [ib, jb] = ps[k];
        blocks.push({ tG: T.prep.fullS.slice(ia + 1, ib), rG: R.prep.fullS.slice(ja + 1, jb), left: ps[k - 1], right: ps[k] });
      }
      const tL = clauseBefore(T, ps[0][0], 4), rL = clauseBefore(R, ps[0][1], 3);
      if (tL && rL) blocks.push({ tG: tL, rG: rL, left: null, right: ps[0] });
      for (const b of blocks) {
        const { tG, rG } = b;
        if (!tG.length || !rG.length || tG.length > 4 || rG.length > 3) continue;
        const tw = tG.map((o) => o.t), rw = rG.map((o) => o.t);
        if (tw.every((t) => !isContent(t)) && rw.every((t) => !isContent(t))) continue;
        if (tw.join("") === rw.join("")) continue;
        const expectedContent = rw.filter(isContent);
        if (!expectedContent.length) continue;
        if (expectedContent.every((t) => tContent.has(t))) continue;
        if (tw.every((t) => rw.includes(t))) continue;
        const rightWords = R.prep.fullS.slice(b.right[1], b.right[1] + 3).map((o) => o.t);
        const tContentWords = tw.filter(isContent).join(" ") || tw.join(" ");
        if (!soundsLike(tContentWords, expectedContent.join(" ")) && !soundsLike(tw.join(""), rw.join("")) && !verbObjectClash(tw, rightWords)) continue;
        const src = srcOf(tG.filter((o) => isContent(o.t) || tG.length <= 3));
        if (src.some((k) => taken.has(k))) continue;
        src.forEach((k) => taken.add(k));
        const leftCtx = b.left ? surface(R, R.prep.fullS[b.left[1]].src) : "";
        const rightCtx = surface(R, R.prep.fullS.slice(b.right[1], Math.min(b.right[1] + 3, R.prep.fullS.length)).flatMap((o) => o.src));
        out.push({
          tIdx: tG.map((o) => T.prep.fullS.indexOf(o)),
          src,
          heard: surface(T, src),
          expected: surface(R, srcOf(rG)),
          context: `${leftCtx ? leftCtx + " " : ""}___ ${rightCtx}`.trim(),
          ref: { text: ref.text, au: ref.au }
        });
      }
    }
    return out.filter((d) => !d.tIdx.every((i) => explained.has(i))).map(({ tIdx, ...d }) => d).sort((a, b) => a.src[0] - b.src[0]);
  }

  // app/js/ui/inlinewords.js
  var LABEL = { good: "Reconhecida como esperado", needs_practice: "Precisa de pr\xE1tica", uncertain: "N\xE3o avaliada / inconclusiva" };
  var playWord = (audioText, opts) => play({ key: audioKey(audioText), text: audioText }, opts);
  function inlineWords(paragraphs) {
    const text = paragraphs.join("\n\n");
    const wordEls = [];
    const detail = h("div", { class: "word-detail hidden", role: "status", "aria-live": "polite" });
    let results = null;
    let selected = null;
    const paras = paragraphs.map((p) => {
      const el = h("p", { class: "para target-text", lang: "en" });
      for (const seg of segment(p)) {
        if (seg.w === void 0) {
          el.append(document.createTextNode(seg.text));
          continue;
        }
        const span = h("span", { class: "w", text: seg.text });
        span.dataset.i = String(wordEls.length);
        span.dataset.audio = wordAudioText(seg);
        span.addEventListener("click", () => select(Number(span.dataset.i)));
        span.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(Number(span.dataset.i));
          }
        });
        wordEls.push(span);
        el.append(span);
      }
      return el;
    });
    function select(i) {
      if (!results) {
        playWord(wordEls[i].dataset.audio);
        return;
      }
      const r = results[i];
      if (selected !== null && wordEls[selected]) wordEls[selected].classList.remove("w-sel");
      selected = i;
      wordEls[i].classList.add("w-sel");
      const word = wordEls[i].textContent;
      clear(detail).append(
        h(
          "div",
          { class: "row nowrap" },
          h("b", { class: "en", text: word }),
          h("span", { class: `chip w-chip-${r.state}`, text: LABEL[r.state] || r.state }),
          h("span", { class: "spacer" }),
          h("button", { class: "btn small", type: "button", onclick: () => playWord(wordEls[i].dataset.audio) }, icon("speaker"), "Ouvir")
        ),
        h("div", { class: "small", style: { marginTop: "4px" }, text: r.reason })
      );
      detail.classList.remove("hidden");
    }
    function apply(evaluation) {
      results = evaluation.words.map((x) => ({ state: x.state, reason: x.reason }));
      wordEls.forEach((el, i) => {
        const st = results[i] ? results[i].state : "uncertain";
        el.className = `w w-${st}`;
        el.dataset.state = st;
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", `${el.textContent}: ${LABEL[st] || st}`);
      });
      detail.classList.add("hidden");
      selected = null;
    }
    function reset() {
      results = null;
      selected = null;
      wordEls.forEach((el) => {
        el.className = "w";
        delete el.dataset.state;
        el.removeAttribute("role");
        el.removeAttribute("tabindex");
        el.removeAttribute("aria-label");
      });
      detail.classList.add("hidden");
    }
    function focus(i) {
      wordEls.forEach((el, k) => el.classList.toggle("w-focus", k === i));
    }
    return { el: h("div", { class: "target-wrap" }, ...paras), detail, text, apply, reset, focus, wordEls };
  }
  function legend() {
    const item = (st, label) => h("span", { class: "lg", role: "listitem" }, h("i", { class: `dot dot-${st}`, "aria-hidden": "true" }), label);
    return h(
      "div",
      { class: "w-legend", role: "list", "aria-label": "Legenda das cores" },
      item("good", "Reconhecida"),
      item("needs_practice", "Praticar"),
      item("uncertain", "N\xE3o avaliada")
    );
  }
  function scoreLine(score, summary) {
    const head = score.overall === null ? h("div", { class: "score-head" }, h("span", { class: "chip", text: "Sem nota geral" })) : h("div", { class: "score-head" }, h("b", { class: "score-num", text: `${score.overall}/100` }), h("span", { class: "score-tag", text: score.partial ? "Avalia\xE7\xE3o parcial" : "Avalia\xE7\xE3o" }));
    return h("div", { class: "score-line" }, head, summary ? h("p", { class: "score-summary", text: summary }) : null);
  }
  function scoreDetails(score, { heard = null, engine = null, note = "" } = {}) {
    return h(
      "details",
      { class: "more fb-details" },
      h("summary", { text: "Ver o que o app ouviu" }),
      heard !== null ? h("p", { class: "small" }, h("span", { class: "muted", text: "Transcri\xE7\xE3o: " }), h("span", { class: "en", text: heard ? `\u201C${heard}\u201D` : "(nada reconhecido)" })) : h("p", { class: "small muted", text: "Nenhuma transcri\xE7\xE3o nesta tentativa." }),
      note ? h("p", { class: "small muted", text: note }) : null,
      score ? h("ul", { class: "small dims" }, score.dims.map((d) => h(
        "li",
        {},
        `${d.label} (peso ${Math.round(d.weight * 100)}%): `,
        d.score === null ? h("i", { text: `n\xE3o avaliado \u2014 ${d.note}` }) : h("b", { text: `${d.score}/100` })
      ))) : null,
      h("p", { class: "tiny muted", text: `${engine === "model" ? "Reconhecimento local (Moonshine), no aparelho." : engine === "webspeech" ? "Reconhecimento do Chrome, no aparelho." : ""} As cores indicam se cada palavra foi reconhecida, n\xE3o qual som foi dito; sotaque n\xE3o \xE9 erro. Pesos da nota: hip\xF3teses iniciais, n\xE3o validadas.` })
    );
  }

  // app/js/ui/asrsetup.js
  var mb = (bytes) => String(Math.round(bytes / 1048576));
  async function runInstall(box2, { onProgressText } = {}) {
    const fill = h("i", { style: { width: "0%" } });
    const bar2 = h("div", { class: "bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 0, "aria-label": "Progresso do download" }, fill);
    const label = h("div", { class: "small muted", text: "Preparando o download\u2026" });
    clear(box2).append(bar2, label);
    try {
      await install({
        onProgress: (f, done, total) => {
          const pct = Math.round(f * 100);
          fill.style.width = `${pct}%`;
          bar2.setAttribute("aria-valuenow", String(pct));
          label.textContent = `Baixando\u2026 ${mb(done)} de ${mb(total)} MB`;
          onProgressText && onProgressText(pct);
        }
      });
      fill.style.width = "100%";
      label.textContent = "Conferindo os arquivos\u2026";
      const v = await verify();
      if (!v.ok) throw new Error("os arquivos baixados est\xE3o incompletos");
      clear(box2).append(h("div", { class: "setup-done", role: "status" }, icon("check"), "Reconhecimento instalado. Funciona offline."));
      return true;
    } catch (e) {
      clear(box2).append(h(
        "div",
        { class: "setup-error", role: "alert" },
        h("b", { text: "N\xE3o foi poss\xEDvel baixar agora." }),
        " ",
        h("span", { text: navigator.onLine === false ? "Voc\xEA est\xE1 sem internet. Conecte-se e tente de novo." : `Verifique a conex\xE3o e tente de novo (${e.message}).` }),
        h("div", { class: "tiny muted", text: "O que j\xE1 foi baixado \xE9 aproveitado na pr\xF3xima tentativa." })
      ));
      return false;
    }
  }
  function asrSetupCard(App2, { onInstalled, onLater } = {}) {
    const progress = h("div", { class: "setup-progress" });
    const primary = h("button", { class: "btn primary", type: "button" }, icon("download"), "Baixar reconhecimento");
    const later = h("button", { class: "btn ghost", type: "button" }, "Agora n\xE3o");
    const card = h(
      "section",
      { class: "card setup-card", "data-role": "asr-setup", "aria-labelledby": "asr-setup-title" },
      h("div", { class: "setup-head" }, h("span", { class: "setup-icon", "aria-hidden": "true" }, icon("mic")), h("h3", { id: "asr-setup-title", text: "Avalie sua pron\xFAncia" })),
      h("p", { text: "Baixe o reconhecimento de fala para analisar suas grava\xE7\xF5es no pr\xF3prio aparelho, sem enviar seu \xE1udio para a nuvem." }),
      h(
        "ul",
        { class: "setup-facts" },
        h("li", {}, h("b", { text: `${sizeLabel()}` }), " de download, uma \xFAnica vez"),
        h("li", { text: "Precisa de internet s\xF3 para baixar" }),
        h("li", { text: "Depois funciona offline" }),
        h("li", { text: "Tudo \xE9 processado no aparelho" })
      ),
      progress,
      h("div", { class: "row setup-actions" }, primary, later)
    );
    primary.onclick = async () => {
      primary.disabled = true;
      later.disabled = true;
      const ok = await runInstall(progress);
      if (ok) {
        App2.state.settings.asrPrompt = "installed";
        App2.flush().catch(() => {
        });
        toast("Reconhecimento instalado. Suas grava\xE7\xF5es ser\xE3o analisadas automaticamente.", 4e3);
        onInstalled && onInstalled();
        return;
      }
      clear(primary).append(icon("refresh"), "Tentar de novo");
      primary.disabled = false;
      later.disabled = false;
    };
    later.onclick = () => {
      App2.state.settings.asrPrompt = "later";
      App2.flush().catch(() => {
      });
      onLater && onLater();
    };
    return card;
  }
  function asrOffNotice(App2, { onInstalled } = {}) {
    const box2 = h("div", { class: "asr-off", "data-role": "asr-off" });
    const open = () => clear(box2).append(asrSetupCard(App2, { onInstalled, onLater: () => {
      clear(box2).append(...line());
    } }));
    const line = () => [
      h("span", { class: "small muted", text: "An\xE1lise autom\xE1tica desligada at\xE9 instalar o reconhecimento." }),
      h("button", { class: "link-btn", type: "button", onclick: open }, "Instalar")
    ];
    box2.append(...line());
    return box2;
  }

  // app/js/ui/freeanswer.js
  var vocabCache = /* @__PURE__ */ new WeakMap();
  var vocabOf = (content) => {
    if (!vocabCache.has(content)) vocabCache.set(content, buildVocab(content));
    return vocabCache.get(content);
  };
  var fmt2 = (n) => String(n).replace(".", ",");
  var STATE_LABEL3 = { good: "Compat\xEDvel", needs_practice: "Confira", uncertain: "N\xE3o avaliada" };
  function freeAnswerPanel(App2, { question = "", model = "", alternatives = [], modelClips = [], unit = "q" }) {
    const el = h("section", { class: "fb free-fb hidden", "aria-live": "polite", "data-role": "free-feedback", "data-state": "idle" });
    const gate = latestGate();
    let w = null, status3 = null, alive = true, last = null, pendingSaved = null;
    loadLexicon();
    const show = (state, ...children) => {
      clear(el).append(...children);
      el.dataset.state = state;
      el.classList.toggle("hidden", !children.filter(Boolean).length);
    };
    const reset = () => {
      gate.invalidate();
      if (busy()) release2();
      show("idle");
    };
    const recordAgain = () => {
      if (!w) return;
      w.el.scrollIntoView({ block: "center", behavior: "smooth" });
      w.start();
    };
    const againBtn = (label = "Gravar novamente") => h("button", { class: "btn small", type: "button", onclick: recordAgain }, icon("mic"), label);
    const mineBtn = () => h("button", { class: "btn small", type: "button", onclick: () => w && w.audioEl.src && playElement(w.audioEl, { restart: true }) }, icon("play"), "Ouvir minha resposta");
    async function refreshStatus() {
      status3 = await status();
      if (!alive) return;
      if (pendingSaved) {
        const r = pendingSaved;
        pendingSaved = null;
        loaded(r);
      } else if (status3 !== "installed" && el.dataset.state === "idle" && last) unavailable();
    }
    function unavailable() {
      const installed = () => {
        status3 = "installed";
        if (last) analyse(last.blob, last.analysis);
        else show("idle");
      };
      if (status3 === "not-installed" && App2.state.settings.asrPrompt !== "later") {
        return show(
          "setup",
          h("p", { class: "small muted", text: "Sua grava\xE7\xE3o est\xE1 salva. Para receber a transcri\xE7\xE3o e o feedback autom\xE1tico, instale o reconhecimento de fala local." }),
          asrSetupCard(App2, { onInstalled: installed, onLater: () => unavailable() })
        );
      }
      if (status3 === "not-installed") return show("unavailable", asrOffNotice(App2, { onInstalled: installed }));
      show("unavailable", h("p", { class: "small muted", text: `An\xE1lise autom\xE1tica indispon\xEDvel aqui: ${unsupportedReason() || "reconhecimento local ausente"}. A grava\xE7\xE3o continua salva.` }));
    }
    async function analyse(blob, analysis, saved = null) {
      const ticket = gate.next();
      last = { blob, analysis };
      if (!saved && status3 !== "installed") return unavailable();
      let text = saved ? saved.text : null;
      let integrity = saved ? saved.integrity || null : null;
      if (!saved && !insufficientAudio(analysis)) {
        const prog = h("span", { class: "small muted" });
        show("analysing", h("div", { class: "fb-analysing", role: "status" }, h("span", { class: "spinner", "aria-hidden": "true" }), "Analisando sua resposta\u2026", prog));
        try {
          const res = await transcribe(blob, { long: true, onProgress: (i, n) => {
            if (n > 1) prog.textContent = ` parte ${i} de ${n}`;
          } });
          text = res.text;
          integrity = transcriptIntegrity({ text, segments: res.segments, secs: res.secs });
        } catch (e) {
          if (!alive || !gate.isCurrent(ticket) || e.code === "cancelled") return;
          return error(e, blob, analysis);
        }
      }
      await loadLexicon();
      if (!alive || !gate.isCurrent(ticket)) return;
      const grammar = text && App2.checker ? App2.checker.coverage(text, { keywords: [] }).grammar : [];
      const divergences = text && App2.checker ? findDivergences(text, { checker: App2.checker, pool: contextPool(App2.content, App2.checker), model }) : [];
      const naturalness = text && App2.checker ? App2.checker.naturalness(text) : [];
      const r = analyseFreeAnswer({ question, model, alternatives, unit, transcript: text || "", analysis, vocab: vocabOf(App2.content), grammar, divergences, naturalness, frames: frameRefs(App2.content), integrity });
      render(r, !!saved);
      if (!saved && text !== null && w) w.updateMeta(blob, { free: { text, at: Date.now(), integrity } });
    }
    function error(e, blob, analysis) {
      const msg = e.code === "too-long" ? `Sua resposta tem ${Math.round(e.secs)} s; a an\xE1lise autom\xE1tica vai at\xE9 ${Math.round(e.max / 60)} min. Ela n\xE3o foi cortada nem avaliada. Grave uma vers\xE3o mais curta (por exemplo, um bloco por vez).` : { load: "O reconhecimento n\xE3o carregou neste momento.", timeout: "A an\xE1lise demorou demais e foi interrompida.", decode: "N\xE3o consegui ler esta grava\xE7\xE3o." }[e.code] || "A an\xE1lise falhou nesta grava\xE7\xE3o.";
      const actions = h("div", { class: "row fb-actions" });
      const help = h("div", { class: "small" });
      if (e.code === "too-long" || e.code === "decode") actions.append(againBtn());
      else actions.append(h("button", { class: "btn small primary", type: "button", onclick: () => analyse(blob, analysis) }, icon("refresh"), "Tentar de novo"));
      if (e.code === "load") {
        actions.append(h("button", { class: "btn small", type: "button", onclick: async (ev) => {
          ev.currentTarget.disabled = true;
          const v = await verify();
          if (v.ok) {
            help.textContent = "Os arquivos do reconhecimento est\xE3o \xEDntegros. Tente de novo; se continuar falhando, feche e reabra o app.";
            return;
          }
          clear(help).append(
            h("p", { text: "Arquivos do reconhecimento incompletos. \xC9 preciso baix\xE1-los de novo (precisa de internet)." }),
            h("button", { class: "btn small primary", type: "button", onclick: async () => {
              if (await runInstall(help)) analyse(blob, analysis);
            } }, icon("download"), "Baixar de novo")
          );
        } }, icon("target"), "Verificar instala\xE7\xE3o"));
      }
      show(
        "error",
        h("div", { class: "fb-error", role: "alert" }, h("b", { text: msg }), " ", h("span", { class: "muted", text: "Nenhuma avalia\xE7\xE3o foi gerada. Sua grava\xE7\xE3o continua salva e a miss\xE3o pode seguir normalmente." })),
        actions,
        help,
        h("details", { class: "more" }, h("summary", { text: "Detalhes t\xE9cnicos" }), h("p", { class: "tiny muted", text: `${e.code || "erro"}: ${e.message}` }))
      );
    }
    function render(r, fromSaved) {
      if (r.status === "inconclusive") {
        return show(
          "inconclusive",
          h("div", { class: "fa-head" }, h("span", { class: "chip", text: STATUS_LABEL.inconclusive })),
          h("p", { class: "fa-msg", text: r.message }),
          r.transcript ? transcriptBox(r) : null,
          h("div", { class: "row fb-actions" }, againBtn())
        );
      }
      const chips = h("div", { class: "practice-chips", role: "list" });
      const panel = h("div", { class: "practice-panel hidden", "aria-live": "polite" });
      const tb = transcriptBox(r, (i) => focusPractice(i));
      function focusPractice(i) {
        const x = r.practice.find((p) => p.w === i || p.ws && p.ws.includes(i));
        tb.focus(x && x.ws ? x.ws : i);
        chips.querySelectorAll(".pchip").forEach((b) => b.setAttribute("aria-pressed", String(!!x && Number(b.dataset.w) === x.w)));
        if (!x) {
          panel.classList.add("hidden");
          return;
        }
        if (x.ws) tb.focus(x.ws);
        const refKey = x.ref ? audioKey(x.ref.toLowerCase().replace(/[.,!?;:]+$/, "")) : null;
        const hasRef = refKey && hasEmbedded(refKey);
        const hasSentence = x.refAu && hasEmbedded(x.refAu);
        if (hasRef) play({ key: refKey, text: x.ref });
        else if (hasSentence) play({ key: x.refAu, text: x.refText });
        clear(panel).append(
          h("p", { class: "small", text: x.reason }),
          h(
            "div",
            { class: "row" },
            hasRef ? h("button", { class: "btn small", type: "button", onclick: () => play({ key: refKey, text: x.ref }) }, icon("speaker"), `Ouvir \u201C${x.ref}\u201D`) : null,
            hasSentence ? h("button", { class: "btn small", type: "button", onclick: () => play({ key: x.refAu, text: x.refText }) }, icon("speaker"), "Ouvir a frase de refer\xEAncia") : null,
            mineBtn(),
            modelClips.length ? h("button", { class: "btn small", type: "button", onclick: () => playSequence(modelClips) }, icon("play"), "Ouvir o exemplo") : null
          ),
          h("p", { class: "tiny muted", text: hasRef || hasSentence ? "Ou\xE7a sua grava\xE7\xE3o e a refer\xEAncia. Se o app ouviu errado, est\xE1 tudo certo; se a palavra saiu diferente, repita e grave de novo." : "N\xE3o h\xE1 \xE1udio de refer\xEAncia para este trecho; compare com sua grava\xE7\xE3o e com o exemplo." }),
          h("button", { class: "btn primary block", type: "button", onclick: recordAgain }, icon("mic"), "Gravar a resposta de novo")
        );
        panel.classList.remove("hidden");
      }
      for (const x of r.practice) {
        const b = h(
          "button",
          { class: "pchip", type: "button", role: "listitem", "aria-pressed": "false", "data-w": String(x.w), "aria-label": `Revisar \u201C${x.text}\u201D` },
          h("span", { class: "en", text: x.text }),
          icon(x.ref ? "speaker" : "eye")
        );
        b.onclick = () => focusPractice(x.w);
        chips.append(b);
      }
      const m = r.metrics;
      const metricRow = (label, value) => h("li", {}, h("span", { class: "muted", text: `${label}: ` }), value === null ? h("i", { text: "indispon\xEDvel" }) : h("b", { text: value }));
      show(
        "result",
        h("div", { class: "fa-head" }, h("span", { class: `chip fa-status fa-${r.status}`, text: STATUS_LABEL[r.status] }), fromSaved ? h("span", { class: "tiny muted", text: "\xFAltima resposta gravada" }) : null),
        h("p", { class: "fa-msg", text: r.message }),
        h("ul", { class: "fa-check", "aria-label": "Crit\xE9rios da resposta" }, r.checklist.map((c) => h(
          "li",
          { class: c.ok ? "ok" : c.unconfirmed ? "unk" : "no" },
          h("span", { class: "fa-mark", "aria-hidden": "true", text: c.ok ? "\u2713" : c.unconfirmed ? "?" : "\u25CB" }),
          c.label,
          c.unconfirmed ? h("span", { class: "tiny muted", text: " \u2014 n\xE3o confirmado: pode ter sido perdido pelo reconhecimento" }) : null,
          h("span", { class: "sr-only", text: c.ok ? " (sim)" : c.unconfirmed ? " (n\xE3o confirmado)" : c.required ? " (n\xE3o)" : " (sugest\xE3o)" })
        ))),
        integrityNote(r.integrity),
        tb.el,
        r.coherence && r.coherence.length ? h(
          "div",
          { class: "notice small fa-coherence", "data-role": "fa-coherence", role: "note" },
          h("b", { text: "Coer\xEAncia do relato" }),
          h("ul", {}, r.coherence.map((c) => h("li", { text: c.msg })))
        ) : null,
        r.practice.length ? h(
          "div",
          { class: "practice", "data-role": "free-practice", "aria-label": "Palavras para revisar" },
          chips,
          h("div", { class: "tiny muted practice-hint", text: r.practice.some((x) => x.flag === "nonword" && x.ref) ? "Trechos que podem ter sido reconhecidos incorretamente: a sugest\xE3o vem do contexto da pergunta, n\xE3o \xE9 a transcri\xE7\xE3o. Toque para conferir se corresponde ao que voc\xEA disse." : "Trechos que destoam do contexto: podem ser erro do reconhecimento ou da pron\xFAncia \u2014 o app n\xE3o sabe qual. Toque para conferir." }),
          panel
        ) : null,
        r.tips.length ? h(
          "div",
          { class: "fa-tips" },
          h("b", { class: "small", text: "Para melhorar a resposta" }),
          h("ul", { class: "small" }, r.tips.map((t) => h("li", { text: t })))
        ) : null,
        r.language && (r.language.grammar.length || r.language.naturalness.length) ? h(
          "div",
          { class: "fa-tips", "data-role": "fa-language" },
          h("b", { class: "small", text: "Gram\xE1tica e naturalidade" }),
          h("ul", { class: "small" }, r.language.naturalness.map((t) => h("li", { text: t })), r.language.grammar.map((t) => h("li", { text: t }))),
          h("div", { class: "tiny muted", text: "Com base na transcri\xE7\xE3o autom\xE1tica: confira ouvindo sua grava\xE7\xE3o." })
        ) : null,
        h("div", { class: "row fb-actions" }, mineBtn(), againBtn()),
        h(
          "details",
          { class: "more" },
          h("summary", { text: "Ritmo e pausas" }),
          h(
            "ul",
            { class: "small fa-metrics" },
            metricRow("Dura\xE7\xE3o da grava\xE7\xE3o", m.totalSec === null ? null : `${fmt2(m.totalSec)} s`),
            metricRow("Do in\xEDcio ao fim da fala", m.speechSec === null ? null : `${fmt2(m.speechSec)} s`),
            metricRow("Velocidade estimada", m.wpm === null ? null : `~${m.wpm} palavras/min`),
            metricRow("Pausas (\u2265 0,3 s)", m.pauses),
            metricRow("Pausas longas (\u2265 0,8 s)", m.longPauses)
          ),
          h("p", { class: "tiny muted", text: "Medido no aparelho a partir da grava\xE7\xE3o e da transcri\xE7\xE3o. Falar mais r\xE1pido n\xE3o significa falar melhor; pausas curtas para pensar s\xE3o normais." })
        ),
        h(
          "details",
          { class: "more" },
          h("summary", { text: "Como esta avalia\xE7\xE3o funciona" }),
          h(
            "ul",
            { class: "small" },
            h("li", {}, h("b", { text: "Transcri\xE7\xE3o: " }), "antes de avaliar, o app confere se a transcri\xE7\xE3o cobre toda a grava\xE7\xE3o; se parte da fala pode ter se perdido, o que faltar fica \u201Cn\xE3o confirmado\u201D."),
            h("li", {}, h("b", { text: "Cores: " }), "verde = compat\xEDvel com o vocabul\xE1rio e o contexto da atividade; \xE2mbar = trecho que destoa do contexto (confira); cinza = sem evid\xEAncia para classificar. Nenhuma cor mede os sons."),
            h("li", {}, h("b", { text: "Resposta: " }), "confere se voc\xEA falou do tema da pergunta e trouxe o que ela pede. N\xE3o precisa repetir o exemplo: outras palavras valem."),
            h("li", {}, h("b", { text: "Ritmo: " }), "dura\xE7\xE3o, tempo de fala, velocidade e pausas, quando foi poss\xEDvel medir."),
            h("li", {}, h("b", { text: "Pron\xFAncia: " }), r.pronunciation.note)
          )
        )
      );
    }
    function integrityNote(integ) {
      if (!integ || !integ.issues || !integ.issues.length) return null;
      return h(
        "div",
        { class: "notice small fa-integrity", "data-role": "fa-integrity", role: "note" },
        h("b", { text: "A transcri\xE7\xE3o pode estar incompleta" }),
        h("ul", {}, integ.issues.map((x) => h("li", { text: x.msg }))),
        h("div", { class: "tiny muted", text: "Por isso, o que n\xE3o aparece na transcri\xE7\xE3o n\xE3o \xE9 tratado como \u201Cvoc\xEA n\xE3o disse\u201D." })
      );
    }
    function transcriptBox(r, onPick) {
      const detail = h("div", { class: "word-detail hidden", role: "status" });
      const spans = [];
      const p = h("p", { class: "fa-text en", lang: "en" });
      const states = new Map(r.words.map((x) => [x.w, x]));
      for (const seg of segment(r.transcript)) {
        if (seg.w === void 0) {
          p.append(document.createTextNode(seg.text));
          continue;
        }
        const info = states.get(seg.w) || { state: "uncertain", reason: "" };
        const span = h("span", { class: `w w-${info.state}`, role: "button", tabindex: "0", "data-state": info.state, "aria-label": `${seg.text}: ${STATE_LABEL3[info.state]}`, text: seg.text });
        const pick = () => {
          spans.forEach((s) => s.classList.toggle("w-focus", s === span));
          if (onPick && info.state === "needs_practice") {
            detail.classList.add("hidden");
            return onPick(seg.w);
          }
          const clean = seg.text.replace(/[.,!?;:]+$/, "").toLowerCase();
          const key = audioKey(clean);
          clear(detail).append(
            h(
              "div",
              { class: "row nowrap" },
              h("b", { class: "en", text: seg.text }),
              h("span", { class: `chip w-chip-${info.state}`, text: STATE_LABEL3[info.state] }),
              h("span", { class: "spacer" }),
              hasEmbedded(key) ? h("button", { class: "btn small", type: "button", onclick: () => play({ key, text: clean }) }, icon("speaker"), "Ouvir") : null
            ),
            h("div", { class: "small", style: { marginTop: "4px" }, text: info.reason })
          );
          detail.classList.remove("hidden");
        };
        span.addEventListener("click", pick);
        span.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick();
          }
        });
        span.dataset.w = String(seg.w);
        spans.push(span);
        p.append(span);
      }
      const lg = legend();
      lg.querySelectorAll(".lg").forEach((el2, i) => {
        el2.lastChild.textContent = [STATE_LABEL3.good, STATE_LABEL3.needs_practice, STATE_LABEL3.uncertain][i];
      });
      const box2 = h(
        "div",
        { class: "fa-transcript" },
        h("div", { class: "fa-tlabel" }, h("span", { class: "eyebrow", text: "O que o app ouviu" }), h("span", { class: "tiny muted", text: " \xB7 transcri\xE7\xE3o autom\xE1tica, pode conter erros" })),
        p,
        lg,
        detail
      );
      return { el: box2, focus: (i) => {
        const set2 = new Set([].concat(i));
        spans.forEach((s) => s.classList.toggle("w-focus", set2.has(Number(s.dataset.w))));
      } };
    }
    function loaded(rec) {
      if (!alive || !rec) return;
      const meta = rec.meta || {};
      last = { blob: rec.blob, analysis: meta.analysis || null };
      if (meta.free) return analyse(rec.blob, meta.analysis || null, { text: meta.free.text, integrity: meta.free.integrity || null });
      if (!rec.blob) return;
      if (status3 === "installed") return analyse(rec.blob, meta.analysis || null);
      unavailable();
    }
    const hooks = {
      onStart: () => reset(),
      onRecorded: (blob, analysis) => analyse(blob, analysis),
      onLoaded: (rec) => {
        if (status3 === null) pendingSaved = rec;
        else loaded(rec);
      },
      onDeleted: () => {
        reset();
        last = null;
      }
    };
    refreshStatus();
    return {
      el,
      hooks,
      attach(widget) {
        w = widget;
      },
      destroy() {
        alive = false;
        gate.invalidate();
        release2();
      }
    };
  }

  // app/js/ui/session.js
  var OUTCOME = { correct: "good", accepted_variant: "good", variant_ame: "good", spelling: "ok", grammar: "bad", meaning: "bad", inconclusive: "bad", empty: "bad" };
  var HEAD = {
    correct: ["good", "\u2713 Correto!"],
    accepted_variant: ["good", "\u2713 Aceito"],
    variant_ame: ["good", "\u2713 Aceito \u2014 grafia americana"],
    spelling: ["mid", "\u2713 Quase perfeito \u2014 erro de digita\xE7\xE3o"],
    grammar: ["bad", "\u2717 Aten\xE7\xE3o \xE0 gram\xE1tica"],
    meaning: ["bad", "\u2717 N\xE3o corresponde ao esperado"],
    inconclusive: ["mid", "\u2248 Diferente do modelo"],
    empty: ["bad", "Sem resposta"]
  };
  function renderSession(App2, { params }) {
    const { content, state } = App2;
    const routineOk = !params.routine || content.routines.some((x) => x.id === params.routine);
    const focus = { routine: routineOk ? params.routine : void 0, context: params.context, category: params.category, mode: routineOk ? params.mode : void 0 };
    if (routineOk && params.routine && stageById(params.stage) && params.stage !== "speak") {
      if (!stageOpen(content, params.routine, params.stage, state)) {
        App2.go(`#/module/${params.routine}`);
        return;
      }
      focus.stage = params.stage;
    }
    const size = Math.max(8, Math.min(20, state.settings.dailyGoal || 12));
    let queue;
    const today = App2.today();
    const startLevel = levelForXp(state.xp).level;
    if (focus.mode === "review") {
      queue = Object.values(state.cards).filter((c) => c.due <= today && cardInContent(content, c.k)).sort((a, b) => a.box - b.box).slice(0, 20).map((c) => {
        const [unit, id, skill] = c.k.split(":");
        return { k: c.k, unit, id, skill, review: true };
      });
    } else if (focus.mode === "present" && focus.routine) {
      const r = content.routines.find((x) => x.id === focus.routine);
      const qs = [...r.questions, ...r.priority ? Object.values(content.questions).filter((q) => q.source === "word" && !q.routine).map((q) => q.id).slice(0, 3) : []];
      queue = [
        ...r.blocks.map((b) => ({ k: cardKey("block", b, "tell"), unit: "block", id: b, skill: "tell" })),
        ...qs.map((q) => ({ k: cardKey("q", q, "conv"), unit: "q", id: q, skill: "conv" })),
        { k: cardKey("routine", r.id, "retell"), unit: "routine", id: r.id, skill: "retell" }
      ];
    } else if (focus.mode === "difficult") {
      queue = difficultCards(state, content).slice(0, 15).map((c) => {
        const [unit, id, skill] = c.k.split(":");
        return { k: c.k, unit, id, skill, review: true };
      });
    } else {
      queue = buildSession(content, state.cards, { focus, size, today, filter: focus.stage ? stageFilter(content, focus.routine, focus.stage) : null });
    }
    queue = queue.filter((q) => validEntry(content, q));
    if (focus.mode !== "present") queue = maybePairs(queue, content);
    const view = App2.layout(focusTitle(App2, focus), { nav: false, back: null, actions: [] });
    const top = view.previousElementSibling;
    const progress = h("div", { class: "bar" }, h("i", { style: { width: "0%" } }));
    const closeBtn = h("button", { class: "icon-btn ghost", "aria-label": "Sair da sess\xE3o", onclick: () => leave() }, icon("close"));
    clear(top).append(h("div", { class: "session-top", style: { width: "100%" } }, closeBtn, progress, h("span", { class: "small muted", id: "count" })));
    const area = h("div", { class: "ex-area" });
    const actionbar = h("div", { class: "actionbar" }, h("div", { class: "inner" }));
    view.append(area);
    document.getElementById("app").append(actionbar);
    const actions = (...btns) => {
      clear(actionbar.firstChild).append(...btns.filter(Boolean));
    };
    let idx = 0;
    const results = [];
    const requeued = /* @__PURE__ */ new Set();
    let xpGained = 0;
    const events = [];
    let widget = null;
    let freePanel = null;
    if (!queue.length) {
      area.append(h(
        "div",
        { class: "card center", style: { marginTop: "24px" } },
        h("div", { style: { fontSize: "2rem" }, text: "\u{1F389}" }),
        h("h3", { text: "Nada pendente por aqui agora" }),
        h("p", { class: "muted small", text: "Voc\xEA est\xE1 em dia neste foco. Escolha outra rotina ou momento do dia, ou pratique a fala." })
      ));
      if (focus.stage) actions(h("a", { class: "btn primary", href: `#/module/${focus.routine}` }, "Voltar ao m\xF3dulo"));
      else actions(h("a", { class: "btn", href: "#/explore" }, "Explorar"), h("a", { class: "btn primary", href: "#/lab" }, "Speaking Lab"));
      return () => actionbar.remove();
    }
    async function leave() {
      if (idx > 0 && idx < queue.length) {
        const ok = await confirmSheet("Sair da sess\xE3o?", "As respostas j\xE1 dadas ficam salvas. Os exerc\xEDcios restantes voltam numa pr\xF3xima sess\xE3o.", { ok: "Sair" });
        if (!ok) return;
      }
      App2.flush();
      App2.go("#/");
    }
    function updateTop() {
      progress.firstChild.style.width = `${Math.round(idx / queue.length * 100)}%`;
      document.getElementById("count").textContent = `${Math.min(idx + 1, queue.length)}/${queue.length}`;
    }
    function next() {
      if (freePanel) {
        freePanel.destroy();
        freePanel = null;
      }
      if (widget) {
        widget.destroy();
        widget = null;
      }
      stopAll();
      updateTop();
      clear(area);
      window.scrollTo(0, 0);
      if (idx >= queue.length) {
        App2.debugExercise = { type: "summary" };
        return summary();
      }
      const entry = queue[idx];
      try {
        if (entry.learn) {
          App2.debugExercise = { type: "learn", entry };
          return renderLearn(entry);
        }
        const ex = entry.unit === "pairs" ? makePairs(content, entry) : makeExercise(content, entry);
        App2.debugExercise = ex;
        if (ex.type === "pairs") return renderPairs(ex);
        RENDER[ex.type](ex);
      } catch (e) {
        console.error(e);
        idx++;
        next();
      }
    }
    function finish(entry, outcome, info = {}) {
      const r = recordAnswer(state, entry.k, outcome, { ...info, today: App2.today() });
      xpGained += r.xp;
      events.push(...r.events);
      results.push({ entry, outcome, cls: info.cls });
      if (outcome === "bad" && !requeued.has(entry.k)) {
        requeued.add(entry.k);
        const copy = { k: entry.k, unit: entry.unit, id: entry.id, skill: entry.skill, review: true, retry: true };
        queue.splice(Math.min(queue.length, idx + 4), 0, copy);
      }
      App2.save();
      return r;
    }
    const kind = (t) => h("div", { class: "ex-kind", text: t });
    const continueBtn = (fn) => {
      const b = h("button", { class: "btn primary lg", onclick: () => {
        idx++;
        fn && fn();
        next();
      } }, "Continuar");
      setTimeout(() => b.focus({ preventScroll: true }), 50);
      return b;
    };
    const autoplay = (clip) => {
      if (state.settings.autoplay) playSoon(clip, 250);
    };
    const nextReviewText = (k) => {
      const c = state.cards[k];
      if (!c) return "";
      const days = c.due - App2.today();
      return days <= 0 ? "Volta ainda nesta sess\xE3o ou na pr\xF3xima." : days === 1 ? "Pr\xF3xima revis\xE3o: amanh\xE3." : `Pr\xF3xima revis\xE3o em ${days} dias.`;
    };
    function feedback(res, { model, au, pt, example, tip, k, onClaim, extra } = {}) {
      const [tone, title] = HEAD[res.cls] || ["mid", res.cls];
      const face = characterImage(App2.character, { good: "correct", bad: "wrong", mid: "thinking" }[tone] || "thinking", { size: 40 });
      const panel = h(
        "div",
        { class: `feedback ${tone}`, role: "status", "aria-live": "polite" },
        h("div", { class: "head" }, face, title, h("span", { class: "spacer" }), res.xp ? h("span", { class: "chip ok", text: `+${res.xp} XP` }) : null)
      );
      if (res.cls !== "correct") {
        panel.append(h("div", { class: "small muted", style: { marginTop: "6px" }, text: "Resposta-modelo" }));
        panel.append(h("div", { class: "row nowrap" }, h("div", { class: "model", style: { flex: 1 } }, diffModel(res, model)), au || model ? speakerButton({ key: au, text: model }, { cls: "icon-btn ghost" }) : null));
        const ans = res.diff && res.diff.answerSpans;
        if (ans && res.cls !== "meaning" && ans.some((x) => x.state === "extra" || x.state === "typo")) {
          panel.append(h("div", { class: "small diff" }, "Voc\xEA escreveu: ", h("span", { class: "en" }, spansView(res.diff.answerText, ans, { extra: "extra", typo: "extra", style: "style" }))));
        } else if (!ans && res.diff && res.diff.extra && res.diff.extra.length && res.cls !== "meaning") {
          panel.append(h("div", { class: "small diff" }, "Voc\xEA escreveu: ", h("span", { class: "en" }, ...res.diff.answer.map((t, i) => [i ? " " : "", h("span", { class: t.ok ? "" : "extra", text: t.t })]))));
        }
      } else if (model) {
        panel.append(h("div", { class: "row nowrap" }, h("div", { class: "model", style: { flex: 1 }, text: model }), speakerButton({ key: au, text: model }, { cls: "icon-btn ghost" })));
      }
      if (pt) panel.append(h("div", { class: "pt small", text: pt }));
      for (const n of res.notes || []) panel.append(h("div", { class: "small", style: { marginTop: "6px" }, text: n }));
      if (tip) panel.append(h("div", { class: "small", style: { marginTop: "6px" } }, "\u{1F4A1} ", tip));
      if (example && example.en && example.en !== model) panel.append(h("div", { class: "small", style: { marginTop: "8px" } }, h("span", { class: "muted", text: "Exemplo: " }), h("span", { class: "en", text: example.en })));
      if (extra) panel.append(extra);
      if (k) panel.append(h("div", { class: "tiny muted", style: { marginTop: "8px" }, text: nextReviewText(k) }));
      if (onClaim) {
        const claim2 = h("button", { class: "btn small", style: { marginTop: "10px" }, onclick: () => {
          onClaim();
          claim2.disabled = true;
          claim2.textContent = "Registrado: sua resposta foi aceita e ficar\xE1 como variante pessoal";
        } }, "Eu estava certo");
        panel.append(claim2);
      }
      return panel;
    }
    function spansView(text, spans, classes) {
      const frag = document.createDocumentFragment();
      let pos = 0;
      for (const sp of spans) {
        if (sp.start > pos) frag.append(document.createTextNode(text.slice(pos, sp.start)));
        const cls = classes[sp.state];
        const piece = text.slice(sp.start, sp.end);
        frag.append(cls ? h("span", { class: cls, text: piece, title: sp.state === "style" ? "diferen\xE7a de estilo, n\xE3o de erro" : null }) : document.createTextNode(piece));
        pos = sp.end;
      }
      if (pos < text.length) frag.append(document.createTextNode(text.slice(pos)));
      return frag;
    }
    function diffModel(res, model) {
      if (!res.diff || !res.diff.target || res.cls === "meaning") return document.createTextNode(model || "");
      if (res.diff.targetSpans && res.diff.targetText === model) return h("span", { class: "diff" }, spansView(model, res.diff.targetSpans, { miss: "miss", style: "style" }));
      const missing = new Set(res.diff.missing);
      if (!missing.size) return document.createTextNode(model || "");
      const frag = document.createDocumentFragment();
      model.split(/(\s+)/).forEach((w) => {
        const norm = w.toLowerCase().replace(/[^a-z0-9'à-ÿ:]/g, "");
        frag.append(missing.has(norm) ? h("span", { class: "miss", text: w }) : document.createTextNode(w));
      });
      return h("span", { class: "diff" }, frag);
    }
    function gradeText(entry, value, targets, meta) {
      const res = App2.checker.check(value, targets, { itemId: entry.unit === "item" ? entry.id : entry.k });
      const outcome = OUTCOME[res.cls];
      const r = finish(entry, outcome, { cls: res.cls, answer: value, hintUsed: meta.hintUsed });
      res.xp = r.xp;
      const onClaim = res.cls === "inconclusive" ? () => claim(entry, value, targets[0]) : null;
      area.append(feedback(res, { ...meta, k: entry.k, onClaim }));
      if (meta.au) autoplay({ key: meta.au, text: meta.model });
      actions(continueBtn());
      return res;
    }
    function claim(entry, value, model) {
      const key = entry.unit === "item" ? entry.id : entry.k;
      state.userVariants[key] = [.../* @__PURE__ */ new Set([...state.userVariants[key] || [], value.trim()])];
      state.pending.push({ key, answer: value.trim(), model, at: Date.now(), status: "claimed" });
      const last = results[results.length - 1];
      if (last && last.entry.k === entry.k) {
        state.cards[entry.k] = { ...state.cards[entry.k], box: Math.max(1, state.cards[entry.k].box), due: App2.today() + 1, lapses: Math.max(0, state.cards[entry.k].lapses - 1), lastResult: "ok" };
        last.outcome = "ok";
        const qi = queue.findIndex((q, i) => i > idx && q.retry && q.k === entry.k);
        if (qi > -1) queue.splice(qi, 1);
      }
      App2.rebuildChecker();
      App2.save();
    }
    function renderLearn(entry) {
      const item = content.items[entry.id];
      const ex = item.ex[0];
      area.append(
        kind("Nova express\xE3o"),
        h(
          "div",
          { class: "card" },
          h("div", { class: "chips" }, h("span", { class: "chip accent", text: categoryLabel(item.c) }), sourceChip(item.source)),
          h(
            "div",
            { class: "row nowrap", style: { marginTop: "8px" } },
            h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { class: "big-en", text: item.en }), item.ipa ? h("div", { class: "muted en small", text: item.ipa }) : null),
            speakerButton({ key: item.au, text: item.en })
          ),
          h("p", { style: { fontSize: "1.1rem", marginTop: "6px" }, text: item.pt }),
          item.tip ? h("div", { class: "notice small" }, "\u{1F4A1} ", item.tip) : null,
          ex ? h(
            "div",
            { style: { marginTop: "12px" } },
            h("div", { class: "row nowrap" }, h("div", { class: "en", style: { flex: 1 }, text: ex.en }), ex.au ? speakerButton({ key: ex.au, text: ex.en }, { cls: "icon-btn ghost" }) : null),
            ex.pt ? h("div", { class: "pt small", text: ex.pt }) : null
          ) : null
        )
      );
      autoplay({ key: item.au, text: item.en });
      actions(h("button", { class: "btn primary lg", onclick: () => {
        const xp = recordLearn(state, item.id, App2.today());
        xpGained += xp;
        queue.splice(Math.min(queue.length, idx + 3), 0, { k: entry.k, unit: entry.unit, id: entry.id, skill: entry.skill, afterLearn: true });
        queue.splice(idx, 1);
        next();
      } }, "Pr\xF3ximo"));
    }
    function chooseOption(ex, opts, o, { reveal } = {}) {
      opts.querySelectorAll("button").forEach((x) => {
        x.disabled = true;
      });
      const rightIdx = ex.options.findIndex((x) => x.correct);
      [...opts.children][rightIdx].classList.add("right");
      if (o && !o.correct) opts.children[ex.options.indexOf(o)].classList.add("wrong");
      const ok = !!(o && o.correct);
      const res = { cls: o ? ok ? "correct" : "meaning" : "empty", notes: [ex.item.explain] };
      const r = finish(ex.entry, ok ? "good" : "bad", { cls: res.cls, answer: o ? o.text : "" });
      res.xp = r.xp;
      area.append(feedback(res, { model: ex.options[rightIdx].text, k: ex.entry.k, extra: reveal ? reveal() : null }));
      actions(continueBtn());
    }
    const dialogueLines = (lines, { focus: focus2 = null } = {}) => h("div", { class: "para dialogue" }, lines.map((s) => h(
      "p",
      { class: `line${focus2 && s.focus ? " hl" : ""}` },
      s.speaker ? h("b", { class: "speaker", text: `${s.speaker}: ` }) : null,
      h("span", { class: "en", text: s.en || s.text })
    )));
    const RENDER = {
      listen(ex) {
        area.append(kind("Ou\xE7a e responda"), h("p", { class: "small muted", text: "Ou\xE7a o trecho do di\xE1logo (quantas vezes quiser) e escolha a resposta. O texto aparece depois." }));
        const play3 = () => playSequence(ex.clips.map((c) => ({ key: c.key, text: c.text })));
        area.append(
          h("button", { class: "btn primary block lg", "data-role": "listen-play", onclick: play3 }, icon("speaker"), "Ouvir o trecho"),
          h("div", { class: "big-en", style: { marginTop: "14px" }, text: ex.item.q })
        );
        const opts = h("div", { class: "options" });
        ex.options.forEach((o) => opts.append(h("button", { class: "option en", text: o.text, onclick: () => chooseOption(ex, opts, o, { reveal }) })));
        const reveal = () => h(
          "div",
          { style: { marginTop: "10px" } },
          h("div", { class: "small muted", text: "O que foi dito:" }),
          dialogueLines(ex.clips),
          h("button", { class: "btn small", onclick: play3 }, icon("speaker"), "Ouvir de novo")
        );
        area.append(opts);
        if (state.settings.autoplay) setTimeout(() => {
          if (App2.debugExercise === ex) play3();
        }, 300);
        actions(h("button", { class: "btn ghost", onclick: () => chooseOption(ex, opts, null, { reveal }) }, "N\xE3o sei"));
      },
      nat(ex) {
        area.append(
          kind("Mais natural"),
          h("p", { class: "small muted", text: "A frase abaixo usa uma forma simples. Escolha a express\xE3o que um falante brit\xE2nico usaria no lugar dela." }),
          h("div", { class: "card flat" }, h("p", { class: "en", "data-role": "nat-sentence", style: { margin: 0 } }, ex.before, h("mark", { class: "nat-plain", text: ex.plain }), ex.after)),
          h("div", { class: "big-en", style: { marginTop: "14px" }, text: ex.item.q })
        );
        const opts = h("div", { class: "options" });
        ex.options.forEach((o) => opts.append(h("button", { class: "option en", text: o.text, onclick: () => chooseOption(ex, opts, o, { reveal }) })));
        const reveal = () => h(
          "div",
          { style: { marginTop: "10px" } },
          h("div", { class: "small muted", text: "No texto:" }),
          h("p", { class: "en", text: ex.sentence.en }),
          h("button", { class: "btn small", onclick: () => play({ key: ex.sentence.au, text: ex.sentence.en }) }, icon("speaker"), "Ouvir a frase")
        );
        area.append(opts);
        actions(h("button", { class: "btn ghost", onclick: () => chooseOption(ex, opts, null, { reveal }) }, "N\xE3o sei"));
      },
      read(ex) {
        area.append(
          kind("Leia e responda"),
          h("p", { class: "small muted", text: "Leia o di\xE1logo e responda. A fala destacada \xE9 a refer\xEAncia." }),
          h("div", { class: "card flat read-passage" }, dialogueLines(ex.passage, { focus: true })),
          h("div", { class: "big-en", style: { marginTop: "14px" }, text: ex.item.q })
        );
        const opts = h("div", { class: "options" });
        ex.options.forEach((o) => opts.append(h("button", { class: "option en", text: o.text, onclick: () => chooseOption(ex, opts, o) })));
        area.append(opts);
        actions(h("button", { class: "btn ghost", onclick: () => chooseOption(ex, opts, null) }, "N\xE3o sei"));
      },
      mc(ex) {
        const { item } = ex;
        area.append(
          kind("Qual \xE9 o significado?"),
          h("div", { class: "row nowrap ex-prompt" }, h("div", { class: "big-en", style: { flex: 1 }, text: item.en }), speakerButton({ key: item.au, text: item.en }))
        );
        if (ex.context) {
          area.append(
            h("p", { class: "en", style: { fontSize: "1.05rem" } }, ex.context.before, h("span", { class: "hl", text: ex.context.target }), ex.context.after),
            h("p", { class: "small muted", text: "O que significa a parte destacada nesta frase?" })
          );
        }
        const opts = h("div", { class: "options" });
        ex.options.forEach((o) => {
          const b = h("button", { class: "option", text: o.pt });
          b.addEventListener("click", () => {
            opts.querySelectorAll("button").forEach((x) => {
              x.disabled = true;
            });
            const right = [...opts.children][ex.options.findIndex((x) => x.correct)];
            right.classList.add("right");
            if (!o.correct) b.classList.add("wrong");
            const res = { cls: o.correct ? "correct" : "meaning", notes: o.correct ? [] : [`\u201C${item.en}\u201D = ${item.pt}`] };
            const r = finish(ex.entry, o.correct ? "good" : "bad", { cls: res.cls, answer: o.pt });
            res.xp = r.xp;
            area.append(feedback(res, { model: o.correct ? null : item.en, au: item.au, example: item.ex[0], tip: o.correct ? null : item.tip, k: ex.entry.k }));
            actions(continueBtn());
          });
          opts.append(b);
        });
        area.append(opts);
        autoplay({ key: item.au, text: item.en });
        actions(h("button", { class: "btn ghost", onclick: () => {
          opts.querySelectorAll("button").forEach((x) => {
            x.disabled = true;
          });
          [...opts.children][ex.options.findIndex((x) => x.correct)].classList.add("right");
          const r = finish(ex.entry, "bad", { cls: "empty" });
          area.append(feedback({ cls: "empty", notes: [`\u201C${item.en}\u201D = ${item.pt}`], xp: r.xp }, { model: item.en, au: item.au, example: item.ex[0], tip: item.tip, k: ex.entry.k }));
          actions(continueBtn());
        } }, "N\xE3o sei"));
      },
      recall(ex) {
        const { item } = ex;
        let level = 0;
        const hintEl = h("div", { class: "en muted", style: { minHeight: "1.6em", marginTop: "8px", letterSpacing: ".04em" } });
        const input = textInput("Digite em ingl\xEAs");
        area.append(
          kind("Como se diz em ingl\xEAs?"),
          h("div", { style: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 }, text: item.pt }),
          h("div", { class: "chips", style: { margin: "8px 0" } }, h("span", { class: "chip", text: ex.label })),
          ex.cue ? h("p", { class: "small muted" }, "Na rotina: ", h("i", { text: ex.cue })) : null,
          input,
          hintEl
        );
        const verify2 = h("button", { class: "btn primary lg", disabled: true }, "Verificar");
        const hintBtn = h("button", { class: "btn", "aria-label": "Dica" }, icon("bulb"), "Dica");
        input.addEventListener("input", () => {
          verify2.disabled = !input.value.trim();
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && input.value.trim()) verify2.click();
        });
        hintBtn.onclick = () => {
          level = Math.min(2, level + 1);
          hintEl.textContent = hint(item.en.replace(/…$/, ""), level);
          if (level >= 2) hintBtn.disabled = true;
          input.focus();
        };
        verify2.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, input.value, ex.targets, { hintUsed: level > 0, model: item.en, au: item.au, pt: item.pt, example: item.ex[0], tip: item.tip });
        };
        const giveUp = h("button", { class: "btn ghost" }, "N\xE3o sei");
        giveUp.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, "", ex.targets, { model: item.en, au: item.au, pt: item.pt, example: item.ex[0], tip: item.tip });
        };
        actions(giveUp, hintBtn, verify2);
        setTimeout(() => input.focus(), 80);
      },
      cloze(ex) {
        const { item, sentence } = ex;
        const input = h("input", { type: "text", class: "en", autocomplete: "off", autocapitalize: "off", spellcheck: "false", autocorrect: "off", "aria-label": "Palavras que faltam", style: { width: `${Math.max(6, ex.target.length + 2)}ch` } });
        area.append(
          kind("Complete a frase"),
          h("p", { class: "pt", text: sentence.pt }),
          h("p", { class: "cloze" }, ex.before, input, ex.after),
          h("p", { class: "small muted" }, "Dica de sentido: ", h("b", { text: item.pt }))
        );
        const verify2 = h("button", { class: "btn primary lg", disabled: true }, "Verificar");
        input.addEventListener("input", () => {
          verify2.disabled = !input.value.trim();
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && input.value.trim()) verify2.click();
        });
        verify2.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, input.value, ex.targets, { model: sentence.en, au: sentence.au, pt: null, tip: item.tip });
        };
        const giveUp = h("button", { class: "btn ghost" }, "N\xE3o sei");
        giveUp.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, "", ex.targets, { model: sentence.en, au: sentence.au });
        };
        actions(giveUp, verify2);
        setTimeout(() => input.focus(), 80);
      },
      order(ex) {
        const { sentence } = ex;
        const built = [];
        const answer = h("div", { class: "tiles answer", "aria-label": "Sua frase" });
        const pool = h("div", { class: "tiles", "aria-label": "Pe\xE7as dispon\xEDveis" });
        let hintUsed = false;
        const verify2 = h("button", { class: "btn primary lg", disabled: true }, "Verificar");
        const draw = () => {
          clear(answer).append(...built.map((i, pos) => h("button", { class: "tile", onclick: () => {
            built.splice(pos, 1);
            draw();
          } }, ex.shuffled[i])));
          clear(pool).append(...ex.shuffled.map((p, i) => h("button", { class: `tile${built.includes(i) ? " used" : ""}`, "aria-hidden": built.includes(i) ? "true" : null, onclick: () => {
            if (!built.includes(i)) {
              built.push(i);
              draw();
            }
          } }, p)));
          verify2.disabled = built.length !== ex.shuffled.length;
        };
        area.append(kind("Monte a frase em ingl\xEAs"), h("p", { style: { fontSize: "1.1rem" }, text: sentence.pt }), answer, h("div", { style: { height: "10px" } }), pool);
        draw();
        const listen2 = h("button", { class: "btn", onclick: () => {
          hintUsed = true;
          play({ key: sentence.au, text: sentence.en });
        } }, icon("speaker"), "Ouvir");
        verify2.onclick = () => {
          const attempt = built.map((i) => ex.shuffled[i]).join(" ");
          const ok = attempt === ex.pieces.join(" ");
          const res = { cls: ok ? "correct" : "meaning", notes: ok ? [] : ["A ordem est\xE1 diferente do modelo."] };
          const r = finish(ex.entry, ok ? "good" : "bad", { cls: res.cls, answer: attempt, hintUsed });
          res.xp = r.xp;
          answer.querySelectorAll("button").forEach((b) => {
            b.disabled = true;
          });
          pool.remove();
          area.append(feedback(res, { model: sentence.en, au: sentence.au, k: ex.entry.k }));
          autoplay({ key: sentence.au, text: sentence.en });
          actions(continueBtn());
        };
        actions(listen2, verify2);
      },
      write(ex) {
        const { sentence } = ex;
        let level = 0;
        const input = h("textarea", { class: "field en", rows: 3, autocomplete: "off", autocapitalize: "sentences", spellcheck: "false", "aria-label": "Sua frase em ingl\xEAs", placeholder: "Escreva em ingl\xEAs" });
        const hints = h("div", { class: "small", style: { marginTop: "8px" } });
        area.append(kind("Escreva em ingl\xEAs"), h("p", { style: { fontSize: "1.15rem" }, text: sentence.pt }), input, hints);
        const verify2 = h("button", { class: "btn primary lg", disabled: true }, "Verificar");
        const hintBtn = h("button", { class: "btn" }, icon("bulb"), "Dica");
        input.addEventListener("input", () => {
          verify2.disabled = !input.value.trim();
        });
        hintBtn.onclick = () => {
          level++;
          if (level === 1) clear(hints).append(h("div", { class: "muted", text: "Express\xF5es que ajudam:" }), h("div", { class: "chips" }, ex.hints.map((x) => h("span", { class: "chip accent", text: `${x.en} = ${x.pt}` }))));
          if (level >= 2) {
            hints.append(h("div", { class: "en muted", style: { marginTop: "6px" }, text: hint(sentence.en, 1) }));
            hintBtn.disabled = true;
          }
        };
        verify2.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, input.value, ex.targets, { hintUsed: level > 0, model: sentence.en, au: sentence.au });
        };
        const giveUp = h("button", { class: "btn ghost" }, "N\xE3o sei");
        giveUp.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, "", ex.targets, { model: sentence.en, au: sentence.au });
        };
        actions(giveUp, hintBtn, verify2);
        setTimeout(() => input.focus(), 80);
      },
      seq(ex) {
        const picked = [];
        const list = h("div", {});
        const verify2 = h("button", { class: "btn primary lg", disabled: true }, "Verificar");
        const draw = () => {
          clear(list).append(...ex.shuffled.map((s) => {
            const pos = picked.indexOf(s.id);
            return h(
              "button",
              { class: `seq-item${pos > -1 ? " picked" : ""}`, onclick: () => {
                if (pos > -1) picked.splice(pos, 1);
                else picked.push(s.id);
                draw();
              } },
              h("span", { class: "num", text: pos > -1 ? String(pos + 1) : "" }),
              h("span", { text: s.en })
            );
          }));
          verify2.disabled = picked.length !== ex.shuffled.length;
        };
        const routine = content.routines.find((r) => r.id === ex.block.routine);
        area.append(kind("Ordene as frases do bloco"), h("p", { class: "small muted", text: `${routine.id} \xB7 ${routine.pt} \xB7 bloco ${ex.block.index}. Toque na ordem em que acontecem.` }), list);
        draw();
        verify2.onclick = () => {
          const ok = picked.every((id, i) => id === ex.sentences[i].id);
          const res = { cls: ok ? "correct" : "meaning", notes: ok ? [] : ["Veja a ordem cronol\xF3gica abaixo."] };
          const r = finish(ex.entry, ok ? "good" : "bad", { cls: res.cls });
          res.xp = r.xp;
          list.querySelectorAll("button").forEach((b) => {
            b.disabled = true;
          });
          area.append(feedback(res, { model: ok ? null : ex.sentences.map((s, i) => `${i + 1}. ${s.en}`).join("\n"), k: ex.entry.k }));
          actions(continueBtn());
        };
        actions(verify2);
      },
      tell(ex) {
        renderProduce(ex, "block");
      },
      retell(ex) {
        renderProduce(ex, "routine");
      },
      conv(ex) {
        renderProduce(ex, "q");
      },
      vb3(ex) {
        const v = ex.verb;
        const input = textInput("Forma da 3\xAA pessoa");
        area.append(
          kind("Simple Present \u2014 3\xAA pessoa"),
          h("p", { class: "small muted", text: "Exerc\xEDcio de gram\xE1tica (n\xE3o \xE9 uma informa\xE7\xE3o sobre a sua rotina)." }),
          h("div", { class: "big-en" }, `I ${v.base} \u2192 He `, h("span", { class: "hl", text: "___" })),
          h("p", { class: "pt", text: v.pt }),
          input
        );
        const verify2 = h("button", { class: "btn primary lg", disabled: true }, "Verificar");
        input.addEventListener("input", () => {
          verify2.disabled = !input.value.trim();
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && input.value.trim()) verify2.click();
        });
        verify2.onclick = () => {
          input.disabled = true;
          gradeText(ex.entry, input.value.replace(/^\s*he\s+/i, ""), ex.targets, {
            model: v.third,
            au: v.au3,
            example: v.ex[0],
            tip: "Na 3\xAA pessoa (he, she, it, my wife, the laptop) o verbo ganha -s/-es: goes, does, watches, studies, has."
          });
        };
        actions(verify2);
        setTimeout(() => input.focus(), 80);
      }
    };
    function textInput(label) {
      return h("input", { type: "text", class: "field en", autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", enterkeyhint: "done", "aria-label": label, placeholder: label });
    }
    function renderProduce(ex, unit) {
      const isQ = unit === "q";
      let model, modelClips, title, intro, items, targetId, keywords = [];
      if (unit === "block") {
        const r = ex.routine;
        title = "Conte este bloco do dia";
        intro = `${r.id} \xB7 ${r.pt} \xB7 bloco ${ex.block.index} (${ex.block.ctx.map((c) => content.contexts.find((x) => x.id === c).pt).join(", ")})`;
        model = ex.block.en;
        modelClips = ex.sentences.map((s) => ({ key: s.au, text: s.en }));
        items = ex.items;
        targetId = `block:${ex.block.id}`;
      } else if (unit === "routine") {
        title = "Conte a rotina completa";
        intro = `${ex.routine.id} \xB7 ${ex.routine.pt}. Use as pistas de cada bloco. Fale com suas palavras \u2014 n\xE3o precisa recitar.`;
        model = ex.routine.blocks.map((b) => content.blocks[b].en).join("\n\n");
        modelClips = ex.routine.blocks.flatMap((b) => content.blocks[b].sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })));
        items = ex.items;
        targetId = `routine:${ex.routine.id}`;
      } else {
        const q = ex.q;
        title = content.journey ? { comp: "Compreens\xE3o", transfer: "Transfer\xEAncia: responda sobre voc\xEA", review: "Revis\xE3o" }[q.kind] || "Responda" : "Pergunta da teacher";
        intro = content.journey && q.kind === "review" ? `Retoma ${q.reviews.join(", ")}` : q.routine ? `Sobre a ${q.routine}` : q.source === "new" ? "Pergunta inesperada (conte\xFAdo novo)" : "Pergunta geral";
        model = q.a;
        modelClips = q.a ? [{ key: q.aau, text: q.a }] : [];
        keywords = q.keywords;
        targetId = `q:${q.id}`;
        items = dedupeCues(ex.items, keywords);
      }
      area.append(kind(title), h("p", { class: "small muted", text: intro }));
      if (isQ) {
        area.append(h("div", { class: "row nowrap" }, h("div", { class: "big-en", style: { flex: 1 }, text: ex.q.q }), speakerButton({ key: ex.q.au, text: ex.q.q })));
        if (ex.q.hint) area.append(h("div", { class: "notice small", text: ex.q.hint }));
        autoplay({ key: ex.q.au, text: ex.q.q });
      } else if (unit === "block") {
        area.append(h("div", { class: "small muted", text: "Pistas (express\xF5es do bloco):" }), h("div", { class: "chips", style: { margin: "6px 0 10px" } }, items.map((it) => h("span", { class: "chip accent", text: it.en }))));
        const ptBox = h("p", { class: "para-pt hidden", text: ex.block.pt });
        area.append(h("button", { class: "btn small", onclick: (e) => {
          ptBox.classList.toggle("hidden");
          e.currentTarget.textContent = ptBox.classList.contains("hidden") ? "Ver o bloco em portugu\xEAs (apoio)" : "Ocultar portugu\xEAs";
        } }, "Ver o bloco em portugu\xEAs (apoio)"), ptBox);
      } else {
        area.append(h("div", { class: "card flat" }, ...ex.blocks.map((b) => h(
          "div",
          { style: { marginBottom: "8px" } },
          h("div", { class: "small", style: { fontWeight: 700 }, text: `${b.block.index}. ${b.block.ctx.map((c) => content.contexts.find((x) => x.id === c).pt).join(" \xB7 ")}` }),
          h("div", { class: "chips" }, b.items.map((it) => h("span", { class: "chip", text: it.en })))
        ))));
      }
      const input = h("textarea", { class: "field en", rows: unit === "routine" ? 6 : 4, spellcheck: "false", autocapitalize: "sentences", placeholder: "Escreva sua resposta (opcional se voc\xEA gravar)", "aria-label": "Sua resposta" });
      if (isQ && state.myAnswers[ex.q.id]) input.value = state.myAnswers[ex.q.id].text;
      area.append(h("label", { class: "lbl", style: { marginTop: "12px" }, text: "Fale e/ou escreva" }));
      freePanel = freeAnswerPanel(App2, { question: isQ ? ex.q.q : "", model, alternatives: isQ ? ex.q.altAnswers || [] : [], modelClips, unit: isQ ? "q" : unit });
      widget = recWidget(App2, { targetId, reference: modelClips, expectedWords: model ? model.split(/\s+/).length : 0, maxMs: unit === "routine" ? 3e5 : 12e4, ...freePanel.hooks });
      freePanel.attach(widget);
      area.append(widget.el, freePanel.el, h("div", { style: { height: "10px" } }), input);
      const reveal = h("button", { class: "btn primary lg" }, "Ver modelo e avaliar");
      reveal.onclick = () => {
        if (widget) widget.stop();
        reveal.disabled = true;
        const text = input.value.trim();
        const cov = text ? App2.checker.coverage(text, { keywords, items }) : null;
        const panel = h("div", { class: "feedback" });
        if (model) {
          panel.append(h(
            "div",
            { class: "row nowrap" },
            h("div", { class: "small muted", style: { flex: 1 }, text: "Modelo (uma forma poss\xEDvel \u2014 n\xE3o precisa ser igual)" }),
            h("button", { class: "icon-btn ghost", "aria-label": "Ouvir modelo", onclick: () => playSequence(modelClips) }, icon("speaker"))
          ));
          model.split("\n\n").forEach((p) => panel.append(h("p", { class: "model", style: { whiteSpace: "pre-line" }, text: p })));
        }
        if (isQ && ex.q.altAnswers) panel.append(h("div", { class: "small" }, h("b", { text: "Alternativa natural: " }), h("span", { class: "en", text: ex.q.altAnswers[0] })), ex.q.reviewNote ? h("div", { class: "small muted", text: ex.q.reviewNote }) : null);
        if (cov) {
          const list = h("ul", { class: "cover-list small" });
          cov.keywords.forEach((k) => list.append(h("li", {}, k.ok ? "\u2705" : "\u2B1C", " ", h("span", { class: "en", text: k.group.join(" / ") }))));
          cov.items.forEach((k) => list.append(h("li", {}, k.ok ? "\u2705" : "\u2B1C", " ", h("span", { class: "en", text: k.en }))));
          panel.append(h("div", { class: "small", style: { marginTop: "8px", fontWeight: 700 }, text: `Voc\xEA usou ${Math.round(cov.ratio * 100)}% das ideias/express\xF5es-chave:` }), list);
          cov.grammar.forEach((g) => panel.append(h("div", { class: "small", text: "\u26A0\uFE0F " + g.msg })));
        } else {
          panel.append(h("p", { class: "small muted", text: "Compare sua grava\xE7\xE3o com o modelo (bot\xE3o A/B acima) e avalie com honestidade." }));
        }
        if (isQ) {
          const mine = h("textarea", { class: "field en", rows: 3, placeholder: "Minha vers\xE3o (a sua resposta real, para a aula)" });
          mine.value = state.myAnswers[ex.q.id] ? state.myAnswers[ex.q.id].text : text;
          panel.append(
            h("label", { class: "lbl", style: { marginTop: "12px" }, text: "Minha vers\xE3o (fica salva s\xF3 no aparelho)" }),
            mine,
            h("button", { class: "btn small", style: { marginTop: "8px" }, onclick: () => {
              if (mine.value.trim()) {
                state.myAnswers[ex.q.id] = { text: mine.value.trim(), at: Date.now() };
                App2.save();
                toast("Minha vers\xE3o salva");
              }
            } }, "Salvar minha vers\xE3o")
          );
        }
        const suggestion = cov ? cov.ratio >= 0.7 ? "good" : cov.ratio >= 0.4 ? "ok" : "bad" : null;
        const gradeRow = h(
          "div",
          { class: "stack", style: { marginTop: "14px" } },
          h("div", { class: "small", style: { fontWeight: 700 }, text: "Como foi?" + (suggestion ? ` (sugest\xE3o pela cobertura: ${{ good: "Consegui", ok: "Parcial", bad: "Preciso rever" }[suggestion]})` : "") }),
          h("div", { class: "row" }, [["bad", "Preciso rever"], ["ok", "Parcial"], ["good", "Consegui"]].map(([o, label]) => h("button", { class: `btn${o === suggestion ? " primary" : ""}`, style: { flex: 1 }, onclick: () => {
            const r = finish(ex.entry, o, { cls: "self-" + o, answer: text });
            if (isQ && text && !state.myAnswers[ex.q.id]) {
              state.myAnswers[ex.q.id] = { text, at: Date.now() };
              App2.save();
            }
            if (r.xp) toast(`+${r.xp} XP`);
            idx++;
            next();
          } }, label)))
        );
        panel.append(gradeRow);
        area.append(panel);
        actions();
        panel.scrollIntoView({ behavior: state.settings.reduceMotion ? "auto" : "smooth", block: "start" });
      };
      actions(reveal);
    }
    function renderPairs(ex) {
      const keyOf = (it) => cardKey("item", it.id, "rec");
      const errors = /* @__PURE__ */ new Set();
      const done = /* @__PURE__ */ new Set();
      let sel = null;
      const left = h("div", { class: "stack" });
      const right = h("div", { class: "stack" });
      const draw = () => {
        clear(left).append(...ex.left.map((it) => h("button", { class: `option en${sel === it.id ? " sel" : ""}${done.has(it.id) ? " done" : ""}`, disabled: done.has(it.id), onclick: () => {
          sel = it.id;
          draw();
        } }, it.en)));
        clear(right).append(...ex.right.map((it) => h("button", { class: `option${done.has(it.id) ? " done" : ""}`, disabled: done.has(it.id), onclick: (e) => pick(it, e.currentTarget) }, it.pt)));
      };
      const pick = (it, btn) => {
        if (!sel) return;
        if (sel === it.id) {
          done.add(it.id);
          sel = null;
          draw();
          if (done.size === ex.items.length) complete();
        } else {
          errors.add(sel);
          btn.classList.add("wrong");
          setTimeout(() => btn.classList.remove("wrong"), 600);
        }
      };
      area.append(kind("Associe ingl\xEAs e portugu\xEAs"), h("p", { class: "small muted", text: "Toque numa express\xE3o e depois no significado." }), h("div", { class: "pairs" }, left, right));
      draw();
      function complete() {
        let gained = 0;
        for (const it of ex.items) gained += finish({ k: keyOf(it), unit: "item", id: it.id, skill: "rec" }, errors.has(it.id) ? "bad" : "good", { cls: errors.has(it.id) ? "meaning" : "correct" }).xp;
        area.append(feedback({ cls: errors.size ? "inconclusive" : "correct", xp: gained, notes: errors.size ? [`Revise: ${[...errors].map((id) => content.items[id].en).join(", ")}`] : [] }, {}));
        actions(continueBtn());
      }
      actions();
    }
    function summary() {
      const good = results.filter((r) => r.outcome !== "bad").length;
      const bad = results.filter((r) => r.outcome === "bad");
      const sr = recordSession(state, { count: results.length, bad: bad.length }, App2.today());
      xpGained += sr.xp;
      events.push(...sr.events);
      App2.flush();
      progress.firstChild.style.width = "100%";
      const wrongUnits = [...new Map(bad.map((r) => [r.entry.k, r.entry])).values()];
      const leveled = levelForXp(state.xp).level > startLevel;
      const face = characterImage(App2.character, leveled ? "levelup" : "celebrate", { size: 96 });
      area.append(
        h(
          "div",
          { class: "card center", style: { marginTop: "16px" } },
          face || h("div", { style: { fontSize: "2.2rem" }, text: bad.length ? "\u{1F4AA}" : "\u{1F31F}" }),
          h("h3", { text: "Sess\xE3o conclu\xEDda" }),
          h(
            "div",
            { class: "stat-grid", style: { marginTop: "12px" } },
            h("div", { class: "stat" }, h("b", { text: `+${xpGained}` }), h("span", { text: "XP" })),
            h("div", { class: "stat" }, h("b", { text: `${results.length ? Math.round(good / results.length * 100) : 0}%` }), h("span", { text: "acertos" })),
            h("div", { class: "stat" }, h("b", { text: String(results.length) }), h("span", { text: "exerc\xEDcios" }))
          )
        ),
        events.length ? h("div", { class: "card" }, h("h3", { text: "Conquistas" }), ...events.map((a) => h("div", { class: "row" }, h("span", { style: { fontSize: "1.4rem" }, text: a.icon }), h("div", {}, h("b", { text: a.title }), h("div", { class: "small muted", text: a.desc }))))) : null,
        wrongUnits.length ? h(
          "div",
          { class: "card" },
          h("h3", { text: "Vai voltar para revis\xE3o" }),
          ...wrongUnits.map((e) => h("div", { class: "small en", text: "\u2022 " + unitLabel(content, e) }))
        ) : null
      );
      if (events.length) toast(`Conquista: ${events[0].title}`);
      actions(
        focus.stage ? h("a", { class: "btn", "data-role": "back-module", href: `#/module/${focus.routine}` }, "Voltar ao m\xF3dulo") : h("a", { class: "btn", href: "#/" }, "In\xEDcio"),
        h("button", { class: "btn primary", onclick: () => App2.go(sessionHref(focus.mode ? {} : focus)) }, focus.stage ? "Praticar de novo" : "Nova sess\xE3o")
      );
    }
    next();
    return () => {
      stopAll();
      if (freePanel) freePanel.destroy();
      if (widget) widget.destroy();
      actionbar.remove();
      App2.flush();
    };
  }
  function dedupeCues(items, keywords) {
    const norm = (t) => t.toLowerCase().replace(/[…."]/g, "").replace(/^i /, "").trim();
    const kw = keywords.flat().map((k) => norm(String(k)));
    const kept = [];
    for (const it of [...items].sort((a, b) => b.en.length - a.en.length)) {
      const n = norm(it.en);
      if (kw.some((k) => k.includes(n) || n.includes(k) && k.length > 3)) continue;
      if (kept.some((x) => norm(x.en).includes(n))) continue;
      kept.push(it);
    }
    return kept;
  }
  function validEntry(content, q) {
    if (q.unit === "pairs") return true;
    if (q.unit === "item") return !!content.items[q.id];
    if (q.unit === "sent") return !!content.sentences[q.id];
    if (q.unit === "block") return !!content.blocks[q.id];
    if (q.unit === "routine") return content.routines.some((r) => r.id === q.id);
    if (q.unit === "q") return !!content.questions[q.id];
    if (q.unit === "verb") return content.verbs.some((v) => v.id === q.id);
    if (q.unit === "lq") return !!(content.listening && content.listening[q.id]);
    if (q.unit === "rq") return !!(content.reading && content.reading[q.id]);
    return false;
  }
  function unitLabel(content, e) {
    if (!validEntry(content, e)) return e.k || `${e.unit}:${e.id}`;
    if (e.unit === "item") return `${content.items[e.id].en} \u2014 ${content.items[e.id].pt}`;
    if (e.unit === "sent") return content.sentences[e.id].en;
    if (e.unit === "block") return `Bloco ${content.blocks[e.id].index} da ${content.blocks[e.id].routine}`;
    if (e.unit === "routine") return `Rotina ${e.id}`;
    if (e.unit === "q") return content.questions[e.id].q;
    if (e.unit === "verb") {
      const v = content.verbs.find((x) => x.id === e.id);
      return `${v.base} \u2192 ${v.third}`;
    }
    if (e.unit === "lq") return `Ouvir: ${content.listening[e.id].q}`;
    if (e.unit === "rq") return `Ler: ${content.reading[e.id].q}`;
    return e.k;
  }
  function difficultCards(state, content = null) {
    return Object.values(state.cards).filter((c) => c.lapses >= 2 || c.lastResult === "bad" && c.lapses >= 1).filter((c) => !content || cardInContent(content, c.k)).sort((a, b) => b.lapses - a.lapses || a.box - b.box);
  }

  // app/js/audio/asr.js
  var SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  var memo = null;
  var cachedStatus = () => memo;
  async function status2(lang = "en-GB") {
    memo = await queryStatus(lang);
    return memo;
  }
  async function queryStatus(lang) {
    if (!SR || !("processLocally" in SR.prototype)) return "unsupported";
    try {
      if (typeof SR.available === "function") return await SR.available({ langs: [lang], processLocally: true });
      if (typeof SR.availableOnDevice === "function") return await SR.availableOnDevice(lang);
    } catch (e) {
      return "unavailable";
    }
    return "unsupported";
  }
  function listen({ lang = "en-GB" } = {}) {
    const finals = [];
    let ended = false, failed = null, resolveEnd;
    const endP = new Promise((r) => {
      resolveEnd = r;
    });
    let rec = null;
    try {
      if (!SR) throw new Error("indispon\xEDvel");
      rec = new SR();
      if (!("processLocally" in rec)) throw new Error("sem modo local");
      rec.processLocally = true;
      rec.lang = lang;
      rec.continuous = true;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        for (let i = e.resultIndex || 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal === false) continue;
          finals[i] = { text: r[0].transcript, confidence: r[0].confidence };
        }
      };
      rec.onerror = (e) => {
        failed = e.error || "erro";
      };
      rec.onend = () => {
        ended = true;
        resolveEnd();
      };
      rec.start();
    } catch (e) {
      failed = e.message;
      ended = true;
      resolveEnd();
    }
    return {
      async stop() {
        if (!ended && rec) {
          try {
            rec.stop();
          } catch (e) {
          }
        }
        await Promise.race([endP, new Promise((r) => setTimeout(r, 4e3))]);
        const parts = finals.filter(Boolean);
        if (!parts.length) return failed ? null : { text: "", confidence: 0 };
        const conf = parts.map((x) => x.confidence).filter((c) => typeof c === "number" && c > 0);
        return { text: parts.map((x) => x.text).join(" "), confidence: conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0 };
      },
      failed: () => failed
    };
  }

  // app/js/ui/wordpractice.js
  var WORD_MAX_MS = 6e3;
  var RESULT = {
    match: { cls: "ok", mark: "check", label: "Reconhecida", text: (w) => `O app reconheceu \u201C${w}\u201D.` },
    mismatch: { cls: "bad", mark: "x", label: "N\xE3o reconhecida corretamente", text: () => "Ou\xE7a de novo e tente outra vez." },
    extra: { cls: "warn", mark: "refresh", label: "Inconclusivo", text: (w) => `O app ouviu outras palavras junto. Diga s\xF3 \u201C${w}\u201D.` },
    empty: { cls: "warn", mark: "refresh", label: "Nenhuma palavra captada", text: () => "Fale mais perto do microfone e tente de novo." }
  };
  var CHIP = { done: ["check", "reconhecida"], retry: ["x", "tente de novo"], todo: ["speaker", "n\xE3o praticada"] };
  function wordPractice({ list, session, engine, clips, getRate, focusWord, onFullSentence }) {
    let sel = null, rec = null, token = 0, error = "";
    const chips = h("div", { class: "practice-chips", role: "list" });
    const progress = h("div", { class: "tiny muted practice-hint", "data-role": "wp-progress" });
    const panel = h("div", { class: "practice-panel hidden", "data-role": "word-practice" });
    const footer = h("div", { "data-role": "wp-footer" });
    const el = h("div", { class: "practice", "data-role": "practice", "aria-label": "Vamos praticar" }, chips, progress, panel, footer);
    const drawChips = () => {
      clear(chips).append(...list.map((x) => {
        const st = session.get(x.key).status;
        const [mark, label] = CHIP[st] || CHIP.todo;
        const b = h("button", {
          class: `pchip${st === "done" ? " done" : ""}`,
          type: "button",
          role: "listitem",
          "aria-pressed": String(sel === x),
          "data-status": st,
          "aria-label": `Praticar \u201C${x.text}\u201D: ${practiceReason(x)} \xB7 ${label}`
        }, h("span", { class: "en", text: x.text }), icon(mark));
        b.onclick = () => select(x);
        return b;
      }));
      const n = session.doneCount(list);
      progress.textContent = n ? `Palavras reconhecidas: ${n} de ${list.length}.` : "Toque numa palavra para ouvir e praticar.";
    };
    const drawFooter = () => {
      const practised = list.some((x) => session.get(x.key).tries > 0);
      const all = session.allDone(list);
      clear(footer);
      if (all) footer.append(h("div", { class: "practice-ok", "data-role": "wp-all-done" }, icon("check"), "Todas as palavras foram reconhecidas."));
      footer.append(h("button", { class: `btn block${all ? " primary" : ""}`, type: "button", "data-role": "wp-full", style: { marginTop: "10px" }, onclick: () => full() }, icon("mic"), practised ? "Agora, pratique a frase completa" : "Gravar a frase completa"));
    };
    function select(x) {
      if (sel !== x) cancel();
      sel = x;
      error = "";
      focusWord(x.w);
      playWord(x.audioText);
      draw();
    }
    function draw() {
      drawChips();
      drawFooter();
      if (!sel) return;
      const x = sel, st = session.get(x.key);
      const sentenceClips = clips.filter((c) => new RegExp(`\\b${x.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(c.text));
      const status3 = h("div", { class: "wp-status", role: "status", "aria-live": "polite" });
      const actions = h("div", { class: "wp-actions" });
      if (st.status === "recording") {
        status3.append(h("span", { class: "wp-dot", "aria-hidden": "true" }), h("span", { text: `Gravando\u2026 diga s\xF3 \u201C${x.text}\u201D` }));
        actions.append(h("button", { class: "btn primary block", type: "button", "data-role": "wp-stop", onclick: () => rec && rec.stop() }, icon("stop"), "Parar"));
      } else if (st.status === "processing") {
        status3.append(h("span", { class: "spinner", "aria-hidden": "true" }), h("span", { text: "Reconhecendo a palavra\u2026" }));
      } else {
        if (error) status3.append(h("div", { class: "wp-result warn", role: "alert", "data-role": "wp-error" }, icon("refresh"), h("span", { text: error })));
        else if (st.last) status3.append(resultBox(x, st.last));
        else status3.append(h("span", { class: "small muted", text: "A pr\xF3xima grava\xE7\xE3o avalia s\xF3 esta palavra, n\xE3o a frase." }));
        const next = session.next(list, x.key);
        if (st.status === "done" && !error) {
          if (next) actions.append(h("button", { class: "btn primary block", type: "button", "data-role": "wp-next", onclick: () => select(next) }, icon("next"), "Praticar pr\xF3xima palavra"));
          actions.append(h("div", { class: "row wp-secondary" }, h("button", { class: "link-btn", type: "button", "data-role": "wp-record", onclick: () => practise(x) }, icon("mic"), "Repetir esta palavra")));
        } else {
          actions.append(h("button", { class: "btn primary block", type: "button", "data-role": "wp-record", onclick: () => practise(x) }, icon("mic"), st.tries || error ? "Tentar novamente" : "Praticar esta palavra"));
          if (next) actions.append(h("div", { class: "row wp-secondary" }, h("button", { class: "link-btn", type: "button", "data-role": "wp-skip", onclick: () => select(next) }, "Pr\xF3xima palavra", icon("next"))));
        }
      }
      clear(panel).append(
        h("div", { class: "pp-head" }, h("b", { class: "en wp-target", text: x.text }), h("span", { class: "small muted", "data-role": "wp-before", text: ` \xB7 na frase, ${practiceReason(x)}` })),
        h(
          "div",
          { class: "row" },
          h("button", { class: "btn small", type: "button", onclick: () => playWord(x.audioText) }, icon("speaker"), "Ouvir"),
          h("button", { class: "btn small", type: "button", onclick: () => playWord(x.audioText, { rate: 0.7 }) }, icon("slow"), "Devagar"),
          h("button", { class: "btn small", type: "button", onclick: () => playSequence(sentenceClips.length ? sentenceClips : clips, { rate: getRate() }) }, icon("play"), "Na frase")
        ),
        status3,
        actions
      );
      panel.dataset.status = st.status;
      panel.classList.remove("hidden");
    }
    function resultBox(x, m) {
      const r = RESULT[m.status];
      return h(
        "div",
        { class: `wp-result ${r.cls}`, "data-role": "wp-result", "data-result": m.status },
        h(
          "dl",
          { class: "wp-dl" },
          h("dt", { text: "Palavra esperada" }),
          h("dd", { class: "en", text: x.text }),
          h("dt", { text: "O app ouviu" }),
          h("dd", { class: "en", "data-role": "wp-heard", text: m.heard ? `\u201C${m.heard}\u201D` : "(nada)" }),
          h("dt", { text: "Resultado" }),
          h("dd", { class: "wp-verdict" }, icon(r.mark), h("b", { text: r.label }))
        ),
        h("p", { class: "small", text: r.text(x.text) }),
        m.status === "match" ? h("p", { class: "tiny muted", text: "Reconhecida = o reconhecimento entendeu a palavra. N\xE3o \xE9 uma medi\xE7\xE3o completa da pron\xFAncia." }) : null
      );
    }
    async function practise(x) {
      if (rec || sel !== x) return;
      const mine = ++token;
      stopAll();
      error = "";
      session.start(x.key);
      draw();
      let session_;
      try {
        session_ = await start({ maxMs: WORD_MAX_MS });
      } catch (e) {
        if (mine !== token) return;
        session.abort(x.key);
        error = e.userMessage || "N\xE3o foi poss\xEDvel gravar.";
        return draw();
      }
      if (mine !== token) {
        session_.cancel();
        return;
      }
      const listener = engine === "webspeech" ? listen({ lang: "en-GB" }) : null;
      rec = session_;
      draw();
      const res = await session_.stopped;
      rec = null;
      if (mine !== token) {
        if (listener) listener.stop();
        return;
      }
      session.processing(x.key);
      draw();
      let match;
      try {
        const a = await analyseBlob(res.blob, { expectedWords: 1 });
        if (!a) throw Object.assign(new Error("decode"), { code: "decode" });
        if (a.silent || a.speechSec < 0.15) {
          if (listener) listener.stop();
          match = { status: "empty", heard: "" };
        } else if (listener) {
          const out = await listener.stop();
          if (!out) throw Object.assign(new Error("webspeech"), { code: "webspeech" });
          match = matchIsolatedWord(x.text, out.text);
        } else {
          match = matchIsolatedWord(x.text, (await transcribe(res.blob, { word: true })).text);
        }
      } catch (e) {
        if (mine !== token || e.code === "cancelled") return;
        session.abort(x.key);
        error = e.code === "decode" ? "N\xE3o consegui ler esta grava\xE7\xE3o. Tente novamente." : "O reconhecimento falhou nesta tentativa. Tente novamente.";
        return draw();
      }
      if (mine !== token) return;
      session.result(x.key, match);
      draw();
    }
    function full() {
      cancel();
      onFullSentence();
    }
    function cancel() {
      token++;
      if (rec) {
        const r = rec;
        rec = null;
        r.cancel();
      }
      if (sel) {
        const st = session.get(sel.key).status;
        if (st === "recording" || st === "processing") session.abort(sel.key);
      }
    }
    drawChips();
    drawFooter();
    el.prepend(h("span", { class: "sr-only", text: practiceSummary(list) }));
    return { el, cancel };
  }

  // app/js/ui/lab.js
  var labTab = "sentences";
  var labRoutine = "R01";
  function renderLab(App2, { params }) {
    if (params.q || params.block || params.routine && params.full || params.sentence || params.drill) return renderTarget(App2, params);
    if (params.routine) labRoutine = params.routine;
    const { content, state } = App2;
    if (!content.routines.some((r) => r.id === labRoutine)) labRoutine = content.routines[0].id;
    const fromModule = !!params.module && content.routines.some((r) => r.id === params.routine);
    const view = App2.layout("Speaking Lab", fromModule ? { back: `#/module/${labRoutine}` } : {});
    if (fromModule) {
      const r = content.routines.find((x) => x.id === labRoutine);
      const recs = [...r.blocks.flatMap((b) => content.blocks[b].sentences).map((s) => `sent:${s}`), ...r.blocks.map((b) => `block:${b}`), `routine:${r.id}`, ...r.questions.map((q) => `q:${q}`)].filter((t) => state.recordingsMeta[t]).length;
      view.append(h(
        "section",
        { class: "card module-head", "data-role": "lab-module" },
        h("div", { class: "small muted", text: `Falar na pr\xE1tica \xB7 ${r.id}` }),
        h("b", { text: r.title && r.title !== r.pt ? r.title : r.pt }),
        h("p", { class: "small", style: { margin: "6px 0 0" }, text: `Pron\xFAncia: leia em voz alta as frases do m\xF3dulo. Conversa: responda \xE0s perguntas com suas palavras. ${recs} grava\xE7\xE3o(\xF5es) neste m\xF3dulo (3 concluem a etapa).` })
      ));
      if (labTab === "drills") labTab = "sentences";
    }
    view.append(h("p", { class: "small muted", text: "Pronunciation Lab (Frases, Blocos): ou\xE7a, grave e compare. Conversation Lab (Perguntas, Drills): responda livremente e receba retorno sobre adequa\xE7\xE3o, gram\xE1tica, naturalidade e confiabilidade da transcri\xE7\xE3o." }));
    const setupSlot = h("div", {});
    view.append(setupSlot);
    if (state.settings.asrPrompt !== "later") {
      status().then((st) => {
        if (st !== "not-installed" || !setupSlot.isConnected) return;
        setupSlot.append(asrSetupCard(App2, { onInstalled: () => {
          setTimeout(() => clear(setupSlot), 2500);
        }, onLater: () => clear(setupSlot) }));
      });
    }
    const seg = h("div", { class: "seg", role: "group", "aria-label": "Tipo de pr\xE1tica" });
    const filter = h("div", { class: "chips scroll", style: { margin: "12px 0" } });
    const body = h("div", {});
    const tabs = [["sentences", "Frases"], ["blocks", "Blocos"], ["questions", "Perguntas"], ...fromModule || !content.drills.length ? [] : [["drills", "Drills"]]];
    const rec = (id) => state.recordingsMeta[id] ? h("span", { class: "chip ok", text: "gravado" }) : null;
    const draw = () => {
      clear(seg).append(...tabs.map(([id, label]) => h("button", { "aria-pressed": String(labTab === id), onclick: () => {
        labTab = id;
        draw();
      } }, label)));
      clear(filter);
      if ((labTab === "sentences" || labTab === "blocks") && !fromModule) {
        filter.append(...content.routines.map((r2) => h("button", { class: "chip", "aria-pressed": String(labRoutine === r2.id), onclick: () => {
          labRoutine = r2.id;
          draw();
        } }, r2.id)));
      }
      clear(body);
      const r = content.routines.find((x) => x.id === labRoutine);
      if (labTab === "sentences") {
        body.append(h("ul", { class: "list card" }, r.blocks.flatMap((b) => content.blocks[b].sentences).map((sid) => {
          const s = content.sentences[sid];
          return h("li", {}, h("a", { class: "list-btn", href: `#/lab?sentence=${sid}` }, h("div", { class: "grow" }, h("div", { class: "title en", text: s.en })), rec(`sent:${sid}`), icon("mic")));
        })));
      }
      if (labTab === "blocks") {
        body.append(...r.blocks.map((bid) => {
          const b = content.blocks[bid];
          return h(
            "a",
            { class: "card link", href: `#/lab?block=${bid}` },
            h("div", { class: "row" }, h("span", { class: "chip", text: `Bloco ${b.index}` }), ...b.ctx.map((c) => h("span", { class: "chip", text: content.contexts.find((x) => x.id === c).pt })), h("span", { class: "spacer" }), rec(`block:${bid}`)),
            h("p", { class: "en small", style: { marginTop: "8px" }, text: b.en.slice(0, 140) + (b.en.length > 140 ? "\u2026" : "") })
          );
        }), h("a", { class: "btn block", href: `#/lab?routine=${r.id}&full=1` }, icon("mic"), `Gravar a ${r.id} completa`));
      }
      if (labTab === "questions" && fromModule) {
        const qs = r.questions.map((id) => content.questions[id]).filter(Boolean);
        body.append(qs.length ? h("ul", { class: "list card" }, qs.map((q) => h("li", {}, h("a", { class: "list-btn", href: `#/lab?q=${q.id}` }, h("div", { class: "grow" }, h("div", { class: "title en", text: q.q })), rec(`q:${q.id}`), icon("mic"))))) : h("p", { class: "small muted", text: "Este m\xF3dulo n\xE3o tem perguntas; pratique as frases e os blocos." }));
      } else if (labTab === "questions") {
        const r1 = content.routines[0].id;
        const groups = [["Rotina 1 (priorit\xE1ria)", (q) => q.routine === r1], ["Gerais (Word)", (q) => q.source === "word" && !q.routine], ["Outras rotinas", (q) => q.routine && q.routine !== r1], ["Inesperadas (novas)", (q) => q.source === "new"]];
        for (const [title, pred] of groups) {
          if (!Object.values(content.questions).some(pred)) continue;
          body.append(h("h2", { text: title }), h("ul", { class: "list card" }, Object.values(content.questions).filter(pred).map((q) => h("li", {}, h("a", { class: "list-btn", href: `#/lab?q=${q.id}` }, h("div", { class: "grow" }, h("div", { class: "title en", text: q.q }), q.routine ? h("div", { class: "small muted", text: q.routine }) : null), rec(`q:${q.id}`), icon("mic"))))));
        }
      }
      if (labTab === "drills") {
        body.append(...content.drills.map((d, i) => h(
          "a",
          { class: "card link", href: `#/lab?drill=${i}` },
          h("div", { class: "row" }, h("h3", { style: { margin: 0, flex: 1 }, text: d.title }), rec(`drill:${i}`)),
          h("p", { class: "small muted", text: d.prompts.slice(0, 2).join(" \xB7 ") + "\u2026" })
        )));
      }
    };
    draw();
    view.append(seg, filter, body);
  }
  function renderTarget(App2, params) {
    const { content, state } = App2;
    const exists = params.sentence ? content.sentences[params.sentence] : params.block ? content.blocks[params.block] : params.routine ? content.routines.some((r) => r.id === params.routine) : params.q ? content.questions[params.q] : params.drill !== void 0 ? content.drills[Number(params.drill)] : null;
    if (!exists) return App2.go("#/lab");
    let title, en = [], pt = "", clips = [], targetId, extra = null, back = "#/lab";
    if (params.sentence) {
      const s = content.sentences[params.sentence];
      title = `Frase \xB7 ${s.routine}`;
      en = [s.en];
      pt = s.pt;
      clips = [{ key: s.au, text: s.en }];
      targetId = `sent:${s.id}`;
    } else if (params.block) {
      const b = content.blocks[params.block];
      title = `${b.routine} \xB7 bloco ${b.index}`;
      en = [b.en];
      pt = b.pt;
      clips = b.sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en }));
      targetId = `block:${b.id}`;
    } else if (params.routine) {
      const r = content.routines.find((x) => x.id === params.routine);
      title = `${r.id} completa`;
      en = r.blocks.map((b) => content.blocks[b].en);
      pt = r.blocks.map((b) => content.blocks[b].pt).join("\n\n");
      clips = r.blocks.flatMap((b) => content.blocks[b].sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })));
      targetId = `routine:${r.id}`;
      extra = h("div", { class: "notice small" }, "Dica: grave primeiro olhando o texto; depois tente s\xF3 com as pistas, como no exerc\xEDcio \u201CConte a rotina\u201D. N\xE3o precisa recitar.");
    } else if (params.q) {
      const q = content.questions[params.q];
      title = "Pergunta da teacher";
      targetId = `q:${q.id}`;
      en = q.a ? [q.a] : [];
      clips = q.a ? [{ key: q.aau, text: q.a }] : [];
      extra = h(
        "div",
        {},
        h("div", { class: "row nowrap" }, h("div", { class: "big-en", style: { flex: 1 }, text: q.q }), speakerButton({ key: q.au, text: q.q })),
        q.hint ? h("div", { class: "notice small", text: q.hint }) : null,
        h("p", { class: "small muted", text: "Responda em voz alta antes de olhar o modelo." }),
        state.myAnswers[q.id] ? h("div", { class: "card flat" }, h("div", { class: "small muted", text: "Minha vers\xE3o" }), h("div", { class: "en", text: state.myAnswers[q.id].text })) : null,
        h("a", { class: "btn small", href: sessionHref({ category: "qa" }), style: { marginTop: "8px" } }, "Praticar perguntas com corre\xE7\xE3o")
      );
    } else if (params.drill !== void 0) {
      const d = content.drills[Number(params.drill)];
      title = d.title;
      targetId = `drill:${params.drill}`;
      extra = h(
        "div",
        {},
        h("ul", { class: "small", style: { paddingLeft: "18px" } }, d.prompts.map((p, i) => h("li", { style: { marginBottom: "6px" } }, h("span", { class: "en", text: p }), " ", d.au && d.au[i] ? speakerButton({ key: d.au[i], text: p }, { cls: "icon-btn ghost" }) : null))),
        Number(params.drill) === 0 ? h("div", { class: "notice small", text: "Fale de 30 a 45 segundos sem ler. O tempo aparece durante a grava\xE7\xE3o." }) : null
      );
    }
    const view = App2.layout(title, { back });
    loadLexicon();
    if (extra) view.append(extra);
    const durations = globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.files || {};
    const referenceSec = clips.reduce((n, c) => n + (durations[c.key] || 0), 0);
    const expectedWords = en.join(" ").split(/\s+/).filter(Boolean).length;
    const iw = en.length ? inlineWords(en) : null;
    const reading = !!iw && !params.q;
    const asrEligible = expectedWords <= 60;
    let rate = state.settings.rate || 1;
    const legendEl = legend();
    legendEl.classList.add("hidden");
    if (en.length) {
      let showPt = false;
      const ptBox = h("div", {});
      const ptBtn = h("button", { class: "btn small ghost", type: "button", "aria-pressed": "false" }, "Ver PT");
      ptBtn.onclick = () => {
        showPt = !showPt;
        ptBtn.textContent = showPt ? "Ocultar PT" : "Ver PT";
        ptBtn.setAttribute("aria-pressed", String(showPt));
        clear(ptBox).append(showPt && pt ? h("p", { class: "para-pt", style: { whiteSpace: "pre-line" }, text: pt }) : null);
      };
      const rateSeg = h("div", { class: "seg rate-seg", role: "group", "aria-label": "Velocidade da refer\xEAncia" });
      const drawRates = () => clear(rateSeg).append(...[0.75, 1, 1.25].map((r) => h("button", { type: "button", "aria-pressed": String(r === rate), onclick: () => {
        rate = r;
        drawRates();
      } }, `${String(r).replace(".", ",")}\xD7`)));
      drawRates();
      view.append(h(
        "section",
        { class: "card phrase-card" },
        h("div", { class: "phrase-top" }, h("span", { class: "eyebrow", text: params.q ? "Resposta-modelo" : "Leia em voz alta" }), ptBtn),
        iw.el,
        legendEl,
        iw.detail,
        ptBox,
        h(
          "div",
          { class: "listen-row" },
          h("button", { class: "btn primary", type: "button", onclick: () => playSequence(clips, { rate }) }, icon("speaker"), "Ouvir refer\xEAncia"),
          h("button", { class: "icon-btn", type: "button", "aria-label": "Parar", onclick: () => stopAll() }, icon("stop")),
          rateSeg
        )
      ));
    }
    const fbBox = h("section", { class: "fb hidden", "aria-live": "polite", "data-role": "feedback" });
    let engine = null, engineInfo = null, listener = null, alive = true, savedPending = null, lastBlob = null, lastAnalysis = null;
    const gate = latestGate();
    const wordSession = wordPracticeSession();
    let wp = null;
    const resetFeedback = () => {
      gate.invalidate();
      if (busy()) release2();
      if (iw) {
        iw.reset();
        iw.focus(null);
      }
      legendEl.classList.add("hidden");
      if (wp) {
        wp.cancel();
        wp = null;
      }
      clear(fbBox);
      fbBox.classList.add("hidden");
      fbBox.dataset.state = "idle";
    };
    const showFb = (stateName, ...children) => {
      clear(fbBox).append(...children);
      fbBox.dataset.state = stateName;
      fbBox.classList.toggle("hidden", !children.filter(Boolean).length);
    };
    async function analyse(blob, analysis, { listenerRes, saved = null } = {}) {
      if (!reading) return;
      const ticket = gate.next();
      lastBlob = blob;
      lastAnalysis = analysis;
      const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.4;
      let res = null, why = "";
      if (saved) res = saved;
      else if (!asrEligible) why = "Texto longo: a an\xE1lise por palavra vale para trechos de at\xE9 60 palavras. Grave um bloco por vez.";
      else if (insufficient) why = "";
      else if (listenerRes !== void 0) {
        res = listenerRes;
        if (!res) why = "O reconhecimento n\xE3o conseguiu rodar junto com a grava\xE7\xE3o neste aparelho.";
      } else if (engine === "model") {
        showFb("analysing", h("div", { class: "fb-analysing", role: "status" }, h("span", { class: "spinner", "aria-hidden": "true" }), "Analisando sua grava\xE7\xE3o\u2026"));
        try {
          res = await transcribe(blob);
        } catch (e) {
          if (!alive || !gate.isCurrent(ticket) || e.code === "cancelled") return;
          return showError(e, blob, analysis);
        }
      } else if (!engine) {
        drawUnavailable();
      }
      if (!alive || !gate.isCurrent(ticket)) return;
      const integrity = saved ? saved.integrity || null : res && res.segments ? transcriptIntegrity({ text: res.text, segments: res.segments, secs: res.secs }) : null;
      const tailUnreliable = !!integrity && integrity.issues.some((x) => x.code === "possibly-truncated" || x.code === "lost-part");
      let evaluation = evaluateWords(iw.text, res, { insufficient, tailUnreliable });
      if (tailUnreliable) evaluation = { ...evaluation, note: [evaluation.note, ...integrity.issues.map((x) => x.msg)].filter(Boolean).join(" ") };
      if (!res && !insufficient && why) evaluation = { ...evaluation, note: why };
      const score = scoreAttempt({ evaluation, analysis, expectedWords });
      const attempt = analyseAttempt(evaluation, iw.text);
      iw.apply(evaluation);
      legendEl.classList.remove("hidden");
      if (!engine && !res) return;
      if (attempt.conclusive) {
        if (!saved) {
          updatePracticeWords(state, targetId, attempt);
          App2.save();
        }
        showResult(score, attempt, res, evaluation.note);
      } else {
        showFb(
          "inconclusive",
          scoreLine(score, inconclusiveHint(evaluation, insufficient)),
          h("div", { class: "row fb-actions" }, h("button", { class: "btn small", type: "button", onclick: () => rerecord() }, icon("mic"), "Gravar novamente")),
          scoreDetails(score, { heard: res ? res.text : null, engine, note: evaluation.note })
        );
      }
      if (res && !saved && engine === "model") w.updateMeta(blob, { result: { text: res.text, at: Date.now(), integrity } });
    }
    const inconclusiveHint = (evaluation, insufficient) => insufficient ? "Quase n\xE3o captei voz nesta grava\xE7\xE3o. Grave de novo, num lugar silencioso e mais perto do microfone." : `${evaluation.note || "N\xE3o deu para avaliar esta tentativa."} Grave novamente.`;
    function showResult(score, attempt, res, note = "") {
      const list = attempt.list;
      if (wp) wp.cancel();
      wp = list.length ? wordPractice({ list, session: wordSession, engine, clips, getRate: () => rate, focusWord: (i) => iw.focus(i), onFullSentence: () => rerecord() }) : null;
      showFb(
        "result",
        scoreLine(score, practiceSummary(list)),
        wp ? wp.el : h("div", { class: "practice-ok", "data-role": "practice-ok" }, icon("check"), "Nenhuma palavra pendente nesta tentativa."),
        list.length ? null : h("div", { class: "row fb-actions" }, h("button", { class: "btn small", type: "button", onclick: () => rerecord() }, icon("mic"), "Gravar novamente")),
        scoreDetails(score, { heard: res ? res.text : null, engine, note })
      );
    }
    function showError(e, blob, analysis) {
      const msg = { load: "O reconhecimento n\xE3o carregou neste momento.", timeout: "A an\xE1lise demorou demais e foi interrompida.", decode: "N\xE3o consegui ler esta grava\xE7\xE3o.", "too-long": `Grava\xE7\xE3o longa demais para a an\xE1lise (m\xE1x. ${MAX_SECONDS} s). Grave um trecho menor.` }[e.code] || "A an\xE1lise falhou nesta grava\xE7\xE3o.";
      const actions = h("div", { class: "row fb-actions" });
      const help = h("div", { class: "small" });
      if (e.code === "decode" || e.code === "too-long") actions.append(h("button", { class: "btn small", type: "button", onclick: () => rerecord() }, icon("mic"), "Gravar novamente"));
      else actions.append(h("button", { class: "btn small primary", type: "button", onclick: () => analyse(blob, analysis) }, icon("refresh"), "Tentar de novo"));
      if (e.code === "load") {
        actions.append(h("button", { class: "btn small", type: "button", onclick: async (ev) => {
          ev.currentTarget.disabled = true;
          const v = await verify();
          if (v.ok) {
            help.textContent = "Os arquivos do reconhecimento est\xE3o \xEDntegros. Tente de novo; se continuar falhando, feche e reabra o app.";
            return;
          }
          clear(help).append(
            h("p", { text: `Arquivos do reconhecimento incompletos (${[...v.missing, ...v.damaged].length}). \xC9 preciso baix\xE1-los de novo (precisa de internet).` }),
            h("button", { class: "btn small primary", type: "button", onclick: async () => {
              const ok = await runInstall(help);
              if (ok) analyse(blob, analysis);
            } }, icon("download"), "Baixar de novo")
          );
        } }, icon("target"), "Verificar instala\xE7\xE3o"));
      }
      showFb(
        "error",
        h("div", { class: "fb-error", role: "alert" }, h("b", { text: msg }), " ", h("span", { class: "muted", text: "Nenhuma nota foi gerada. Sua grava\xE7\xE3o continua salva." })),
        actions,
        help,
        h("details", { class: "more" }, h("summary", { text: "Detalhes t\xE9cnicos" }), h("p", { class: "tiny muted", text: `${e.code || "erro"}: ${e.message}` }))
      );
    }
    function rerecord() {
      w.el.scrollIntoView({ block: "center", behavior: "smooth" });
      w.start();
    }
    function drawUnavailable() {
      if (!reading || !asrEligible || !engineInfo) return;
      const installed = () => {
        refresh().then(() => {
          if (lastBlob) analyse(lastBlob, lastAnalysis);
        });
      };
      if (engineInfo.local === "not-installed" && state.settings.asrPrompt !== "later") {
        return showFb("setup", asrSetupCard(App2, { onInstalled: installed, onLater: () => drawUnavailable() }));
      }
      const parts = [];
      if (engineInfo.local === "not-installed") parts.push(asrOffNotice(App2, { onInstalled: installed }));
      else if (engineInfo.why) parts.push(h("p", { class: "small muted", text: `An\xE1lise autom\xE1tica indispon\xEDvel aqui: ${engineInfo.why}.` }));
      if (!engineInfo.webspeech && !isAndroid()) {
        parts.push(h("button", { class: "link-btn", type: "button", onclick: (e) => {
          e.currentTarget.disabled = true;
          refresh(true);
        } }, "Ver se est\xE1 dispon\xEDvel (reconhecimento do Chrome)"));
      }
      showFb("unavailable", ...parts);
    }
    const free = !reading && (params.q || params.drill !== void 0) ? freeAnswerPanel(App2, params.q ? { question: content.questions[params.q].q, model: content.questions[params.q].a || "", alternatives: content.questions[params.q].altAnswers || [], modelClips: clips, unit: "q" } : { question: "", model: content.drills[Number(params.drill)].prompts.join(" "), modelClips: [], unit: "drill" }) : null;
    const w = recWidget(App2, {
      targetId,
      reference: clips,
      expectedWords,
      referenceSec,
      maxMs: params.routine ? 3e5 : 12e4,
      onStart: () => {
        resetFeedback();
        if (!reading) return;
        listener = asrEligible && engine === "webspeech" ? listen({ lang: "en-GB" }) : null;
      },
      onRecorded: async (blob, analysis) => {
        if (!reading) return;
        if (listener) {
          const l = listener;
          listener = null;
          analyse(blob, analysis, { listenerRes: await l.stop() });
        } else analyse(blob, analysis);
      },
      onLoaded: (rec) => {
        savedPending = rec;
        if (engineInfo) processSaved();
      },
      onDeleted: () => {
        resetFeedback();
        lastBlob = null;
        if (!engine) drawUnavailable();
      },
      ...free ? free.hooks : {}
      // resposta livre: os ganchos do painel substituem os da leitura
    });
    if (free) free.attach(w);
    view.append(w.el, free ? free.el : fbBox);
    function processSaved() {
      const rec = savedPending;
      savedPending = null;
      if (!rec || !reading || !alive) return;
      const meta = rec.meta || {};
      if (meta.result && engine) analyse(rec.blob, meta.analysis, { saved: { text: meta.result.text, confidence: 0, integrity: meta.result.integrity || null } });
      else if (engine === "model" && asrEligible && rec.blob) analyse(rec.blob, meta.analysis);
      else {
        lastBlob = rec.blob;
        lastAnalysis = meta.analysis;
      }
    }
    const refresh = async (ask = false) => {
      engineInfo = await detectEngine({ ask, known: state.settings.asrKnown });
      if (!alive) return;
      engine = engineInfo.engine;
      if (engineInfo.webspeech && engineInfo.webspeech !== state.settings.asrKnown) {
        state.settings.asrKnown = engineInfo.webspeech;
        App2.save();
      }
      if (!engine) drawUnavailable();
      else if (fbBox.dataset.state === "setup" || fbBox.dataset.state === "unavailable") resetFeedback();
      drawManual();
      if (savedPending) processSaved();
    };
    if (reading) refresh();
    const manualBox = h("div", {});
    view.append(manualBox);
    function drawManual() {
      clear(manualBox);
      if (!en.length || !asrEligible || engine) return;
      const words2 = [...new Set(en.join(" ").split(/\s+/).map((w2) => w2.replace(/[^A-Za-z'’-]/g, "")).filter((w2) => w2.length > 2))];
      state.difficultWords = state.difficultWords || {};
      const picks = h("div", {}, ...words2.map((wd) => {
        const key = wd.toLowerCase();
        const b = h("button", { class: "word-pick", type: "button", "aria-pressed": String(!!state.difficultWords[key]) }, wd);
        b.onclick = () => {
          if (state.difficultWords[key]) delete state.difficultWords[key];
          else state.difficultWords[key] = { at: Date.now(), from: targetId };
          b.setAttribute("aria-pressed", String(!!state.difficultWords[key]));
          App2.save();
        };
        return b;
      }));
      manualBox.append(h(
        "details",
        { class: "more card flat manual" },
        h("summary", { text: "Marcar palavras dif\xEDceis (sem an\xE1lise autom\xE1tica)" }),
        h("p", { class: "small muted", text: "Compare A/B e marque as palavras que soaram diferentes. Elas aparecem em \u201CRevisar\u201D." }),
        picks
      ));
    }
    if (!reading && en.length) {
      if (free) status().then((st) => {
        if (st !== "installed" && alive) drawManual();
      });
      else drawManual();
    }
    const tips = relevantTips(content, en.join(" "));
    if (tips.length) {
      view.append(h(
        "details",
        { class: "more card flat tips" },
        h("summary", { text: `Dicas de pron\xFAncia (${tips.length})` }),
        h("ul", { class: "list" }, tips.map((it) => h(
          "li",
          {},
          h(
            "div",
            { class: "list-btn" },
            h("div", { class: "grow" }, h("div", { class: "title en", text: `${it.en}  ${it.ipa || ""}` }), h("div", { class: "small muted", text: it.tip || "" })),
            speakerButton({ key: it.au, text: it.en }, { cls: "icon-btn ghost" })
          )
        )))
      ));
    }
    return () => {
      alive = false;
      gate.invalidate();
      if (wp) wp.cancel();
      if (listener) {
        listener.stop();
        listener = null;
      }
      if (free) free.destroy();
      release2();
      w.destroy();
    };
  }
  var isAndroid = () => /Android/i.test(navigator.userAgent || "");
  function relevantTips(content, text) {
    const tokens = new Set(wordTokens(text));
    return Object.values(content.items).filter((it) => (it.ipa || it.tip) && wordTokens(it.en).every((t) => tokens.has(t))).slice(0, 6);
  }
  async function detectEngine({ ask = false, known = null } = {}) {
    const local = await status();
    const webspeech = cachedStatus() || (ask || known === "available" ? await status2("en-GB") : null);
    return { engine: local === "installed" ? "model" : webspeech === "available" ? "webspeech" : null, local, webspeech, why: unsupportedReason() };
  }

  // app/js/ui/review.js
  function renderReview(App2) {
    const { state, content } = App2;
    const view = App2.layout("Revisar", { back: "#/stats" });
    const today = App2.today();
    const due = Object.values(state.cards).filter((c) => c.due <= today);
    const hard = difficultCards(state, content);
    view.append(h(
      "div",
      { class: "stat-grid" },
      h("div", { class: "stat" }, h("b", { text: String(due.length) }), h("span", { text: "para hoje" })),
      h("div", { class: "stat" }, h("b", { text: String(hard.length) }), h("span", { text: "dificuldades" })),
      h("div", { class: "stat" }, h("b", { text: String(Object.keys(state.difficultWords || {}).length) }), h("span", { text: "palavras marcadas" }))
    ));
    view.append(h(
      "div",
      { class: "row", style: { marginTop: "14px" } },
      h("a", { class: `btn primary${due.length ? "" : " disabled"}`, href: due.length ? sessionHref({ mode: "review" }) : null, "aria-disabled": due.length ? null : "true", style: { flex: 1 } }, icon("refresh"), "Revisar pend\xEAncias"),
      h("a", { class: "btn", href: hard.length ? sessionHref({ mode: "difficult" }) : null, "aria-disabled": hard.length ? null : "true", style: { flex: 1 } }, icon("target"), "Treinar dificuldades")
    ));
    const parse = (k) => {
      const [unit, id, skill] = k.split(":");
      return { unit, id, skill, k };
    };
    const SK = { rec: "reconhecer", rcl: "lembrar", bld: "completar", ord: "ordenar", wrt: "escrever", seq: "sequ\xEAncia", tell: "contar bloco", retell: "contar rotina", conv: "conversa", vb3: "3\xAA pessoa" };
    view.append(h("h2", { text: "Dificuldades" }));
    if (!hard.length) view.append(h("p", { class: "small muted", text: "Nenhuma por enquanto. Itens com erros repetidos aparecem aqui." }));
    else view.append(h("ul", { class: "list card" }, hard.slice(0, 40).map((c) => {
      const e = parse(c.k);
      return h("li", {}, h("div", { class: "list-btn" }, h(
        "div",
        { class: "grow" },
        h("div", { class: "title en", text: unitLabel(content, e) }),
        h("div", { class: "small muted", text: `${SK[e.skill] || e.skill} \xB7 ${c.lapses} erro(s) \xB7 caixa ${c.box}` })
      )));
    })));
    const claimed = state.pending.filter((p) => p.status === "claimed");
    view.append(h("h2", { text: "Respostas aceitas por voc\xEA" }), h("p", { class: "small muted", text: "Quando o corretor n\xE3o tinha certeza e voc\xEA marcou \u201CEu estava certo\u201D. Elas passam a ser aceitas; remova se mudar de ideia." }));
    if (!claimed.length) view.append(h("p", { class: "small muted", text: "Nenhuma." }));
    else {
      const ul = h("ul", { class: "list card" });
      const draw = () => {
        clear(ul).append(...state.pending.filter((p) => p.status === "claimed").map((p) => h("li", {}, h(
          "div",
          { class: "list-btn" },
          h("div", { class: "grow" }, h("div", { class: "title en", text: p.answer }), h("div", { class: "small muted en", text: `modelo: ${p.model}` })),
          h("button", { class: "btn small danger", onclick: async () => {
            if (!await confirmSheet("Remover variante?", `\u201C${p.answer}\u201D deixar\xE1 de ser aceita.`, { ok: "Remover", danger: true })) return;
            p.status = "removed";
            state.userVariants[p.key] = (state.userVariants[p.key] || []).filter((v) => v !== p.answer);
            App2.rebuildChecker();
            App2.save();
            draw();
          } }, "Remover")
        ))));
      };
      draw();
      view.append(ul);
    }
    const mine = Object.entries(state.myAnswers);
    view.append(h("h2", { text: "Minhas vers\xF5es" }));
    if (!mine.length) view.append(h("p", { class: "small muted", text: "Suas respostas pessoais \xE0s perguntas da teacher aparecem aqui." }));
    else view.append(h("ul", { class: "list card" }, mine.map(([qid, a]) => {
      const q = content.questions[qid];
      return h("li", {}, h("a", { class: "list-btn", href: `#/lab?q=${qid}` }, h(
        "div",
        { class: "grow" },
        h("div", { class: "small muted en", text: q ? q.q : qid }),
        h("div", { class: "title en", text: a.text }),
        h("div", { class: "tiny muted", text: fmtDate(a.at) })
      )));
    })));
    const words2 = Object.keys(state.difficultWords || {});
    view.append(h("h2", { text: "Palavras marcadas no Speaking Lab" }));
    if (!words2.length) view.append(h("p", { class: "small muted", text: "Nenhuma palavra marcada." }));
    else view.append(h("div", { class: "chips" }, words2.map((w) => h("a", { class: "chip warn", href: labHref(state.difficultWords[w].from), text: w }))));
  }
  function labHref(target = "") {
    const [kind, id] = target.split(":");
    const param = { sent: "sentence", block: "block", q: "q", drill: "drill" }[kind];
    if (kind === "routine") return `#/lab?routine=${id}&full=1`;
    return param ? `#/lab?${param}=${id}` : "#/lab";
  }

  // app/js/ui/stats.js
  function renderStats(App2) {
    const { state, content } = App2;
    const view = App2.layout("Progresso", { actions: [h("a", { class: "icon-btn ghost", href: "#/settings", "aria-label": "Ajustes" }, icon("gear"))] });
    const today = App2.today();
    const lvl = levelForXp(state.xp);
    const st = streak(state, today);
    const cards = Object.values(state.cards);
    view.append(h(
      "div",
      { class: "card" },
      h(
        "div",
        { class: "row nowrap" },
        h("div", { style: { flex: 1 } }, h("div", { class: "small muted", text: "N\xEDvel" }), h("div", { style: { fontSize: "1.6rem", fontWeight: 800 }, text: String(lvl.level) })),
        h("div", { class: "center" }, h("div", { style: { fontSize: "1.4rem", fontWeight: 800 } }, h("span", { class: "flame", text: "\u{1F525}" }), ` ${st.days}`), h("div", { class: "tiny muted", text: "dias seguidos" }))
      ),
      h("div", { class: "small muted", style: { margin: "8px 0 4px" }, text: `${state.xp} XP \xB7 faltam ${lvl.to - state.xp} para o n\xEDvel ${lvl.level + 1}` }),
      bar((state.xp - lvl.from) / (lvl.to - lvl.from)),
      h("p", { class: "tiny muted", style: { marginTop: "8px" }, text: "Um dia sem estudo por semana n\xE3o quebra a sequ\xEAncia." })
    ));
    view.append(h("a", { class: "card link flat", href: "#/review" }, h(
      "div",
      { class: "row nowrap" },
      h("span", { class: "icon-btn accent" }, icon("refresh")),
      h("div", { style: { flex: 1 } }, h("b", { text: "Revisar erros e dificuldades" }), h("div", { class: "small muted", text: `${cards.filter((c) => c.due <= today).length} pendente(s) hoje` })),
      icon("next")
    )));
    const heat = h("div", { class: "heat", "aria-label": "Atividade das \xFAltimas 5 semanas" });
    for (let n = today - 34; n <= today; n++) {
      const d = state.days[n];
      const lvlCls = !d || !d.ex ? "" : d.ex >= (state.settings.dailyGoal || 12) ? "l3" : d.ex >= 5 ? "l2" : "l1";
      heat.append(h("i", { class: lvlCls, title: d ? `${d.ex} exerc\xEDcios` : "sem estudo" }));
    }
    view.append(h("h2", { text: "\xDAltimas 5 semanas" }), h("div", { class: "card flat" }, heat));
    let ex = 0, good = 0, rec = 0;
    for (let n = today - 13; n <= today; n++) {
      const d = state.days[n];
      if (d) {
        ex += d.ex;
        good += d.good;
        rec += d.rec;
      }
    }
    view.append(h(
      "div",
      { class: "stat-grid", style: { marginTop: "12px" } },
      h("div", { class: "stat" }, h("b", { text: String(ex) }), h("span", { text: "exerc\xEDcios (14d)" })),
      h("div", { class: "stat" }, h("b", { text: ex ? `${Math.round(good / ex * 100)}%` : "\u2014" }), h("span", { text: "acertos (14d)" })),
      h("div", { class: "stat" }, h("b", { text: String(rec) }), h("span", { text: "grava\xE7\xF5es (14d)" }))
    ));
    const SK = [["rec", "Reconhecer"], ["rcl", "Lembrar (recuperar)"], ["bld", "Completar na frase"], ["ord", "Montar frases"], ["wrt", "Escrever frases"], ["tell", "Contar blocos"], ["retell", "Contar rotinas"], ["conv", "Perguntas da teacher"]];
    view.append(h("h2", { text: "Por habilidade" }), h("div", { class: "card flat stack" }, SK.map(([s, label]) => {
      const cs = cards.filter((c) => c.k.endsWith(":" + s));
      const m = cs.filter((c) => c.box >= MASTERED_BOX).length;
      return h("div", {}, h("div", { class: "row small" }, h("span", { style: { flex: 1 }, text: label }), h("span", { class: "muted", text: `${m} dominados \xB7 ${cs.length} em estudo` })), bar(cs.length ? m / cs.length : 0, "ok"));
    })));
    view.append(h("h2", { text: "Por rotina" }), h("div", { class: "card flat stack" }, content.routines.map((r) => {
      const m = mastery(state.cards, r.items.map((i) => cardKey("item", i, "rec")));
      const told = r.blocks.filter((b) => state.cards[cardKey("block", b, "tell")]).length;
      return h(
        "a",
        { href: `#/routine/${r.id}`, style: { textDecoration: "none", color: "inherit", display: "block" } },
        h("div", { class: "row small" }, h("span", { style: { flex: 1 }, text: `${r.id} \xB7 ${r.pt}` }), h("span", { class: "muted", text: `${told}/${r.blocks.length} blocos` })),
        bar(m.ratio)
      );
    })));
    view.append(h("h2", { text: "Por momento do dia" }), h("div", { class: "card flat stack" }, content.contexts.map((c) => {
      const ids = Object.values(content.items).filter((it) => it.ctx.includes(c.id)).map((it) => cardKey("item", it.id, "rec"));
      return h("div", {}, h("div", { class: "row small" }, h("span", { style: { flex: 1 }, text: `${c.icon} ${c.pt}` })), bar(mastery(state.cards, ids).ratio));
    })));
    view.append(h("h2", { text: "Conquistas" }), h("div", { class: "ach" }, ACHIEVEMENTS.map((a) => h("div", { class: state.achievements[a.id] ? "" : "locked", title: a.desc }, h("span", { class: "ico", text: a.icon }), a.title))));
  }

  // app/js/store/storage.js
  async function cachesUsage() {
    const out = { app: 0, asr: 0, other: 0, files: 0 };
    if (!("caches" in globalThis)) return null;
    try {
      for (const name of await caches.keys()) {
        const c = await caches.open(name);
        let bytes = 0;
        for (const req of await c.keys()) {
          const r = await c.match(req);
          if (!r) continue;
          const h2 = r.headers.get("X-DRG-Size");
          bytes += h2 ? Number(h2) : (await r.blob()).size;
          out.files++;
        }
        if (name.startsWith("drg-")) out.app += bytes;
        else if (name.startsWith("asr-local-")) out.asr += bytes;
        else out.other += bytes;
      }
      return out;
    } catch (e) {
      return null;
    }
  }
  async function storageReport() {
    const [rec, kv, cache] = await Promise.all([recordingsUsage(), kvUsage(), cachesUsage()]);
    let estimate = null, persisted = null;
    try {
      estimate = await navigator.storage.estimate();
    } catch (e) {
    }
    try {
      persisted = await navigator.storage.persisted();
    } catch (e) {
    }
    const study = kv.reduce((n, x) => n + x.bytes, 0);
    const measured = rec.bytes + study + (cache ? cache.app + cache.asr + cache.other : 0);
    return {
      recordings: rec,
      study,
      studyKeys: kv,
      cache,
      persisted,
      usage: estimate ? estimate.usage : null,
      quota: estimate ? estimate.quota : null,
      // diferença entre a estimativa do navegador e o que foi somado: não é atribuída a nenhuma categoria
      unattributed: estimate && cache ? Math.max(0, estimate.usage - measured) : null
    };
  }

  // app/js/ui/settings.js
  var totalCards = (st) => {
    syncActive(st);
    return Object.values(st.profiles).reduce((n, p) => n + Object.keys(p.cards || {}).length, 0);
  };
  function renderSettings(App2) {
    const { state } = App2;
    const s = state.settings;
    const view = App2.layout("Ajustes", { back: "#/" });
    const set2 = (k, v) => {
      s[k] = v;
      App2.applySettings();
      App2.save();
    };
    const seg = (label, key, options) => {
      const box2 = h("div", { class: "seg", role: "group", "aria-label": label });
      const draw = () => clear(box2).append(...options.map(([v, t]) => h("button", { "aria-pressed": String(s[key] === v), onclick: () => {
        set2(key, v);
        draw();
      } }, t)));
      draw();
      return h("div", { style: { marginBottom: "14px" } }, h("label", { class: "lbl", text: label }), box2);
    };
    const toggle = (label, key, sub) => {
      const input = h("input", { type: "checkbox", checked: !!s[key], style: { width: "24px", height: "24px" } });
      input.addEventListener("change", () => set2(key, input.checked));
      return h("label", { class: "row nowrap", style: { minHeight: "48px", marginBottom: "8px" } }, h("div", { style: { flex: 1 } }, h("div", { style: { fontWeight: 600 }, text: label }), sub ? h("div", { class: "small muted", text: sub }) : null), input);
    };
    const voiceSel = h("select", { class: "field", "aria-label": "Voz do sistema" });
    const diag = h("div", { class: "kv small", style: { marginTop: "10px" } });
    const chars = h("div", { class: "list card", role: "radiogroup", "aria-label": "Personagem", "data-role": "characters" });
    const drawChars = () => clear(chars).append(...registry().characters.map((c) => {
      const on = App2.character.id === c.id;
      const vs = visualStatus(c);
      const pack = c.content === "base" ? App2.baseContent : c.content;
      const sub = c.profile && c.profile.occupation ? `${c.profile.occupation.pt} \xB7 ` : "";
      const btn = h(
        "button",
        { class: "list-btn char-opt", type: "button", role: "radio", "aria-checked": String(on), "data-character": c.id },
        characterBadge(c, "idle"),
        h(
          "div",
          { class: "grow" },
          h("div", { class: "title" }, c.name, c.status === "preview" || c.status === "planned" ? h("span", { class: "chip", style: { marginLeft: "8px" }, text: "em prepara\xE7\xE3o" }) : null),
          h("div", { class: "small muted", text: pack ? `${sub}${pack.routines.length} rotina(s), ${Object.keys(pack.sentences).length} frases` : "Conte\xFAdo em prepara\xE7\xE3o \xB7 progresso pr\xF3prio" }),
          h("div", { class: "tiny muted", text: `Imagens: ${vs.ready.length} de 6 prontas${c.status === "preview" ? " \xB7 \xE1udio de refer\xEAncia: voz do aparelho" : ""}` })
        ),
        on ? icon("check") : null
      );
      btn.onclick = () => {
        if (on) return;
        App2.chooseCharacter(c.id);
        toast(`Praticando com ${c.name}. O progresso com cada personagem continua salvo.`);
        drawChars();
      };
      return h("li", {}, btn);
    }));
    drawChars();
    view.append(
      h("h2", { text: "Personagem" }),
      chars,
      h("p", { class: "tiny muted", text: "Cada personagem tem rotinas e frases pr\xF3prias. Palavras comuns \xE0s duas rotinas s\xE3o revisadas juntas; XP, n\xEDvel e sequ\xEAncia de dias s\xE3o os mesmos." })
    );
    view.append(h("h2", { text: "\xC1udio" }), h(
      "div",
      { class: "card" },
      seg("Fonte da voz de refer\xEAncia", "audioSource", [["embedded", "Embutida (brit\xE2nica)"], ["system", "Voz do sistema"]]),
      h("p", { class: "small muted", text: "A voz embutida foi gerada offline em ingl\xEAs brit\xE2nico e funciona sem internet. A voz do sistema depende das vozes instaladas no Android." }),
      seg("Velocidade", "rate", [[0.75, "0,75\xD7"], [0.9, "0,9\xD7"], [1, "1\xD7"], [1.15, "1,15\xD7"]]),
      toggle("Tocar \xE1udio automaticamente", "autoplay", "Nos exerc\xEDcios e ao mostrar a resposta."),
      h("label", { class: "lbl", text: "Voz do sistema (quando usada)" }),
      voiceSel,
      h(
        "div",
        { class: "row", style: { marginTop: "10px" } },
        h("button", { class: "btn small", onclick: () => play({ key: null, text: "I wake up at five, take a shower and brush my teeth." }).then((r) => toast(r.ok ? "Voz do sistema OK" : "Voz do sistema indispon\xEDvel")) }, icon("speaker"), "Testar voz do sistema"),
        h("button", { class: "btn small", onclick: () => play({ key: App2.baseContent.sentences["R01-B1-S1"].au, text: "" }).then((r) => toast(r.ok ? "\xC1udio embutido OK" : "\xC1udio embutido indispon\xEDvel")) }, icon("speaker"), "Testar \xE1udio embutido")
      ),
      diag
    ));
    diagnose().then((d) => {
      clear(voiceSel).append(h("option", { value: "", text: "Autom\xE1tica (en-GB local preferida)" }), ...d.englishVoices.map((v) => h("option", { value: v.uri, selected: v.uri === s.voiceURI, text: `${v.name} (${v.lang}${v.local ? "" : ", online"})` })));
      voiceSel.onchange = () => set2("voiceURI", voiceSel.value);
      Promise.all([cachedStatus() || "n\xE3o verificado", status()]).then(([a, local]) => {
        permissionState().then((mic) => {
          clear(diag).append(
            h("span", { text: "\xC1udios embutidos" }),
            h("span", { text: `${d.embedded} (${d.embeddedVoice || "\u2014"})` }),
            h("span", { text: "Vozes inglesas do sistema" }),
            h("span", { text: `${d.englishVoices.length} (${d.englishVoices.filter((v) => /GB/i.test(v.lang)).length} en-GB)` }),
            h("span", { text: "Grava\xE7\xE3o" }),
            h("span", { text: supported() ? `dispon\xEDvel \xB7 microfone: ${{ granted: "permitido", denied: "bloqueado", prompt: "perguntar\xE1" }[mic] || mic}` : "indispon\xEDvel" }),
            h("span", { text: "Reconhecimento local do Chrome" }),
            h("span", { text: { available: "dispon\xEDvel", downloadable: "pode ser baixado", downloading: "baixando", unavailable: "indispon\xEDvel neste navegador", unsupported: "n\xE3o suportado neste navegador" }[a] || a }),
            h("span", { text: "Reconhecimento local (modelo do app)" }),
            h(
              "span",
              {},
              { installed: `instalado (${sizeLabel()}) `, "not-installed": "n\xE3o baixado (opcional, no Speaking Lab)", unsupported: `indispon\xEDvel: ${unsupportedReason()}` }[local],
              local === "installed" ? h("button", { class: "btn small", onclick: async (e) => {
                e.currentTarget.disabled = true;
                await remove();
                toast("Modelo de reconhecimento removido.");
                App2.go(location.hash);
              } }, "Remover") : null
            ),
            h("span", { text: "Reconhecimento online" }),
            h("span", { text: "nunca usado (enviaria sua voz para fora do aparelho)" })
          );
        });
      });
    });
    view.append(h("h2", { text: "Leitura e acessibilidade" }), h(
      "div",
      { class: "card" },
      seg("Tamanho do texto", "fontScale", [[1, "Normal"], [1.15, "Grande"], [1.3, "Maior"]]),
      seg("Tema", "theme", [["auto", "Autom\xE1tico"], ["light", "Claro"], ["dark", "Escuro"]]),
      toggle("Reduzir anima\xE7\xF5es", "reduceMotion"),
      seg("Meta di\xE1ria (exerc\xEDcios)", "dailyGoal", [[8, "8"], [12, "12"], [20, "20"]])
    ));
    const usage = h("div", { class: "kv small" });
    view.append(h("h2", { text: "Seus dados" }), h(
      "div",
      { class: "card stack" },
      h("p", { class: "small", text: "Todo o progresso fica somente neste aparelho. Nada \xE9 enviado para a internet. Se voc\xEA limpar os dados do navegador ou trocar de aparelho, s\xF3 o backup recupera o progresso." }),
      usage,
      h(
        "div",
        { class: "row" },
        h("button", { class: "btn", onclick: exportNow }, icon("download"), "Exportar backup"),
        h(
          "label",
          { class: "btn", role: "button", tabindex: "0" },
          icon("upload"),
          "Importar backup",
          h("input", { type: "file", accept: "application/json,.json", class: "hidden", onchange: (e) => importFile(e.target.files[0]) })
        )
      ),
      h("button", { class: "btn small", onclick: async () => {
        const ok = await requestPersistence();
        toast(ok ? "Armazenamento persistente ativo" : "O navegador n\xE3o concedeu armazenamento persistente (instalar o app na tela inicial ajuda).");
        drawUsage();
      } }, "Proteger dados contra limpeza autom\xE1tica"),
      h("p", { class: "tiny muted", text: "Os \xE1udios das suas grava\xE7\xF5es s\xE3o apagados automaticamente 7 dias depois de gravados; transcri\xE7\xF5es, avalia\xE7\xF5es e progresso continuam. A prote\xE7\xE3o contra limpeza \xE9 um pedido ao navegador e n\xE3o impede que o sistema ou voc\xEA apaguem os dados do site." }),
      h("button", { class: "btn danger", onclick: wipe }, "Apagar todo o progresso\u2026")
    ));
    async function drawUsage() {
      clear(usage).append(h("span", { class: "muted", text: "Medindo\u2026" }), h("span", {}));
      if (App2.runRetention) await App2.runRetention();
      const r = await storageReport();
      if (!usage.isConnected) return;
      const kb = (b) => `${Math.round(b / 1024).toLocaleString("pt-BR")} KB`;
      const mb2 = (b) => `${(b / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} MB`;
      const row = (label, value, role) => [h("span", { text: label }), h("span", { text: value, "data-role": role || null })];
      clear(usage).append(
        ...row("Armazenamento", backend === "indexeddb" ? "IndexedDB" : backend === "localstorage" ? "localStorage (limitado)" : "\u2014"),
        ...row("Protegido contra limpeza", r.persisted === null ? "\u2014" : r.persisted ? "sim (pedido aceito pelo navegador)" : "n\xE3o", "persisted"),
        ...row("Cart\xF5es de estudo", String(Object.keys(state.cards).length)),
        ...row("Grava\xE7\xF5es salvas", `${r.recordings.count} (${kb(r.recordings.bytes)})`, "rec-usage"),
        ...r.recordings.textOnly ? row("Resultados sem \xE1udio", `${r.recordings.textOnly} (\xE1udio j\xE1 apagado; transcri\xE7\xE3o e an\xE1lise mantidas)`, "rec-textonly") : [],
        ...row("Progresso e respostas", kb(r.study), "study-usage"),
        ...r.cache ? row("App offline (textos e \xE1udios de refer\xEAncia)", mb2(r.cache.app), "app-cache") : [],
        ...r.cache ? row("Reconhecimento de fala local", r.cache.asr ? mb2(r.cache.asr) : "n\xE3o instalado", "asr-cache") : [],
        ...row("Uso total (estimativa do navegador)", r.usage === null ? "\u2014" : `\u2248 ${mb2(r.usage)}`, "usage-total"),
        ...r.unattributed ? row("N\xE3o atribu\xEDdo (dados internos do navegador)", `\u2248 ${mb2(r.unattributed)}`, "usage-other") : [],
        ...row("\xDAltimo backup", state.lastBackupAt ? fmtDate(state.lastBackupAt) : "nunca")
      );
    }
    drawUsage();
    function exportNow() {
      state.lastBackupAt = Date.now();
      App2.save();
      const blob = exportBackup(state);
      const a = h("a", { href: URL.createObjectURL(blob), download: `daily-routine-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json` });
      document.body.append(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1e3);
      toast("Backup gerado. Guarde o arquivo em local seguro (grava\xE7\xF5es de voz n\xE3o entram no backup).", 5e3);
      drawUsage();
    }
    async function importFile(file) {
      if (!file) return;
      try {
        const incoming = await parseBackup(file, App2.content.version, { ownerOf: makeOwnerOf(App2.profileViews()) });
        const n = totalCards(incoming);
        const ok = await confirmSheet("Restaurar backup?", `O progresso atual de todas as personas e jornadas (${totalCards(state)} cart\xF5es) ser\xE1 substitu\xEDdo pelo do backup (${n} cart\xF5es). Cada persona e jornada fica com o pr\xF3prio progresso. Uma c\xF3pia do atual fica guardada no aparelho.`, { ok: "Restaurar" });
        if (!ok) return;
        await keepPrevious(state);
        App2.adoptState(incoming);
        await saveState(incoming);
        toast("Backup restaurado.");
        App2.go("#/");
      } catch (e) {
        toast(`N\xE3o foi poss\xEDvel importar: ${e.message}`, 6e3);
      }
    }
    async function wipe() {
      const ok = await confirmSheet("Apagar todo o progresso?", "XP, revis\xF5es, conquistas, respostas e grava\xE7\xF5es ser\xE3o apagados deste aparelho. Recomendo exportar um backup antes. Esta a\xE7\xE3o n\xE3o pode ser desfeita.", { ok: "Exportar backup e apagar", danger: true });
      if (!ok) return;
      exportNow();
      const sure = await confirmSheet("Confirmar exclus\xE3o", "O backup foi baixado. Apagar agora?", { ok: "Apagar", danger: true });
      if (!sure) return;
      await wipeState();
      const fresh = freshState(App2.content.version);
      fresh.settings = { ...fresh.settings, ...s };
      App2.adoptState(fresh);
      await saveState(App2.state);
      toast("Progresso apagado.");
      App2.go("#/");
    }
    view.append(h("h2", { text: "Aplicativo" }), h("div", { class: "stack", "data-role": "app-section" }, installCard(App2), updateStatus(App2)));
    view.append(h("h2", { text: "Sobre" }), h(
      "div",
      { class: "card small" },
      h(
        "div",
        { class: "kv" },
        h("span", { text: "App" }),
        h("span", { text: "1.0.0 (MVP)" }),
        h("span", { text: "Conte\xFAdo" }),
        h("span", { text: `${App2.content.version} \xB7 ${App2.content.builtAt}` }),
        h("span", { text: "Fonte" }),
        h("span", { text: "Daily Routines \u2014 Conversation Practice (Word)" }),
        h("span", { text: "Modo" }),
        h("span", { text: `${location.protocol.replace(":", "")}${navigator.serviceWorker && navigator.serviceWorker.controller ? " \xB7 offline ativo" : ""}` }),
        h("span", { text: "Internet" }),
        h("span", { text: navigator.onLine ? "conectado (n\xE3o \xE9 necess\xE1rio)" : "offline" })
      ),
      h("p", { class: "tiny muted", style: { marginTop: "10px" }, text: "Voz embutida: modelo Kokoro (Apache-2.0), gerada offline. Conte\xFAdo novo \xE9 marcado como tal; o restante vem do Word." })
    ));
  }
  function renderChecklist(App2) {
    const { state, content } = App2;
    const view = App2.layout("Checklist antes da aula", { back: "#/" });
    const links = ["#/routine/R01", "#/lab?q=R01.Q3", "#/lab?q=G.Q08", "#/category/time", "#/category/verb", "#/lab?drill=2"];
    view.append(h("p", { class: "small muted", text: "Os seis pontos do material. Marque quando se sentir seguro; a data fica registrada." }));
    const list = h("ul", { class: "list card" });
    const draw = () => clear(list).append(...content.checklist.map((item, i) => {
      const done = state.checklist[i];
      const cb = h("input", { type: "checkbox", checked: !!done, "aria-label": item, style: { width: "24px", height: "24px", flex: "none" } });
      cb.addEventListener("change", () => {
        if (cb.checked) state.checklist[i] = Date.now();
        else delete state.checklist[i];
        App2.save();
        draw();
      });
      return h("li", {}, h(
        "div",
        { class: "list-btn" },
        cb,
        h("div", { class: "grow" }, h("div", { class: "title", text: item }), done ? h("div", { class: "tiny muted", text: `marcado em ${fmtDate(done)}` }) : null),
        h("a", { class: "btn small", href: links[i] || "#/explore" }, "Praticar")
      ));
    }));
    draw();
    view.append(list, h("div", { class: "notice", style: { marginTop: "14px" }, text: content.meta.mainGoal }));
  }

  // app/js/main.js
  var APP_VERSION = "1.0.0";
  var App = {
    baseContent: globalThis.DRG_CONTENT,
    // conteúdo do Lucas (data/content.js), nunca alterado
    content: globalThis.DRG_CONTENT,
    // visão do personagem ativo (engine/characters.js); o motor só enxerga esta
    character: null,
    journey: null,
    // jornada independente ativa (Conversation Practice) ou null = rotinas do personagem
    state: null,
    checker: null,
    storageProblem: null,
    isNew: false,
    today: () => dayNumber(),
    save() {
      saveSoon(App.state);
    },
    flush() {
      return flush(App.state);
    },
    go(hash) {
      if (location.hash === hash) route();
      else location.hash = hash;
    },
    rebuildChecker() {
      App.checker = createChecker(App.content.language, { userVariants: App.state.userVariants });
    },
    /** Troca a persona ativa: visão de conteúdo e perfil de progresso dela; o progresso das outras fica intacto. */
    setCharacter(id) {
      App.character = characterById(id);
      App.content = App.journey ? journeyView(App.baseContent, App.journey.id) : contentFor(App.baseContent, App.character.id);
      if (App.state && App.state.settings.character !== App.character.id) App.state.settings.character = App.character.id;
      if (App.state) activate(App.state, profileIdFor(App.character.id, App.journey && App.journey.id), App.today());
    },
    /** Escolha feita pela pessoa (primeira escolha, Início ou Ajustes): troca, marca como escolhido e grava já. */
    chooseCharacter(id) {
      App.setCharacter(id);
      App.state.settings.characterChosen = true;
      App.rebuildChecker();
      return App.flush().catch(() => {
      });
    },
    /** Entra (id) ou sai (null) de uma jornada independente: troca só a visão de conteúdo; personagem e progresso intactos. */
    setJourney(id) {
      App.journey = id ? journeyById(id) : null;
      if (App.state) App.state.settings.journey = App.journey ? App.journey.id : null;
      App.content = App.journey ? journeyView(App.baseContent, App.journey.id) : contentFor(App.baseContent, App.character.id);
      if (App.state) activate(App.state, profileIdFor(App.character.id, App.journey && App.journey.id), App.today());
      App.rebuildChecker();
      return App.flush().catch(() => {
      });
    },
    /** Passa a usar um estado inteiro (carregado, importado ou recém-criado): persona, jornada e perfil salvos nele. */
    adoptState(state) {
      App.state = state;
      App.journey = journeyById(state.settings.journey);
      App.setCharacter(state.settings.character);
      App.rebuildChecker();
      App.applySettings();
    },
    /** Visões de conteúdo de cada perfil (Lucas primeiro: dono dos itens genéricos compartilhados). */
    profileViews() {
      const chars = registry().characters.map((c) => ({ profile: c.id, content: c.content === "base" ? App.baseContent : c.content ? contentFor(App.baseContent, c.id) : null }));
      const js = journeyRegistry().map((j) => ({ profile: journeyProfile(j.id), content: journeyView(App.baseContent, j.id) }));
      return [...chars.sort((a, b) => a.profile === "lucas" ? -1 : b.profile === "lucas" ? 1 : 0), ...js];
    },
    applySettings() {
      const s = App.state.settings;
      const root2 = document.documentElement;
      if (s.theme === "auto") root2.removeAttribute("data-theme");
      else root2.setAttribute("data-theme", s.theme);
      root2.style.setProperty("--fs", String(s.fontScale || 1));
      document.body.classList.toggle("reduce-motion", !!s.reduceMotion);
      configure({ audioSource: s.audioSource, voiceURI: s.voiceURI, rate: s.rate });
    }
  };
  App.asr = { local: localasr_exports };
  globalThis.DRG_APP = App;
  var TABS = [
    { hash: "#/", label: "In\xEDcio", icon: "home", match: (r) => r === "" },
    { hash: "#/modules", label: "Estudar", icon: "book", match: (r) => ["modules", "module", "words", "explore", "routine", "context", "category", "checklist"].includes(r) },
    { hash: "#/lab", label: "Falar", icon: "mic", match: (r) => r === "lab" },
    { hash: "#/stats", label: "Progresso", icon: "chart", match: (r) => ["stats", "review"].includes(r) }
  ];
  var root = document.getElementById("app");
  var cleanup = null;
  function layout(title, { back = null, actions = [], nav = true } = {}) {
    clear(root);
    const top = h(
      "header",
      { class: "topbar" },
      back ? h("button", { class: "icon-btn ghost", "aria-label": "Voltar", onclick: () => back === true ? history.back() : App.go(back) }, icon("back")) : null,
      h("h1", { text: title }),
      ...actions
    );
    const view = h("main", { class: `view${nav ? "" : " no-nav"}`, id: "view" });
    root.append(top, view);
    if (App.pwa) view.append(live(() => updateBanner(App)));
    if (nav) {
      const r = location.hash.replace(/^#\/?/, "").split(/[/?]/)[0] || "";
      root.append(h(
        "nav",
        { class: "nav", "aria-label": "Principal" },
        TABS.map((t) => h("a", { href: t.hash, "aria-current": t.match(r) ? "page" : null }, icon(t.icon), t.label))
      ));
    }
    return view;
  }
  App.layout = layout;
  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query = ""] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(query));
    return { name: parts[0] || "", arg: parts[1] ? decodeURIComponent(parts[1]) : null, params };
  }
  function route() {
    stopAll();
    if (cleanup) {
      try {
        cleanup();
      } catch (e) {
      }
      cleanup = null;
    }
    const r = parseRoute();
    window.scrollTo(0, 0);
    try {
      const screens = {
        "": renderHome,
        explore: renderExplore,
        routine: renderRoutine,
        context: renderContext,
        category: renderCategory,
        session: renderSession,
        lab: renderLab,
        review: renderReview,
        stats: renderStats,
        settings: renderSettings,
        checklist: renderChecklist,
        modules: renderModules,
        module: renderModule,
        words: renderWords
      };
      const needsContent = ["explore", "routine", "context", "category", "session", "lab", "review", "checklist", "module", "words"];
      if (!App.journey && isPlanned(App.character) && needsContent.includes(r.name)) {
        layout(`Daily Routine \xB7 ${App.character.name}`, { back: "#/" }).append(plannedNotice(App));
        return;
      }
      const fn = r.name === "" && !App.state.settings.characterChosen ? renderCharacterPick : screens[r.name] || renderHome;
      cleanup = fn(App, r) || null;
    } catch (e) {
      console.error(e);
      const v = layout("Algo deu errado", { back: "#/" });
      v.append(h("div", { class: "notice bad" }, `Erro ao abrir a tela: ${e.message}. Seu progresso est\xE1 salvo.`));
    }
  }
  async function boot() {
    if (!App.content) {
      root.append(h("div", { class: "view" }, h("div", { class: "notice bad" }, "Conte\xFAdo n\xE3o encontrado (data/content.js). Reinstale o app.")));
      return;
    }
    const { state, isNew, problem } = await loadState(App.content.version, { ownerOf: makeOwnerOf(App.profileViews()) });
    App.isNew = isNew;
    App.storageProblem = problem;
    App.adoptState(state);
    if (isNew) await saveState(state).catch(() => {
    });
    window.addEventListener("hashchange", route);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") App.flush().catch(() => {
      });
    });
    window.addEventListener("pagehide", () => {
      App.flush().catch(() => {
      });
    });
    initPwa(App);
    route();
    if (problem) toast(problem, 6e3);
    confirmBoot(App);
    scheduleRetention();
  }
  var retentionRunning = null;
  App.runRetention = (now) => {
    if (!retentionRunning) {
      retentionRunning = pruneRecordings(now === void 0 ? {} : { now }).then((r) => {
        App.lastRetention = { ...r, at: now || Date.now() };
        return r;
      }).catch(() => null).finally(() => {
        retentionRunning = null;
      });
    }
    return retentionRunning;
  };
  function scheduleRetention() {
    setTimeout(() => App.runRetention(), 1500);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") App.runRetention();
    });
    setInterval(() => App.runRetention(), 60 * 60 * 1e3);
  }
  boot();
})();
