<?php require_once __DIR__ . '/../layout/header.php'; ?>

<div class="page-header">
    <div class="page-title">
        <h2>Laporan Harian QA & Defect Tracking (FR-09)</h2>
        <p>Auto-Generated Daily QA Summary per Bank Klien (Otomatisasi Laporan Pukul 17:00)</p>
    </div>
    <div style="display: flex; gap: 0.75rem;">
        <a href="/reports/export-csv?date=<?= urlencode($selectedDate) ?>&client_id=<?= $clientId ?>" class="btn btn-secondary">
            Export CSV / Excel
        </a>
        <a href="/reports/export-pdf?date=<?= urlencode($selectedDate) ?>&client_id=<?= $clientId ?>" target="_blank" class="btn btn-primary">
            One-Click Export PDF (Kop PT Sarana Pactindo)
        </a>
    </div>
</div>

<!-- Filter Bar Laporan -->
<div class="card" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
    <form method="GET" action="/reports/daily" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div>
            <label class="form-label" style="margin-bottom: 0.25rem;">Tanggal Laporan</label>
            <input type="date" name="date" class="form-control" value="<?= htmlspecialchars($selectedDate) ?>" style="padding: 0.55rem 0.85rem;">
        </div>

        <div style="flex: 1; min-width: 200px;">
            <label class="form-label" style="margin-bottom: 0.25rem;">Pilih Bank Klien</label>
            <select name="client_id" class="form-control">
                <option value="">Semua Bank Klien (Multi-Bank Aggregate)</option>
                <?php foreach ($clients as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= $clientId === (int)$c['id'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($c['client_name']) ?> (<?= $c['client_code'] ?>)
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <button type="submit" class="btn btn-primary">
            Muat Laporan
        </button>
    </form>
</div>

<!-- Info Banner FR-09 -->
<div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
    <div>
        <div style="font-weight: 700; color: #fff; font-size: 0.92rem;">
            Rekap Otomatis QA Cutoff Harian (Pukul 17:00 WIB)
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
            Tanggal: <strong><?= date('d F Y', strtotime($selectedDate)) ?></strong> &bull; Waktu penyusunan instan (1-Click).
        </div>
    </div>
    <span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 10px; border-radius: 6px; font-weight: 700;">
        Real-Time Synchronized
    </span>
</div>

<!-- Ringkasan Eksekutif Metrik Laporan -->
<div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 1.5rem;">
    <div class="metric-card open">
        <div class="metric-label">Defect Baru (Open)</div>
        <div class="metric-val"><?= $metricOpen ?></div>
    </div>
    <div class="metric-card retest">
        <div class="metric-label">Ready for Retest</div>
        <div class="metric-val"><?= $metricRetest ?></div>
    </div>
    <div class="metric-card reopen">
        <div class="metric-label">Gagal Uji (Re-open)</div>
        <div class="metric-val"><?= $metricReopen ?></div>
    </div>
    <div class="metric-card close">
        <div class="metric-label">Selesai (Closed)</div>
        <div class="metric-val"><?= $metricClose ?></div>
    </div>
    <div class="metric-card" style="border-top: 3px solid #dc2626;">
        <div class="metric-label">Isu Blocker</div>
        <div class="metric-val" style="color: #f87171;"><?= $metricBlocker ?></div>
    </div>
</div>

<!-- Tabel Rincian Defect Laporan -->
<div class="card">
    <div class="card-header">
        <span class="card-title">Daftar Defect Terkait Aktivitas Harian</span>
        <span style="font-size: 0.8rem; color: var(--text-dim);"><?= count($defects) ?> Item Tercatat</span>
    </div>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Tiket & Bank</th>
                    <th>Judul & Modul</th>
                    <th>Severity</th>
                    <th>Status Saat Ini</th>
                    <th>Dev PIC</th>
                    <th>QC Reporter</th>
                    <th>Update Terakhir</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($defects)): ?>
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-dim);">
                            Tidak ada aktivitas defect pada tanggal dan bank yang dipilih.
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($defects as $d): ?>
                        <tr>
                            <td>
                                <strong style="color: #60a5fa; font-family: monospace;"><?= htmlspecialchars($d['ticket_number']) ?></strong>
                                <div style="font-size: 0.75rem; color: #fff;"><?= htmlspecialchars($d['client_name']) ?></div>
                            </td>
                            <td>
                                <div style="font-weight: 600; color: #fff;"><?= htmlspecialchars($d['title']) ?></div>
                                <div style="font-size: 0.74rem; color: var(--text-dim);"><?= htmlspecialchars($d['project_name']) ?> &rsaquo; <?= htmlspecialchars($d['module_name']) ?></div>
                            </td>
                            <td>
                                <span class="sev-badge sev-<?= $d['severity'] ?>"><?= $d['severity'] ?></span>
                            </td>
                            <td>
                                <span class="badge badge-<?= $d['status'] ?>"><?= $d['status'] ?></span>
                            </td>
                            <td><?= !empty($d['dev_name']) ? htmlspecialchars($d['dev_name']) : '-' ?></td>
                            <td><?= htmlspecialchars($d['qc_name']) ?></td>
                            <td>
                                <span style="font-size: 0.75rem; color: var(--text-dim);"><?= date('H:i:s', strtotime($d['updated_at'])) ?></span>
                            </td>
                            <td>
                                <a href="/defects/detail?id=<?= $d['id'] ?>" class="btn btn-secondary btn-sm">Lihat &rarr;</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/../layout/footer.php'; ?>
