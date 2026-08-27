<?php
/**
 * @var int $newOpenToday
 * @var int $readyForRetest
 * @var int $reopenedToday
 * @var int $closedToday
 * @var int $totalOutstanding
 * @var array $statusCounts
 * @var array $severityCounts
 * @var array $clientStats
 * @var array $recentActivities
 */
require_once __DIR__ . '/../layout/header.php';
?>

<div class="page-header">
    <div class="page-title">
        <h2>Dashboard Monitoring Multi-Bank</h2>
        <p>Ringkasan status defect real-time & kesehatan kualitas sistem perbankan PT Sarana Pactindo</p>
    </div>
    <div style="display: flex; gap: 0.75rem;">
        <a href="/reports/daily" class="btn btn-secondary">
            Laporan Harian (17:00)
        </a>
        <?php if (Auth::hasRole(['QC', 'LEAD', 'PM'])): ?>
            <a href="/defects/create" class="btn btn-primary">
                Input Defect Baru
            </a>
        <?php endif; ?>
    </div>
</div>

<!-- FR-08: Ringkasan Metrik Harian Otomatis -->
<div class="metrics-grid">
    <div class="metric-card open">
        <div class="metric-label">New Open Today</div>
        <div class="metric-val">
            <?= $newOpenToday ?? 0 ?>
        </div>
        <div class="metric-sub">Defect dilaporkan hari ini</div>
    </div>

    <div class="metric-card retest">
        <div class="metric-label">Ready for Retest</div>
        <div class="metric-val">
            <?= $readyForRetest ?? 0 ?>
        </div>
        <div class="metric-sub">Menunggu verifikasi QC</div>
    </div>

    <div class="metric-card reopen">
        <div class="metric-label">Re-opened Today</div>
        <div class="metric-val">
            <?= $reopenedToday ?? 0 ?>
        </div>
        <div class="metric-sub">Gagal verifikasi / regresi</div>
    </div>

    <div class="metric-card close">
        <div class="metric-label">Closed Today</div>
        <div class="metric-val">
            <?= $closedToday ?? 0 ?>
        </div>
        <div class="metric-sub">Selesai diperbaiki & lolos uji</div>
    </div>

    <div class="metric-card total">
        <div class="metric-label">Total Outstanding</div>
        <div class="metric-val" style="color: #f59e0b;">
            <?= $totalOutstanding ?? 0 ?>
        </div>
        <div class="metric-sub">Akumulasi tiket aktif (Open+Retest+Reopen)</div>
    </div>
</div>

<!-- Charts Row -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
    <div class="card">
        <div class="card-header">
            <span class="card-title">Distribusi Status Defect</span>
            <span style="font-size: 0.78rem; color: var(--text-dim);">Semua Bank</span>
        </div>
        <div style="height: 240px; position: relative;">
            <canvas id="statusChart"></canvas>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <span class="card-title">Distribusi Tingkat Keparahan</span>
            <span style="font-size: 0.78rem; color: var(--text-dim);">Defect Aktif</span>
        </div>
        <div style="height: 240px; position: relative;">
            <canvas id="severityChart"></canvas>
        </div>
    </div>
</div>

<!-- Multi-Bank Status Table & Recent Activities -->
<div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 1.5rem; margin-bottom: 2rem;">
    <!-- Bank Breakdown -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Kualitas Defect per Bank Klien</span>
            <a href="/defects" class="btn btn-secondary btn-sm">Lihat Semua &rarr;</a>
        </div>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Bank Klien</th>
                        <th>Open</th>
                        <th>Retesting</th>
                        <th>Re-open</th>
                        <th>Closed</th>
                        <th>Total</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($clientStats ?? [] as $cs): ?>
                        <tr>
                            <td>
                                <strong style="color: #fff;"><?= htmlspecialchars($cs['client_name']) ?></strong>
                                <div style="font-size: 0.72rem; color: var(--text-dim);"><?= htmlspecialchars($cs['client_code']) ?></div>
                            </td>
                            <td><span class="badge badge-Open"><?= (int)$cs['count_open'] ?></span></td>
                            <td><span class="badge badge-Retesting"><?= (int)$cs['count_retesting'] ?></span></td>
                            <td><span class="badge badge-Re-open"><?= (int)$cs['count_reopen'] ?></span></td>
                            <td><span class="badge badge-Close"><?= (int)$cs['count_close'] ?></span></td>
                            <td><strong><?= (int)$cs['total_defects'] ?></strong></td>
                            <td>
                                <a href="/defects?client_id=<?= $cs['id'] ?>" class="btn btn-secondary btn-sm">Filter</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Recent Audit Activity -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">Aktivitas Audit Terbaru</span>
            <span style="font-size: 0.75rem; color: #34d399; font-weight: 600;">Live</span>
        </div>
        <div class="timeline" style="margin-top: 0.5rem; max-height: 420px; overflow-y: auto; padding-right: 0.5rem;">
            <?php foreach ($recentActivities ?? [] as $act): ?>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
                            <strong style="font-size: 0.82rem; color: #60a5fa;"><?= htmlspecialchars($act['ticket_number']) ?></strong>
                            <span style="font-size: 0.7rem; color: var(--text-dim);"><?= date('H:i d/m', strtotime($act['created_at'])) ?></span>
                        </div>
                        <div style="font-size: 0.8rem; color: #e2e8f0; margin-bottom: 0.25rem;">
                            <strong><?= htmlspecialchars($act['user_name']) ?></strong> 
                            mengubah status ke <span class="badge badge-<?= $act['to_status'] ?>"><?= $act['to_status'] ?></span>
                        </div>
                        <?php if (!empty($act['notes'])): ?>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">
                                "<?= htmlspecialchars(mb_strimwidth($act['notes'], 0, 80, '...')) ?>"
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: ['Open', 'Retesting', 'Re-open', 'Close'],
            datasets: [{
                data: [
                    <?= (int)($statusCounts['Open'] ?? 0) ?>,
                    <?= (int)($statusCounts['Retesting'] ?? 0) ?>,
                    <?= (int)($statusCounts['Re-open'] ?? 0) ?>,
                    <?= (int)($statusCounts['Close'] ?? 0) ?>
                ],
                backgroundColor: ['#3b82f6', '#a855f7', '#ef4444', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } }
            },
            cutout: '70%'
        }
    });

    new Chart(document.getElementById('severityChart'), {
        type: 'bar',
        data: {
            labels: ['Blocker', 'High', 'Medium', 'Low'],
            datasets: [{
                label: 'Jumlah Defect Aktif',
                data: [
                    <?= (int)($severityCounts['Blocker'] ?? 0) ?>,
                    <?= (int)($severityCounts['High'] ?? 0) ?>,
                    <?= (int)($severityCounts['Medium'] ?? 0) ?>,
                    <?= (int)($severityCounts['Low'] ?? 0) ?>
                ],
                backgroundColor: ['#dc2626', '#f97316', '#eab308', '#64748b'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
});
</script>

<?php require_once __DIR__ . '/../layout/footer.php'; ?>
