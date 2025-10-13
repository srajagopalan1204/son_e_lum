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
