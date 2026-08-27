<?php require_once __DIR__ . '/../layout/header.php'; ?>

<div class="page-header">
    <div class="page-title">
        <h2>Daftar Defect Multi-Bank</h2>
        <p>Manajemen tiket defect lintas platform perbankan PT Sarana Pactindo</p>
    </div>
    <?php if (Auth::hasRole(['QC', 'LEAD', 'PM'])): ?>
        <a href="/defects/create" class="btn btn-primary">
            Input Defect Baru
        </a>
    <?php endif; ?>
</div>

<!-- Filter Bar -->
<div class="card" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
    <form method="GET" action="/defects" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 1.5; min-width: 200px;">
            <label class="form-label" style="margin-bottom: 0.25rem;">Pencarian Tiket / Judul</label>
            <input type="text" name="search" class="form-control" placeholder="No Tiket, kata kunci..." value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">
        </div>

        <div style="flex: 1; min-width: 150px;">
            <label class="form-label" style="margin-bottom: 0.25rem;">Bank Klien</label>
            <select name="client_id" class="form-control">
                <option value="">Semua Bank Klien</option>
                <?php foreach ($clients as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= (int)($_GET['client_id'] ?? 0) === (int)$c['id'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($c['client_name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div style="flex: 1; min-width: 130px;">
            <label class="form-label" style="margin-bottom: 0.25rem;">Status</label>
            <select name="status" class="form-control">
                <option value="">Semua Status</option>
                <option value="Open" <?= ($_GET['status'] ?? '') === 'Open' ? 'selected' : '' ?>>Open</option>
                <option value="Retesting" <?= ($_GET['status'] ?? '') === 'Retesting' ? 'selected' : '' ?>>Retesting</option>
                <option value="Re-open" <?= ($_GET['status'] ?? '') === 'Re-open' ? 'selected' : '' ?>>Re-open</option>
                <option value="Close" <?= ($_GET['status'] ?? '') === 'Close' ? 'selected' : '' ?>>Close</option>
            </select>
        </div>

        <div style="flex: 1; min-width: 130px;">
            <label class="form-label" style="margin-bottom: 0.25rem;">Severity</label>
            <select name="severity" class="form-control">
                <option value="">Semua Severity</option>
                <option value="Blocker" <?= ($_GET['severity'] ?? '') === 'Blocker' ? 'selected' : '' ?>>Blocker</option>
                <option value="High" <?= ($_GET['severity'] ?? '') === 'High' ? 'selected' : '' ?>>High</option>
                <option value="Medium" <?= ($_GET['severity'] ?? '') === 'Medium' ? 'selected' : '' ?>>Medium</option>
                <option value="Low" <?= ($_GET['severity'] ?? '') === 'Low' ? 'selected' : '' ?>>Low</option>
            </select>
        </div>

        <div style="display: flex; gap: 0.5rem;">
            <button type="submit" class="btn btn-primary" style="padding: 0.65rem 1rem;">
                Filter
            </button>
            <a href="/defects" class="btn btn-secondary" style="padding: 0.65rem 0.85rem;" title="Reset Filter">
                Reset
            </a>
        </div>
    </form>
</div>

<!-- Table of Defects -->
<div class="card">
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Tiket & Bank</th>
                    <th>Judul & Modul</th>
                    <th>Severity</th>
                    <th>Env</th>
                    <th>Status</th>
                    <th>PIC Dev</th>
                    <th>QC Reporter</th>
                    <th>Tgl Lapor</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($defects)): ?>
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-dim);">
                            Tidak ada defect ditemukan untuk filter saat ini.
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($defects as $d): ?>
                        <tr>
                            <td>
                                <strong style="color: #60a5fa; font-family: monospace; font-size: 0.88rem;"><?= htmlspecialchars($d['ticket_number']) ?></strong>
                                <div style="font-size: 0.75rem; color: #fff; margin-top: 2px;">
                                    <?= htmlspecialchars($d['client_name']) ?>
                                </div>
                            </td>
                            <td>
                                <a href="/defects/detail?id=<?= $d['id'] ?>" style="color: #fff; font-weight: 600;">
                                    <?= htmlspecialchars($d['title']) ?>
                                </a>
                                <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 3px;">
                                    <?= htmlspecialchars($d['project_name']) ?> &rsaquo; <?= htmlspecialchars($d['module_name']) ?>
                                </div>
                            </td>
                            <td>
                                <span class="sev-badge sev-<?= $d['severity'] ?>"><?= $d['severity'] ?></span>
                            </td>
                            <td>
                                <span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;"><?= $d['environment'] ?></span>
                            </td>
                            <td>
                                <span class="badge badge-<?= $d['status'] ?>">
                                    <?= $d['status'] ?>
                                </span>
                                <?php if ($d['reopen_count'] > 0): ?>
                                    <div style="font-size: 0.68rem; color: #ef4444; margin-top: 2px; font-weight: 700;">
                                        (Re-open #<?= $d['reopen_count'] ?>)
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?= !empty($d['dev_name']) ? htmlspecialchars($d['dev_name']) : '<span style="color:var(--text-dim);">Belum ditugaskan</span>' ?>
                            </td>
                            <td>
                                <div style="font-size: 0.82rem;"><?= htmlspecialchars($d['qc_name']) ?></div>
                            </td>
                            <td>
                                <div style="font-size: 0.75rem; color: var(--text-dim);">
                                    <?= date('d/m/Y H:i', strtotime($d['created_at'])) ?>
                                </div>
                            </td>
                            <td>
                                <a href="/defects/detail?id=<?= $d['id'] ?>" class="btn btn-secondary btn-sm">
                                    Detail &rarr;
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/../layout/footer.php'; ?>
