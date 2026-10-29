# UniVerse — Privacy Engineering & Responsible AI Framework

This document outlines the strict ethical safeguards, data minimization principles, non-punitive architecture, and human-in-the-loop governance implemented across UniVerse.

---

## 1. Ethical Foundation: The Non-Punitive Safeguard

### Presumption of Student Integrity
UniVerse operates under an immutable architectural policy:
> **Automated computer vision signals, geometric zone intrusions, and behavioral cues are preliminary indicators for human invigilator review—NEVER proof of academic dishonesty.**

### Why Event Flags Are Not Misconduct
1. **Benign Physical Realities**: In an examination hall, students routinely:
   - Drop a pen, eraser, or identity card and reach down to retrieve it.
   - Turn their head to consult an analog wall clock or look toward an invigilator delivering additional question paper supplements.
   - Adjust their physical posture, stretch their neck, or rub fatigued eyes during a 3-hour examination.
2. **Camera Sensor Inaccuracies**:
   - Monocular webcams lack true 3D depth perception; perspective distortion can make an object resting on a legal area appear to overlap a restricted zone.
   - Ambient lighting changes (e.g. passing clouds or overhead fluorescent flicker) can cause momentary tracking jitter.
3. **Architectural Enforcement**:
   - The UniVerse codebase contains **zero** endpoints or logic that automatically deduct grades, issue warnings to students, or disqualify an exam attempt.
   - Every flagged cue is routed to the `exam_incidents` queue in `pending_review` status and requires explicit human invigilator investigation before any determination is reached.

---

## 2. Information Deliberately Not Collected (Data Minimization)

Under the privacy-by-design framework, the application deliberately excludes intrusive surveillance data:

| Sensitive Category | UniVerse Handling Policy | Technical Enforcement |
| :--- | :--- | :--- |
| **Raw Browsing History** | **NEVER collected or transmitted** to the server. | Only anonymous domain categorizations evaluated client-side or statelessly. |
| **Full URL Paths & Query Strings** | **NEVER collected**. | URL parsing strips paths (`/repo/issues`), search queries (`?q=secret`), and fragments. |
| **Keystroke Logging & Page Content** | **NEVER collected**. | Zero keylogging listeners or DOM screen scrapers. |
| **Authentication Credentials** | **NEVER collected**. | No password capturing; simulation personas used for evaluation demo. |
| **Examination Video Recordings** | **NEVER uploaded to cloud servers**. | Local HTML5 video feed runs in volatile browser memory; zero video frames persisted on disk. |

---

## 3. Data Sovereignty & User Consent (Digital Wellbeing)

### Client-Side Sovereignty
- In Module D (Digital Wellbeing), all granular browsing events remain strictly within the user's local browser storage.
- When an aggregate session is saved, only high-level numerical summaries (e.g. active duration, pause seconds, context switches) are sent to the local backend.
- Detailed domain dwell lists are omitted from the server-side shared feed.

### Unconditional Permanent Deletion
- Students have immediate access to an interactive raw JSON inspector to view exactly what metrics the platform calculates.
- Students can trigger an immediate, permanent purge via `DELETE /api/wellbeing/purge`, which executes:
  ```sql
  DELETE FROM wellbeing_sessions;
  ```
- This permanently removes all historical records with zero retention backups.

---

## 4. Computer Vision Limitations & Mitigation Matrix

| Potential Failure Mode | Root Cause | System Safeguard & Mitigation |
| :--- | :--- | :--- |
| **False Positive: Incidental Head Turning** | Student looks at wall clock or stretching. | **Rule 1 (Temporal Sliding Window)**: Isolated movements are ignored; requires $\ge 3$ occurrences in 30 seconds to alert proctor. |
| **False Positive: Lighting/Shadow Shift** | Fluorescent lamp cycling creates false motion. | **Proctor Note Review**: Invigilators verify video context before confirming an incident. |
| **False Negative: Obscured Hand Motion** | Peripheral vision angle outside webcam FOV. | **Physical Invigilation Role**: System explicitly states that CV is a secondary aid and cannot replace human room proctors. |
| **Perspective Distortion** | 2D bounding box projection flattens 3D space. | **Intersection-over-Union (IoU) Thresholding**: Requires substantial bounding box intersection ($> 0.15\text{ IoU}$) rather than point touching. |

---

## 5. Immutable Proctor Audit Ledger

To prevent arbitrary, biased, or undocumented decisions by human invigilators:
1. Every proctor interaction with an incident requires a typed justification note.
2. The system atomically inserts a record into the `exam_audit_log` table:
   - `incident_id`: Unique identifier of the evaluated event.
   - `action`: State transition (e.g. `dismissal`, `resolution`, `status_change`).
   - `actor_role`: Full name and title of the certified reviewer.
   - `previous_status` $\to$ `new_status`.
   - `notes`: Full proctor justification text.
   - `timestamp`: Chronological wall-clock timestamp.
3. This audit trail is **append-only** and permanently available for student contestation and academic integrity committees.
