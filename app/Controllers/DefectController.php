<?php
require_once __DIR__ . '/../Core/Auth.php';
require_once __DIR__ . '/../Core/Security.php';
require_once __DIR__ . '/../../config/database.php';

class DefectController {
    public function index(): void {
        Auth::requireAuth();
        $db = Database::getInstance()->getConnection();

        // Ambil filter
        $clientId = (int)($_GET['client_id'] ?? 0);
        $status = $_GET['status'] ?? '';
        $severity = $_GET['severity'] ?? '';
        $search = trim($_GET['search'] ?? '');

        $sql = "SELECT d.*, 
                       m.module_name, 
                       p.name as project_name, p.platform, 
                       c.id as client_id, c.client_name, c.client_code,
                       u_qc.name as qc_name,
                       u_dev.name as dev_name
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
        if (!empty($status)) {
            $sql .= " AND d.status = ? ";
            $params[] = $status;
        }
        if (!empty($severity)) {
            $sql .= " AND d.severity = ? ";
            $params[] = $severity;
        }
        if (!empty($search)) {
            $sql .= " AND (d.ticket_number LIKE ? OR d.title LIKE ? OR d.description LIKE ?) ";
            $term = "%{$search}%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY d.id DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $defects = $stmt->fetchAll();

        // Master data bank untuk filter
        $clients = $db->query("SELECT id, client_name, client_code FROM clients ORDER BY client_name ASC")->fetchAll();

        require_once __DIR__ . '/../../views/defects/index.php';
    }

    public function createForm(): void {
        Auth::requireAuth();
        if (!Auth::hasRole(['QC', 'LEAD', 'PM'])) {
            $_SESSION['error'] = 'Hanya Quality Control (QC) atau Lead yang berhak membuat tiket defect baru.';
            header('Location: /defects');
            exit;
        }

        $db = Database::getInstance()->getConnection();
        $clients = $db->query("SELECT id, client_name, client_code FROM clients WHERE status = 'Active' ORDER BY client_name ASC")->fetchAll();
        $developers = $db->query("SELECT id, name, email FROM users WHERE role = 'DEVELOPER' ORDER BY name ASC")->fetchAll();

        require_once __DIR__ . '/../../views/defects/create.php';
    }

    public function store(): void {
        Auth::requireAuth();
        if (!Auth::hasRole(['QC', 'LEAD', 'PM'])) {
            $_SESSION['error'] = 'Akses ditolak.';
            header('Location: /defects');
            exit;
        }

        $db = Database::getInstance()->getConnection();
        $moduleId = (int)($_POST['module_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $severity = $_POST['severity'] ?? 'Medium';
        $environment = $_POST['environment'] ?? 'SIT';
        $steps = trim($_POST['steps_to_reproduce'] ?? '');
        $expected = trim($_POST['expected_result'] ?? '');
        $actual = trim($_POST['actual_result'] ?? '');
        $rawPayload = trim($_POST['payload_log'] ?? '');
        $devId = !empty($_POST['dev_id']) ? (int)$_POST['dev_id'] : null;
        $qcId = Auth::id();

        if (empty($moduleId) || empty($title) || empty($description)) {
            $_SESSION['error'] = 'Modul, judul defect, dan deskripsi wajib diisi.';
            header('Location: /defects/create');
            exit;
        }

        // Masking data sensitif otomatis (PAN, CVV, PIN)
        $maskedPayload = Security::maskSensitiveData($rawPayload);

        // Upload attachment jika ada
        $attachmentUrl = null;
        if (!empty($_FILES['attachment']['name'])) {
            $file = $_FILES['attachment'];
            $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'log', 'json'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (in_array($ext, $allowedExts)) {
                $uploadDir = __DIR__ . '/../../public/uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $filename = 'evidence_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $target = $uploadDir . $filename;
                if (move_uploaded_file($file['tmp_name'], $target)) {
                    $attachmentUrl = '/uploads/' . $filename;
                }
            }
        }

        try {
            $db->beginTransaction();

            // Dapatkan client code untuk format tiket
            $cStmt = $db->prepare("SELECT c.client_code FROM modules m JOIN projects p ON m.project_id = p.id JOIN clients c ON p.client_id = c.id WHERE m.id = ?");
            $cStmt->execute([$moduleId]);
            $clientCode = $cStmt->fetchColumn() ?: 'DEF';

            // Hitung nomor tiket
            $yearMonth = date('Ym');
            $countStmt = $db->query("SELECT COUNT(*) FROM defects");
            $seq = str_pad((int)$countStmt->fetchColumn() + 1, 3, '0', STR_PAD_LEFT);
            $ticketNumber = "DEF-{$clientCode}-{$yearMonth}-{$seq}";

            // Insert defect
            $stmt = $db->prepare("INSERT INTO defects 
                (ticket_number, module_id, title, description, severity, environment, steps_to_reproduce, expected_result, actual_result, payload_log, status, dev_id, qc_id, reopen_count, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, 0, NOW(), NOW())");
            $stmt->execute([
                $ticketNumber, $moduleId, $title, $description, $severity, $environment,
                $steps, $expected, $actual, $maskedPayload, $devId, $qcId
            ]);
            $defectId = (int)$db->lastInsertId();

            // Insert initial activity
            $actStmt = $db->prepare("INSERT INTO defect_activities (defect_id, user_id, from_status, to_status, notes, attachment_url, created_at) VALUES (?, ?, NULL, 'Open', ?, ?, NOW())");
            $actStmt->execute([$defectId, $qcId, 'Defect baru dilaporkan dengan severity ' . $severity, $attachmentUrl]);

            // Kirim notifikasi ke Developer jika ditugaskan
            if ($devId) {
                $qcUser = Auth::user();
                $notifStmt = $db->prepare("INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, 'new_defect', 0, NOW())");
                $notifStmt->execute([
                    $devId,
                    $defectId,
                    'Defect Baru Ditugaskan',
                    "{$qcUser['name']} menugaskan tiket {$ticketNumber} ({$severity}): {$title}"
                ]);
            }

            $db->commit();
            $_SESSION['success'] = "Defect berhasil dibuat dengan nomor tiket {$ticketNumber}.";
            header("Location: /defects/detail?id={$defectId}");
            exit;
        } catch (Exception $e) {
            $db->rollBack();
            $_SESSION['error'] = "Gagal membuat defect: " . $e->getMessage();
            header('Location: /defects/create');
            exit;
        }
    }

    public function detail(): void {
        Auth::requireAuth();
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            header('Location: /defects');
            exit;
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT d.*, 
                                     m.module_name, 
                                     p.name as project_name, p.platform, 
                                     c.id as client_id, c.client_name, c.client_code,
                                     u_qc.name as qc_name, u_qc.email as qc_email,
                                     u_dev.name as dev_name, u_dev.email as dev_email
                              FROM defects d
                              JOIN modules m ON d.module_id = m.id
                              JOIN projects p ON m.project_id = p.id
                              JOIN clients c ON p.client_id = c.id
                              JOIN users u_qc ON d.qc_id = u_qc.id
                              LEFT JOIN users u_dev ON d.dev_id = u_dev.id
                              WHERE d.id = ?");
        $stmt->execute([$id]);
        $defect = $stmt->fetch();

        if (!$defect) {
            $_SESSION['error'] = 'Data defect tidak ditemukan.';
            header('Location: /defects');
            exit;
        }

        // Ambil histori aktivitas
        $actStmt = $db->prepare("SELECT a.*, u.name as user_name, u.role as user_role 
                                FROM defect_activities a
                                JOIN users u ON a.user_id = u.id
                                WHERE a.defect_id = ?
                                ORDER BY a.id ASC");
        $actStmt->execute([$id]);
        $activities = $actStmt->fetchAll();

        // Daftar Developer untuk reassign (Lead/PM)
        $developers = $db->query("SELECT id, name, email FROM users WHERE role = 'DEVELOPER' ORDER BY name ASC")->fetchAll();

        require_once __DIR__ . '/../../views/defects/detail.php';
    }

    public function updateStatus(): void {
        Auth::requireAuth();
        $defectId = (int)($_POST['defect_id'] ?? 0);
        $newStatus = $_POST['to_status'] ?? '';
        $notes = trim($_POST['notes'] ?? '');
        $buildNumber = trim($_POST['build_number'] ?? '');
        $commitHash = trim($_POST['commit_hash'] ?? '');
        $newDevId = !empty($_POST['reassign_dev_id']) ? (int)$_POST['reassign_dev_id'] : null;

        if ($defectId <= 0 || empty($newStatus)) {
            $_SESSION['error'] = 'Parameter transisi status tidak valid.';
            header("Location: /defects");
            exit;
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM defects WHERE id = ?");
        $stmt->execute([$defectId]);
        $defect = $stmt->fetch();

        if (!$defect) {
            $_SESSION['error'] = 'Defect tidak ditemukan.';
            header("Location: /defects");
            exit;
        }

        $currentStatus = $defect['status'];
        $userRole = Auth::role();
        $userId = Auth::id();
        $userName = Auth::user()['name'];

        // ATURAN STATE MACHINE & RBAC (PRD Bagian 4 & 5)
        $isValidTransition = false;
        $isReopen = false;

        if (Auth::hasRole(['LEAD', 'PM'])) {
            // Lead & PM memiliki full override
            $isValidTransition = in_array($newStatus, ['Open', 'Retesting', 'Re-open', 'Close'], true);
        } elseif ($userRole === 'DEVELOPER') {
            // Developer HANYA boleh mengubah Open / Re-open -> Retesting
            if (in_array($currentStatus, ['Open', 'Re-open'], true) && $newStatus === 'Retesting') {
                $isValidTransition = true;
                if (empty($notes)) {
                    $_SESSION['error'] = 'Developer wajib mengisi Catatan Perbaikan (Fixing Note).';
                    header("Location: /defects/detail?id={$defectId}");
                    exit;
                }
            } else {
                $_SESSION['error'] = 'Developer tidak memiliki izin melakukan transisi status ini (dilarang langsung Close).';
                header("Location: /defects/detail?id={$defectId}");
                exit;
            }
        } elseif ($userRole === 'QC') {
            // QC HANYA boleh mengubah Retesting -> Close ATAU Retesting -> Re-open
            if ($currentStatus === 'Retesting' && in_array($newStatus, ['Close', 'Re-open'], true)) {
                $isValidTransition = true;
                if ($newStatus === 'Re-open') {
                    $isReopen = true;
                    if (empty($notes)) {
                        $_SESSION['error'] = 'QC wajib mengisi Alasan Gagal Verifikasi / Regression Note saat Re-open.';
                        header("Location: /defects/detail?id={$defectId}");
                        exit;
                    }
                }
            } else {
                $_SESSION['error'] = 'QC hanya dapat memverifikasi tiket yang berstatus Retesting (Close / Re-open).';
                header("Location: /defects/detail?id={$defectId}");
                exit;
            }
        }

        if (!$isValidTransition) {
            $_SESSION['error'] = "Transisi status dari {$currentStatus} ke {$newStatus} tidak diizinkan oleh sistem.";
            header("Location: /defects/detail?id={$defectId}");
            exit;
        }

        // Upload attachment jika ada
        $attachmentUrl = null;
        if (!empty($_FILES['activity_attachment']['name'])) {
            $file = $_FILES['activity_attachment'];
            $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'log', 'json'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (in_array($ext, $allowedExts)) {
                $uploadDir = __DIR__ . '/../../public/uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $filename = 'act_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                    $attachmentUrl = '/uploads/' . $filename;
                }
            }
        }

        try {
            $db->beginTransaction();

            // Update status & reopen_count
            $reopenIncrement = $isReopen ? 1 : 0;
            $targetDevId = $newDevId ?: $defect['dev_id'];

            $upStmt = $db->prepare("UPDATE defects SET 
                status = ?, 
                dev_id = ?, 
                reopen_count = reopen_count + ?, 
                updated_at = NOW() 
                WHERE id = ?");
            $upStmt->execute([$newStatus, $targetDevId, $reopenIncrement, $defectId]);

            // Catat activity
            $actStmt = $db->prepare("INSERT INTO defect_activities 
                (defect_id, user_id, from_status, to_status, notes, build_number, commit_hash, attachment_url, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $actStmt->execute([
                $defectId, $userId, $currentStatus, $newStatus, 
                $notes, $buildNumber ?: null, $commitHash ?: null, $attachmentUrl
            ]);

            // Buat Notifikasi Real-time
            if ($newStatus === 'Retesting') {
                // Notifikasi ke QC Reporter
                $notifStmt = $db->prepare("INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, 'ready_retest', 0, NOW())");
                $notifStmt->execute([
                    $defect['qc_id'],
                    $defectId,
                    'Tiket Siap Retest',
                    "Developer {$userName} menandai {$defect['ticket_number']} siap di-retest (Build: {$buildNumber})."
                ]);
            } elseif ($newStatus === 'Re-open') {
                // Notifikasi ke Dev PIC
                if ($targetDevId) {
                    $notifStmt = $db->prepare("INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, 'reopened', 0, NOW())");
                    $notifStmt->execute([
                        $targetDevId,
                        $defectId,
                        'Defect Gagal Retest (Re-opened)',
                        "QC {$userName} membuka kembali {$defect['ticket_number']}. Alasan: {$notes}"
                    ]);
                }
            } elseif ($newStatus === 'Close') {
                // Notifikasi ke Dev PIC
                if ($targetDevId) {
                    $notifStmt = $db->prepare("INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, 'closed', 0, NOW())");
                    $notifStmt->execute([
                        $targetDevId,
                        $defectId,
                        'Defect Telah Diverifikasi & Closed',
                        "QC {$userName} telah memverifikasi dan menutup tiket {$defect['ticket_number']}."
                    ]);
                }
            }

            $db->commit();
            $_SESSION['success'] = "Status tiket {$defect['ticket_number']} berhasil diperbarui menjadi {$newStatus}.";
            header("Location: /defects/detail?id={$defectId}");
            exit;
        } catch (Exception $e) {
            $db->rollBack();
            $_SESSION['error'] = "Gagal memperbarui status: " . $e->getMessage();
            header("Location: /defects/detail?id={$defectId}");
            exit;
        }
    }
}
