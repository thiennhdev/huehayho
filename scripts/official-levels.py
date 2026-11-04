#!/usr/bin/env python3
"""Sinh src/content/official.ts: cấp độ chính thức của từng từ trong giáo án.

Nguồn dữ liệu mở:
  • CEFR-J Wordlist v1.5 + Octanove C1/C2 — github.com/openlanguageprofiles/olp-en-cefrj
  • Complete HSK Vocabulary (HSK 2.0 & 3.0, MIT) — github.com/drkameleon/complete-hsk-vocabulary
Cách chạy:  npx tsx scripts/dump-vocab.ts /tmp/mine.json && python3 scripts/official-levels.py /tmp/mine.json
"""
import csv, io, json, re, sys, urllib.request

def get(url):
    return urllib.request.urlopen(url, timeout=60).read().decode("utf-8")

OLP = "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/"
HSK = "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.min.json"
mine = json.load(open(sys.argv[1]))
order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
lex = {}
for f in ["cefrj-vocabulary-profile-1.5.csv", "octanove-vocabulary-profile-c1c2-1.0.csv"]:
    for r in csv.DictReader(io.StringIO(get(OLP + f))):
        for h in r["headword"].split("/"):
            h = h.strip().lower()
            if h and (h not in lex or order[r["CEFR"]] < order[lex[h]]):
                lex[h] = r["CEFR"]
irregular = {"went": "go", "bought": "buy", "children": "child", "saw": "see", "had": "have", "goodbye": "good-bye", "parents": "parent", "shoes": "shoe"}
STOP = {"a", "an", "the", "to", "of", "in", "on", "at", "for", "with", "my", "your", "you", "me", "i"}
en = {}
for v in mine["en"]:
    t = v["term"].lower()
    lv = lex.get(t) or lex.get(irregular.get(t, "~"))
    star = ""
    if not lv:
        words = [w for w in re.split(r"[\s\-]+", t) if w and w not in STOP]
        lvs = [lex.get(w) or lex.get(irregular.get(w, "~")) or lex.get(w.rstrip("s")) or lex.get(re.sub(r"(ed|ing)$", "", w)) for w in words]
        if words and all(lvs):
            lv, star = max(lvs, key=lambda x: order[x]), "*"
    if lv:
        en[v["term"]] = lv + star
idx = {}
for e in json.loads(get(HSK)):
    idx.setdefault(e["s"], e)
zh = {}
for v in mine["zh"]:
    e = idx.get(v["term"])
    if e:
        news = [int(x[1:]) for x in e["l"] if x.startswith("n")]
        olds = [int(x[1:]) for x in e["l"] if x.startswith("o")]
        zh[v["term"]] = [min(news) if news else 0, min(olds) if olds else 0]
header = open("src/content/official.ts").read().split("export const")[0]
open("src/content/official.ts", "w").write(
    header + "export const CEFR_LEVEL: Record<string, string> = " + json.dumps(en, ensure_ascii=False)
    + ";\n\nexport const HSK_LEVEL: Record<string, [number, number]> = " + json.dumps(zh, ensure_ascii=False) + ";\n"
)
print(f"EN: {len(en)}/{len(mine['en'])} từ có cấp CEFR-J · ZH: {len(zh)}/{len(mine['zh'])} từ có trong danh sách HSK")
