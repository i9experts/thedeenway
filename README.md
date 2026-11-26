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

## Admin panel (reels)

`/admin` lets school staff manage the reels shown on the home page and in the reel gallery.

It needs two Railway variables on the **thedeenway** service:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Reference to the Railway **PostgreSQL** service's `DATABASE_URL` |
| `ADMIN_PASSWORD` | A strong password (10+ characters) for staff |
| `SESSION_SECRET` *(optional)* | Any long random text; adds extra protection to admin sessions |
| `UPLOAD_DIR` | `/data/uploads` — needs a Railway **volume** mounted at `/data` (for uploaded reel videos) |

The `reels` table is created automatically on first use.

**Uploaded videos vs links.** Uploaded MP4s autoplay muted on every device. Facebook, YouTube and TikTok links autoplay muted through their embeds. Instagram does not allow autoplay on other websites, so Instagram reels play when tapped — upload the video instead for autoplay. Share links (`facebook.com/share/…`, `instagram.com/share/…`, `fb.watch`, `vm.tiktok.com`) are followed automatically to the real reel address.

## Parent Portal (`/portal`)

The portal runs in **demo mode** on a sample family until Eldermin's integration API exists.

- Screens: `app/[locale]/portal/` (overview, attendance, homework, results, fees, notices with the SPD consent form). Text: `content/portal.ts`.
- Data comes only through the `ElderminApi` interface in `lib/eldermin/types.ts`. Today `lib/eldermin/index.ts` returns the sample data in `mock.ts`; the real client plugs in there.
- Not built yet: real parent sign-in (mobile number + one-time code, needs an SMS/WhatsApp provider), online payment, and saving consent forms.
- Set `SESSION_SECRET` in Railway before real family data is connected.

## Online admissions

- Parents apply at `/admissions/apply` (four steps, optional documents) and track progress at `/admissions/status` with their application number and mobile number.
- Staff manage applications at `/admin/admissions`: search and filter, open an application, set its status and assessment time, write a message for the parent and an internal note, open uploaded documents, and download a CSV.
- Needs `DATABASE_URL`. Without it the apply page falls back to the WhatsApp registration form. Document upload also needs `UPLOAD_DIR` (documents are stored privately and served only to signed-in staff).
- Not built yet: online fee payment, automatic SMS/WhatsApp/email notifications, and sending accepted applications to Eldermin.
