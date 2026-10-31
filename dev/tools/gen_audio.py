#!/usr/bin/env python3
"""Gera o áudio britânico de referência, offline, com o modelo Kokoro (Apache-2.0).

Uso (ambiente de desenvolvimento, nunca no aparelho):
  python tools/gen_audio.py <kokoro.onnx> <voices.bin> [--voice bf_emma] [--limit N]

Lê content/build/audio-manifest.json e grava app/audio/<chave>.ogg (Opus, mono, 32 kbit/s).
É incremental: arquivos existentes são mantidos. Também gera app/data/audio-index.js
(chave → duração) para o app saber quais áudios existem.
"""
import base64
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
NUM = {0: "", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
       10: "ten", 11: "eleven", 12: "twelve", 15: "fifteen", 20: "twenty", 30: "thirty", 45: "forty-five", 50: "fifty"}

# Pronúncias forçadas (IPA no formato do Kokoro) para nomes próprios e homógrafos.
OVERRIDES = [
    (re.compile(base64.b64decode("SXRhw7o=").decode("utf-8")), "iːtɑːˈuː"),  # nome privado (codificado de propósito)
    # 'analyses' substantivo (não o verbo 'analyses')
    (re.compile(r"(?<=efficiency )analyses|(?<=allocation )analyses|(?<=strategic )analyses|(?<=profitability )analyses"), "ɐnˈaləsiːz"),
]


def say_time(m):
    h, mi, mer = int(m.group(1)), int(m.group(2)), m.group(3) or ""
    words = NUM.get(h, str(h))
    if mi:
        words += " " + NUM.get(mi, str(mi))
    return words + (" " + mer if mer else "")


def normalise(text):
    """Texto → forma falável (horas por extenso etc.). Não altera o conteúdo exibido."""
    t = re.sub(r"\b(\d{1,2}):(\d{2})(\s?[ap]\.m\.)?", say_time, text)
    t = t.replace("…", "...")
    return re.sub(r"\s+", " ", t).strip()


def to_phonemes(kokoro, text):
    """Fonemiza respeitando os OVERRIDES."""
    spans = []
    for rx, ph in OVERRIDES:
        for m in rx.finditer(text):
            spans.append((m.start(), m.end(), ph))
    spans.sort()
    out, pos = [], 0
    for a, b, ph in spans:
        if a < pos:
            continue
        if text[pos:a].strip():
            out.append(kokoro.tokenizer.phonemize(text[pos:a], "en-gb"))
        out.append(ph)
        pos = b
    if text[pos:].strip():
        out.append(kokoro.tokenizer.phonemize(text[pos:], "en-gb"))
    return " ".join(x.strip() for x in out if x.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model")
    ap.add_argument("voices")
    ap.add_argument("--voice", default="bf_emma")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--ffmpeg", default="ffmpeg")
    args = ap.parse_args()

    import soundfile as sf
    from kokoro_onnx import Kokoro

    kokoro = Kokoro(args.model, args.voices)
    manifest = json.load(open(os.path.join(ROOT, "content/build/audio-manifest.json"), encoding="utf-8"))
    # jornadas (Conversation Practice): mesmo formato + voz por entrada (cada personagem do diálogo com uma voz britânica)
    cpath = os.path.join(ROOT, "content/build/characters-audio-manifest.json")  # personagens com áudio próprio (Lukinhas)
    if os.path.exists(cpath):
        seen = {m["key"] for m in manifest}
        manifest += [m for m in json.load(open(cpath, encoding="utf-8")) if m["key"] not in seen]
    jpath = os.path.join(ROOT, "content/build/journeys-audio-manifest.json")
    if os.path.exists(jpath):
        seen = {m["key"] for m in manifest}
        manifest += [m for m in json.load(open(jpath, encoding="utf-8")) if m["key"] not in seen]
    outdir = os.path.join(ROOT, "app/audio")
    os.makedirs(outdir, exist_ok=True)
    index_path = os.path.join(ROOT, "content/build/audio-durations.json")
    durations = json.load(open(index_path)) if os.path.exists(index_path) else {}

    todo = [m for m in manifest if not os.path.exists(os.path.join(outdir, m["key"] + ".ogg"))]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(manifest)} no manifesto, {len(todo)} a gerar", flush=True)
    for n, m in enumerate(todo, 1):
        spoken = normalise(m["text"])
        phonemes = to_phonemes(kokoro, spoken)
        samples, sr = kokoro.create(phonemes, voice=m.get("voice") or args.voice, speed=1.0, lang="en-gb", is_phonemes=True)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            sf.write(tmp.name, samples, sr)
            wav = tmp.name
        target = os.path.join(outdir, m["key"] + ".ogg")
        subprocess.run([args.ffmpeg, "-loglevel", "error", "-y", "-i", wav, "-af", "apad=pad_dur=0.15",
                        "-c:a", "libopus", "-b:a", "32k", "-ac", "1", target], check=True)
        os.unlink(wav)
        durations[m["key"]] = round(len(samples) / sr + 0.15, 2)
        if n % 25 == 0 or n == len(todo):
            json.dump(durations, open(index_path, "w"))
            print(f"{n}/{len(todo)}", flush=True)

    keys = {m["key"] for m in manifest}
    present = {k: v for k, v in durations.items() if k in keys and os.path.exists(os.path.join(outdir, k + ".ogg"))}
    with open(os.path.join(ROOT, "app/data/audio-index.js"), "w") as f:
        f.write("// GERADO por tools/gen_audio.py — chave → duração (s). Voz: Kokoro " + args.voice + " (Apache-2.0).\n")
        f.write("window.DRG_AUDIO = " + json.dumps({"voice": args.voice, "files": present}) + ";\n")
    print(f"índice: {len(present)} áudios", flush=True)


if __name__ == "__main__":
    sys.exit(main())
