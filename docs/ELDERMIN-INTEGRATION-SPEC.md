# Eldermin ↔ Deenway Portal — Integration Spec v0.1

**For:** the Eldermin development team · **From:** The Deenway School · **Date:** 25 November 2026
**Status:** draft for review. Please comment on anything that conflicts with how Eldermin works today.

## 1. Purpose

The Deenway School is building a public website, parent portal and online admissions app ("the Portal"). **Eldermin remains the single source of truth** for students, guardians, attendance, results, fees and admissions. The Portal calls Eldermin's API in real time. This document lists the endpoints and behaviour the Portal needs.

## 2. General requirements

| Item | Requirement |
|---|---|
| Environments | A **sandbox** (test data, separate database) and **production**. Sandbox URL + a test school slug needed first. |
| Transport | HTTPS only, JSON, UTF-8 (Urdu/Arabic names must round-trip). |
| Tenancy | Every request carries `x-school-slug`. Responses must only ever contain that tenant's data. A token for tenant A with slug B must be rejected (403). |
| Service authentication | The Portal server authenticates with a **service API key per tenant** (`Authorization: Bearer <key>`), scoped to the endpoints below only. Keys can be rotated and revoked. |
| Acting on behalf of a guardian | Parent-facing calls include `x-guardian-id: <eldermin guardian id>`. Eldermin must only return data for students linked to that guardian. |
| Versioning | Prefix `/integration/v1/`. Breaking changes go to `v2`, with 60 days' notice. |
| Pagination | `?page=&limit=` (max 100), response `{ data: [], page, limit, total }`. |
| Dates | ISO 8601 with time zone (`2026-12-19T18:00:00+05:00`). |
| Money | Integer **minor units** + currency: `{ "amount": 300000, "currency": "PKR" }` = PKR 3,000. |
| Errors | `{ "error": { "code": "STUDENT_NOT_FOUND", "message": "…" } }` with correct HTTP status. |
| Rate limits | At least 20 requests/second per tenant. Return `429` with `Retry-After`. |
| Idempotency | All `POST` endpoints accept an `Idempotency-Key` header; repeating a request with the same key must not create duplicates. |
| Webhooks | Eldermin calls the Portal on the events in section 6, signed with HMAC-SHA256 (`x-eldermin-signature`). |
| Audit | Eldermin logs every integration call (who, tenant, endpoint, time). |

## 3. Guardian identity (parent login)

The Portal handles parent login itself (phone + one-time code). It needs to link a verified phone/email to a guardian in Eldermin.

| Method & path | Purpose |
|---|---|
| `POST /integration/v1/guardians/lookup` | Body `{ phone? , email? , cnic? }` → `{ guardianId, name, students: [ { studentId, name, campusId, class, section } ] }` or 404. Exact match only. |
| `GET /integration/v1/guardians/{guardianId}` | Guardian profile: names, phones, emails, address, preferred language, authorised collectors. |
| `PATCH /integration/v1/guardians/{guardianId}` | Guardian may update phone, email, address, preferred language. Changes logged. |

## 4. Parent portal data (all require `x-guardian-id`)

| Method & path | Returns |
|---|---|
| `GET /integration/v1/students/{studentId}` | Profile: name (EN + native script), photo URL (signed, short-lived), campus, class, section, roll no., class teacher. |
| `GET /integration/v1/students/{studentId}/attendance?from=&to=` | Daily records `{ date, status: present/absent/late/leave/holiday, note }` + summary %. |
| `POST /integration/v1/students/{studentId}/leave-requests` | Guardian submits leave `{ from, to, reason }` → request id, status. |
| `GET /integration/v1/students/{studentId}/timetable` | Weekly timetable. |
| `GET /integration/v1/students/{studentId}/homework?from=&to=` | Homework items with subject, due date, attachments. |
| `GET /integration/v1/students/{studentId}/assessments?term=` | Published results only (not drafts). |
| `GET /integration/v1/students/{studentId}/report-cards` | List + signed PDF URL per report card. |
| `GET /integration/v1/students/{studentId}/behaviour?shared=true` | Only notes the school has marked "shared with parents". |
| `GET /integration/v1/students/{studentId}/invoices?status=` | Fee invoices `{ invoiceId, period, items[], amount, dueDate, status, voucherNo, 1billId? }`. |
| `GET /integration/v1/invoices/{invoiceId}/voucher.pdf` | Printable bank voucher. |
| `GET /integration/v1/announcements?campusId=&classId=` | Notices targeted at the guardian's campuses/classes. |
| `GET /integration/v1/events?from=&to=` | School calendar. |
| `GET /integration/v1/messages` / `POST /integration/v1/messages` | Guardian ↔ class-teacher messaging thread (if Eldermin supports it; otherwise Phase 2). |

## 5. Payments

The Portal runs the payment gateways (JazzCash, Easypaisa, card, 1Bill) and confirms each successful payment to Eldermin.

| Method & path | Purpose |
|---|---|
| `POST /integration/v1/payments` | Body `{ invoiceId, amount, currency, method: "jazzcash"/"easypaisa"/"card"/"1bill", gatewayRef, paidAt }` + `Idempotency-Key` = gatewayRef. Eldermin marks the invoice paid/part-paid and returns `{ receiptNo, receiptUrl }`. Must reject if the amount exceeds the outstanding balance. |
| `GET /integration/v1/payments?from=&to=` | For daily reconciliation between the Portal and Eldermin Finance. |

**1Bill:** if Eldermin already generates 1Bill consumer IDs, expose them on invoices; otherwise the Portal will register invoices with the 1Bill aggregator and post payments back via the endpoint above.

## 6. Admissions

The Portal collects applications; Eldermin's Admission Life Cycle module manages them.

| Method & path | Purpose |
|---|---|
| `GET /integration/v1/admissions/config` | **Public (service key only, no guardian).** Campuses, classes open for admission, age cut-offs, required documents, fees, assessment slots. |
| `POST /integration/v1/admissions/applications` | Submit a completed application (student, guardians, previous school, medical/support notes, document URLs, payment ref) → `{ applicationId, applicationNo, status }`. |
| `GET /integration/v1/admissions/applications/{applicationId}` | Status + timeline + any messages for the applicant. |
| `POST /integration/v1/admissions/applications/{applicationId}/documents` | Upload an extra document requested by staff. |
| `POST /integration/v1/admissions/applications/{applicationId}/assessment-booking` | Book an assessment slot. |

Status values: `submitted`, `under_review`, `documents_requested`, `assessment_booked`, `assessed`, `offered`, `offer_accepted`, `waitlisted`, `rejected`, `enrolled`, `withdrawn`.
On `enrolled`, Eldermin creates the student and guardian records and returns their IDs (via webhook), so the applicant's Portal account becomes a parent account.

## 7. Webhooks (Eldermin → Portal)

`POST https://<portal>/api/webhooks/eldermin` with header `x-eldermin-signature: sha256=<hmac of raw body>`. Retry with back-off for 24 h on non-2xx.

| Event | Payload essentials |
|---|---|
| `admission.status_changed` | applicationId, oldStatus, newStatus, note |
| `admission.enrolled` | applicationId, studentId, guardianIds[] |
| `invoice.created` / `invoice.updated` | invoiceId, studentId, amount, dueDate, status |
| `attendance.absent` | studentId, date (so the Portal can notify parents) |
| `announcement.published` | announcementId, campusIds[], classIds[] |
| `result.published` | studentId, term |
| `guardian.updated` / `student.updated` | id, changed fields |

## 8. Security & privacy checklist

- [ ] Service keys are per tenant, stored hashed, revocable, and limited to `/integration/v1/*`.
- [ ] `x-guardian-id` is enforced on every parent-facing endpoint: a guardian can never read another family's student.
- [ ] Cross-tenant test: key for tenant A + slug B → 403, no data.
- [ ] Photo and document URLs are signed and expire (≤ 15 minutes).
- [ ] Medical and safeguarding fields are **never** returned to the Portal unless explicitly listed above.
- [ ] Behaviour notes default to *not shared* with parents.
- [ ] All integration calls are logged; logs retained ≥ 1 year.
- [ ] Sandbox contains no real student data.

## 9. Delivery order requested

1. Sandbox + service key + `admissions/config` + `admissions/applications` (unblocks online admissions)
2. `guardians/lookup`, students, invoices, `payments` (unblocks parent login and fee payment)
3. Attendance, assessments, report cards, announcements, webhooks
4. Homework, timetable, behaviour, messaging

## 10. Questions for the Eldermin team

1. Does Eldermin already have a Parent role and guardian–student links we can rely on?
2. How far along is the Admission Life Cycle module, and does it have a public application intake?
3. Does Finance already generate bank vouchers or 1Bill IDs?
4. Can you provide an OpenAPI (Swagger) file for the integration endpoints?
5. Expected dates for the sandbox and each delivery step above?
