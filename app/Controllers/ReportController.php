<?php
require_once __DIR__ . '/../Core/Auth.php';
require_once __DIR__ . '/../../config/database.php';

use Auth as AuthClass;
use Database as DatabaseClass;

class ReportController {
    public function dashboard(): void {
        AuthClass::requireAuth();
        $db = DatabaseClass::getInstance()->getConnection();
        $today = date('Y-m-d');

        // FR-08: Ringkasan Metrik Harian
        // 1. New Open Today
        $stmt = $db->prepare("SELECT COUNT(*) FROM defects WHERE DATE(created_at) = ?");
        $stmt->execute([$today]);
        $newOpenToday = (int)$stmt->fetchColumn();

        // 2. Ready for Retest (Status Retesting)
        $stmt = $db->query("SELECT COUNT(*) FROM defects WHERE status = 'Retesting'");
        $readyForRetest = (int)$stmt->fetchColumn();

        // 3. Re-opened Today
        $stmt = $db->prepare("SELECT COUNT(*) FROM defect_activities WHERE to_status = 'Re-open' AND DATE(created_at) = ?");
        $stmt->execute([$today]);
        $reopenedToday = (int)$stmt->fetchColumn();

        // 4. Closed Today
        $stmt = $db->prepare("SELECT COUNT(*) FROM defect_activities WHERE to_status = 'Close' AND DATE(created_at) = ?");
        $stmt->execute([$today]);
        $closedToday = (int)$stmt->fetchColumn();

        // 5. Total Outstanding Defect (Open + Retesting + Re-open)
        $stmt = $db->query("SELECT COUNT(*) FROM defects WHERE status IN ('Open', 'Retesting', 'Re-open')");
        $totalOutstanding = (int)$stmt->fetchColumn();

        // Statistik Status Keseluruhan
        $stmt = $db->query("SELECT status, COUNT(*) as total FROM defects GROUP BY status");
        $statusCounts = ['Open' => 0, 'Retesting' => 0, 'Re-open' => 0, 'Close' => 0];
        while ($row = $stmt->fetch()) {
            $statusCounts[$row['status']] = (int)$row['total'];
        }

        // Statistik Severity
        $stmt = $db->query("SELECT severity, COUNT(*) as total FROM defects WHERE status != 'Close' GROUP BY severity");
        $severityCounts = ['Blocker' => 0, 'High' => 0, 'Medium' => 0, 'Low' => 0];
        while ($row = $stmt->fetch()) {
            $severityCounts[$row['severity']] = (int)$row['total'];
        }

        // Agregasi Per Bank Klien
        $stmt = $db->query("SELECT c.id, c.client_name, c.client_code,
                                   SUM(CASE WHEN d.status = 'Open' THEN 1 ELSE 0 END) as count_open,
                                   SUM(CASE WHEN d.status = 'Retesting' THEN 1 ELSE 0 END) as count_retesting,
                                   SUM(CASE WHEN d.status = 'Re-open' THEN 1 ELSE 0 END) as count_reopen,
                                   SUM(CASE WHEN d.status = 'Close' THEN 1 ELSE 0 END) as count_close,
                                   COUNT(d.id) as total_defects
                            FROM clients c
                            LEFT JOIN projects p ON c.id = p.client_id
                            LEFT JOIN modules m ON p.id = m.project_id
                            LEFT JOIN defects d ON m.id = d.module_id
                            GROUP BY c.id, c.client_name, c.client_code
                            ORDER BY total_defects DESC");
        $clientStats = $stmt->fetchAll();

        // 10 Aktivitas Terbaru
        $stmt = $db->query("SELECT a.*, d.ticket_number, d.title as defect_title, u.name as user_name, u.role as user_role
                            FROM defect_activities a
                            JOIN defects d ON a.defect_id = d.id
                            JOIN users u ON a.user_id = u.id
                            ORDER BY a.id DESC LIMIT 8");
        $recentActivities = $stmt->fetchAll();

        require_once __DIR__ . '/../../views/dashboard/index.php';
    }

    public function dailyReport(): void {
        AuthClass::requireAuth();
        $db = DatabaseClass::getInstance()->getConnection();

        $selectedDate = $_GET['date'] ?? date('Y-m-d');
        $clientId = (int)($_GET['client_id'] ?? 0);

        // Ambil daftar klien
        $clients = $db->query("SELECT id, client_name, client_code FROM clients ORDER BY client_name ASC")->fetchAll();

        // Query defects harian
        $sql = "SELECT d.*, m.module_name, p.name as project_name, p.platform, c.client_name, c.client_code,
                       u_qc.name as qc_name, u_dev.name as dev_name
                FROM defects d
                JOIN modules m ON d.module_id = m.id
                JOIN projects p ON m.project_id = p.id
                JOIN clients c ON p.client_id = c.id
                JOIN users u_qc ON d.qc_id = u_qc.id
                LEFT JOIN users u_dev ON d.dev_id = u_dev.id
                WHERE (DATE(d.created_at) = ? OR DATE(d.updated_at) = ?) ";
        $params = [$selectedDate, $selectedDate];

        if ($clientId > 0) {
            $sql .= " AND c.id = ? ";
            $params[] = $clientId;
        }

        $sql .= " ORDER BY c.client_name ASC, d.id DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $defects = $stmt->fetchAll();

        // Ringkasan metrik untuk laporan ini
        $metricOpen = 0;
        $metricRetest = 0;
        $metricReopen = 0;
        $metricClose = 0;
        $metricBlocker = 0;

        foreach ($defects as $d) {
            if ($d['status'] === 'Open') $metricOpen++;
            if ($d['status'] === 'Retesting') $metricRetest++;
            if ($d['status'] === 'Re-open') $metricReopen++;
            if ($d['status'] === 'Close') $metricClose++;
            if ($d['severity'] === 'Blocker') $metricBlocker++;
        }

        require_once __DIR__ . '/../../views/reports/daily.php';
    }

    public function exportPdf(): void {
        AuthClass::requireAuth();
        $db = DatabaseClass::getInstance()->getConnection();

        $selectedDate = $_GET['date'] ?? date('Y-m-d');
        $clientId = (int)($_GET['client_id'] ?? 0);

        // Ambil data untuk cetak laporan
        $clientName = "Semua Bank Klien";
        if ($clientId > 0) {
            $cStmt = $db->prepare("SELECT client_name FROM clients WHERE id = ?");
            $cStmt->execute([$clientId]);
            $clientName = $cStmt->fetchColumn() ?: "Bank Klien";
        }

        $sql = "SELECT d.*, m.module_name, p.name as project_name, p.platform, c.client_name, c.client_code,
                       u_qc.name as qc_name, u_dev.name as dev_name
                FROM defects d
                JOIN modules m ON d.module_id = m.id
                JOIN projects p ON m.project_id = p.id
                JOIN clients c ON p.client_id = c.id
                JOIN users u_qc ON d.qc_id = u_qc.id
                LEFT JOIN users u_dev ON d.dev_id = u_dev.id
                WHERE 1=1 ";
        $params = [];
        if ($clientId > 0) {
            $sql .= " AND c.id = ? ";
            $params[] = $clientId;
        }

        $sql .= " AND (DATE(d.created_at) = ? OR DATE(d.updated_at) = ?) ORDER BY d.id DESC";
        $params[] = $selectedDate;
        $params[] = $selectedDate;
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $defects = $stmt->fetchAll();

        require_once __DIR__ . '/../../views/reports/pdf_template.php';
    }

    public function exportCsv(): void {
        AuthClass::requireAuth();
        $db = DatabaseClass::getInstance()->getConnection();

        $selectedDate = $_GET['date'] ?? date('Y-m-d');
        $clientId = (int)($_GET['client_id'] ?? 0);

        $sql = "SELECT d.ticket_number, c.client_name, p.name as project_name, m.module_name,
                       d.title, d.severity, d.environment, d.status, d.reopen_count,
                       u_qc.name as qc_name, u_dev.name as dev_name, d.created_at, d.updated_at
                FROM defects d
                JOIN modules m ON d.module_id = m.id
                JOIN projects p ON m.project_id = p.id
                JOIN clients c ON p.client_id = c.id
                JOIN users u_qc ON d.qc_id = u_qc.id
                LEFT JOIN users u_dev ON d.dev_id = u_dev.id
                WHERE 1=1 ";
        $params = [];
        if ($clientId > 0) {
            $sql .= " AND c.id = ? ";
            $params[] = $clientId;
        }
        $sql .= " AND (DATE(d.created_at) = ? OR DATE(d.updated_at) = ?) ORDER BY d.id DESC";
        $params[] = $selectedDate;
        $params[] = $selectedDate;

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="Defect_Report_' . date('Ymd_His') . '.csv"');

        $output = fopen('php://output', 'w');
        // BOM untuk Excel UTF-8
        fputs($output, "\xEF\xBB\xBF");
        fputcsv($output, ['Ticket Number', 'Bank Klien', 'Project', 'Module', 'Judul Defect', 'Severity', 'Environment', 'Status', 'Reopen Count', 'QC Reporter', 'Dev PIC', 'Created At', 'Updated At']);

        foreach ($rows as $r) {
            fputcsv($output, [
                $r['ticket_number'],
                $r['client_name'],
                $r['project_name'],
                $r['module_name'],
                $r['title'],
                $r['severity'],
                $r['environment'],
                $r['status'],
                $r['reopen_count'],
                $r['qc_name'],
                $r['dev_name'] ?? '-',
                $r['created_at'],
                $r['updated_at']
            ]);
        }
        fclose($output);
        exit;
    }
}
