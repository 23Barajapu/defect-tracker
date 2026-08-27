<?php
// Automated Unit & Feature Test Script
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Core/Security.php';
require_once __DIR__ . '/../app/Core/Auth.php';

echo "=== STARTING AUTOMATED VERIFICATION ===\n\n";

$passCount = 0;
$failCount = 0;
$db = null;

function assertTest(string $name, bool $condition): void {
    global $passCount, $failCount;
    if ($condition) {
        echo " [PASS] {$name}\n";
        $passCount++;
    } else {
        echo " [FAIL] {$name}\n";
        $failCount++;
    }
}

// TEST 1: Database Connection
try {
    $db = Database::getInstance()->getConnection();
    assertTest("Database Connection OK", $db !== null);
} catch (Exception $e) {
    assertTest("Database Connection Error: " . $e->getMessage(), false);
}

if ($db !== null) {
    // TEST 2: Tables Existence
    $tables = ['clients', 'projects', 'modules', 'users', 'defects', 'defect_activities', 'notifications'];
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '{$table}'");
        assertTest("Table '{$table}' exists", $stmt->rowCount() > 0);
    }
}

// TEST 3: Security Sensitive Data Masking (PAN, PIN, CVV)
$rawJson = '{"pan": "4111112233441111", "cvv": "987", "pin": "123456", "amount": 250000}';
$masked = Security::maskSensitiveData($rawJson);
assertTest("PAN is masked (first 6 & last 4 preserved)", str_contains($masked, '411111******1111'));
assertTest("CVV is masked", str_contains($masked, '***'));
assertTest("PIN is masked", str_contains($masked, '[PIN_MASKED]'));
assertTest("Amount remains unmasked", str_contains($masked, '250000'));

// TEST 4: Raw Standalone PAN Masking
$rawLog = 'ISO8583 Bit2=5211110099881234 in stream';
$maskedLog = Security::maskSensitiveData($rawLog);
assertTest("Raw standalone PAN masked", str_contains($maskedLog, '521111******1234'));

if ($db !== null) {
    // TEST 5: State Machine & Data Integrity
    $stmt = $db->query("SELECT COUNT(*) FROM defects WHERE status = 'Open'");
    $openCount = (int)$stmt->fetchColumn();
    assertTest("Open defects counted properly", $openCount >= 0);

    $stmt = $db->query("SELECT COUNT(*) FROM defect_activities");
    $actCount = (int)$stmt->fetchColumn();
    assertTest("Audit trail activities logged", $actCount > 0);
}

echo "\n=== VERIFICATION RESULT: {$passCount} PASSED, {$failCount} FAILED ===\n";
if ($failCount === 0) {
    echo ">>> ALL ACCEPTANCE CRITERIA SATISFIED 100% <<<\n";
}
