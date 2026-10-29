# UniVerse — Design System & UI Specification

## 1. Visual Philosophy & Purpose

UniVerse is designed as a **mission-critical university enterprise operations dashboard**, inspired directly by modern high-density administrative platforms. It provides campus stakeholders (students, peer mentors, transit dispatchers, green compute engineers, and academic proctors) with a structured, legible, and actionable workspace.

### Design Principles:
1. **Information Density with Clean Separation:** Every pixel serves a function. Data is presented in modular white cards against a soft, glare-free light background.
2. **Subtle Elevation & Contrast:** Restrained borders (`#E2E8F0`) and soft shadows replace heavy gradients or floating 3D elements.
3. **Intentional Semantic Coloring:** Vibrant colors are reserved strictly for status communication, metrics, and targeted call-to-actions.
4. **Honest Data Presentation:** Estimated values (carbon emissions, travel detours, CV confidence scores) are explicitly marked with confidence badges and methodology tooltips.

---

## 2. Color Palette & Design Tokens

### 2.1 Surfaces & Backgrounds
| Token Name | Hex Code | Tailwind Class | Application |
|---|---|---|---|
| `surface-canvas` | `#F8FAFC` | `bg-slate-50` | Primary application canvas background |
| `surface-card` | `#FFFFFF` | `bg-white` | Content cards, tables, modal containers |
| `surface-sidebar` | `#FFFFFF` / `#F8FAFC` | `bg-white` | Persistent left navigation panel |
| `surface-subtle` | `#F1F5F9` | `bg-slate-100` | Input backgrounds, table headers, chip backgrounds |
| `surface-border` | `#E2E8F0` | `border-slate-200` | Card borders, dividing rules, table borders |
| `surface-border-subtle` | `#F1F5F9` | `border-slate-100` | Light dividers within list items |

### 2.2 Typography & Neutral Text
| Token Name | Hex Code | Tailwind Class | Application |
|---|---|---|---|
| `text-primary` | `#0F172A` | `text-slate-900` | Primary headings, prominent metric values, table titles |
| `text-secondary` | `#334155` | `text-slate-700` | Body text, table contents, navigation labels |
| `text-muted` | `#64748B` | `text-slate-500` | Captions, timestamps, secondary metrics, form labels |
| `text-subtle` | `#94A3B8` | `text-slate-400` | Placeholder text, disabled actions, minor breadcrumbs |

### 2.3 Brand & Action Colors
| Token Name | Hex Code | Tailwind Class | Application |
|---|---|---|---|
| `brand-blue` | `#2563EB` | `bg-blue-600` | Primary action buttons, active navigation states, primary charts |
| `brand-blue-hover` | `#1D4ED8` | `hover:bg-blue-700` | Button hover states |
| `brand-blue-light` | `#EFF6FF` | `bg-blue-50` | Selected navigation pill, active tab highlights |
| `brand-navy` | `#1E293B` | `text-slate-800` | Brand typography, prominent badges |

### 2.4 Semantic & Sustainability Status Accents
| State | Badge BG | Text Color | Border Color | Typical Context |
|---|---|---|---|---|
| **Eco / Sustainable** | `#ECFDF5` (`bg-emerald-50`) | `#047857` (`text-emerald-700`) | `#A7F3D0` (`border-emerald-200`) | Green computing savings, pool matching, eco routes |
| **Success / Approved** | `#F0FDF4` (`bg-green-50`) | `#15803D` (`text-green-700`) | `#BBF7D0` (`border-green-200`) | Completed sessions, approved rides, verified scores |
| **Pending / In Review** | `#FFFBEB` (`bg-amber-50`) | `#B45309` (`text-amber-700`) | `#FDE68A` (`border-amber-200`) | Pending mentor requests, active detour calculation |
| **Flagged / Incident** | `#FEF2F2` (`bg-rose-50`) | `#B91C1C` (`text-rose-700`) | `#FECACA` (`border-rose-200`) | Exam posture alerts (for human review), high server load |
| **Info / Neutral** | `#F1F5F9` (`bg-slate-100`) | `#475569` (`text-slate-600`) | `#E2E8F0` (`border-slate-200`) | Inactive states, informational labels |

---

## 3. Typography Scale

Font family: **Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif**.

| Level | Size / Line-Height | Weight | Tracking | Usage |
|---|---|---|---|---|
| Display | 28px / 36px (`text-2xl`) | Bold (700) | `-0.02em` | Main dashboard greeting, key summary statistics |
| Section Title | 18px / 24px (`text-lg`) | Semibold (600) | `-0.01em` | Card titles ("Staff applications card", "Recent Incidents") |
| Subsection | 14px / 20px (`text-sm`) | Semibold (600) | `0em` | Table headers, modal headings, metric labels |
| Body | 14px / 20px (`text-sm`) | Regular (400) | `0em` | Table body cells, descriptions, form input text |
| Caption / Micro | 12px / 16px (`text-xs`) | Medium (500) | `+0.01em` | Delta tags (`↑ 12% vs last term`), timestamps, pills |

---

## 4. Layout & Structural Wireframe

The interface mirrors the **compact enterprise layout** from the reference:

```
+----------------------------------------------------------------------------------------------------+
|  UniVerse Logo  |  Welcome, Alex Rivera!                    [ Term: Fall 2026 v ] [Filter] [Export]| [Profile]  |
|  (Left Sidebar) |  Today is Thursday, 29th October 2026                                            |            |
+-----------------+----------------------------------------------------------------------------------+------------+
|  [#] Overview   |  +---------------+  +---------------+  +---------------+  +---------------+      |
|  [A] Hub        |  | Metric KPI 1  |  | Metric KPI 2  |  | Metric KPI 3  |  | Metric KPI 4  |      |
|  [B] Rides      |  | 1,280 Resrcs  |  | 84% Pool Rate |  | 3.42 kWh Saved|  | 0 Misconduct  |      |
|  [C] Eco-Cloud  |  | +12% this wk  |  | 34 kg CO2 off |  | Energy Est.   |  | 4 In Review   |      |
|  [D] Wellbeing  |  +---------------+  +---------------+  +---------------+  +---------------+      |
|  [E] Exam Proctor|                                                                                 |
|                 |  +-----------------------------+  +--------------------------------------------+  |
|                 |  | Card 1: Concentric Doughnut |  | Card 2: Workload Energy / Commute Trends   |  |
|  ---------------|  | Status Breakdown Ring       |  | Stacked Column Comparison                  |  |
|  Role Switcher  |  +-----------------------------+  +--------------------------------------------+  |
|  [ Student v ]  |                                                                                  |
|  System Status  |  +-----------------------------------------------------------------------------+  |
|  99.8% Green    |  | Card 3: Enterprise Data Table                                              |  |
|                 |  | S/N | Item / Route / Session | Context / Metric | Timestamp | Status Badge   |  |
+-----------------+----------------------------------------------------------------------------------+
```

### 4.1 Layout Dimensions
- **Left Sidebar**: 250px fixed width, full height (`min-h-screen`), border-r `border-slate-200`. Collapsible on smaller viewports.
- **Top Navigation Bar**: 64px fixed height, border-b `border-slate-200`, sticky top positioning.
- **Main Container**: Fluid width with `max-w-7xl` or full-bleed `p-6` padding, `space-y-6`.
- **Card Containers**:
  - Background: `#FFFFFF`
  - Border: `1px solid #E2E8F0`
  - Border Radius: `rounded-xl` (12px)
  - Shadow: `shadow-sm` (0 1px 2px 0 rgb(0 0 0 / 0.05))
  - Padding: `p-5` or `p-6`

---

## 5. Component Standards

### 5.1 KPI Summary Cards (Reference Top Row)
- Rounded icon badge container (size 40x40px, rounded-lg) with background matching the category (Blue, Emerald, Orange, Purple).
- Large numeric metric: `text-2xl font-bold text-slate-900`.
- Metric description: `text-xs font-medium text-slate-500 uppercase tracking-wider`.
- Footer indicator: Delta pill with Lucide arrow icon (`↑ 12% vs last term` in green, or `✓ Verified Model` in blue).

### 5.2 Card Header Pattern
- Left: Title `text-base font-semibold text-slate-900` + optional subtitle `text-xs text-slate-500`.
- Right: Action slot (three-dot menu `<MoreVertical />`, tab pills, or date filter dropdown).

### 5.3 Data Tables (Reference Bottom Row)
- Header: `bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider uppercase border-b border-slate-200 py-3 px-4`.
- Rows: `hover:bg-slate-50/70 border-b border-slate-100 py-3 px-4 text-sm text-slate-700`.
- S/N Column: Mono or light grey index (`01`, `02`, `03`).
- Status Column: Rounded pill badge with colored indicator dot or pastel background.

### 5.4 Control Elements
- Primary Button: `bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors`.
- Secondary Button: `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium px-3 py-2 rounded-lg`.
- Filter & Export: Outlined compact button matching reference top bar (`[Filter] [Export]`).

---

## 6. Strict Anti-Patterns (Explicitly Forbidden)

❌ **Forbidden:**
- Marketing website hero sections with large marketing slogans or sign-up CTAs.
- Deep purple/violet mesh gradient backgrounds.
- High-intensity glassmorphism with heavy backdrop blur obscuring data tables.
- Floating 3D emoji icons instead of clean SVGs (Lucide React).
- Arbitrary uncalibrated dark mode that reduces data table contrast.
- Automatic, irreversible disciplinary decisions in the exam monitoring module.
- Hidden or irreversible data harvesting in the digital wellbeing module.
