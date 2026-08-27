<?php 
require_once __DIR__ . '/../layout/header.php';
$userRole = Auth::role();
$userId = Auth::id();
$isDevPic = ($defect['dev_id'] == $userId);
$isQcReporter = ($defect['qc_id'] == $userId);
?>

<div class="page-header">
    <div>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem;">
            <h2 style="font-family: monospace; font-size: 1.5rem; color: #60a5fa;"><?= htmlspecialchars($defect['ticket_number']) ?></h2>
            <span class="badge badge-<?= $defect['status'] ?>"><?= $defect['status'] ?></span>
            <span class="sev-badge sev-<?= $defect['severity'] ?>"><?= $defect['severity'] ?></span>
            <?php if ($defect['reopen_count'] > 0): ?>
                <span style="font-size: 0.75rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 8px; border-radius: 4px; font-weight: 700;">
                    Re-opened <?= $defect['reopen_count'] ?>x
                </span>
            <?php endif; ?>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;"><?= htmlspecialchars($defect['title']) ?></h3>
    </div>
    <a href="/defects" class="btn btn-secondary">
        &larr; Kembali
    </a>
</div>

<!-- Grid 2 Kolom: Detail Kiri, Action & State Machine Kanan -->
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
    <!-- Kolom Kiri: Detail Informasi & Audit Trail -->
    <div>
        <!-- Metadata Overview Card -->
        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; border-bottom: 1px solid var(--surface-border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">BANK KLIEN</div>
                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;"><?= htmlspecialchars($defect['client_name']) ?></div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">PROYEK / PLATFORM</div>
                    <div style="font-weight: 600; color: #cbd5e1;"><?= htmlspecialchars($defect['project_name']) ?> (<?= htmlspecialchars($defect['platform']) ?>)</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">MODUL FUNGSIONAL</div>
                    <div style="font-weight: 600; color: #cbd5e1;"><?= htmlspecialchars($defect['module_name']) ?></div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">ENVIRONMENT</div>
                    <div style="font-weight: 600; color: #38bdf8;"><?= htmlspecialchars($defect['environment']) ?></div>
                </div>
            </div>

            <!-- Deskripsi & Reproduksi -->
            <div style="margin-bottom: 1.25rem;">
                <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.35rem;">Deskripsi Kesalahan</h4>
                <div style="font-size: 0.92rem; color: #e2e8f0; white-space: pre-line; background: rgba(15,23,42,0.5); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--surface-border);">
                    <?= htmlspecialchars($defect['description']) ?>
                </div>
            </div>

            <?php if (!empty($defect['steps_to_reproduce'])): ?>
                <div style="margin-bottom: 1.25rem;">
                    <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.35rem;">Langkah-langkah Mereproduksi</h4>
                    <div style="font-size: 0.88rem; color: #cbd5e1; white-space: pre-line; background: rgba(15,23,42,0.5); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--surface-border);">
                        <?= htmlspecialchars($defect['steps_to_reproduce']) ?>
                    </div>
                </div>
            <?php endif; ?>

            <?php if (!empty($defect['expected_result']) || !empty($defect['actual_result'])): ?>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                    <div>
                        <h4 style="font-size: 0.8rem; text-transform: uppercase; color: #34d399; margin-bottom: 0.35rem;">Expected Result</h4>
                        <div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 0.75rem; border-radius: 8px;">
                            <?= htmlspecialchars($defect['expected_result']) ?>
                        </div>
                    </div>
                    <div>
                        <h4 style="font-size: 0.8rem; text-transform: uppercase; color: #f87171; margin-bottom: 0.35rem;">Actual Result</h4>
                        <div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); padding: 0.75rem; border-radius: 8px;">
                            <?= htmlspecialchars($defect['actual_result']) ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Masked Payload Viewer -->
            <?php if (!empty($defect['payload_log'])): ?>
                <div style="margin-bottom: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-dim);">Payload Log Perbankan (Masked ISO 8583 / JSON)</h4>
                        <span style="font-size: 0.7rem; color: #34d399;">PCI-DSS Masked</span>
                    </div>
                    <div class="code-block"><?= htmlspecialchars($defect['payload_log']) ?></div>
                </div>
            <?php endif; ?>
        </div>

        <!-- Audit Trail & Activity Timeline (FR-05) -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Audit Trail & Riwayat Siklus Status (FR-05)</span>
                <span style="font-size: 0.78rem; color: var(--text-dim);"><?= count($activities) ?> Riwayat Aktivitas</span>
            </div>
            <div class="timeline" style="margin-top: 1rem;">
                <?php foreach ($activities as $act): ?>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                <div>
                                    <strong style="color: #fff; font-size: 0.88rem;"><?= htmlspecialchars($act['user_name']) ?></strong>
                                    <span class="role-badge role-<?= $act['user_role'] ?>" style="font-size: 0.65rem; margin-left: 4px;"><?= $act['user_role'] ?></span>
                                </div>
                                <span style="font-size: 0.72rem; color: var(--text-dim);"><?= date('d/m/Y H:i:s', strtotime($act['created_at'])) ?></span>
                            </div>

                            <div style="margin-bottom: 0.35rem;">
                                Transisi: 
                                <?php if ($act['from_status']): ?>
                                    <span class="badge badge-<?= $act['from_status'] ?>"><?= $act['from_status'] ?></span> &rarr;
                                <?php endif; ?>
                                <span class="badge badge-<?= $act['to_status'] ?>"><?= $act['to_status'] ?></span>
                            </div>

                            <?php if (!empty($act['notes'])): ?>
                                <div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(0,0,0,0.2); padding: 0.65rem; border-radius: 6px; margin-top: 0.35rem;">
                                    <?= htmlspecialchars($act['notes']) ?>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($act['build_number']) || !empty($act['commit_hash'])): ?>
                                <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; color: #94a3b8; margin-top: 0.35rem; font-family: monospace;">
                                    <?php if (!empty($act['build_number'])): ?>
                                        <span>Build: <strong><?= htmlspecialchars($act['build_number']) ?></strong></span>
                                    <?php endif; ?>
                                    <?php if (!empty($act['commit_hash'])): ?>
                                        <span>Commit: <strong><?= htmlspecialchars($act['commit_hash']) ?></strong></span>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($act['attachment_url'])): ?>
                                <div style="margin-top: 0.5rem;">
                                    <a href="<?= htmlspecialchars($act['attachment_url']) ?>" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">
                                        Lihat Evidence / Screenshot
                                    </a>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <!-- Kolom Kanan: State Machine Control & PIC -->
    <div>
        <!-- PIC & Reporter Card -->
        <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-header">
                <span class="card-title">Penugasan & Reporter</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">QC REPORTER</div>
                    <div style="font-weight: 700; color: #fff; font-size: 0.92rem; margin-top: 2px;">
                        <?= htmlspecialchars($defect['qc_name']) ?>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-dim);"><?= htmlspecialchars($defect['qc_email']) ?></div>
                </div>

                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">PIC DEVELOPER</div>
                    <div style="font-weight: 700; color: #c084fc; font-size: 0.92rem; margin-top: 2px;">
                        <?= !empty($defect['dev_name']) ? htmlspecialchars($defect['dev_name']) : '<span style="color:var(--text-dim);">Belum ditugaskan</span>' ?>
                    </div>
                    <?php if (!empty($defect['dev_email'])): ?>
                        <div style="font-size: 0.78rem; color: var(--text-dim);"><?= htmlspecialchars($defect['dev_email']) ?></div>
                    <?php endif; ?>
                </div>

                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">WAKTU DIBUAT</div>
                    <div style="font-size: 0.82rem; color: #cbd5e1;"><?= date('d M Y, H:i', strtotime($defect['created_at'])) ?></div>
                </div>

                <div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">TERAKHIR DIPERBARUI</div>
                    <div style="font-size: 0.82rem; color: #cbd5e1;"><?= date('d M Y, H:i', strtotime($defect['updated_at'])) ?></div>
                </div>
            </div>
        </div>

        <!-- State Machine Action Box (FR-04) -->
        <div class="card" style="border: 1px solid rgba(59, 130, 246, 0.4); background: linear-gradient(145deg, #1e293b, #131d2e);">
            <div class="card-header">
                <span class="card-title">Aksi Transisi Status (FR-04)</span>
                <span class="role-badge role-<?= $userRole ?>"><?= $userRole ?></span>
            </div>

            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                Status saat ini: <strong style="color: #fff;"><?= $defect['status'] ?></strong>. Sesuai aturan RBAC PRD, tombol aksi berikut tersedia:
            </p>

            <!-- Aksi untuk Developer -->
            <?php if (in_array($defect['status'], ['Open', 'Re-open']) && (Auth::hasRole(['DEVELOPER', 'LEAD', 'PM']))): ?>
                <button type="button" class="btn btn-purple" style="width: 100%; justify-content: center; margin-bottom: 0.75rem;" onclick="openModal('modal-retest')">
                    Submit Fix & Mark 'Retesting'
                </button>
                <div style="font-size: 0.72rem; color: var(--text-dim); text-align: center;">
                    Mengirim notifikasi otomatis ke QC Tester bahwa bug telah diperbaiki.
                </div>
            <?php endif; ?>

            <!-- Aksi untuk QC Tester saat Retesting -->
            <?php if ($defect['status'] === 'Retesting' && (Auth::hasRole(['QC', 'LEAD', 'PM']))): ?>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button type="button" class="btn btn-success" style="width: 100%; justify-content: center;" onclick="openModal('modal-close')">
                        Verifikasi Sukses (Verify & Close)
                    </button>
                    <button type="button" class="btn btn-danger" style="width: 100%; justify-content: center;" onclick="openModal('modal-reopen')">
                        Retest Gagal / Regresi (Re-open)
                    </button>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-dim); text-align: center; margin-top: 0.5rem;">
                    QC memutuskan apakah perbaikan lolos uji atau perlu dibuka kembali.
                </div>
            <?php endif; ?>

            <!-- Status Closed -->
            <?php if ($defect['status'] === 'Close'): ?>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 700; color: #34d399; font-size: 0.9rem;">Defect Telah Selesai (Closed)</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Semua skenario pengujian telah dinyatakan lolos verifikasi oleh QC.
                    </div>
                </div>
            <?php endif; ?>

            <!-- Lead / PM Override Option -->
            <?php if (Auth::hasRole(['LEAD', 'PM'])): ?>
                <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--surface-border);">
                    <div style="font-size: 0.75rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">
                        Lead / PM Control Panel
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center;" onclick="openModal('modal-override')">
                        Override Status / Reassign PIC
                    </button>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- 1. Modal: Developer Mark Retesting -->
<div class="modal-backdrop" id="modal-retest">
    <div class="modal-box">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 1rem;">
            Submit Perbaikan Defect (Retesting)
        </h3>
        <form action="/defects/status" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="defect_id" value="<?= $defect['id'] ?>">
            <input type="hidden" name="to_status" value="Retesting">

            <div class="form-group">
                <label class="form-label" for="notes_retest">Catatan Perbaikan (Fixing Note) *</label>
                <textarea name="notes" id="notes_retest" class="form-control" rows="3" placeholder="Jelaskan bagian kode/konfigurasi yang telah diperbaiki..." required></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                    <label class="form-label" for="build_number">Nomor Build / Versi Staging</label>
                    <input type="text" name="build_number" id="build_number" class="form-control" placeholder="Contoh: v2.4.2-rc1">
                </div>
                <div class="form-group">
                    <label class="form-label" for="commit_hash">Commit Hash Git</label>
                    <input type="text" name="commit_hash" id="commit_hash" class="form-control" placeholder="Contoh: 7a9e14f">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="act_att_retest">Lampiran Bukti Unit Test (Opsional)</label>
                <input type="file" name="activity_attachment" id="act_att_retest" class="form-control">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-retest')">Batal</button>
                <button type="submit" class="btn btn-purple">Kirim ke QC untuk Retest</button>
            </div>
        </form>
    </div>
</div>

<!-- 2. Modal: QC Close Defect -->
<div class="modal-backdrop" id="modal-close">
    <div class="modal-box">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #34d399; margin-bottom: 1rem;">
            Verifikasi Berhasil & Tutup Tiket (Close)
        </h3>
        <form action="/defects/status" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="defect_id" value="<?= $defect['id'] ?>">
            <input type="hidden" name="to_status" value="Close">

            <div class="form-group">
                <label class="form-label" for="notes_close">Catatan Verifikasi QC</label>
                <textarea name="notes" id="notes_close" class="form-control" rows="3" placeholder="Skenario pengujian telah lolos verifikasi dan tidak ditemukan efek samping..."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Bukti Pengujian Berhasil (Screenshot / Report)</label>
                <input type="file" name="activity_attachment" class="form-control">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-close')">Batal</button>
                <button type="submit" class="btn btn-success">Konfirmasi Verify & Close</button>
            </div>
        </form>
    </div>
</div>

<!-- 3. Modal: QC Re-open Defect -->
<div class="modal-backdrop" id="modal-reopen">
    <div class="modal-box">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #f87171; margin-bottom: 1rem;">
            Retest Gagal / Ditemukan Regresi (Re-open)
        </h3>
        <form action="/defects/status" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="defect_id" value="<?= $defect['id'] ?>">
            <input type="hidden" name="to_status" value="Re-open">

            <div class="form-group">
                <label class="form-label" for="notes_reopen">Alasan Gagal Retest / Log Baru *</label>
                <textarea name="notes" id="notes_reopen" class="form-control" rows="3" placeholder="Jelaskan detail kegagalan saat verifikasi ulang..." required></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Tangkapan Layar Error Baru</label>
                <input type="file" name="activity_attachment" class="form-control">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-reopen')">Batal</button>
                <button type="submit" class="btn btn-danger">Buka Kembali Tiket (Re-open)</button>
            </div>
        </form>
    </div>
</div>

<!-- 4. Modal: Lead/PM Override -->
<?php if (Auth::hasRole(['LEAD', 'PM'])): ?>
<div class="modal-backdrop" id="modal-override">
    <div class="modal-box">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #fbbf24; margin-bottom: 1rem;">
            Lead / PM Override Control
        </h3>
        <form action="/defects/status" method="POST">
            <input type="hidden" name="defect_id" value="<?= $defect['id'] ?>">

            <div class="form-group">
                <label class="form-label">Paksa Ubah Status Menjadi</label>
                <select name="to_status" class="form-control" required>
                    <option value="Open" <?= $defect['status'] === 'Open' ? 'selected' : '' ?>>Open</option>
                    <option value="Retesting" <?= $defect['status'] === 'Retesting' ? 'selected' : '' ?>>Retesting</option>
                    <option value="Re-open" <?= $defect['status'] === 'Re-open' ? 'selected' : '' ?>>Re-open</option>
                    <option value="Close" <?= $defect['status'] === 'Close' ? 'selected' : '' ?>>Close</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Reassign PIC Developer</label>
                <select name="reassign_dev_id" class="form-control">
                    <option value="">-- Tetap Developer Saat Ini --</option>
                    <?php foreach ($developers as $dev): ?>
                        <option value="<?= $dev['id'] ?>" <?= $defect['dev_id'] == $dev['id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($dev['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Alasan Override / Catatan Lead</label>
                <textarea name="notes" class="form-control" rows="2" placeholder="Catatan instruksi khusus manajemen..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-override')">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<?php require_once __DIR__ . '/../layout/footer.php'; ?>
