<?php
// Entry Point Aplikasi
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Core/Auth.php';
require_once __DIR__ . '/../app/Core/Security.php';
require_once __DIR__ . '/../app/Core/Router.php';

require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Controllers/ClientController.php';
require_once __DIR__ . '/../app/Controllers/DefectController.php';
require_once __DIR__ . '/../app/Controllers/NotificationController.php';
require_once __DIR__ . '/../app/Controllers/ReportController.php';

Auth::startSession();

$router = new Router();

// Auth Routes
$router->get('/login', [AuthController::class, 'showLogin']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/logout', [AuthController::class, 'logout']);
$router->get('/auth/switch', [AuthController::class, 'switchRole']);

// Dashboard & Reports
$router->get('/dashboard', [ReportController::class, 'dashboard']);
$router->get('/reports/daily', [ReportController::class, 'dailyReport']);
$router->get('/reports/export-pdf', [ReportController::class, 'exportPdf']);
$router->get('/reports/export-csv', [ReportController::class, 'exportCsv']);

// Defects Management
$router->get('/defects', [DefectController::class, 'index']);
$router->get('/defects/create', [DefectController::class, 'createForm']);
$router->post('/defects/store', [DefectController::class, 'store']);
$router->get('/defects/detail', [DefectController::class, 'detail']);
$router->post('/defects/status', [DefectController::class, 'updateStatus']);

// REST APIs & Realtime SSE
$router->get('/api/clients', [ClientController::class, 'getClientsApi']);
$router->get('/api/projects', [ClientController::class, 'getProjectsApi']);
$router->get('/api/modules', [ClientController::class, 'getModulesApi']);
$router->get('/api/notifications', [NotificationController::class, 'getUnread']);
$router->post('/api/notifications/read', [NotificationController::class, 'markAllRead']);
$router->get('/api/stream', [NotificationController::class, 'stream']);

$router->dispatch();
