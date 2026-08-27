<?php
$currentUser = Auth::user();
$currentUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Multi-Bank Defect Tracking & Daily Reporting Engine - PT Sarana Pactindo</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<?php if ($currentUser): ?>
<nav class="navbar">
    <div class="brand">
        <div class="brand-logo">SP</div>
        <div class="brand-text">
            <h1>Defect Tracking System</h1>
            <span>PT Sarana Pactindo &bull; Quality Assurance Division</span>
        </div>
    </div>

    <ul class="nav-links">
        <li>
            <a href="/dashboard" class="nav-link <?= $currentUri === '/dashboard' ? 'active' : '' ?>">
                Dashboard
            </a>
        </li>
        <li>
            <a href="/defects" class="nav-link <?= str_starts_with($currentUri, '/defects') ? 'active' : '' ?>">
                Daftar Defect
            </a>
        </li>
        <li>
            <a href="/reports/daily" class="nav-link <?= str_starts_with($currentUri, '/reports') ? 'active' : '' ?>">
                Laporan Harian QA
            </a>
        </li>
    </ul>

    <div class="nav-right">
        <!-- Quick Role Switcher -->
        <div class="quick-switch" title="Ganti akun peran pengujian">
            <span style="font-size: 0.72rem; color: var(--text-dim); margin-right: 4px;">Role:</span>
            <select onchange="location.href='/auth/switch?user_id=' + this.value">
                <option value="1" <?= $currentUser['id'] == 1 ? 'selected' : '' ?>>Rina (QC Tester)</option>
                <option value="2" <?= $currentUser['id'] == 2 ? 'selected' : '' ?>>Budi (Developer)</option>
                <option value="3" <?= $currentUser['id'] == 3 ? 'selected' : '' ?>>Agus (Tech Lead)</option>
                <option value="4" <?= $currentUser['id'] == 4 ? 'selected' : '' ?>>Siti (Project Manager)</option>
            </select>
        </div>

        <!-- Notification Dropdown -->
        <div class="notif-bell" id="notif-bell-btn" title="Notifikasi Sistem" style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 0.82rem; font-weight: 600;">Notifikasi</span>
            <span class="notif-count" id="notif-badge" style="display: none;">0</span>

            <div class="notif-dropdown" id="notif-dropdown">
                <div class="notif-header">
                    <span>Notifikasi Baru</span>
                    <button onclick="markAllNotificationsRead()" class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 2px 6px;">Tandai Dibaca</button>
                </div>
                <div id="notif-items-list">
                    <!-- Dinamis dimuat via JS -->
                </div>
            </div>
        </div>

        <!-- User Profile Pill -->
        <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="text-align: right;">
                <div style="font-size: 0.85rem; font-weight: 700;"><?= htmlspecialchars($currentUser['name']) ?></div>
                <span class="role-badge role-<?= $currentUser['role'] ?>"><?= $currentUser['role'] ?></span>
            </div>
            <a href="/logout" class="btn btn-secondary btn-sm" title="Logout" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;">
                Keluar
            </a>
        </div>
    </div>
</nav>

<!-- Audio alert -->
<audio id="notif-sound" preload="auto">
    <source src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(200).join("A") type="audio/wav">
</audio>

<div class="container">
    <?php if (!empty($_SESSION['success'])): ?>
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 0.85rem 1.25rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
            <?= htmlspecialchars($_SESSION['success']) ?>
        </div>
        <?php unset($_SESSION['success']); ?>
    <?php endif; ?>

    <?php if (!empty($_SESSION['error'])): ?>
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; padding: 0.85rem 1.25rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
            <?= htmlspecialchars($_SESSION['error']) ?>
        </div>
        <?php unset($_SESSION['error']); ?>
    <?php endif; ?>

<?php endif; ?>
