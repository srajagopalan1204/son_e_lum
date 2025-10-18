#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
Project: Son et Lumière Interactive SOP Series (v10)
Module: mk_tw_v10.py
Provenance:
    Developed by ChatGPT Collaborative Tools (Consultant)
    and Subi Rajagopalan (for Scott Electric)
    Adapted for Scott Electric ERP Training — Son et Lumière Interactive SOP Series
    Originally adapted from EduXL (2000–2005 Foundation Work)
Context:
    Collaborative optimization to streamline SOP creation, reduce cycle time,
    and enable scalable training deployment for ERP readiness.
Design:
    - Reads build CSV and global JSON settings
    - Auto-detects decision nodes; supports JSON question overrides per SOP
    - Auto-creates Menu and Exit passages if missing
    - Embeds CSS/JS from files into SugarCube 'stylesheet'/'script' passages
===============================================================================
"""

import argparse, csv, json, os, sys
from pathlib import Path
from textwrap import shorten

# ----------------------------- Helpers ---------------------------------------

def safe(s: str) -> str:
    return (s or "").replace("\r", "").replace("\n", " ").strip()

def first_words(text: str, limit_words: int) -> str:
    words = safe(text).split()
    return " ".join(words[:limit_words])

def is_decision(row) -> bool:
    nexts = [row.get("Next1","").strip(), row.get("Next2","").strip(), row.get("Next3","").strip()]
    return len([n for n in nexts if n]) > 1 or str(row.get("Question","")).strip().upper() == "TRUE"

def ensure_core_passages(passages: dict, settings: dict) -> None:
    # Menu
    if "Menu" not in passages:
        passages["Menu"] = {
            "StepCode": "Menu",
            "StepTitle": "Menu",
            "Body1": "Welcome to the Tech Mobile interactive SOP.",
            "Body2": "",
            "Body3": "This is the main entry point. Choose any process step below to begin.",
            "ImageURL": "",
            "DisplayText": "Main Menu",
            "Next1": "M1", "Next2": "", "Next3": "",
            "Question": "FALSE", "UAP_Name": "", "UAP_URL": ""
        }
    # Exit
    exit_text = settings.get("sop_overrides", {}).get("Tech_Mobile", {}).get("exit_text", {})
    exit_b1 = exit_text.get("Body1", "You’ve reached the end of the SOP. Use Back to review or Menu to start fresh.")
    exit_b3 = exit_text.get("Body3", "Having followed this path (breadcrumb shows your trail), you can step back to review or return to Menu to start again. Exiting clears your breadcrumb history.")
    if "EXIT" not in passages:
        passages["EXIT"] = {
            "StepCode": "EXIT",
            "StepTitle": "Exit",
            "Body1": exit_b1,
            "Body2": "",
            "Body3": exit_b3,
            "ImageURL": "",
            "DisplayText": "End of process",
            "Next1": "Menu", "Next2": "", "Next3": "",
            "Question": "FALSE", "UAP_Name": "End", "UAP_URL": "https://scottuap.app/tech/end"
        }

def apply_question_overrides(p: dict, settings: dict) -> None:
    sop_name = "Tech_Mobile"  # v10 pilot default; can be parameterized
    overrides = settings.get("question_overrides", {}) or settings.get("sop_overrides", {}).get(sop_name, {}).get("question_overrides", {})
    step = p.get("StepCode","")
    if overrides and step in overrides:
        p["_question_text"] = overrides[step]
    else:
        # Auto-generate if decision and no explicit question
        if is_decision(p):
            title = p.get("StepTitle","").strip()
            if "?" in title:
                p["_question_text"] = title
            else:
                p["_question_text"] = f"Decision: {title}"

def derive_bodies_if_missing(p: dict) -> None:
    # Fill Body3 from Body3 or StepTitle; Body2/Body1 condensed
    b3 = p.get("Body3","").strip()
    if not b3:
        # derive from context if needed
        title = p.get("StepTitle","").strip()
        prev_hint = ""  # could be enriched in future
        next_hint = " ".join([n for n in [p.get("Next1",""), p.get("Next2","")] if n])
        b3 = f"{title}. Continue to {next_hint}." if next_hint else f"{title}."
        p["Body3"] = b3
    if not p.get("Body2","").strip():
        p["Body2"] = first_words(b3, 40)
    if not p.get("Body1","").strip():
        p["Body1"] = first_words(b3, 15)

def read_text_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return ""

def build_twee(passages: dict, title: str, css_text: str, js_text: str, start: str) -> str:
    lines = []
    # StoryTitle
    lines.append(f":: StoryTitle\n{title}\n")
    # Stylesheet
    if css_text:
        lines.append(f":: Story Stylesheet [stylesheet]\n{css_text}\n")
    # Script
    if js_text:
        lines.append(f":: Story Script [script]\n{js_text}\n")

    # Menu listing (dynamic links) – enhance if needed
    if "Menu" in passages:
        menu_body = passages["Menu"]["Body3"] + "\n\n"
        # Link to first step and any M*/S* roots present
        roots = [k for k,v in passages.items() if v.get("StepCode") in ("M1","S1")]
        for r in sorted(set(roots)):
            menu_body += f"[[Start → {r}]]\n"
        lines.append(f":: Menu\n{menu_body}\n")

    # Emit each passage
    for code, p in passages.items():
        if code in ("Menu", "StoryTitle", "Story Stylesheet", "Story Script"):
            continue
        title_line = f"== {p.get('StepTitle','').strip()} ({code}) ==\n"
        img = p.get("ImageURL","").strip()
        img_line = f"\n''{p.get('DisplayText','').strip()}''\n" if p.get("DisplayText") else ""
        if img:
            img_line += f"\n[img[{img}]]\n"
        # Body
        body = p.get("Body3","").strip()
        # UAP link
        uap_line = ""
        if p.get("UAP_URL","").strip():
            uap_label = p.get("UAP_Name","Learn more")
            uap_url = p["UAP_URL"].strip()
            uap_line = f"\n\n''{uap_label}:'' {uap_url}\n"
        # Decision question (inline hint)
        qline = ""
        if p.get("_question_text"):
            qline = f"\n\n'''{p['_question_text']}'''\n"

        # Links
        links = []
        for nxt in [p.get("Next1","").strip(), p.get("Next2","").strip(), p.get("Next3","").strip()]:
            if nxt:
                links.append(f"[[Continue → {nxt}]]")
        if not links:
            links.append("[[Exit → EXIT]]")
        link_block = "\n".join(links)

        lines.append(f":: {code}\n{title_line}{img_line}{body}{qline}{uap_line}\n\n{link_block}\n")

    # Ensure EXIT exists (safety)
    if "EXIT" not in passages:
        lines.append(":: EXIT\n== Exit ==\nYou’ve reached the end of the SOP. [[Return to Menu→Menu]]\n")

    return "\n".join(lines)

# ----------------------------- Main ------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Build a SugarCube Twee file from Son et Lumière CSV (v10).")
    ap.add_argument("--input-csv", required=True)
    ap.add_argument("--output-twee", required=True)
    ap.add_argument("--story-js", required=True)
    ap.add_argument("--story-css", required=True)
    ap.add_argument("--title", default="Son et Lumière SOP v10")
    ap.add_argument("--start", default="Menu")
    ap.add_argument("--settings-json", default="config/global_settings.json")
    args = ap.parse_args()

    # Load settings
    try:
        with open(args.settings_json, "r", encoding="utf-8") as f:
            settings = json.load(f)
    except Exception as e:
        print(f"[WARN] Could not read settings JSON: {e}")
        settings = {}

    # Read CSV
    passages = {}
    with open(args.input_csv, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        required = ["StepCode","StepTitle","Body1","Body2","Body3","ImageURL","DisplayText","Next1","Next2","Next3","Question","UAP_Name","UAP_URL"]
        for r in reader:
            row = {k: r.get(k, "").strip() for k in required}
            # derive bodies if missing
            derive_bodies_if_missing(row)
            # apply question text/overrides
            apply_question_overrides(row, settings)
            code = row["StepCode"] or row["StepTitle"]
            passages[code] = row

    # Ensure Menu & Exit
    ensure_core_passages(passages, settings)

    # Load CSS/JS
    css_text = read_text_file(Path(args.story_css))
    js_text  = read_text_file(Path(args.story_js))

    # Build twee
    twee = build_twee(passages, args.title, css_text, js_text, args.start)

    # Write out
    out_path = Path(args.output_twee)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(twee, encoding="utf-8")
    print(f"[OK] Wrote Twee: {out_path}")

if __name__ == "__main__":
    main()
