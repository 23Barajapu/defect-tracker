<?php
// Seeder script untuk mengisi database awal
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Matikan foreign key check sementara untuk truncate/fresh seed
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $db->exec("TRUNCATE TABLE notifications;");
    $db->exec("TRUNCATE TABLE defect_activities;");
    $db->exec("TRUNCATE TABLE defects;");
    $db->exec("TRUNCATE TABLE modules;");
    $db->exec("TRUNCATE TABLE projects;");
    $db->exec("TRUNCATE TABLE clients;");
    $db->exec("TRUNCATE TABLE users;");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 1. Users
    $password = password_hash('password123', PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)");
    $users = [
        [1, 'Rina Marlina (QC Tester)', 'qc@pactindo.com', $password, 'QC', '081234567890'],
        [2, 'Budi Santoso (Developer)', 'dev@pactindo.com', $password, 'DEVELOPER', '081234567891'],
        [3, 'Agus Pratama (Tech Lead)', 'lead@pactindo.com', $password, 'LEAD', '081234567892'],
        [4, 'Siti Nurhaliza (Project Manager)', 'pm@pactindo.com', $password, 'PM', '081234567893'],
        [5, 'Ahmad Fauzi (QC Mobile)', 'qc2@pactindo.com', $password, 'QC', '081234567894'],
        [6, 'Dimas Arya (Backend Dev)', 'dev2@pactindo.com', $password, 'DEVELOPER', '081234567895']
    ];
    foreach ($users as $u) {
        $stmt->execute($u);
    }

    // 2. Clients (Bank)
    $stmt = $db->prepare("INSERT INTO clients (id, client_name, client_code, status) VALUES (?, ?, ?, ?)");
    $clients = [
        [1, 'Bank BJB', 'BJB', 'Active'],
        [2, 'Bank Jatim', 'BJTM', 'Active'],
        [3, 'Bank DKI', 'BDKI', 'Active'],
        [4, 'Bank Sulselbar', 'BSSB', 'Active']
    ];
    foreach ($clients as $c) {
        $stmt->execute($c);
    }

    // 3. Projects
    $stmt = $db->prepare("INSERT INTO projects (id, client_id, name, platform) VALUES (?, ?, ?, ?)");
    $projects = [
        [1, 1, 'BJB Digi Mobile V3', 'Mobile Banking'],
        [2, 1, 'BJB QRIS Merchant Engine', 'QRIS Engine'],
        [3, 2, 'Jatim Mobile Banking NextGen', 'Mobile Banking'],
        [4, 2, 'Jatim ISO 8583 Switch Gateway', 'Core Banking Switching'],
        [5, 3, 'JakOne Mobile Banking Replatform', 'Mobile Banking'],
        [6, 4, 'Sulselbar Backoffice Portal', 'Backoffice CMS']
    ];
    foreach ($projects as $p) {
        $stmt->execute($p);
    }

    // 4. Modules
    $stmt = $db->prepare("INSERT INTO modules (id, project_id, module_name) VALUES (?, ?, ?)");
    $modules = [
        [1, 1, 'Transfer Antar Bank (BI-FAST)'],
        [2, 1, 'Autentikasi Biometrik & PIN'],
        [3, 1, 'Pembayaran Tagihan PDAM & PLN'],
        [4, 2, 'QRIS MPM Settlement & Reversal'],
        [5, 3, 'Open Account Onboarding (e-KYC)'],
        [6, 4, 'ISO 8583 MTI 0200 Financial Request Parsing'],
        [7, 5, 'Top-Up E-Wallet (GoPay, OVO, ShopeePay)'],
        [8, 6, 'User Access Management & Audit Logs']
    ];
    foreach ($modules as $m) {
        $stmt->execute($m);
    }

    // 5. Defects
    $now = date('Y-m-d H:i:s');
    $stmt = $db->prepare("INSERT INTO defects (id, ticket_number, module_id, title, description, severity, environment, steps_to_reproduce, expected_result, actual_result, payload_log, status, dev_id, qc_id, reopen_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $defects = [
        [
            1, 'DEF-BJB-202608-001', 1,
            'Timeout Transaksi BI-FAST saat nominal di atas Rp 50.000.000',
            'Sistem gagal menerima callback respons dari FastSwitch saat nominal transaksi besar.',
            'Blocker', 'UAT',
            "1. Login BJB Digi Mobile\n2. Menu Transfer -> BI-FAST\n3. Input Rekening Tujuan Bank Mandiri\n4. Input Nominal 75.000.000\n5. Submit PIN",
            'Transaksi berhasil dan status sukses tercatat.',
            'Aplikasi berputar loading hingga muncul error HTTP 504 Gateway Timeout.',
            "{\n  \"pan\": \"411111******1111\",\n  \"amount\": 75000000,\n  \"channel\": \"MBI-FAST\",\n  \"stan\": \"009821\",\n  \"pin_block\": \"[MASKED]\"\n}",
            'Open', 2, 1, 0, $now, $now
        ],
        [
            2, 'DEF-BJTM-202608-002', 6,
            'MTI 0200 Bit 48 (Private Data) Terpotong pada Switch Gateway',
            'Parsing panjang bit 48 gagal saat menerima karakter khusus nama merchant.',
            'High', 'SIT',
            "1. Kirim payload ISO 8583 MTI 0200 dengan bit 48 berisi nama toko berkarakter &\n2. Amati log backend switch.",
            'Bit 48 diparse lengkap sesuai spesifikasi ISO 8583 Sarana Pactindo.',
            'Buffer overflow ringan mengakibatkan parsing terhenti di byte ke-32.',
            "ISO8583_LOG: MTI=0200 | BIT3=000000 | BIT4=000000150000 | BIT48=Toko Serba Ada & Rekan [TRUNCATED]",
            'Retesting', 6, 1, 0, $now, $now
        ],
        [
            3, 'DEF-BDKI-202608-003', 7,
            'Gagal Top-up ShopeePay - Saldo Terpotong Tanpa Notifikasi',
            'Potong saldo berhasil tapi hit API partner timeout tanpa reversal otomatis.',
            'High', 'UAT',
            "1. Pilih Top Up -> ShopeePay\n2. Masukkan nomor handphone\n3. Pilih nominal Rp 100.000\n4. Konfirmasi transaksi",
            'Jika partner timeout, transaksi otomatis reversal dan saldo kembali realtime.',
            'Saldo nasabah terpotong, status di app pending selamanya.',
            "{\n  \"action\": \"topup_shopeepay\",\n  \"customer_phone\": \"081299998888\",\n  \"amount\": 100000,\n  \"status\": \"PENDING_NO_REVERSAL\"\n}",
            'Re-open', 2, 5, 1, $now, $now
        ],
        [
            4, 'DEF-BJB-202608-004', 2,
            'Biometrik FaceID crash pada iOS 18.2',
            'Panggilan LocalAuthentication API menyebabkan fatal exception pada build terbaru.',
            'Medium', 'DEV',
            "1. Buka aplikasi di iPhone iOS 18.2\n2. Aktifkan FaceID di pengaturan\n3. Logout dan coba login kembali",
            'Prompt FaceID muncul normal.',
            'Aplikasi langsung force-close ke home screen.',
            null,
            'Close', 2, 1, 0, $now, $now
        ]
    ];
    foreach ($defects as $d) {
        $stmt->execute($d);
    }

    // 6. Defect Activities
    $stmt = $db->prepare("INSERT INTO defect_activities (defect_id, user_id, from_status, to_status, notes, build_number, commit_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $activities = [
        [1, 1, null, 'Open', 'Defect ditemukan saat pengujian skenario high-value BI-FAST di UAT.', null, null, $now],
        [2, 1, null, 'Open', 'Parsing bit 48 gagal pada simulator switch.', null, null, $now],
        [2, 6, 'Open', 'Retesting', 'Sudah diperbaiki dengan alokasi buffer dinamis 999 bytes. Build v2.4.1 siap di SIT.', 'v2.4.1-rc3', 'a7f9c2e', $now],
        [3, 5, null, 'Open', 'Topup timeout tanpa reversal.', null, null, $now],
        [3, 2, 'Open', 'Retesting', 'Menambahkan scheduler auto-reversal 30 detik.', 'v1.12.0', 'c44e912', $now],
        [3, 5, 'Retesting', 'Re-open', 'Retest gagal: Saldo masih belum kembali saat partner mengembalikan code 68.', null, null, $now],
        [4, 1, null, 'Open', 'Crash FaceID di iOS 18.', null, null, $now],
        [4, 2, 'Open', 'Retesting', 'Update framework LocalAuth pods ke versi 2.1.', 'v3.0.2', 'e12bb09', $now],
        [4, 1, 'Retesting', 'Close', 'Verifikasi berhasil di 3 device iOS 18. Passed.', null, null, $now]
    ];
    foreach ($activities as $act) {
        $stmt->execute($act);
    }

    // 7. Notifications
    $stmt = $db->prepare("INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $notifications = [
        [2, 1, 'Defect Baru Ditugaskan', 'QC Rina melaporkan defect Blocker pada modul BI-FAST (DEF-BJB-202608-001)', 'new_defect', 0, $now],
        [1, 2, 'Siap Retest', 'Dev Dimas telah menyelesaikan perbaikan untuk DEF-BJTM-202608-002 (Build v2.4.1-rc3)', 'ready_retest', 0, $now],
        [2, 3, 'Defect Gagal Retest (Re-opened)', 'QC Ahmad membuka kembali tiket DEF-BDKI-202608-003. Perlu perbaikan lanjutan.', 'reopened', 0, $now]
    ];
    foreach ($notifications as $n) {
        $stmt->execute($n);
    }

    echo "DATABASE_SEEDED_SUCCESSFULLY\n";
} catch (Exception $e) {
    echo "SEEDING_ERROR: " . $e->getMessage() . "\n";
}
