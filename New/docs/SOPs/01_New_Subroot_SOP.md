New/ Sub-root Strategy & SOP (son_e_lum)

Purpose
Add a New/ sub-root for all new development and training, without touching the current pilot (which continues using legacy paths like SE/, SOP/, ui/). After the pilot demo, archive the legacy tree into prev_YYYYMMDD/ and (optionally) promote New/ to the root layout.

Scope
Repo: son_e_lum
Owners: <role/names>
Last Reviewed: YYYY-MM-DD

1) Goals

Keep the pilot running with zero changes to its paths.

Put all new work under New/ with a clean, standard layout and SOPs.

Give assistants and collaborators a single entrypoint and PR checks.

After pilot demo, perform a clean cutover and archive legacy safely.

2) Layouts
2.1 Legacy (pilot – unchanged)
SE/
SOP/
└─ Tech/Mob/{Audio, Image/prev, Text}
ui/

2.2 New (for all new development)
New/
  docs/
    SOPs/
      00_Index.md
      10_Workflow_SRO.md
      20_Release_Checklist.md
  site/
    content/              # text/markdown, narration, page data
    assets/
      images/
        prev/
      audio/
      other/
    templates/            # replaces legacy `ui/`
  public/                 # build output (generated)
  scripts/
    build_site.sh         # placeholder – swap for real build tool


Tip: Keep a top-level FOR_AI_ASSISTANTS.md that points to New/docs/SOPs/00_Index.md.

3) Create the New/ sub-root

Run inside son_e_lum, on a feature branch:

git checkout -b chore/new-subroot

mkdir -p New/docs/SOPs New/docs/HOWTOs New/docs/Playbooks
mkdir -p New/site/content New/site/assets/images/prev New/site/assets/audio New/site/assets/other New/site/templates
mkdir -p New/public New/scripts .github/workflows

# SOP index
cat > New/docs/SOPs/00_Index.md <<'MD'
# 00 Index
- [Workflow SRO](10_Workflow_SRO.md)
- [Release Checklist](20_Release_Checklist.md)
MD

# Workflow SOP
cat > New/docs/SOPs/10_Workflow_SRO.md <<'MD'
# Workflow SRO (New/)
**Purpose:** How we change content, templates, and assets under `New/`.
**Scope:** `son_e_lum/New/`
**Owner:** <role/name> • **Last Reviewed:** YYYY-MM-DD

## Edit → Build → Verify
1. Edit content in `New/site/content/**` and templates in `New/site/templates/**`.
2. Put media in `New/site/assets/**`.
3. Build site → `New/scripts/build_site.sh` (replace with real build).
4. Verify generated files in `New/public/`.
5. Commit, PR, and merge.

## Rollback
- Revert the merge or redeploy previous tag.
MD

# Release checklist
cat > New/docs/SOPs/20_Release_Checklist.md <<'MD'
# Release Checklist (New/)
**Owner:** <role/name> • **Last Reviewed:** YYYY-MM-DD

- [ ] Changes limited to `New/site/**` and `New/docs/**`
- [ ] Build ran clean: `New/scripts/build_site.sh`
- [ ] Output verified in `New/public/`
- [ ] SOPs updated if anything changed
- [ ] PR merged with checks

**Rollback:** revert PR or redeploy previous tag.
MD

# Placeholder build (swap for your tool: Hugo/MkDocs/Eleventy/etc.)
cat > New/scripts/build_site.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo '[placeholder] Generating New/public (replace with real generator)'
mkdir -p New/public
rsync -a --delete New/site/templates/ New/public/ || true
echo 'Done.'
SH
chmod +x New/scripts/build_site.sh

# Helper for future chats (repo root)
if [ ! -f FOR_AI_ASSISTANTS.md ]; then
cat > FOR_AI_ASSISTANTS.md <<'MD'
# For AI Assistants
- Use the **Website Build SOP (New/)**: New/docs/SOPs/00_Index.md
- Read `New/docs/SOPs/10_Workflow_SRO.md` and `20_Release_Checklist.md` first.
- All new development happens under `New/`. The pilot uses legacy paths until cutover.
MD
git add FOR_AI_ASSISTANTS.md
fi

# PR template (nudges devs to follow New/ SOP)
mkdir -p .github
cat > .github/PULL_REQUEST_TEMPLATE.md <<'MD'
## Summary
- What changed & why

## SOP (New/)
- [ ] I followed **Website Build SOP (New/)**: New/docs/SOPs/00_Index.md
- [ ] If I changed templates/assets/content, I updated SOPs if needed
- [ ] I verified the build output in `New/public/`
MD

# Optional: PR reminder workflow for New/
mkdir -p .github/workflows
cat > .github/workflows/sop-check.yml <<'YML'
name: SOP check (New/)
on:
  pull_request:
    types: [opened, edited, synchronize]
jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Require SOP acknowledgement when New/ files change
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR=$(jq -r '.pull_request.number' "$GITHUB_EVENT_PATH")
          touched=$(gh api repos/${{ github.repository }}/pulls/$PR/files --paginate | jq -r '.[].filename' | grep -E '^New/' || true)
          if [ -n "$touched" ]; then
            body=$(gh api repos/${{ github.repository }}/pulls/$PR -q '.body' || echo "")
            echo "$body" | grep -qi '\[x\].*Website Build SOP' || { echo '::error::Please check the Website Build SOP (New/) checkbox in the PR body.'; exit 1; }
          fi
YML

# README: add a New pointer at the top
if [ -f README.md ]; then
  grep -qi 'Website Build SOP (New/)' README.md || \
    (printf "> **New work starts here:** [Website Build SOP (New/)](New/docs/SOPs/00_Index.md)\n\n" && cat README.md) > README.md.tmp && mv README.md.tmp README.md
else
  printf "> **New work starts here:** [Website Build SOP (New/)](New/docs/SOPs/00_Index.md)\n" > README.md
fi

git add New README.md .github
git commit -m "docs(site): add New/ sub-root for development + SOPs; pilot untouched"
git push -u origin chore/new-subroot

# Open PR
gh pr create --title "feat(site): add New/ sub-root (SOPs + layout) — pilot unchanged" \
  --body "Adds New/ structure for all new development and training. Pilot under legacy paths remains untouched. SOPs and PR checks point to New/."

4) Day-to-day usage (while pilot runs)

Build only under New/:

Content → New/site/content/**

Templates → New/site/templates/**

Assets → New/site/assets/**

Build & preview:

New/scripts/build_site.sh
# serve New/public for preview (example)
python3 -m http.server -d New/public 8080


Use the PR template checklist; make sure the SOP check passes.

One-liner for future chats:

Repo is son_e_lum. Follow New/docs/SOPs/00_Index.md. All new work happens under New/; pilot uses legacy paths until cutover.

5) Cutover (after pilot demo)

Do this once the pilot no longer relies on legacy paths.

git checkout -b chore/cutover

# Archive legacy tree (preserves history with git mv)
stamp=$(date +%Y%m%d)
mkdir -p prev_$stamp
git mv SE SOP ui prev_$stamp/ 2>/dev/null || true

# Option A (simple): keep New/ in place
# Update your deployment to serve from New/public.

# Option B (promote New/ to root layout)
# git mv New/site site
# git mv New/docs docs
# git mv New/scripts scripts
# rm -rf New

git commit -m "chore(site): archive legacy to prev_${stamp}; (optionally) promote New/"
git push -u origin chore/cutover
gh pr create --title "chore(site): cutover post-pilot" \
  --body "Archives legacy under prev_${stamp}; New/ becomes the active layout."

6) Troubleshooting

Pilot breakage? The New/ plan doesn’t touch legacy paths; if something breaks, it’s likely deployment path changes—double-check your deploy points at the correct public/.

CI failing SOP check? Make sure the PR body includes a checked box:

- [x] Website Build SOP


Assistants ignoring SOPs? FOR_AI_ASSISTANTS.md at repo root points them to New/docs/SOPs/00_Index.md.

7) References

Central “SOP-of-SOPs” in khata_punji/handbook/SOP_of_SOPs/

This document: New/docs/SOPs/01_New_Subroot_SOP.md

Workflow: New/docs/SOPs/10_Workflow_SRO.md

Release: New/docs/SOPs/20_Release_Checklist.md