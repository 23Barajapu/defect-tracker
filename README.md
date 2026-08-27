# Universal Multi-Bank Defect Tracking & Daily Reporting Engine

An enterprise-grade software quality assurance (QA) and defect lifecycle management platform tailored for multi-client banking solutions, switching gateways, and financial applications.

Developed for **PT Sarana Pactindo**, this system eliminates communication bottlenecks between Quality Control (QC) and Software Engineering teams through strict state-machine governance, automated daily QA progress generation, and banking-grade sensitive data masking (PCI-DSS compliance).

---

## Key Features

- **Multi-Bank Client Hierarchy & Data Isolation**: Segregate defect tracking across institutions (e.g., Bank BJB, Bank Jatim, Bank DKI, Bank Sulselbar), platforms (*Mobile Banking*, *QRIS Engine*, *Switching Host*, *Backoffice*), and functional modules.
- **Strict 4-Stage State Machine & RBAC**:
  - `Open`: Reported by QC with steps to reproduce and payload logs.
  - `Retesting`: Transitioned only by Developers upon deploying fixes (requires build number, commit hash, and fixing notes).
  - `Re-open`: Triggered by QC upon verification failure/regression (auto-increments `reopen_count`).
  - `Close`: Verified and closed by QC/Management.
- **Automated Data Masking (PCI-DSS Ready)**: Automatic regex sanitization of Primary Account Numbers (PAN 16-digit masked to `411111******1111`), CVV/CVC, PIN blocks, and confidential tokens within ISO 8583 logs and JSON payloads.
- **Bidirectional Real-Time Notifications**: Server-Sent Events (SSE) push channel delivering in-app status change alerts and audio cues with under 2-second latency.
- **Automated Daily QA Summary (FR-09)**: Real-time progress metric cards and 17:00 WIB daily cutoff aggregation.
- **One-Click Formal Export (FR-10)**: Instant export to official PT Sarana Pactindo letterhead PDF with executive summaries and audit approval signatures, as well as CSV/Excel exports.
- **Chronological Audit Trail (FR-05)**: Full history log tracking status changes, timestamps, reviewer notes, and test evidence.

---

## Technology Stack

- **Backend**: Native PHP 8.1+ (Modular REST API & Page Router, Singleton PDO Database Handler, Session RBAC)
- **Database**: MySQL 5.7+ / 8.0+ / MariaDB (`utf8mb4_unicode_ci`)
- **Frontend**: Modern Vanilla HTML5 / CSS3 / JavaScript (Glassmorphism UI, Chart.js Visualizations)
- **Real-Time Channel**: Server-Sent Events (SSE) `/api/stream`
- **Architecture**: Zero-bloat, lightweight, high-performance architecture with sub-millisecond execution overhead.

---

## Directory Structure

```text
SISTEM-PKL/
├── app/
│   ├── Controllers/
│   │   ├── AuthController.php          # Session auth & quick role switcher
│   │   ├── ClientController.php        # Multi-bank hierarchy endpoints
│   │   ├── DefectController.php        # State machine validator & CRUD
│   │   ├── NotificationController.php  # In-app notifications & SSE stream
│   │   └── ReportController.php        # Analytics & PDF/CSV export engine
│   └── Core/
│       ├── Auth.php                    # Role-based access control (RBAC)
│       ├── Router.php                  # Request dispatcher
│       └── Security.php                # PCI-DSS sensitive data masking
├── config/
│   └── database.php                    # Singleton PDO connection
├── database/
│   ├── migrate.php                     # Database migration runner
│   ├── schema.sql                      # DDL schema definition (7 tables)
│   └── seeder.php                      # Realistic banking test datasets
├── public/
│   ├── assets/
│   │   ├── css/style.css               # Design system
│   │   └── js/app.js                   # Real-time SSE subscriber & UI logic
│   ├── uploads/                        # Evidence attachment storage
│   └── index.php                       # Application entry point
├── tests/
│   └── test_system.php                 # Automated verification test suite
└── views/
    ├── auth/                           # Login view
    ├── dashboard/                      # Real-time metric cards & charts
    ├── defects/                        # Form, list, and detail views
    ├── layout/                         # Header & footer navigation layouts
    └── reports/                        # Daily QA report & printable PDF template
```

---

## Installation & Setup

### 1. Prerequisites

- PHP 8.1 or higher (with `pdo_mysql`, `mbstring`, `json`, `curl` extensions enabled)
- MySQL / MariaDB Server (Port 3306)
- Apache Web Server (with `mod_rewrite` enabled)
- Laragon, XAMPP, or Docker environment

### 2. Clone Repository

```bash
git clone https://github.com/23Barajapu/defect-tracker.git
cd defect-tracker
```

### 3. Database Configuration & Migration

Ensure MySQL is running on `127.0.0.1:3306` (default credentials `root` with empty password). To adjust credentials, edit `config/database.php`.

Run the automated migration and seed runner:

```bash
php database/migrate.php
```

### 4. Web Server Routing

- **Laragon / Local Apache**: Point document root to the project directory or access directly via `http://localhost/SISTEM-PKL/public/` (or `http://sistem-pkl.test/`).

---

## Demo Credentials (RBAC Matrix)

All demo accounts use password: `password123`

| Role | Email | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Quality Control (QC)** | `qc@pactindo.com` | Report defects (`Open`), verify fixes (`Close`), flag failures (`Re-open`) |
| **Software Developer** | `dev@pactindo.com` | Analyze assigned issues, submit fixes & build notes (`Retesting`) |
| **Technical Lead** | `lead@pactindo.com` | Reassign PIC Developer, state override, SLA monitoring |
| **Project Manager** | `pm@pactindo.com` | Executive overview, multi-bank health audit, formal PDF/Excel report export |

---

## Quality Assurance & Automated Testing

Execute the automated test suite covering database integrity, state transitions, and sensitive data masking:

```bash
php tests/test_system.php
```

Sample output:

```text
=== STARTING AUTOMATED VERIFICATION ===
 [PASS] Database Connection OK
 [PASS] Table 'clients' exists
 [PASS] Table 'projects' exists
 [PASS] Table 'modules' exists
 [PASS] Table 'users' exists
 [PASS] Table 'defects' exists
 [PASS] Table 'defect_activities' exists
 [PASS] Table 'notifications' exists
 [PASS] PAN is masked (first 6 & last 4 preserved)
 [PASS] CVV is masked
 [PASS] PIN is masked
 [PASS] Amount remains unmasked
 [PASS] Raw standalone PAN masked
 [PASS] Open defects counted properly
 [PASS] Audit trail activities logged

=== VERIFICATION RESULT: 15 PASSED, 0 FAILED ===
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
