<?php
// Simple & Robust HTTP Router

class Router {
    private array $routes = [];

    public function get(string $path, array $handler): void {
        $this->routes['GET'][$path] = $handler;
    }

    public function post(string $path, array $handler): void {
        $this->routes['POST'][$path] = $handler;
    }

    public function dispatch(): void {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Root redirect
        if ($uri === '/') {
            header('Location: /dashboard');
            exit;
        }

        if (isset($this->routes[$method][$uri])) {
            [$controllerClass, $action] = $this->routes[$method][$uri];
            $controller = new $controllerClass();
            $controller->$action();
            return;
        }

        // 404 Not Found
        http_response_code(404);
        if (str_starts_with($uri, '/api/')) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Endpoint tidak ditemukan']);
        } else {
            echo "<div style='font-family: sans-serif; text-align: center; padding: 50px;'><h1>404</h1><p>Halaman tidak ditemukan.</p><a href='/dashboard'>Kembali ke Dashboard</a></div>";
        }
    }
}
