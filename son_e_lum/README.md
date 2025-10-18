# Son et Lumière v10 Repository Structure

This repository contains the complete workflow for the **Son et Lumière (Sound and Light)** training system.

## 📂 Structure Overview

```
son_e_lum/
├── src/                 → Python generators (mk_tw_v10.py)
├── config/              → Global narration and behavior settings
├── data/                → Build-ready CSVs
├── Inputs/              → Narration text and PowerPoint sources
│   ├── TECH_text_*.md
│   └── PPTs/
│       └── TECH_*.pptx
├── images/              → Slide exports (PNG)
│   └── TECH/
│       └── S1.png, S2.png, ...
├── out/                 → Generated .twee story files
├── docs/                → Published HTML for GitHub Pages
│   └── TECH/Main/
└── README.md            → This guide
```

## 🧭 Quick Commands

**Run build**
```bash
python src/mk_tw_v10.py \
  --input-csv data/TECH_build_101625_0930.csv \
  --output-twee out/TECH_Main_101625_0930.twee \
  --title "Tech Service SOP" \
  --start Menu
```

**Publish**
```bash
git add .
git commit -m "Add Tech SOP build"
git push
```

Your published story will appear at:
`https://<your-username>.github.io/son_e_lum/TECH/Main/TECH_Main_101625_0930.html`
