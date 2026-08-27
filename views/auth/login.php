<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Universal Multi-Bank Defect Tracking Engine</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
            padding: 1.5rem;
        }
        .login-card {
            width: 100%;
            max-width: 440px;
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }
        .demo-roles {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--surface-border);
        }
    </style>
</head>
<body>

<div class="login-wrapper">
    <div class="login-card">
        <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.5rem;">
            <div class="brand-logo" style="width: 44px; height: 44px; font-size: 1.25rem;">SP</div>
            <div>
                <h1 style="font-size: 1.25rem; font-weight: 800; color: #fff;">PT Sarana Pactindo</h1>
                <p style="font-size: 0.75rem; color: var(--text-muted);">Defect Tracking & QA Reporting System</p>
            </div>
        </div>

        <?php if (!empty($_SESSION['error'])): ?>
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem;">
                <?= htmlspecialchars($_SESSION['error']) ?>
            </div>
            <?php unset($_SESSION['error']); ?>
        <?php endif; ?>

        <form action="/login" method="POST">
            <div class="form-group">
                <label class="form-label" for="email">Email Pengguna</label>
                <input type="email" name="email" id="email" class="form-control" placeholder="nama@pactindo.com" required value="qc@pactindo.com">
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Kata Sandi</label>
                <input type="password" name="password" id="password" class="form-control" placeholder="••••••••" required value="password123">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.5rem; padding: 0.75rem;">
                Masuk ke Sistem
            </button>
        </form>

        <div class="demo-roles">
            <div style="grid-column: span 2; font-size: 0.75rem; color: var(--text-dim); text-align: center; margin-bottom: 0.25rem;">
                Pilih Akun Pengujian:
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="setDemo('qc@pactindo.com')">
                QC Tester (Rina)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="setDemo('dev@pactindo.com')">
                Developer (Budi)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="setDemo('lead@pactindo.com')">
                Tech Lead (Agus)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="setDemo('pm@pactindo.com')">
                PM (Siti)
            </button>
        </div>
    </div>
</div>

<script>
function setDemo(email) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = 'password123';
}
</script>
</body>
</html>
