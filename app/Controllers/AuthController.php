<?php
require_once __DIR__ . '/../Core/Auth.php';
require_once __DIR__ . '/../../config/database.php';

class AuthController {
    public function showLogin(): void {
        if (Auth::check()) {
            header('Location: /dashboard');
            exit;
        }
        require_once __DIR__ . '/../../views/auth/login.php';
    }

    public function login(): void {
        $email = trim($_POST['email'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (empty($email) || empty($password)) {
            $_SESSION['error'] = 'Email dan password wajib diisi.';
            header('Location: /login');
            exit;
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            Auth::login($user);
            header('Location: /dashboard');
            exit;
        }

        $_SESSION['error'] = 'Email atau password tidak sesuai.';
        header('Location: /login');
        exit;
    }

    public function switchRole(): void {
        // Fitur cepat pengujian: Switch akun pengguna
        Auth::requireAuth();
        $userId = (int)($_GET['user_id'] ?? 0);
        if ($userId > 0) {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            if ($user) {
                Auth::login($user);
            }
        }
        $referer = $_SERVER['HTTP_REFERER'] ?? '/dashboard';
        header("Location: {$referer}");
        exit;
    }

    public function logout(): void {
        Auth::logout();
        header('Location: /login');
        exit;
    }
}
