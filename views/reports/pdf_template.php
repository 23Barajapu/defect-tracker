<?php
/**
 * @var string $selectedDate
 * @var int $clientId
 * @var string $clientName
 * @var array $defects
 */
$selectedDate = $selectedDate ?? date('Y-m-d');
$clientId = $clientId ?? 0;
$clientName = $clientName ?? 'Semua Bank Klien';
$defects = $defects ?? [];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Harian QA - PT Sarana Pactindo</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            line-height: 1.4;
        }
        .header-kop {
            display: flex;
            align-items: center;
            border-bottom: 3px double #1e3a8a;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .logo-box {
            width: 55px;
            height: 55px;
            background: #1e3a8a;
            color: #fff;
            font-weight: 800;
            font-size: 22pt;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            margin-right: 18px;
        }
        .company-info h1 {
            margin: 0;
            font-size: 16pt;
            color: #1e3a8a;
            letter-spacing: 0.5px;
        }
        .company-info p {
            margin: 2px 0 0 0;
            font-size: 9pt;
            color: #4b5563;
        }
        .report-title {
            text-align: center;
            margin: 15px 0;
        }
        .report-title h2 {
            margin: 0;
            font-size: 14pt;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .report-title .sub-meta {
            font-size: 9.5pt;
            color: #6b7280;
            margin-top: 4px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 9.5pt;
        }
        .meta-table td {
            padding: 4px 8px;
        }
        .meta-label {
            font-weight: bold;
            color: #374151;
            width: 20%;
        }
        .summary-boxes {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            gap: 10px;
        }
        .box {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            background: #f9fafb;
        }
        .box-title {
            font-size: 8pt;
            text-transform: uppercase;
            font-weight: bold;
            color: #6b7280;
        }
        .box-value {
            font-size: 18pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 4px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 30px;
        }
        .data-table th, .data-table td {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            text-align: left;
        }
        .data-table th {
            background-color: #1e3a8a;
            color: #fff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 7.5pt;
        }
        .data-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .status-pill {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 7.5pt;
        }
        .status-Open { background: #dbeafe; color: #1e40af; }
        .status-Retesting { background: #f3e8ff; color: #6b21a8; }
        .status-Re-open { background: #fee2e2; color: #991b1b; }
        .status-Close { background: #d1fae5; color: #065f46; }

        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .sig-box {
            width: 28%;
            text-align: center;
            font-size: 9pt;
        }
        .sig-space {
            height: 60px;
        }
        .sig-name {
            font-weight: bold;
            border-bottom: 1px solid #374151;
            padding-bottom: 2px;
        }
        .sig-title {
            color: #6b7280;
            font-size: 8pt;
            margin-top: 3px;
        }
        .print-actions {
            background: #1e293b;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
            margin-bottom: 20px;
        }
        @media print {
            .print-actions {
                display: none;
            }
        }
    </style>
</head>
<body>

<div class="print-actions">
    <div>
        <strong>Format Cetak PDF Resmi &mdash; PT Sarana Pactindo</strong>
    </div>
    <div style="display: flex; gap: 10px;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Cetak / Simpan PDF
        </button>
        <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
            Tutup
        </button>
    </div>
</div>

<div style="padding: 10px;">
    <!-- Kop Dokumen Resmi -->
    <div class="header-kop">
        <div class="logo-box">SP</div>
        <div class="company-info">
            <h1>PT SARANA PACTINDO</h1>
            <p>Software Engineering, Banking Switching Engine & Quality Assurance Division</p>
            <p>Pactindo Cyber Building, Jakarta &mdash; Email: qa-support@pactindo.com</p>
        </div>
    </div>

    <!-- Judul Dokumen -->
    <div class="report-title">
        <h2>DAILY DEFECT TRACKING & QA PROGRESS REPORT</h2>
        <div class="sub-meta">Dokumen Kontrol Kualitas Perbankan Terpadu (FR-10)</div>
    </div>

    <!-- Metadata Ringkas -->
    <table class="meta-table">
        <tr>
            <td class="meta-label">Nomor Dokumen:</td>
            <td>DOC-QA-<?= date('Ymd') ?>-<?= strtoupper(substr(md5($selectedDate . $clientId), 0, 4)) ?></td>
            <td class="meta-label">Tanggal Cutoff:</td>
            <td><?= date('d F Y', strtotime($selectedDate)) ?> (17:00 WIB)</td>
        </tr>
        <tr>
            <td class="meta-label">Lingkup Bank Klien:</td>
            <td><strong><?= htmlspecialchars($clientName) ?></strong></td>
            <td class="meta-label">Waktu Export:</td>
            <td><?= date('d/m/Y H:i:s') ?> WIB</td>
        </tr>
    </table>

    <!-- Ringkasan Eksekutif -->
    <?php
    $cOpen = 0; $cRetest = 0; $cReopen = 0; $cClose = 0;
    foreach ($defects as $d) {
        if ($d['status'] === 'Open') $cOpen++;
        if ($d['status'] === 'Retesting') $cRetest++;
        if ($d['status'] === 'Re-open') $cReopen++;
        if ($d['status'] === 'Close') $cClose++;
    }
    ?>
    <div class="summary-boxes">
        <div class="box">
            <div class="box-title">New Open</div>
            <div class="box-value" style="color: #2563eb;"><?= $cOpen ?></div>
        </div>
        <div class="box">
            <div class="box-title">Ready for Retest</div>
            <div class="box-value" style="color: #7c3aed;"><?= $cRetest ?></div>
        </div>
        <div class="box">
            <div class="box-title">Re-opened</div>
            <div class="box-value" style="color: #dc2626;"><?= $cReopen ?></div>
        </div>
        <div class="box">
            <div class="box-title">Verified & Closed</div>
            <div class="box-value" style="color: #059669;"><?= $cClose ?></div>
        </div>
        <div class="box" style="background: #eff6ff;">
            <div class="box-title">Total Tiket</div>
            <div class="box-value"><?= count($defects) ?></div>
        </div>
    </div>

    <!-- Tabel Rincian Data Defect -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 14%;">No. Tiket</th>
                <th style="width: 12%;">Bank & Modul</th>
                <th>Judul Defect</th>
                <th style="width: 8%;">Severity</th>
                <th style="width: 6%;">Env</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 12%;">PIC Dev</th>
                <th style="width: 12%;">QC Tester</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($defects)): ?>
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #6b7280;">Tidak ada catatan defect aktif.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($defects as $d): ?>
                    <tr>
                        <td><strong><?= htmlspecialchars($d['ticket_number']) ?></strong></td>
                        <td>
                            <strong><?= htmlspecialchars($d['client_code']) ?></strong><br>
                            <span style="font-size: 7.5pt; color: #4b5563;"><?= htmlspecialchars($d['module_name']) ?></span>
                        </td>
                        <td>
                            <?= htmlspecialchars($d['title']) ?>
                            <?php if (!empty($d['reopen_count']) && $d['reopen_count'] > 0): ?>
                                <span style="color: #dc2626; font-weight: bold; font-size: 7pt;">(Reopen #<?= $d['reopen_count'] ?>)</span>
                            <?php endif; ?>
                        </td>
                        <td><strong><?= $d['severity'] ?></strong></td>
                        <td><?= $d['environment'] ?></td>
                        <td><span class="status-pill status-<?= $d['status'] ?>"><?= $d['status'] ?></span></td>
                        <td><?= htmlspecialchars($d['dev_name'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($d['qc_name']) ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>

    <!-- Tanda Tangan & Pengesahan Dokumen -->
    <div class="signature-section">
        <div class="sig-box">
            <div>Dibuat Oleh,</div>
            <div class="sig-space"></div>
            <div class="sig-name">Rina Marlina</div>
            <div class="sig-title">Quality Control Lead</div>
        </div>

        <div class="sig-box">
            <div>Ditinjau Oleh,</div>
            <div class="sig-space"></div>
            <div class="sig-name">Agus Pratama</div>
            <div class="sig-title">Technical Lead Software</div>
        </div>

        <div class="sig-box">
            <div>Disetujui Oleh,</div>
            <div class="sig-space"></div>
            <div class="sig-name">Siti Nurhaliza</div>
            <div class="sig-title">Project Manager PT Sarana Pactindo</div>
        </div>
    </div>
</div>

</body>
</html>
