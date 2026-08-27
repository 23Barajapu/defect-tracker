<?php
// Autentikasi dan Kontrol Akses Berbasis Peran (RBAC)
class Auth {
    public static function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function login(array $user): void {
        self::startSession();
        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'phone' => $user['phone'] ?? '',
            'avatar' => $user['avatar'] ?? ''
        ];
    }

    public static function logout(): void {
        self::startSession();
        unset($_SESSION['user']);
        session_destroy();
    }

    public static function check(): bool {
        self::startSession();
        return isset($_SESSION['user']) && !empty($_SESSION['user']['id']);
    }

    public static function user(): ?array {
        self::startSession();
        return $_SESSION['user'] ?? null;
    }

    public static function id(): ?int {
        $user = self::user();
        return $user ? (int)$user['id'] : null;
    }

    public static function role(): ?string {
        $user = self::user();
        return $user['role'] ?? null;
    }

    public static function hasRole(string|array $roles): bool {
        $currentRole = self::role();
        if (!$currentRole) return false;
        if (is_array($roles)) {
            return in_array($currentRole, $roles, true);
        }
        return $currentRole === $roles;
    }

    public static function requireAuth(): void {
        if (!self::check()) {
            if (self::isApiRequest()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }
            header('Location: /login');
            exit;
        }
    }

    public static function isApiRequest(): bool {
        return (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json')) ||
               (isset($_SERVER['REQUEST_URI']) && str_starts_with($_SERVER['REQUEST_URI'], '/api/'));
    }
}
