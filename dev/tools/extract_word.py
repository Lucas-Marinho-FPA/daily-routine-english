#!/usr/bin/env python3
"""Extrai o Word-fonte para content/word/word-extract.json, sem interpretação.

Uso: python3 -I tools/extract_word.py <arquivo.docx> content/word/word-extract.json
Requer pandoc. A saída é fiel ao documento: nenhuma correção, categoria ou
conteúdo novo é adicionado aqui (isso fica em content/enrich/).
"""
import hashlib
import html
import json
import re
import subprocess
import sys


def clean(fragment):
    text = re.sub(r"<[^>]+>", "", fragment)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def tokens(doc):
    """Sequência ordenada de (tipo, conteúdo) para h1, h2, p, li e tabelas."""
    pattern = re.compile(
        r"<h1[^>]*>(?P<h1>.*?)</h1>|<h2[^>]*>(?P<h2>.*?)</h2>|(?P<table><table.*?</table>)"
        r"|<li[^>]*>(?P<li>.*?)</li>|<p>(?P<p>.*?)</p>",
        re.S,
    )
    for m in pattern.finditer(doc):
        kind = m.lastgroup
        if kind == "table":
            rows = []
            for tr in re.findall(r"<tr.*?</tr>", m.group("table"), re.S):
                cells = [clean(c) for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)]
                rows.append(cells)
            yield "table", rows
        else:
            yield kind, clean(m.group(kind))


def table_rows(rows):
    header, body = rows[0], rows[1:]
    assert header[:2] == ["English", "Português / sentido"], header
    return [{"en": r[0], "pt": r[1], "note": r[2]} for r in body]


def main(src, out):
    raw = open(src, "rb").read()
    doc = subprocess.run(["pandoc", src, "-t", "html", "--wrap=none"], capture_output=True, check=True).stdout.decode()

    result = {
        "source": {"file": src.split("/")[-1].split("-", 1)[-1], "sha256": hashlib.sha256(raw).hexdigest()},
        "intro": [], "howToUse": [], "standards": [], "routines": [],
        "toolkit": {}, "generalQuestions": [], "drills": [], "checklist": [], "mainGoal": None,
    }
    h1 = h2 = None
    routine = None
    pending_q = None
    li_in_p = set()

    for kind, val in tokens(doc):
        if kind == "h1":
            h1, h2 = val, None
            m = re.match(r"Daily Routine (\d+): (.+)", val)
            if m:
                routine = {
                    "id": f"R{int(m.group(1)):02d}", "title": m.group(2), "goal": None,
                    "en": [], "pt": [], "vocab": [], "phrasal": [], "usage": [], "questions": [],
                }
                result["routines"].append(routine)
            else:
                routine = None
            continue
        if kind == "h2":
            h2 = val
            if h1 and h1.startswith("Mini speaking drills"):
                result["drills"].append({"title": val, "prompts": []})
            continue

        # perguntas da teacher: "**Teacher: …**" seguido de "Possible answer: …"
        if kind == "p" and val.startswith("Teacher:"):
            pending_q = val[len("Teacher:"):].strip()
            continue
        if kind == "p" and val.startswith("Possible answer:") and pending_q:
            qa = {"q": pending_q, "a": val[len("Possible answer:"):].strip()}
            (routine["questions"] if routine else result["generalQuestions"]).append(qa)
            pending_q = None
            continue

        if h1 is None:
            if kind == "p":
                result["intro"].append(val)
        elif h1.startswith("Como usar"):
            if kind == "li":
                result["howToUse"].append(val)
        elif h1.startswith("Padrão linguístico"):
            if kind == "li":
                result["standards"].append(val)
        elif routine is not None:
            if kind == "p" and val.startswith("Objetivo de conversação:"):
                routine["goal"] = val.split(":", 1)[1].strip()
            elif kind == "p" and h2 and h2.startswith("Model text"):
                routine["en"].append(val)
            elif kind == "p" and h2 and h2.startswith("Tradução"):
                routine["pt"].append(val)
            elif kind == "table" and h2.startswith("Vocabulário"):
                routine["vocab"] = table_rows(val)
            elif kind == "table" and h2.startswith("Phrasal"):
                routine["phrasal"] = table_rows(val)
            elif kind == "li" and h2.startswith("Pontos de uso"):
                routine["usage"].append(re.sub(r"^<p>|</p>$", "", val))
        elif h1.startswith("Conversation Toolkit"):
            if kind == "p" and h2 is None:
                result["toolkit"]["intro"] = val
            elif kind == "table":
                key = "structures" if h2 is None else "simplePresent" if h2.startswith("Simple Present") else "phrasalReview"
                result["toolkit"][key] = table_rows(val)
        elif h1.startswith("Mini speaking drills"):
            if kind == "li":
                result["drills"][-1]["prompts"].append(val)
        elif h1.startswith("Checklist"):
            if kind == "li":
                result["checklist"].append(re.sub(r"^\[ \]\s*", "", val).replace("☐ ", ""))
            elif kind == "p" and val.startswith("Meta principal"):
                result["mainGoal"] = val

    # <li> com <p> interno aparece duas vezes (li e p) em alguns blocos; o tratamento acima só usa li.
    del li_in_p
    json.dump(result, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    r = result
    print(json.dumps({
        "routines": len(r["routines"]),
        "paragraphsEN": sum(len(x["en"]) for x in r["routines"]),
        "paragraphsPT": sum(len(x["pt"]) for x in r["routines"]),
        "tableRows": sum(len(x["vocab"]) + len(x["phrasal"]) for x in r["routines"]) + sum(len(v) for k, v in r["toolkit"].items() if k != "intro"),
        "routineQuestions": sum(len(x["questions"]) for x in r["routines"]),
        "generalQuestions": len(r["generalQuestions"]),
        "usageNotes": sum(len(x["usage"]) for x in r["routines"]),
        "howToUse": len(r["howToUse"]), "standards": len(r["standards"]),
        "drills": [len(d["prompts"]) for d in r["drills"]], "checklist": len(r["checklist"]),
    }))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
