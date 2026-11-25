# The Deenway School — website & portal

The new platform for **www.thedeenwayschool.com**: public website in English, Urdu and Arabic, online admissions registration, and the foundation for the Parent Portal connected to Eldermin.

- Plan: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md)
- Eldermin integration spec (for the Eldermin team): [`docs/ELDERMIN-INTEGRATION-SPEC.md`](docs/ELDERMIN-INTEGRATION-SPEC.md)
- The old WordPress site files are kept on the `wordpress-backup` branch.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

Railway deploys automatically from `main`: it runs `npm install`, `npm run build`, then `npm start` (listens on `$PORT`).

## Where things live

| What | Where |
|---|---|
| Page text in each language | `content/en.ts`, `content/ur.ts`, `content/ar.ts` (same structure in each) |
| Campuses, phones, fees, downloads | `lib/site.ts` |
| Pages | `app/[locale]/…` |
| Photos (WebP, 800 and 1600 px) | `public/images/` |
| PDFs (handbook, assessment outlines) | `public/docs/` |
| SPD 2026 event page | `public/spd-2026/` |

To change wording, edit the three `content/*.ts` files. To add a campus, add it to `lib/site.ts` and its name to `campusNames` in each content file.
