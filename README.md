# St. Jude Medical Center & Hospital Management System

A comprehensive, enterprise-grade healthcare platform and clinical hospital management ecosystem. The platform combines a public patient care portal with an advanced Electronic Health Record (EHR) and clinical operating system designed for healthcare professionals, administrators, and patients.

---

## 🏥 Platform Overview

St. Jude Medical Center is architected around two primary environments:

1. **Public Patient Portal & Health Gateway**: A patient-first web experience providing clinical specialty discovery, interactive symptom triage, online doctor scheduling, patient education, virtual care access, and visitor logistics.
2. **Clinical Hospital EMR / EHR Operating System**: A high-density clinical workstation for physicians, nurses, and hospital administrators to manage inpatient care, triage queues, telemetry monitoring, pharmacy fulfillment, medical billing, and multi-department operations.

---

## 🌟 Core Modules & Functionality

### 1. Public Patient Portal & Gateway

* **Emergency Care & Triage Status**: Live emergency room wait times, trauma bay capacity indicators, and immediate dispatch hotline routing.
* **Specialty Care Centers**: Interactive discovery of medical departments including the Cardiovascular Institute, Brain & Neurological Sciences, Comprehensive Cancer Center, Orthopedic & Joint Reconstruction, Children's & Neonatal Health, and Trauma Surgery.
* **Intelligent Clinical Symptom Checker**: Guided multi-step symptom assessment evaluating severity, symptom duration, urgency level, and specialty doctor recommendations.
* **Online Physician Directory & Booking**: Searchable catalog of hospital specialists with bios, credentials, patient ratings, available time slots, and multi-step consultation scheduling.
* **MyChart Patient Portal**: Secure patient care area featuring personal health summaries, scheduled consultations, telehealth video access, clinical lab results, and direct clinician messaging.
* **Patient Health Library & Research**: Clinically curated medical articles, preventive lifestyle guidance, research updates, and clinical trials information.
* **Visitor & Campus Logistics**: Comprehensive guide covering visiting hours by department, campus maps, parking guidelines, visitor passes, and amenities.

---

### 2. Clinical Operations & EMR Workspace

* **Clinical Dashboard & Ward Census**: Real-time hospital metrics monitoring emergency admissions, ICU bed occupancy, on-duty physicians, active surgical cases, and live trauma alerts.
* **Interactive Appointment Scheduler**:
  * **Monthly Calendar View**: 7-column monthly grid visualization displaying scheduled patient consultations color-coded by medical specialty.
  * **Date Inspector & Day Timeline**: Rapid inspection of daily appointment rosters with instant check-in, voiding, and slot creation.
  * **Multi-Format Scheduling**: In-person consultations and integrated telehealth appointments with fee tracking and claim statuses.
* **Inpatient Bed & Ward Management**: Real-time visualization of General Wards, Intensive Care Units (ICU), Cardiac Care (CCU), and Pediatric bays with occupancy status and rapid patient allocation.
* **Electronic Health Records (EHR) & Patient Directory**:
  * Searchable patient database filterable by name, blood type, status, admitting physician, and medical condition.
  * Detailed patient profiles containing vitals telemetry, allergy rosters, admission history, clinical timelines, and active treatment regimens.
* **Medical Prescriptions & Pharmacy Dispensary**:
  * Digital medication prescription engine with automated dosage and frequency selection.
  * Pharmacy inventory tracking with stock level meters and reorder triggers.
* **Diagnostic Labs & Radiology Center**: Comprehensive tracking of pathology tests, metabolic panels, ECG waveforms, MRI scans, and ultrasound imaging with status verification.
* **Hospital Medical Billing & Revenue Cycle**:
  * Itemized invoices, fee schedules, consultation billing, and real-time insurance claim adjudication (Approved, Pending, Denied).
  * Direct invoice generation, itemized service additions, and payment receipt processing.
* **Physician & Staff Roster**:
  * On-duty medical staff directory with specialty filters and direct paging.
  * Administrative controls to update physician duty status, manage shift schedules, and adjust consultation availability.
* **Clinical Analytics & Department Reports**:
  * Department patient load distribution charts, admission capacity trackers, and clinical volume trends.
* **Role-Based Access Control & System Telemetry**:
  * Role switcher supporting Doctor, Nurse, Receptionist, Administrator, and Public Patient modes.
  * System event log with live timestamped audit trails of triage actions, admissions, and prescription updates.

---

## 🎨 Design System & Accessibility

* **Adaptive Theming**: Full support for both a high-contrast Light Theme and an eye-safe Dark Slate Palette tailored for low-light clinical environments.
* **Medical Typography & Contrast**: Strict compliance with WCAG AA accessibility standards ensuring readability for critical medical data.
* **Responsive Architecture**: Fluid layouts scaling seamlessly from mobile viewports to ultra-wide multi-column clinical display monitors.
* **Micro-Interactions**: Smooth state transitions, non-disruptive toast alerts, and interactive tooltips for diagnostic data points.

---

## 💻 Technology Foundation

* **Frontend Framework**: React with TypeScript
* **Styling**: Tailwind CSS
* **Animations**: Motion (motion/react)
* **Iconography**: Lucide React
* **Data Visualization**: Handcrafted responsive SVG data graphics and charts
