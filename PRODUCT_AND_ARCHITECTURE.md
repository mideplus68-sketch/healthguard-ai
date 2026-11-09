# HealthGuard AI — prototype scope and architecture

## Product goal

Help individuals and families keep a structured record of symptoms, basic measurements, and laboratory-reported malaria test results, and make it easier to recognize when to seek qualified care. Malaria is the first use case; expansion to other conditions is out of scope for this prototype.

## Prototype scope

**Included:** email/password account sign-in when Supabase is configured; adult/child profiles; a malaria-focused symptom questionnaire; fixed, clinician-review-pending warning-sign copy; manual temperature and note logging; manual entry of laboratory-reported RDT/microscopy result, lab name and date; profile-scoped history; owner-only cloud sync; local demo mode when Supabase is not configured; explanatory content that says symptoms cannot confirm malaria; local demo clinician review screen; responsive Expo web preview and native Expo app.

**Excluded:** patient-to-clinician sharing, live laboratory interfaces, medical device connectivity, automated image/sample reading, risk scoring, diagnosis, treatment advice, medication dosing, facility directory, push alerts, billing, and multi-condition rules.

## Architecture

```text
Expo React Native app (iOS / Android / web preview)
  ├── Supabase Auth email/password sign-in (optional local demo mode)
  ├── family profile and screen state
  ├── transparent, fixed safety and explanation copy
  └── Supabase JS client → Postgres tables protected by owner-only RLS
      ├── profiles
      ├── measurements
      ├── symptom_checkins
      └── lab_results

Future production boundary (not implemented)
  Mobile app ── reviewed access/service layer ── clinical workflow and audit systems
                 ├── consent and guardian permissions
                 ├── clinician workspace and review queues
                 └── laboratory partner adapters
```

The “AI” name is a product name only in this prototype. Explanations are fixed product copy, not generated clinical advice. Supabase provides an early authenticated owner-only record store; the clinician screen remains local and does not read cloud records. The configured project's primary region is Central EU (Frankfurt), selected at the user's request. No production privacy, security, clinical validation, or regulatory claim is made. Review identity, guardian/consent rules, audit, retention, deletion/export, incident response, data residency and applicable Nigerian obligations before any real patient data or deployment. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for setup details.

## Data model direction for a secured backend

- `User`: authenticated account, contact and consent state.
- `PersonProfile`: owner, display name, date/approximate age, guardian relationship; avoid collecting unnecessary identifiers.
- `SymptomCheckIn`: profile, timestamp, questionnaire version, user-selected responses, fixed safety message shown.
- `Measurement`: profile, type, value, unit, observed time, optional device/source and note.
- `LabResult`: profile, test type, reported result, laboratory identity, test time, report reference, verifier/provenance.
- `ClinicianReview`: authorized clinician, reviewed item, disposition, timestamp and audit metadata.

Use explicit consent and role-based access; encrypt transport and stored sensitive data; minimize retention; keep access and clinical edits auditable; separate a caregiver's identity from a child's profile. Define deletion/export, incident response, backups, and key management before collecting real health data. Do not store report images until privacy, retention, and secure file handling are designed.

## Safety and clinical assumptions to validate

1. Symptoms and temperature are not sufficient to confirm malaria. The app records information and directs users to qualified care/testing; it does not make a diagnosis or treatment recommendation.
2. A clinician and local health authority must review every red-flag phrase, pathway, age-specific caveat, and escalation destination before any pilot. The current fixed warning list and urgent message are illustrative prototype content, not an approved triage protocol.
3. A laboratory partner must define accepted RDT/microscopy methods, quality assurance, result provenance, correction process, turnaround expectations, and escalation for inconclusive results.
4. Define inclusion/exclusion criteria, guardian consent and child assent where applicable, language/localization, accessibility, and low-connectivity behavior with local clinical and community reviewers.
5. Determine Nigerian data-protection, health-product, and medical-device obligations with qualified privacy/regulatory counsel and relevant authorities before a public or clinical deployment. No regulatory status is asserted here.
6. No clinical validation or usability study has been completed. Any future evaluation needs a prospective protocol, ethics review as applicable, predefined endpoints, and comparison against quality-assured reference testing.

## Execution plan

1. **Prototype (this build):** implement the end-to-end user journey, optional owner-only Supabase sync, and local demo review view; gather non-clinical workflow feedback using synthetic data.
2. **Clinical and privacy review:** appoint clinical owner, review local pathways, consent, data minimization, threat model, retention, and regulatory classification.
3. **Workflow validation:** test with clinicians, caregivers and laboratory staff using synthetic or properly consented research data; revise copy and navigation.
4. **Secure pilot foundation:** complete a security/privacy review of the prototype backend, then implement guardian/profile permissions, consent, audit, deletion/export, monitoring and incident response; build governed clinician access and partner interfaces.
5. **Clinical validation and approvals:** obtain required ethics and regulatory determinations; validate safety and workflow performance against the approved protocol before any claims or wider access.
6. **Controlled pilot:** limited, supervised deployment with trained partner sites, incident monitoring and predefined stop criteria. Consider business model and expansion only after safety, workflow and willingness-to-pay evidence.

## Business model hypotheses (not validated)

Explore B2C family plans only after safe operations and privacy are in place; explore B2B2C clinic/laboratory partnerships where organizations sponsor access and receive workflow tools. Interview households, labs and clinics first. Do not monetize or share identifiable health records for advertising.

