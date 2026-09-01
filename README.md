# Universal Multi-Bank Defect Tracking & Daily Reporting Engine

An enterprise-grade software quality assurance (QA) and defect lifecycle management platform tailored for multi-client banking solutions, switching gateways, and financial applications.

Developed for **PT Sarana Pactindo**, this system eliminates communication bottlenecks between Quality Control (QC) and Software Engineering teams through strict state-machine governance, automated daily QA progress generation, real-time alerting, and banking-grade sensitive data masking (PCI-DSS compliance).

---

## Key Features & Modern UI/UX

- **Interactive Drag-and-Drop Kanban Board**: Real-time visual Kanban columns (`Open`, `Retesting`, `Re-open`, `Close`) with strict RBAC transition validation modals.
- **Enterprise Dark & Light Glassmorphism UI**: High-end banking theme with smooth color tokens, floating glass navigation bar, and instant quick role switcher.
- **Visual ISO 8583 Bit Inspector & Live Sanitizer**: Interactive parser for ISO 8583 banking messages (MTI, Bit 2 PAN, Bit 4 Amount, Bit 52 PIN) with PCI-DSS sensitive data masking validation.
- **Real-Time Live Notification Center & Audio Chime**: Server-Sent Events (SSE) `/api/notifications/stream` delivering instant alerts with synthesized Web Audio chimes under 2-second SLA.
- **Automated Daily QA Summary (FR-09)**: Real-time progress metric cards with 17:00 WIB daily cutoff aggregation.
- **One-Click Formal PDF Export (FR-10)**: Official PT Sarana Pactindo letterhead printable PDF template with executive summaries and audit approval signatures, as well as CSV/Excel exports.
- **Chronological Audit Trail (FR-05)**: Full history log tracking status changes, timestamps, reviewer notes, and test evidence.

---

## Technology Stack

- **Frontend & Full-Stack Core**: Next.js 14 (App Router, Server & Client Components, Server Actions)
- **UI & Animations**: React 18, TailwindCSS, Lucide Icons, Framer Motion
- **Database**: MySQL 5.7+ / 8.0+ / MariaDB (`utf8mb4_unicode_ci`) via `mysql2/promise` connection pool
- **Charts & Visualizations**: Chart.js & React-Chartjs-2
- **Real-Time Channel**: Server-Sent Events (SSE) `/api/notifications/stream`
- **Security & Masking**: Custom PCI-DSS regex engine for 16-digit PAN, CVV, and PIN blocks

---

## Directory Structure

```text
SISTEM-PKL/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with ThemeProvider, Navbar, and Toast
│   │   ├── page.tsx                  # Home redirect to /dashboard
│   │   ├── login/page.tsx            # Modern Enterprise Login with Demo Quick-Fill
│   │   ├── dashboard/page.tsx        # Real-time Metrics & Charts Dashboard
│   │   ├── defects/
│   │   │   ├── page.tsx              # Multi-bank Defect List & Search Filters
│   │   │   ├── kanban/page.tsx       # Interactive Drag-and-Drop Kanban Board
│   │   │   ├── create/page.tsx       # Universal Defect Input Form with Live Masking
│   │   │   └── [id]/page.tsx         # Ticket Detail, Audit Timeline & State Transition
│   │   ├── reports/
│   │   │   ├── daily/page.tsx        # Daily QA Summary (Cutoff 17:00)
│   │   │   └── pdf/page.tsx          # Formal PDF Printable Template Kop PT Sarana Pactindo
│   │   ├── tools/
│   │   │   └── iso8583/page.tsx      # Visual ISO 8583 Bit Inspector & Payload Sanitizer
│   │   └── api/
│   │       ├── auth/                 # Session login, logout, me, and quick switch endpoints
│   │       ├── clients/              # Bank hierarchy endpoints
│   │       ├── projects/             # Platform endpoints
│   │       ├── modules/              # Functional module endpoints
│   │       ├── defects/              # Defect CRUD, detail, and state machine transition API
│   │       ├── notifications/        # In-app notifications & SSE real-time stream
│   │       └── reports/              # Daily QA cutoff metrics & CSV export API
│   ├── components/
│   │   ├── Navbar.tsx                # Floating glass navbar with role switcher & notification bell
│   │   ├── KanbanBoard.tsx           # Drag and Drop Kanban columns & cards
│   │   ├── ThemeProvider.tsx         # Dark & Light mode switcher
│   │   ├── StatusBadge.tsx           # Glowing status pills
│   │   ├── SeverityBadge.tsx         # Severity indicator
│   │   ├── NotificationToast.tsx     # Animated Toast with Web Audio Chime
│   │   ├── IsoInspector.tsx          # ISO 8583 visual bit-parser component
│   │   └── Charts.tsx                # Dynamic dashboard graphs (Chart.js)
│   └── lib/
│       ├── db.ts                     # MySQL2 Connection Pool
│       ├── auth.ts                   # Session and RBAC helpers
│       └── security.ts               # PCI-DSS data masking & ISO 8583 bit parser
├── database/
│   ├── migrate.php                   # Database migration & seeder runner
│   ├── schema.sql                    # DDL schema definition (7 tables)
│   └── seeder.php                    # Realistic banking test datasets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.mjs
```

---

## Installation & Setup

### 1. Prerequisites

- Node.js 18.17+ or 20+ (Node v24 supported)
- MySQL / MariaDB Server (Port 3306, default `root` with empty password)
- Laragon, XAMPP, or Docker environment for MySQL

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/23Barajapu/defect-tracker.git
cd defect-tracker
npm install
```

### 3. Database Migration & Seeder

Ensure MySQL is running on `127.0.0.1:3306` (database `sistem_pkl_defect`). Run the automated migration:

```bash
php database/migrate.php
```

---

## Running the Application

### Development Mode (Recommended)

Start the Next.js development server:

```bash
npm run dev
```

Open your browser at:
```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## Demo Credentials (RBAC Matrix)

All demo accounts use password: `password123` (or click instant demo account buttons on the login screen):

| Role | Email | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Quality Control (QC)** | `qc@pactindo.com` | Report defects (`Open`), verify fixes (`Close`), flag failures (`Re-open`) |
| **Software Developer** | `dev@pactindo.com` | Analyze assigned issues, submit fixes & build notes (`Retesting`) |
| **Technical Lead** | `lead@pactindo.com` | Reassign PIC Developer, state override, SLA monitoring |
| **Project Manager** | `pm@pactindo.com` | Executive overview, multi-bank health audit, formal PDF/Excel report export |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
