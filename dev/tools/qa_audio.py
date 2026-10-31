#!/usr/bin/env python3
"""Controle de qualidade dos áudios gerados (ambiente de desenvolvimento).

Transcreve cada app/audio/<chave>.ogg com PocketSphinx (modelo en-US genérico, local) e mede
quantas palavras do texto esperado aparecem na transcrição. É um indicador grosseiro de
inteligibilidade: o PocketSphinx erra bastante mesmo com áudio bom, então só os casos
muito abaixo da média merecem escuta humana. Saída: docs/evidence/audio-qa.json
"""
import base64
import json
import os
import re
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(ROOT, "tools"))
from gen_audio import normalise  # mesma normalização de horas usada na síntese  # noqa: E402


def words(t):
    t = normalise(t).lower().replace(base64.b64decode("aXRhw7o=").decode("utf-8"), base64.b64decode("aXRhdQ==").decode("utf-8")).replace("a.m.", "am").replace("p.m.", "pm")  # 1º replace: nome privado (codificado)
    return re.findall(r"[a-z']+", t)


def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            dp[i][j] = dp[i + 1][j + 1] + 1 if a[i] == b[j] else max(dp[i + 1][j], dp[i][j + 1])
    return dp[0][0]


def main():
    from pocketsphinx import Decoder
    dec = Decoder(samprate=16000)
    manifest = json.load(open(os.path.join(ROOT, "content/build/audio-manifest.json")))
    rows = []
    for m in manifest:
        path = os.path.join(ROOT, "app/audio", m["key"] + ".ogg")
        if not os.path.exists(path):
            rows.append({"key": m["key"], "text": m["text"], "missing": True})
            continue
        pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                             capture_output=True, check=True).stdout
        dec.start_utt()
        dec.process_raw(pcm, full_utt=True)
        dec.end_utt()
        hyp = dec.hyp().hypstr if dec.hyp() else ""
        exp = words(m["text"])
        got = re.findall(r"[a-z']+", hyp.lower())
        score = lcs(exp, got) / max(1, len(exp))
        rows.append({"key": m["key"], "kind": m["kind"], "text": m["text"], "heard": hyp, "match": round(score, 2), "words": len(exp)})
    scored = [r for r in rows if "match" in r]
    long_ = [r for r in scored if r["words"] >= 6]
    mean_long = sum(r["match"] for r in long_) / max(1, len(long_))
    flagged = sorted([r for r in long_ if r["match"] < 0.45], key=lambda r: r["match"])
    out = {"files": len(rows), "missing": sum(1 for r in rows if r.get("missing")), "meanMatchLong": round(mean_long, 3),
           "flaggedLong": len(flagged), "flagged": flagged[:40], "all": rows}
    os.makedirs(os.path.join(ROOT, "docs/evidence"), exist_ok=True)
    json.dump(out, open(os.path.join(ROOT, "docs/evidence/audio-qa.json"), "w"), ensure_ascii=False, indent=1)
    print(json.dumps({k: v for k, v in out.items() if k not in ("all", "flagged")}))


if __name__ == "__main__":
    main()
