<?php
/**
 * @var array $clients
 * @var array $developers
 */
require_once __DIR__ . '/../layout/header.php';
?>

<div class="page-header">
    <div class="page-title">
        <h2>Input Tiket Defect Baru (FR-03)</h2>
        <p>Standarisasi formulir pelaporan defect perbankan PT Sarana Pactindo</p>
    </div>
    <a href="/defects" class="btn btn-secondary">
        &larr; Kembali ke Daftar Defect
    </a>
</div>

<div class="card" style="max-width: 960px; margin: 0 auto;">
    <form action="/defects/store" method="POST" enctype="multipart/form-data">
        <!-- Section 1: Multi-Bank Hierarchy -->
        <div style="border-bottom: 1px solid var(--surface-border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #60a5fa; margin-bottom: 1rem;">
                1. Hierarki Bank Klien & Modul Fungsional (FR-01)
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="select-client">Bank Klien *</label>
                    <select id="select-client" class="form-control" required>
                        <option value="">-- Pilih Bank Klien --</option>
                        <?php foreach ($clients ?? [] as $c): ?>
                            <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['client_name']) ?> (<?= $c['client_code'] ?>)</option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="select-project">Proyek / Platform *</label>
                    <select id="select-project" class="form-control" disabled required>
                        <option value="">-- Pilih Bank Terlebih Dahulu --</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="select-module">Modul Fungsional *</label>
                    <select name="module_id" id="select-module" class="form-control" disabled required>
                        <option value="">-- Pilih Proyek Terlebih Dahulu --</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Section 2: Defect Details -->
        <div style="border-bottom: 1px solid var(--surface-border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #60a5fa; margin-bottom: 1rem;">
                2. Rincian Kesalahan & Lingkungan Pengujian
            </h3>

            <div class="form-group">
                <label class="form-label" for="title">Judul Defect *</label>
                <input type="text" name="title" id="title" class="form-control" placeholder="Contoh: Timeout Transaksi BI-FAST saat nominal di atas 50 juta" required>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="severity">Tingkat Keparahan (Severity) *</label>
                    <select name="severity" id="severity" class="form-control" required>
                        <option value="Blocker">Blocker (Fatal / Transaksi Berhenti)</option>
                        <option value="High" selected>High (Fitur Utama Error)</option>
                        <option value="Medium">Medium (Fitur Sekunder Bermasalah)</option>
                        <option value="Low">Low (Minor / Kosmetik / Typo)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="environment">Testing Environment *</label>
                    <select name="environment" id="environment" class="form-control" required>
                        <option value="DEV">DEV (Development Internal)</option>
                        <option value="SIT" selected>SIT (System Integration Test)</option>
                        <option value="UAT">UAT (User Acceptance Test Bank)</option>
                        <option value="Pre-Prod">Pre-Prod (Staging Bank Partner)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="dev_id">Penugasan PIC Developer</label>
                    <select name="dev_id" id="dev_id" class="form-control">
                        <option value="">-- Pilih PIC Developer --</option>
                        <?php foreach ($developers ?? [] as $dev): ?>
                            <option value="<?= $dev['id'] ?>"><?= htmlspecialchars($dev['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="description">Deskripsi Singkat Permasalahan *</label>
                <textarea name="description" id="description" class="form-control" rows="3" placeholder="Jelaskan secara ringkas dampak dan kondisi error..." required></textarea>
            </div>

            <div class="form-group">
                <label class="form-label" for="steps_to_reproduce">Langkah-langkah Mereproduksi (Steps to Reproduce)</label>
                <textarea name="steps_to_reproduce" id="steps_to_reproduce" class="form-control" rows="3" placeholder="1. Buka menu transfer&#10;2. Input rekening tujuan..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="expected_result">Hasil yang Diharapkan (Expected Result)</label>
                    <textarea name="expected_result" id="expected_result" class="form-control" rows="2" placeholder="Respon sukses dan saldo terpotong normal."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="actual_result">Hasil yang Terjadi (Actual Result)</label>
                    <textarea name="actual_result" id="actual_result" class="form-control" rows="2" placeholder="Muncul popup error 504 Gateway Timeout."></textarea>
                </div>
            </div>
        </div>

        <!-- Section 3: ISO 8583 / JSON Payload Log & Auto Masking -->
        <div style="border-bottom: 1px solid var(--surface-border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h3 style="font-size: 1rem; font-weight: 700; color: #60a5fa;">
                    3. Log ISO 8583 / JSON Payload & Masking Keamanan (NFR-01)
                </h3>
                <span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                    Auto-Masking PAN & PIN Aktif
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="payload_log_input">Input Raw Log / JSON Payload</label>
                    <textarea name="payload_log" id="payload_log_input" class="form-control" rows="5" placeholder='{"pan": "4111112233441111", "pin": "123456", "cvv": "123", "amount": 500000}'></textarea>
                </div>
                <div>
                    <label class="form-label">Live Masking Preview (Tersimpan Aman di Database)</label>
                    <div id="payload_log_preview" class="code-block" style="height: 125px; overflow-y: auto;">
                        // Masking preview akan muncul secara realtime saat Anda mengetik...
                    </div>
                </div>
            </div>

            <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="attachment">Unggah Bukti / Screenshot / File Log (Evidence Attachment)</label>
                <input type="file" name="attachment" id="attachment" class="form-control" accept="image/*,.pdf,.txt,.log,.json">
            </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem;">
            <a href="/defects" class="btn btn-secondary">Batal</a>
            <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.75rem;">
                Submit Defect Baru (Status: Open)
            </button>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../layout/footer.php'; ?>
