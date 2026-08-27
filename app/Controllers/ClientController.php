<?php
require_once __DIR__ . '/../Core/Auth.php';
require_once __DIR__ . '/../../config/database.php';

class ClientController {
    public function getClientsApi(): void {
        Auth::requireAuth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("SELECT id, client_name, client_code, status FROM clients ORDER BY client_name ASC");
        $clients = $stmt->fetchAll();
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $clients]);
    }

    public function getProjectsApi(): void {
        Auth::requireAuth();
        $clientId = (int)($_GET['client_id'] ?? 0);
        $db = Database::getInstance()->getConnection();
        if ($clientId > 0) {
            $stmt = $db->prepare("SELECT id, client_id, name, platform FROM projects WHERE client_id = ? ORDER BY name ASC");
            $stmt->execute([$clientId]);
        } else {
            $stmt = $db->query("SELECT id, client_id, name, platform FROM projects ORDER BY name ASC");
        }
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    }

    public function getModulesApi(): void {
        Auth::requireAuth();
        $projectId = (int)($_GET['project_id'] ?? 0);
        $db = Database::getInstance()->getConnection();
        if ($projectId > 0) {
            $stmt = $db->prepare("SELECT id, project_id, module_name FROM modules WHERE project_id = ? ORDER BY module_name ASC");
            $stmt->execute([$projectId]);
        } else {
            $stmt = $db->query("SELECT id, project_id, module_name FROM modules ORDER BY module_name ASC");
        }
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    }
}
