# The Deenway Platform — Blueprint v0.1

**Status:** proposal for approval · **Prepared:** 25 November 2026
**Goal:** one world-class platform for The Deenway School — public website, parent portal and online admissions — built to grow from one school in Pakistan into a franchise brand.

---

## 1. Decisions already made

| Topic | Decision |
|---|---|
| Approach | Rebuild as one modern app. WordPress is retired after launch; its files stay on the `wordpress-backup` branch. |
| First release | Public website, **Parent portal**, **Online admissions**, **Eldermin integration** |
| Records system | **Eldermin** stays the single source of truth for students, fees, attendance, results, admissions. The portal calls Eldermin's API live. |
| Eldermin ownership | Developed by a third party. They build the endpoints in `ELDERMIN-INTEGRATION-SPEC.md`; we build the portal against that spec. |
| Scale | Pakistan now, franchise later: multi-campus, multi-currency and multi-language from the start. |
| Languages | **English, Urdu, Arabic** at launch (Urdu and Arabic right-to-left). |
| Payments | JazzCash, Easypaisa, bank card gateway, 1Bill / bank voucher |
| Brand | The Deenway School logo stays exactly as it is. |
| Hosting | **Railway** |
| Go-live | Build on a test address; the current Hostinger site stays live until you approve the switch. |
| Content | Copied from the live website; photos from the WordPress backup. |
| Code | `i9experts/thedeenway`, new platform on `main` |

---

## 2. Architecture

```
                 Parents · Applicants · Public visitors
                                 │
                     thedeenwayschool.com (Railway)
         ┌───────────────────────┴────────────────────────┐
         │            Deenway Web  (Next.js, TypeScript)   │
         │  Public website · Parent portal · Admissions    │
         │  EN / UR / AR · mobile-first · installable app  │
         └──────┬───────────────┬───────────────┬──────────┘
                │               │               │
        Portal database   Payment gateways   Eldermin API (third party)
        (PostgreSQL)      JazzCash/Easypaisa  students, fees, attendance,
        content, users,   card, 1Bill         results, admissions
        sessions, logs
```

**What lives where**

| Data | Owner | Why |
|---|---|---|
| Students, guardians, classes, attendance, results, fee invoices, admissions records | **Eldermin** | Single source of truth; staff keep working in Eldermin. |
| Website pages, news, events, gallery, campus pages, translations | **Portal** | Edited by school staff through a built-in content editor. |
| Parent login accounts, sessions, notification preferences | **Portal** | Linked to Eldermin guardian IDs. |
| Payment transactions | **Portal**, confirmed to Eldermin | Gateway callbacks land in the portal, which posts the payment to Eldermin. |
| Draft admission applications | **Portal** until submitted, then **Eldermin** | Parents can save and return before submitting. |

**Technology**

| Layer | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript, server-rendered for speed and SEO |
| Styling | Tailwind CSS with a Deenway design system (tokens for green, gold, cream; RTL-aware) |
| Database | PostgreSQL on Railway (Prisma) |
| Files | Railway volume or S3-compatible storage for images and documents |
| Content editing | Built-in admin CMS (Payload CMS inside the same app) so staff edit pages in EN/UR/AR without a developer |
| Auth | Parent login by phone + one-time code (WhatsApp/SMS) or email; staff login with 2-factor |
| Messaging | WhatsApp Business API + SMS + email for codes, fee reminders, notices |
| Monitoring | Error tracking, uptime checks, daily database backups |

---

## 3. What we will build (Release 1)

### 3.1 Public website — "world-class first impression"
- **Home:** the Deenway story, vision ("Enlightening the roots of knowledge"), programmes, campuses, why Deenway, testimonials, latest news and events, admissions call-to-action.
- **About:** history, vision and values, leadership messages, Islamic ethos, faculty.
- **Programmes:** Pre-primary, Primary, Middle, Secondary; Qur'an and hifz; co-curricular; Tarbiyah.
- **Campuses:** one page per campus (map, facilities, contact, gallery). Franchise-ready: new campus = new entry, no code change.
- **Admissions:** process, eligibility, assessment outlines, fee structure, FAQs, **Apply Online**.
- **News & Events:** including event microsites like SPD 2026 "Nurture on Values".
- **Gallery, Downloads** (parent handbook, syllabi), **Careers**, **Contact**.
- Three languages with a language switcher; full right-to-left layout for Urdu and Arabic.
- Fast (under 2 s on mobile), accessible (WCAG 2.2 AA), SEO with structured data for schools and events.

### 3.2 Online admissions
1. Choose campus and class → see eligibility and fees.
2. Create applicant account (phone + one-time code).
3. Multi-step form: student, guardians, previous school, medical/support needs, documents upload. Save and continue later.
4. Pay admission/assessment fee online.
5. Book an assessment slot.
6. Track status: Submitted → Under review → Assessment booked → Result → Offer → Enrolled.
7. On acceptance, the student and guardian are created in Eldermin, and the applicant account becomes a parent account.

Staff manage applications **in Eldermin's Admissions module**; the portal shows status from Eldermin.

### 3.3 Parent portal
- One login, all children (siblings across campuses).
- **Today:** attendance, homework, notices, upcoming events.
- **Attendance:** calendar view, absence reasons, leave requests.
- **Results:** assessment results and downloadable report cards.
- **Fees:** invoices, due dates, pay online (JazzCash, Easypaisa, card, 1Bill), receipts, payment history.
- **Notices & events:** school announcements, event consent forms (e.g. SPD participation and media consent) with e-signature.
- **Messages:** with class teacher (via Eldermin), meeting requests.
- **Behaviour & Tarbiyah notes** shared by the school.
- **Profile:** guardian details, authorised collectors, notification preferences, language.
- Installable on phones (PWA) with push notifications; native apps can come later from the same code.

### 3.4 Staff admin (inside the portal)
- Edit website content, news, events, galleries in all three languages.
- Publish notices and consent forms to selected campuses/classes.
- See portal payments and reconciliation status with Eldermin.
- Roles: Super admin, Campus admin, Content editor, Admissions officer, Finance viewer.

---

## 4. Franchise readiness (built in, not bolted on)
- **Campus as data:** every page, notice, fee and admission is tagged to a campus; a franchise partner gets a campus-scoped admin.
- **Eldermin tenancy:** each franchise school can be its own Eldermin tenant (school slug); the portal maps campus → slug.
- **Multi-currency** (PKR first; AED, SAR, GBP, USD later) and per-country payment gateways.
- **Brand guardrails:** shared design system so every campus site looks unmistakably Deenway.

---

## 5. Hosting on Railway

| Service | Purpose |
|---|---|
| `web` | Next.js app (public site, portal, admin) |
| `postgres` | Portal database, daily backups |
| `storage` | Media and documents |
| `worker` | Background jobs: notifications, payment reconciliation, Eldermin sync retries |

Environments: **staging** (`new.thedeenwayschool.com`) and **production** (`thedeenwayschool.com`).
Cut-over: DNS switch from Hostinger after sign-off; old WordPress kept read-only for 30 days, then cancelled. Old URLs are redirected to new ones so Google rankings are kept.

---

## 6. Delivery plan

| Phase | Scope | Depends on |
|---|---|---|
| **0. Foundations** (week 1) | Repo setup, design system, Railway staging, CMS, EN/UR/AR | Railway access |
| **1. Public website** (weeks 2–4) | All public pages, content migrated, SEO, redirects | Live-site content access |
| **2. Online admissions** (weeks 4–6) | Application flow, documents, payment, status | Eldermin admissions endpoints, payment merchant accounts |
| **3. Parent portal** (weeks 6–9) | Login, dashboard, attendance, results, fees, notices, consent forms | Eldermin parent endpoints |
| **4. Launch** (week 10) | Security review, load test, parent pilot (one class), go-live | School sign-off |
| **Later** | Student portal & LMS, alumni, franchise partner onboarding, native apps, AI assistant for parents | — |

Phases 0–1 can start immediately. Phases 2–3 are built against a **mock Eldermin API** that follows the spec, so the third party's timeline doesn't block us; we switch to the real API when it is ready.

---

## 7. What I need from you

| # | Item | Why | Blocking |
|---|---|---|---|
| 1 | **Railway account access** — invite to the Railway project, or an API token added through this session's secure credential form | To create staging and production | Phase 0 |
| 2 | **Network access** for this session to `thedeenwayschool.com` and Railway (I'll request it in the app) | To copy live content and deploy | Phase 0–1 |
| 3 | **Eldermin contact** — send them `ELDERMIN-INTEGRATION-SPEC.md`; get a sandbox URL and a test school slug | To connect admissions and the parent portal | Phase 2–3 |
| 4 | **Campus list** — name, address, phone, classes offered, principal | Campus pages and admissions | Phase 1 |
| 5 | **Fee structure** per campus/class for 2026–27 | Admissions and fees pages | Phase 2 |
| 6 | **Payment merchant accounts** — JazzCash, Easypaisa, card gateway (bank/PayFast/Safepay), 1Bill biller ID | Online payment | Phase 2 |
| 7 | **WhatsApp Business / SMS provider** (or approval to set one up) | Parent login codes and notifications | Phase 3 |
| 8 | **DNS access** for thedeenwayschool.com (where the domain is registered) | Staging subdomain and go-live | Phase 0 / 4 |
| 9 | **Photos & videos** beyond what's on the current site; leadership messages; testimonials | World-class content | Phase 1 |
| 10 | **Urdu and Arabic reviewer** at the school | Check translations before publishing | Phase 1 |
| 11 | **Privacy & safeguarding policy** owner | Parent data, photos of children, consent | Phase 3 |

---

## 8. Principles
- **Child safety and privacy first:** minimal data in the portal, everything sensitive stays in Eldermin; consent-aware media; audit logs.
- **One source of truth:** no copied student records drifting out of date.
- **Staff never need a developer** to change website text, news or notices.
- **Mobile-first:** most parents will use phones.
- **Honest states:** no fake data; clear empty and loading states everywhere.
