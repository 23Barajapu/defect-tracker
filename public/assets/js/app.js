// Universal Defect Tracking - Client Engine
document.addEventListener('DOMContentLoaded', () => {
    initRealtimeStream();
    initNotificationDropdown();
    initCascadingDropdowns();
    initPayloadMaskPreview();
});

// 1. Real-time In-App Notification (SSE)
function initRealtimeStream() {
    if (!window.EventSource) return;

    try {
        const evtSource = new EventSource('/api/stream');
        
        evtSource.addEventListener('notification', (e) => {
            const data = JSON.parse(e.data);
            if (Array.isArray(data)) {
                data.forEach(item => {
                    showToast(item.title, item.message);
                    playAlertSound();
                });
                updateNotifBadge();
            }
        });

        evtSource.addEventListener('ping', (e) => {
            const data = JSON.parse(e.data);
            if (data.unread_count !== undefined) {
                const countBadge = document.getElementById('notif-badge');
                if (countBadge) {
                    countBadge.textContent = data.unread_count;
                    countBadge.style.display = data.unread_count > 0 ? 'flex' : 'none';
                }
            }
        });

        evtSource.onerror = () => {
            // Reconnect otomatis dikelola browser
        };
    } catch (err) {
        console.warn('SSE Error:', err);
    }
}

function showToast(title, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div>
            <div style="font-weight: 700; font-size: 0.88rem;">${title}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${message}</div>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function playAlertSound() {
    const audio = document.getElementById('notif-sound');
    if (audio) {
        audio.play().catch(() => {});
    }
}

// 2. Notification Dropdown
function initNotificationDropdown() {
    const bell = document.getElementById('notif-bell-btn');
    const dropdown = document.getElementById('notif-dropdown');
    if (!bell || !dropdown) return;

    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
            fetchUnreadNotifications();
        }
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== bell) {
            dropdown.classList.remove('show');
        }
    });
}

function fetchUnreadNotifications() {
    const listEl = document.getElementById('notif-items-list');
    if (!listEl) return;

    fetch('/api/notifications')
        .then(r => r.json())
        .then(res => {
            if (res.success && res.data.length > 0) {
                listEl.innerHTML = res.data.map(n => `
                    <div class="notif-item">
                        <div style="font-weight: 600; color: #fff;">${n.title}</div>
                        <div style="color: #94a3b8; font-size: 0.78rem;">${n.message}</div>
                        <div style="color: #64748b; font-size: 0.7rem; margin-top: 4px;">${n.created_at}</div>
                    </div>
                `).join('');
            } else {
                listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.8rem;">Tidak ada notifikasi baru</div>';
            }
        });
}

function markAllNotificationsRead() {
    fetch('/api/notifications/read', { method: 'POST' })
        .then(r => r.json())
        .then(() => {
            const countBadge = document.getElementById('notif-badge');
            if (countBadge) countBadge.style.display = 'none';
            fetchUnreadNotifications();
        });
}

function updateNotifBadge() {
    fetch('/api/notifications')
        .then(r => r.json())
        .then(res => {
            const countBadge = document.getElementById('notif-badge');
            if (countBadge) {
                countBadge.textContent = res.count;
                countBadge.style.display = res.count > 0 ? 'flex' : 'none';
            }
        });
}

// 3. Cascading Dropdowns: Bank -> Project -> Module
function initCascadingDropdowns() {
    const clientSelect = document.getElementById('select-client');
    const projectSelect = document.getElementById('select-project');
    const moduleSelect = document.getElementById('select-module');

    if (!clientSelect || !projectSelect || !moduleSelect) return;

    clientSelect.addEventListener('change', () => {
        const clientId = clientSelect.value;
        projectSelect.innerHTML = '<option value="">-- Memuat Proyek... --</option>';
        moduleSelect.innerHTML = '<option value="">-- Pilih Proyek Terlebih Dahulu --</option>';
        projectSelect.disabled = true;
        moduleSelect.disabled = true;

        if (!clientId) return;

        fetch(`/api/projects?client_id=${clientId}`)
            .then(r => r.json())
            .then(res => {
                projectSelect.innerHTML = '<option value="">-- Pilih Proyek / Platform --</option>';
                res.data.forEach(p => {
                    projectSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.platform})</option>`;
                });
                projectSelect.disabled = false;
            });
    });

    projectSelect.addEventListener('change', () => {
        const projectId = projectSelect.value;
        moduleSelect.innerHTML = '<option value="">-- Memuat Modul... --</option>';
        moduleSelect.disabled = true;

        if (!projectId) return;

        fetch(`/api/modules?project_id=${projectId}`)
            .then(r => r.json())
            .then(res => {
                moduleSelect.innerHTML = '<option value="">-- Pilih Modul Fungsional --</option>';
                res.data.forEach(m => {
                    moduleSelect.innerHTML += `<option value="${m.id}">${m.module_name}</option>`;
                });
                moduleSelect.disabled = false;
            });
    });
}

// 4. Live Masking Preview for ISO 8583 / JSON Payload
function initPayloadMaskPreview() {
    const input = document.getElementById('payload_log_input');
    const preview = document.getElementById('payload_log_preview');
    if (!input || !preview) return;

    input.addEventListener('input', () => {
        let val = input.value;
        if (!val.trim()) {
            preview.textContent = '// Masking preview akan muncul di sini...';
            return;
        }

        let masked = val
            .replace(/\b(\d{6})(\d{6,9})(\d{4})\b/g, '$1******$3')
            .replace(/("(?:cvv|cvc|cvv2)"\s*:\s*")([^"]+)(")/gi, '$1***$3')
            .replace(/("(?:pin|pin_block|mpin)"\s*:\s*")([^"]+)(")/gi, '$1[PIN_MASKED]$3');

        preview.textContent = masked;
    });
}

// Modal helper
function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('show');
}
function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('show');
}
