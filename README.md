# ClinTech (AdvaClin) — Phase 1 wireframe

Clickable, coded wireframe of the ClinTech EDC for AMS, focused on **role-based access control (RBAC)**.
The login form checks email + password with the backend (`ams-backend`). Everything else is seed data held in
in-memory Zustand stores.

## Run

Start the backend first. `npm run dev` proxies `/api` to it on <http://localhost:8020>; see the `ams-backend` readme.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build (optional)
```

To sign in with the form, the email needs a backend account **and** a seeded user below. In `ams-backend`:

```bash
uv run python -m scripts.create_dev_user abcd.pqrs@amsltd.com "Abcd Pqrs" --category ADMIN --prefix Mr
```

The page and data for that user come from the seed. **Quick demo sign-in** on the login page and the switcher in the
user menu skip the password and don't call the backend. The switch keeps the current in-memory data.

A deployed build calls the backend at `VITE_API_BASE_URL`.

| Role | User | Email |
|---|---|---|
| Admin | Mr. Abcd Pqrs | abcd.pqrs@amsltd.com |
| Head-Sponsor | Dr. Jignesh Patel | dr.jpatel@amsltd.com |
| PM-Sponsor | Mr. Kunal Bhatt | kbhatt@amsltd.com |
| QA Auditor | Mr. Ashish Kulkarni | akulkarni@amsltd.com |
| CRA-CO | Ms. Anaïs Martin | anais.martin@cerc.fr |
| Investigator | Dr. Philippe Chevalier | pchevalier@louisehospital.com |
| CRC (2 sites) | Ms. Dyna Martin | dyna@louisehospital.com |

Data resets on every reload. To keep demo edits across reloads set `IS_PERSISTENCE_ENABLED = true`
in `src/store/store.config.ts` (clear site data to reset).

The in-app **Prototype assumptions** page (user menu) lists every decision taken where the drafts are open.
**UI kit** (user menu) shows the shared components.

## What is in Phase 1

- Login, project/site picker, app shell with context header, 403/404.
- Admin portal: Admin users, Sponsor & CO accounts (with global sponsor rights), Company profile.
- Masters: Default Access Rights (typed templates) and one generic screen for Product Group,
  Project Status, Site Status and Participant Status.
- Projects + project hub, Investigator & Site + site hub.
- Sponsor user affiliation (per project), CO user affiliation (per site), Site user management.
- Read-only View mode with effective permissions for every user / affiliation.
- Audit trail of every create / edit / (de)activate / (de)affiliate / permission change and every login.
- "Coming in Phase 2" pages for all other modules — already routed and permission-gated.

## Where things live

```
src/
  app/            bootstrap, router (routes.tsx, route-paths.constants.ts, guards/), providers
  rbac/           permission catalog (the 4 matrices), can(), usePermission, <Can>, <RequirePermission>
  store/          one Zustand store per domain; every mutation writes an audit entry (recordAudit)
  data/           seed data, one file per entity (template defaults documented in access-rights.seed.ts)
  types/          domain types
  components/     shared presentational components (data-grid, form, permission-matrix, layout, feedback, overlay)
  features/       one folder per feature: pages/ (containers) · components/ (views) · hooks/ (logic) ·
                  schemas/ (Zod) · constants/ · utils/
  styles/         tokens.css (Tailwind v4 @theme) · theme.css (daisyUI "clintech") · base.css
```

Conventions: pages only wire hooks to views; views have no store access; route paths come from `paths.*`;
user-facing strings live in `*.constants.ts`; styling uses tokens only, and class lists longer than one line
move to the component's `*.module.css`. daisyUI component classes (`btn`, `menu`, `dropdown-content`,
`drawer-*`…) stay in JSX — they lose their state selectors if `@apply`-ed.

## Notes

- `vite.config.ts` pre-bundles all runtime dependencies (`optimizeDeps.noDiscovery`). This avoids a Windows
  file-lock error during dependency re-optimisation. **Add any new runtime dependency to that list.**
- No lint, tests or CI by design at the wireframe stage.
