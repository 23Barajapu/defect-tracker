<?php
require_once __DIR__ . '/../Core/Auth.php';
require_once __DIR__ . '/../../config/database.php';

class NotificationController {
    public function getUnread(): void {
        Auth::requireAuth();
        $userId = Auth::id();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT n.*, d.ticket_number 
                              FROM notifications n 
                              JOIN defects d ON n.defect_id = d.id 
                              WHERE n.user_id = ? AND n.is_read = 0 
                              ORDER BY n.id DESC LIMIT 10");
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'count' => count($items),
            'data' => $items
        ]);
    }

    public function markAllRead(): void {
        Auth::requireAuth();
        $userId = Auth::id();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->execute([$userId]);

        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
    }

    /**
     * Server-Sent Events (SSE) Real-time Stream
     */
    public function stream(): void {
        Auth::requireAuth();
        $userId = Auth::id();

        // Header SSE
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        // Nonaktifkan buffering output PHP
        if (function_exists('apache_setenv')) {
            @apache_setenv('no-gzip', '1');
        }
        @ini_set('zlib.output_compression', 'Off');
        @ini_set('output_buffering', 'Off');
        while (ob_get_level()) {
            ob_end_flush();
        }
        flush();

        $db = Database::getInstance()->getConnection();
        $lastChecked = date('Y-m-d H:i:s', time() - 5);

        // Kirim event awal
        $stmt = $db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);
        $unreadCount = (int)$stmt->fetchColumn();

        echo "event: ping\n";
        echo "data: " . json_encode(['time' => time(), 'unread_count' => $unreadCount]) . "\n\n";
        flush();

        // Loop SSE (10 iterasi dengan sleep 1s untuk menjaga connection limit)
        for ($i = 0; $i < 10; $i++) {
            if (connection_aborted()) {
                break;
            }

            $stmt = $db->prepare("SELECT n.*, d.ticket_number 
                                  FROM notifications n 
                                  JOIN defects d ON n.defect_id = d.id 
                                  WHERE n.user_id = ? AND n.created_at >= ? AND n.is_read = 0
                                  ORDER BY n.id DESC");
            $stmt->execute([$userId, $lastChecked]);
            $newNotifs = $stmt->fetchAll();

            if (!empty($newNotifs)) {
                echo "event: notification\n";
                echo "data: " . json_encode($newNotifs) . "\n\n";
                flush();
                $lastChecked = date('Y-m-d H:i:s');
            }

            sleep(1);
        }
        exit;
    }
}
